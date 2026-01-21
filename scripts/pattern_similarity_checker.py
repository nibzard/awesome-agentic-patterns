#!/usr/bin/env python3
"""
pattern_similarity_checker.py

Duplicate detection for pattern files using tag similarity and content analysis.

Detects potentially duplicate or very similar patterns by comparing:
- Tag overlap (Jaccard similarity)
- Title similarity
- Category overlap
- Problem/Solution section content

Usage:
    python scripts/pattern_similarity_checker.py <new-pattern.md>
    python scripts/pattern_similarity_checker.py --all
    python scripts/pattern_similarity_checker.py --threshold=0.7 <pattern.md>
"""

import argparse
import math
import os
import re
import sys
from collections import Counter
from pathlib import Path
from typing import Dict, List, Optional, Set, Tuple


# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from build_readme import parse_front_matter


def slugify(value: str) -> str:
    """Normalize string for comparison."""
    value = re.sub(r'[^\w\s-]', '', value).strip().lower()
    value = re.sub(r'[-\s]+', ' ', value)
    return value


def tokenize(text: str) -> Set[str]:
    """Tokenize text into words, removing common stop words."""
    if not text:
        return set()

    # Common stop words to ignore
    stop_words = {
        "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
        "of", "with", "by", "from", "as", "is", "was", "are", "were", "be",
        "been", "being", "have", "has", "had", "do", "does", "did", "will",
        "would", "could", "should", "may", "might", "must", "can", "this",
        "that", "these", "those", "it", "its", "they", "them", "their",
        "what", "which", "who", "whom", "when", "where", "why", "how",
    }

    # Tokenize and filter
    words = re.findall(r'\b\w+\b', text.lower())
    return {w for w in words if len(w) > 3 and w not in stop_words}


def jaccard_similarity(set1: Set[str], set2: Set[str]) -> float:
    """
    Calculate Jaccard similarity between two sets.

    J(A, B) = |A ∩ B| / |A ∪ B|
    """
    if not set1 or not set2:
        return 0.0

    intersection = len(set1.intersection(set2))
    union = len(set1.union(set2))

    return intersection / union if union > 0 else 0.0


def cosine_similarity(set1: Set[str], set2: Set[str]) -> float:
    """
    Calculate cosine similarity between two sets (treating as binary vectors).
    """
    if not set1 or not set2:
        return 0.0

    intersection = len(set1.intersection(set2))
    magnitude = math.sqrt(len(set1)) * math.sqrt(len(set2))

    return intersection / magnitude if magnitude > 0 else 0.0


def levenshtein_distance(s1: str, s2: str) -> int:
    """Calculate Levenshtein distance between two strings."""
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)

    if len(s2) == 0:
        return len(s1)

    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row

    return previous_row[-1]


def string_similarity(s1: str, s2: str) -> float:
    """
    Calculate normalized string similarity based on Levenshtein distance.

    Returns 1.0 for identical strings, 0.0 for completely different.
    """
    if not s1 or not s2:
        return 0.0

    max_len = max(len(s1), len(s2))
    if max_len == 0:
        return 1.0

    distance = levenshtein_distance(s1.lower(), s2.lower())
    return 1.0 - (distance / max_len)


