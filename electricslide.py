import argparse
import sys
import json
import logging
import numpy as np

def find_boundaries_using_window(space_counts, window_size, threshold_percentage):
    """Use a sliding window approach to find column boundaries."""
    boundaries = []
    threshold = window_size * threshold_percentage
    for i in range(len(space_counts) - window_size + 1):
        window_sum = sum(space_counts[i:i+window_size])
        if window_sum > threshold:
            boundaries.append(i + window_size // 2)
    return boundaries

def evaluate_boundaries(boundaries, lines):
    """Evaluate boundaries to determine if they seem logical."""
    too_many_spaces = 0
    for b_start, b_end in zip(boundaries[:-1], boundaries[1:]):
        col_data = [line[b_start:b_end].strip() for line in lines]
        if all(data == '' for data in col_data):
            too_many_spaces += 1

    return too_many_spaces <= len(boundaries) / 2

def find_common_spaces(lines, window_size, initial_threshold_percentage):
    """Combine sliding window with adaptive thresholding to find column boundaries."""
    space_counts = [line[i:i+1] == ' ' for i in range(min(map(len, lines))) for line in lines]
    
    boundaries = find_boundaries_using_window(space_counts, window_size, initial_threshold_percentage)
    
    if not evaluate_boundaries(boundaries, lines):
        adjusted_threshold_percentage = initial_threshold_percentage * 0.9
        boundaries = find_boundaries_using_window(space_counts, window_size, adjusted_threshold_percentage)
    
    return boundaries

def get_column_boundaries(spaces):
    """Determine column boundaries based on common space positions."""
    boundaries = []
    for start, end in zip(spaces[:-1], spaces[1:]):
        if end - start > 1:
            boundaries.append((start, end))
    return boundaries

def parse_line(line, boundaries):
    """Extract column values from a line based on the established boundaries."""
    return [line[start:end].strip() for start, end in boundaries]

def process_data(lines, window_size, initial_threshold_percentage):
    """Convert the data lines into a list of dictionaries."""
    spaces = find_common_spaces(lines, window_size, initial_threshold_percentage)
    boundaries = get_column_boundaries(spaces)
    headers = parse_line(lines[0], boundaries)
    
    result = []
    for line in lines[1:]:
        values = parse_line(line, boundaries)
        result.append(dict(zip(headers, values)))
    return result

def main():
    logging.basicConfig(level=logging.INFO)

    parser = argparse.ArgumentParser(description="Convert tabular data into a list of dictionaries.")
    parser.add_argument("-i", "--input", help="Input file path. If not provided, reads from stdin.", default=None)
    parser.add_argument("-o", "--output", help="Output file path. If not provided, outputs to stdout.", default=None)
    parser.add_argument("-w", "--window_size", type=int, default=10, help="Size of the sliding window.")
    parser.add_argument("-t", "--threshold", type=float, default=0.75, help="Initial threshold percentage for the sliding window.")
    args = parser.parse_args()
    
    try:
        if args.input:
            with open(args.input, "r") as f:
                data = f.readlines()
        else:
            data = sys.stdin.readlines()
        
        result = process_data(data, args.window_size, args.threshold)
        
        output_data = json.dumps(result, indent=4)
        if args.output:
            with open(args.output, "w") as f:
                f.write(output_data)
        else:
            print(output_data)
        
        logging.info("Processing completed successfully!")
    except Exception as e:
        logging.error(f"An error occurred: {e}")

if __name__ == "__main__":
    main()
