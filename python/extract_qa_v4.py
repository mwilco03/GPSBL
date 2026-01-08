"""
Optimized Q&A Extractor from PDF
- Single PDF read (cached)
- Pre-compiled regex
- Optional multiprocessing for large PDFs
"""

import pdfplumber
import json
import csv
import re
import sys
import io
import os
from collections import defaultdict, Counter
from dataclasses import dataclass, field
from typing import List, Dict, Tuple, Optional, Set
from functools import lru_cache


# ============================================================
# PRE-COMPILED REGEX (avoid recompilation)
# ============================================================

RE_QUESTION = re.compile(r'^(\d+)\s*[.)\]:]')
RE_ANSWER = re.compile(r'^([A-Za-z])\s*[.)\]:]')
RE_URL = re.compile(r'https?://', re.IGNORECASE)
RE_PAGE_NUM = re.compile(r'^page\s+\d+', re.IGNORECASE)


# ============================================================
# DATA CLASSES
# ============================================================

@dataclass
class TextLine:
    """Represents a line of text with its properties."""
    text: str
    y_pos: float
    x_pos: float
    colors: List[tuple]
    dominant_color: tuple = None
    
    def __post_init__(self):
        if self.colors:
            self.dominant_color = Counter(self.colors).most_common(1)[0][0]


@dataclass
class PDFData:
    """Cached PDF data - single read, multiple uses."""
    lines: List[TextLine]
    all_colors: List[tuple]
    color_counts: Counter
    line_counts: Counter
    
    @classmethod
    def from_pdf(cls, pdf_path: str) -> 'PDFData':
        """Read PDF once and cache all needed data."""
        lines = []
        all_colors = []
        
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                chars = page.chars
                if not chars:
                    continue
                
                # Group by y-position
                line_groups = defaultdict(list)
                for char in chars:
                    y_key = round(char['top'], 1)
                    line_groups[y_key].append(char)
                
                for y_pos, line_chars in sorted(line_groups.items()):
                    line_chars.sort(key=lambda c: c['x0'])
                    
                    text = "".join(c['text'] for c in line_chars).strip()
                    if not text:
                        continue
                    
                    colors = []
                    for c in line_chars:
                        color = c.get('non_stroking_color')
                        if color is not None:
                            color = tuple(color) if isinstance(color, list) else color
                            colors.append(color)
                            all_colors.append(color)
                    
                    x_pos = line_chars[0]['x0'] if line_chars else 0
                    
                    lines.append(TextLine(
                        text=text,
                        y_pos=y_pos,
                        x_pos=x_pos,
                        colors=colors
                    ))
        
        return cls(
            lines=lines,
            all_colors=all_colors,
            color_counts=Counter(all_colors),
            line_counts=Counter(line.text for line in lines)
        )


# ============================================================
# CORE FUNCTIONS (optimized)
# ============================================================

def color_distance(c1: tuple, c2: tuple) -> float:
    """Calculate distance between two colors."""
    if c1 is None or c2 is None or len(c1) != len(c2):
        return float('inf')
    return sum((a - b) ** 2 for a, b in zip(c1, c2)) ** 0.5


def cluster_colors(colors: List[tuple], threshold: float = 0.1) -> Dict[tuple, tuple]:
    """Cluster similar colors together."""
    if not colors:
        return {}
    
    unique_colors = list(set(colors))
    clusters = {}
    representatives = []
    
    for color in unique_colors:
        found_cluster = None
        for rep in representatives:
            if color_distance(color, rep) < threshold:
                found_cluster = rep
                break
        
        if found_cluster:
            clusters[color] = found_cluster
        else:
            clusters[color] = color
            representatives.append(color)
    
    return clusters


def is_question_marker(text: str) -> Optional[str]:
    """Check if line starts with a question marker."""
    match = RE_QUESTION.match(text)
    return match.group(0) if match else None


def is_answer_marker(text: str) -> Optional[str]:
    """Check if line starts with an answer marker."""
    match = RE_ANSWER.match(text)
    return match.group(0) if match else None


