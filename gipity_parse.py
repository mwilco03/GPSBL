import argparse
import sys
import json

def get_column_boundaries(header):
    """Identify the start and end positions of each column based on transitions in the header."""
    boundaries = []
    in_column = False
    for idx, char in enumerate(header):
        if char != ' ' and not in_column:
            in_column = True
            start = idx
        elif char == ' ' and in_column:
            in_column = False
            boundaries.append((start, idx))
    if in_column:
        boundaries.append((start, len(header)))
    return boundaries

def parse_line(line, boundaries):
    """Extract column values from a line based on the provided boundaries."""
    return [line[start:end].strip() for start, end in boundaries]

def process_data(lines):
    """Process the data lines into a list of dictionaries."""
    if not lines:
        return []
    
    boundaries = get_column_boundaries(lines[0])
    headers = parse_line(lines[0], boundaries)
    
    result = []
    for line in lines[1:]:
        values = parse_line(line, boundaries)
        result.append(dict(zip(headers, values)))
    return result

def main():
    parser = argparse.ArgumentParser(description="Convert tabular data into a list of dictionaries.")
    parser.add_argument("-i", "--input", help="Input file path. If not provided, reads from stdin.", default=None)
    parser.add_argument("-o", "--output", help="Output file path. If not provided, outputs to stdout.", default=None)
    args = parser.parse_args()
    
    # Read data
    if args.input:
        with open(args.input, "r") as f:
            data = f.readlines()
    else:
        data = sys.stdin.readlines()
    
    # Process data
    result = process_data(data)
    
    # Output results
    output_data = json.dumps(result, indent=4)
    if args.output:
        with open(args.output, "w") as f:
            f.write(output_data)
    else:
        print(output_data)

if __name__ == "__main__":
    main()