def extract_sections(filepath: str) -> Dict[str, str]:
    """
    Extract main sections from a pattern file.

    Returns dict with keys: problem, solution, how_to_use, trade_offs
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove front matter
    if content.startswith('---'):
        end_idx = content.find('\n---', 4)
        if end_idx > 0:
            content = content[end_idx + 4:]

    sections = {}
    current_section = None
    current_content = []

    # Section markers we care about
    section_markers = ['## Problem', '## Solution', '## How to use it', '## Trade-offs']

    for line in content.split('\n'):
        if line.startswith('## '):
            # Save previous section
            if current_section:
                sections[current_section] = ' '.join(current_content)

            # Start new section
            current_section = line[3:].strip().lower()
            if 'problem' in current_section:
                current_section = 'problem'
            elif 'solution' in current_section:
                current_section = 'solution'
            elif 'how to use' in current_section:
                current_section = 'how_to_use'
            elif 'trade-off' in current_section:
                current_section = 'trade_offs'
            else:
                current_section = None
            current_content = []
        elif current_section:
            # Skip code blocks and mermaid diagrams
            if line.strip().startswith('```') or line.strip().startswith('~~~'):
                continue
            current_content.append(line.strip())

    # Save last section
    if current_section:
        sections[current_section] = ' '.join(current_content)

    return sections


class PatternSimilarityChecker:
    """Checker for finding similar/duplicate patterns."""

    def __init__(self, patterns_dir: str, threshold: float = 0.5):
        """
        Initialize the checker.

        Args:
            patterns_dir: Path to patterns directory
            threshold: Minimum similarity score to report (0-1)
        """
        self.patterns_dir = Path(patterns_dir)
        self.threshold = threshold
        self.patterns = self._load_patterns()

    def _load_patterns(self) -> List[Dict]:
        """Load all pattern metadata and content."""
        patterns = []

        for filepath in self.patterns_dir.glob("*.md"):
            if filepath.name == "TEMPLATE.md":
                continue

            try:
                metadata = parse_front_matter(str(filepath))
                sections = extract_sections(filepath)

                patterns.append({
                    "file": filepath.name,
                    "path": str(filepath),
                    "title": metadata.get("title", ""),
                    "tags": [t.lower() for t in metadata.get("tags", [])],
                    "category": metadata.get("category", ""),
                    "sections": sections,
                    "metadata": metadata,
                })
            except Exception as e:
                print(f"Warning: Could not load {filepath.name}: {e}")

        return patterns

    def compare_to_pattern(self, filepath: str) -> List[Dict]:
        """
        Compare a single pattern file against all existing patterns.

        Returns list of similarity results, sorted by total similarity.
        """
        try:
            metadata = parse_front_matter(filepath)
            sections = extract_sections(filepath)
        except Exception as e:
            print(f"Error: Could not parse pattern file: {e}")
            return []

        new_pattern = {
            "file": Path(filepath).name,
            "title": metadata.get("title", ""),
            "tags": [t.lower() for t in metadata.get("tags", [])],
            "category": metadata.get("category", ""),
            "sections": sections,
        }

        results = []

        for existing in self.patterns:
            if existing["file"] == new_pattern["file"]:
                continue  # Skip self

            similarity = self._calculate_similarity(new_pattern, existing)
            if similarity["total"] >= self.threshold:
                results.append({
                    "existing_file": existing["file"],
                    "existing_title": existing["title"],
                    "similarity": similarity,
                })

        # Sort by total similarity
        results.sort(key=lambda x: x["similarity"]["total"], reverse=True)
        return results

    def check_all_similarities(self) -> List[Dict]:
        """
        Check all patterns against each other for similarities.

        Returns list of potential duplicates (each pair once).
        """
        results = []

        for i, pattern1 in enumerate(self.patterns):
            for pattern2 in self.patterns[i + 1:]:
                similarity = self._calculate_similarity(pattern1, pattern2)
                if similarity["total"] >= self.threshold:
                    results.append({
                        "pattern1": pattern1["file"],
                        "pattern2": pattern2["file"],
                        "title1": pattern1["title"],
                        "title2": pattern2["title"],
                        "similarity": similarity,
                    })

        # Sort by total similarity
        results.sort(key=lambda x: x["similarity"]["total"], reverse=True)
        return results

    def _calculate_similarity(self, pattern1: Dict, pattern2: Dict) -> Dict[str, float]:
        """Calculate detailed similarity metrics between two patterns."""

        # 1. Tag similarity (Jaccard)
        tags1 = set(pattern1["tags"])
        tags2 = set(pattern2["tags"])
        tag_sim = jaccard_similarity(tags1, tags2)

        # 2. Title similarity
        title_sim = string_similarity(pattern1["title"], pattern2["title"])

        # 3. Category match
        category_match = 1.0 if pattern1["category"] == pattern2["category"] else 0.0

        # 4. Content similarity (problem + solution)
        content1_tokens = set()
        content2_tokens = set()

        for section in ["problem", "solution"]:
            if section in pattern1["sections"]:
                content1_tokens.update(tokenize(pattern1["sections"][section]))
            if section in pattern2["sections"]:
                content2_tokens.update(tokenize(pattern2["sections"][section]))

        content_sim = jaccard_similarity(content1_tokens, content2_tokens)

        # Weighted total (adjust weights as needed)
        total = (
            tag_sim * 0.30 +
            title_sim * 0.20 +
            category_match * 0.15 +
            content_sim * 0.35
        )

        return {
            "tag": tag_sim,
            "title": title_sim,
            "category": category_match,
            "content": content_sim,
            "total": total,
        }

    def suggest_action(self, similarity: Dict[str, float]) -> str:
        """Suggest action based on similarity score."""
        total = similarity["total"]

        if total >= 0.8:
            return "MERGE - Patterns are very similar, consider merging"
        elif total >= 0.7:
            return "REVIEW - High similarity, manual review needed"
        elif total >= 0.6:
            return "CHECK - Moderate similarity, check if related"
        elif total >= 0.5:
            return "RELATED - May be related patterns"
        else:
            return "OK - Below similarity threshold"


def print_similarity_report(results: List[Dict], threshold: float, checker):
    """Print a formatted similarity report."""

    if not results:
        print(f"\n✅ No patterns found with similarity >= {threshold}")
        return

    print(f"\n{'='*80}")
    print(f"⚠️  FOUND {len(results)} POTENTIAL DUPLICATE/RELATED PATTERN PAIRS")
    print(f"{'='*80}")

    for i, result in enumerate(results, 1):
        if "existing_file" in result:
            # Single pattern comparison
            print(f"\n{i}. {result['existing_title']}")
            print(f"   File: {result['existing_file']}")
        else:
            # All-pairs comparison
            print(f"\n{i}. {result['title1']} <-> {result['title2']}")
            print(f"   Files: {result['pattern1']} <-> {result['pattern2']}")

        sim = result["similarity"]
        action = checker.suggest_action(sim)

        print(f"   Total Similarity: {sim['total']:.2f}")
        print(f"   Tag Similarity:    {sim['tag']:.2f} (Jaccard)")
        print(f"   Title Similarity:  {sim['title']:.2f}")
        print(f"   Category Match:    {sim['category']:.2f}")
        print(f"   Content Similarity:{sim['content']:.2f}")
        print(f"   Suggested Action:  {action}")

    # Print warning for high similarities
    high_sim = [r for r in results if r["similarity"]["total"] >= 0.7]
    if high_sim:
        print(f"\n{'='*80}")
        print(f"⚠️  WARNING: {len(high_sim)} patterns with similarity >= 0.7")
        print(f"   These may be duplicates or variants that need merging.")
        print(f"{'='*80}")


def export_similarity_report(results: List[Dict], output_file: str, checker):
    """Export similarity report to Markdown file."""

    lines = [
        "# Pattern Similarity Report",
        "",
        f"Generated: {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        f"Total pairs found: {len(results)}",
        "",
        "---",
        "",
    ]

    for i, result in enumerate(results, 1):
        if "existing_file" in result:
            lines.extend([
                f"## {i}. {result['existing_title']}",
                "",
                f"**File:** `{result['existing_file']}`  ",
                f"**Similarity:** {result['similarity']['total']:.2f}  ",
            ])
        else:
            lines.extend([
                f"## {i}. {result['title1']} ↔ {result['title2']}",
                "",
                f"**Files:** `{result['pattern1']}` ↔ `{result['pattern2']}`  ",
                f"**Similarity:** {result['similarity']['total']:.2f}  ",
            ])

        sim = result["similarity"]
        action = checker.suggest_action(sim)

        lines.extend([
            "",
            f"**Breakdown:**",
            f"- Tag Similarity: {sim['tag']:.2f}",
            f"- Title Similarity: {sim['title']:.2f}",
            f"- Category Match: {sim['category']:.2f}",
            f"- Content Similarity: {sim['content']:.2f}",
            "",
            f"**Suggested Action:** {action}",
            "",
            "---",
            "",
        ])

    with open(output_file, "w") as f:
        f.write("\n".join(lines))

    print(f"Report exported to: {output_file}")


def main():
    parser = argparse.ArgumentParser(
        description="Check patterns for duplicates or high similarity",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s patterns/new-pattern.md
  %(prog)s --all
  %(prog)s --all --threshold=0.7 --export report.md
        """,
    )
    parser.add_argument(
        "pattern_file",
        nargs="?",
        help="Path to pattern file to check against existing patterns",
    )
    parser.add_argument(
        "--all",
        "-a",
        action="store_true",
        help="Check all patterns against each other",
    )
    parser.add_argument(
        "--patterns-dir",
        "-d",
        type=str,
        default="patterns",
        help="Path to patterns directory (default: patterns)",
    )
    parser.add_argument(
        "--threshold",
        "-t",
        type=float,
        default=0.5,
        help="Similarity threshold for reporting (default: 0.5)",
    )
    parser.add_argument(
        "--export",
        "-e",
        type=str,
        help="Export report to Markdown file",
    )

    args = parser.parse_args()

    # Validate arguments
    if not args.all and not args.pattern_file:
        parser.error("Either specify a pattern file or use --all")

    if args.all and args.pattern_file:
        parser.error("Cannot use --all with a specific pattern file")

    # Check patterns directory
    patterns_dir = Path(args.patterns_dir)
    if not patterns_dir.exists():
        print(f"Error: Patterns directory not found: {patterns_dir}")
        return 1

    # Initialize checker
    checker = PatternSimilarityChecker(str(patterns_dir), args.threshold)
    print(f"Loaded {len(checker.patterns)} patterns for comparison")

    # Run comparison
    if args.all:
        print(f"\n🔍 Checking all patterns for similarities (threshold: {args.threshold})...")
        results = checker.check_all_similarities()
    else:
        pattern_path = Path(args.pattern_file)
        if not pattern_path.exists():
            print(f"Error: Pattern file not found: {pattern_path}")
            return 1

        print(f"\n🔍 Comparing '{pattern_path.name}' against existing patterns...")
        results = checker.compare_to_pattern(str(pattern_path))

    # Print report
    print_similarity_report(results, args.threshold, checker)

    # Export if requested
    if args.export:
        export_similarity_report(results, args.export, checker)

    # Return exit code based on findings
    if results:
        return 1  # Found potential duplicates
    return 0


if __name__ == "__main__":
    sys.exit(main())