def is_noise_line(text: str, auto_noise: Set[str]) -> bool:
    """Check if line is noise (uses pre-compiled regex)."""
    text_stripped = text.strip()
    
    if text_stripped in auto_noise:
        return True
    
    if not text_stripped:
        return True
    
    if RE_URL.search(text_stripped):
        return True
    
    if RE_PAGE_NUM.match(text_stripped):
        return True
    
    return False


def detect_noise_patterns(pdf_data: PDFData, min_count: int = 3) -> Set[str]:
    """Detect noise patterns from cached PDF data."""
    noise = set()
    
    for text, count in pdf_data.line_counts.items():
        if count < min_count:
            continue
        
        if is_question_marker(text) or is_answer_marker(text):
            continue
        
        text_lower = text.lower()
        is_noise_like = (
            ':' in text or
            text_lower.startswith('http') or
            'not given' in text_lower or
            'classification' in text_lower or
            'reference' in text_lower or
            RE_PAGE_NUM.match(text_lower) or
            count >= 5
        )
        
        if is_noise_like:
            noise.add(text)
    
    return noise


def detect_correct_color(pdf_data: PDFData) -> Tuple[Optional[tuple], Dict]:
    """Detect the color used for correct answers."""
    color_map = cluster_colors(pdf_data.all_colors)
    
    # Count clustered colors
    clustered_counts = Counter(color_map.get(c, c) for c in pdf_data.all_colors)
    sorted_colors = clustered_counts.most_common()
    
    if len(sorted_colors) < 2:
        return None, color_map
    
    # Look for green among non-dominant colors
    dominant = sorted_colors[0][0]
    
    for color, count in sorted_colors[1:]:
        if isinstance(color, tuple) and len(color) >= 3:
            r, g, b = color[0], color[1], color[2] if len(color) > 2 else 0
            if g > r and g > b and g > 0.1:
                return color, color_map
    
    # Fall back to first non-dominant
    return sorted_colors[1][0], color_map


def is_color_match(color: tuple, target: tuple, color_map: Dict, threshold: float = 0.1) -> bool:
    """Check if color matches target."""
    if color is None or target is None:
        return False
    
    color = tuple(color) if isinstance(color, list) else color
    
    if color == target:
        return True
    
    if color_map.get(color) == target:
        return True
    
    return color_distance(color, target) < threshold


def extract_qa_fast(pdf_data: PDFData, correct_color: tuple, color_map: Dict, 
                    noise_patterns: Set[str]) -> List[Dict]:
    """Extract Q&A from cached PDF data."""
    qa_list = []
    current_question = None
    current_answers = []
    current_item = None
    
    for line in pdf_data.lines:
        if is_noise_line(line.text, noise_patterns):
            continue
        
        q_marker = is_question_marker(line.text)
        a_marker = is_answer_marker(line.text)
        
        if q_marker:
            if current_question and current_answers:
                qa_list.append({
                    'question': current_question,
                    'answers': current_answers
                })
            
            current_question = line.text
            current_answers = []
            current_item = ('question', None)
            
        elif a_marker:
            is_correct = False
            if correct_color and line.colors:
                is_correct = any(
                    is_color_match(c, correct_color, color_map)
                    for c in line.colors
                )
            
            current_answers.append({
                'marker': a_marker.strip(),
                'text': line.text,
                'is_correct': is_correct
            })
            current_item = ('answer', len(current_answers) - 1)
            
        else:
            if current_item:
                item_type, idx = current_item
                if item_type == 'question' and current_question:
                    current_question += " " + line.text
                elif item_type == 'answer' and current_answers:
                    current_answers[idx]['text'] += " " + line.text
                    if correct_color and line.colors and not current_answers[idx]['is_correct']:
                        current_answers[idx]['is_correct'] = any(
                            is_color_match(c, correct_color, color_map)
                            for c in line.colors
                        )
    
    if current_question and current_answers:
        qa_list.append({
            'question': current_question,
            'answers': current_answers
        })
    
    return qa_list


# ============================================================
# MAIN EXTRACTION (single entry point)
# ============================================================

def extract(pdf_path: str, color_index: int = None, verbose: bool = False) -> List[Dict]:
    """
    Main extraction function - optimized single-pass.
    
    Args:
        pdf_path: Path to PDF
        color_index: Manual color selection (1-based index)
        verbose: Print analysis info
    
    Returns:
        List of Q&A dictionaries
    """
    # Single PDF read
    if verbose:
        print("Reading PDF...", file=sys.stderr)
    
    pdf_data = PDFData.from_pdf(pdf_path)
    
    if verbose:
        print(f"  {len(pdf_data.lines)} lines, {len(pdf_data.all_colors)} color samples", file=sys.stderr)
    
    # Detect noise patterns
    noise = detect_noise_patterns(pdf_data)
    
    if verbose and noise:
        print(f"  Auto-filtering {len(noise)} noise patterns", file=sys.stderr)
    
    # Detect correct answer color
    if color_index is not None:
        sorted_colors = Counter(pdf_data.all_colors).most_common()
        if 0 < color_index <= len(sorted_colors):
            correct_color = sorted_colors[color_index - 1][0]
            color_map = cluster_colors(pdf_data.all_colors)
        else:
            correct_color, color_map = detect_correct_color(pdf_data)
    else:
        correct_color, color_map = detect_correct_color(pdf_data)
    
    if verbose and correct_color:
        print(f"  Using color {correct_color} for correct answers", file=sys.stderr)
    
    # Extract Q&A
    qa_list = extract_qa_fast(pdf_data, correct_color, color_map, noise)
    
    return qa_list


# ============================================================
# OUTPUT FUNCTIONS
# ============================================================

RE_STRIP_NUM = re.compile(r'^\d+[.):\s]+')

def format_results(qa_list: List[Dict]) -> str:
    """Format Q&A as string."""
    lines = []
    for qa in qa_list:
        q_text = RE_STRIP_NUM.sub('', qa['question'])
        lines.append(q_text)
        
        for ans in qa['answers']:
            if ans['is_correct']:
                lines.append(f"* - {ans['text']}")
            else:
                lines.append(f"- {ans['text']}")
        
        lines.append("")
    
    return "\n".join(lines)


def print_results(qa_list: List[Dict]):
    """Print to stdout."""
    print(format_results(qa_list))


def save_results(qa_list: List[Dict], output_path: str):
    """Save to file."""
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(format_results(qa_list))
    print(f"Saved: {output_path}", file=sys.stderr)


# ============================================================
# ANALYSIS FUNCTIONS (for debugging)
# ============================================================

def analyze_colors(pdf_path: str):
    """Show color analysis."""
    pdf_data = PDFData.from_pdf(pdf_path)
    color_map = cluster_colors(pdf_data.all_colors)
    clustered = Counter(color_map.get(c, c) for c in pdf_data.all_colors)
    
    print("\n" + "=" * 60)
    print("COLOR FREQUENCY ANALYSIS")
    print("=" * 60)
    print(f"Total: {len(pdf_data.all_colors)} chars, {len(clustered)} colors\n")
    
    for i, (color, count) in enumerate(clustered.most_common()):
        pct = (count / len(pdf_data.all_colors)) * 100
        marker = " " if i == 0 else "*"
        print(f"{marker} [{i+1}] {color}: {count} ({pct:.1f}%)")


def analyze_patterns(pdf_path: str):
    """Show pattern analysis."""
    pdf_data = PDFData.from_pdf(pdf_path)
    noise = detect_noise_patterns(pdf_data)
    
    repeating = [(t, c) for t, c in pdf_data.line_counts.items()
                 if c > 1 and not is_question_marker(t) and not is_answer_marker(t)]
    repeating.sort(key=lambda x: -x[1])
    
    print("\n" + "=" * 60)
    print("REPEATING PATTERNS")
    print("=" * 60)
    
    for text, count in repeating[:20]:
        marker = "[OMIT]" if text in noise else "      "
        preview = text[:50] + "..." if len(text) > 50 else text
        print(f"  {marker} [{count:3}x] \"{preview}\"")
    
    print(f"\nAuto-omitting {len(noise)} patterns")


# ============================================================
# DEMO
# ============================================================

def create_test_pdf(filename="test_quiz.pdf"):
    """Create test PDF."""
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas
    from reportlab.lib.colors import black, green, blue, red
    
    c = canvas.Canvas(filename, pagesize=letter)
    width, height = letter
    y = height - 50
    
    questions = [
        ("2. The squadron must complete training to", "compensate for the missing certification."),
        ("3. Which evaluation determines the crew", "member's qualification position?"),
        ("4. What is the primary purpose of the program?", None),
    ]
    
    answers_data = [
        [("A. one", False), ("B. two", False), ("C. three", True), ("D. four", False)],
        [("A. Initial Qualification", False), ("B. Mission (M) Series", False), 
         ("C. Qualification (Q) Series", True), ("D. Basic Mission Capable", False)],
        [("A. Training", False), ("B. Evaluation", True), ("C. Documentation", False), ("D. Assessment", False)],
    ]
    
    for i, (q1, q2) in enumerate(questions):
        c.setFillColor(black)
        c.drawString(50, y, q1)
        y -= 15
        if q2:
            c.drawString(70, y, q2)
            y -= 25
        else:
            y -= 10
        
        for ans_text, is_correct in answers_data[i]:
            c.setFillColor(green if is_correct else black)
            c.drawString(50, y, ans_text)
            y -= 20
        
        # Add noise
        c.setFillColor(red)
        c.drawString(50, y, "Answer not given")
        y -= 15
        c.setFillColor(blue)
        c.drawString(50, y, "QDB: FY26 - NA, Reference: ACCI")
        y -= 15
        c.drawString(50, y, "Classification: Unclassified")
        y -= 30
    
    c.save()


# ============================================================
# CLI
# ============================================================

def main():
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Extract Q&A from PDF (optimized)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s input.pdf                     Extract to stdout
  %(prog)s input.pdf -o output.txt       Save to file
  %(prog)s input.pdf -c 3                Use 3rd color as correct
  %(prog)s input.pdf --analyze-colors    Show color analysis
  %(prog)s input.pdf --analyze-patterns  Show noise patterns
  %(prog)s --demo                        Run demo
        """
    )
    
    parser.add_argument("pdf", nargs="?", help="PDF file")
    parser.add_argument("-o", "--output", help="Output file (default: stdout)")
    parser.add_argument("-c", "--color-index", type=int, help="Color index for correct answers")
    parser.add_argument("-v", "--verbose", action="store_true", help="Show processing info")
    parser.add_argument("--analyze-colors", action="store_true", help="Show color analysis")
    parser.add_argument("--analyze-patterns", action="store_true", help="Show noise patterns")
    parser.add_argument("--demo", action="store_true", help="Run demo")
    
    args = parser.parse_args()
    
    if args.demo:
        print("Creating test PDF...", file=sys.stderr)
        old_stdout = sys.stdout
        sys.stdout = open(os.devnull, 'w')
        create_test_pdf("test_quiz.pdf")
        sys.stdout.close()
        sys.stdout = old_stdout
        args.pdf = "test_quiz.pdf"
    
    if not args.pdf:
        parser.print_help()
        return 1
    
    if not os.path.exists(args.pdf):
        print(f"Error: {args.pdf} not found", file=sys.stderr)
        return 1
    
    if args.analyze_colors:
        analyze_colors(args.pdf)
        return 0
    
    if args.analyze_patterns:
        analyze_patterns(args.pdf)
        return 0
    
    # Main extraction
    qa_list = extract(args.pdf, args.color_index, args.verbose)
    
    if args.output:
        save_results(qa_list, args.output)
    else:
        print_results(qa_list)
    
    print(f"Extracted {len(qa_list)} questions.", file=sys.stderr)
    return 0


if __name__ == "__main__":
    exit(main())
