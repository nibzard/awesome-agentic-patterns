#!/usr/bin/env python3
"""
pattern_validator.py

Pre-commit validation for pattern files.

Validates:
- YAML front-matter completeness
- Required sections presence
- Mermaid diagram syntax
- URL validity
- Content quality checks

Usage:
    python scripts/pattern_validator.py <pattern-file.md>
    python scripts/pattern_validator.py --all
    python scripts/pattern_validator.py --fix <pattern-file.md>
"""

import argparse
import os
import re
import sys
import urllib.request
import urllib.error
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
from typing import List, Optional, Set, Tuple


# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from build_readme import parse_front_matter


class Severity(Enum):
    """Severity levels for validation issues."""
    ERROR = "ERROR"
    WARNING = "WARNING"
    INFO = "INFO"


@dataclass
class ValidationIssue:
    """Represents a validation issue found in a pattern file."""
    severity: Severity
    category: str
    message: str
    line: Optional[int] = None
    column: Optional[int] = None
    fix_suggestion: Optional[str] = None


@dataclass
class ValidationResult:
    """Result of validating a pattern file."""
    file_path: str
    is_valid: bool
    issues: List[ValidationIssue] = field(default_factory=list)

    def add_issue(self, severity: Severity, category: str, message: str,
                  line: Optional[int] = None, fix_suggestion: Optional[str] = None):
        self.issues.append(ValidationIssue(
            severity=severity, category=category, message=message,
            line=line, fix_suggestion=fix_suggestion
        ))
        if severity == Severity.ERROR:
            self.is_valid = False


# Valid values for pattern metadata
VALID_STATUSES = {
    "proposed",
    "emerging",
    "established",
    "validated-in-production",
    "best-practice",
    "experimental-but-awesome",
    "rapidly-improving",
}

VALID_CATEGORIES = {
    "Orchestration & Control",
    "Context & Memory",
    "Feedback Loops",
    "Learning & Adaptation",
    "Reliability & Eval",
    "Security & Safety",
    "Tool Use & Environment",
    "UX & Collaboration",
    "Uncategorized",
}

# Required YAML fields
REQUIRED_YAML_FIELDS = {"title", "status", "authors", "based_on", "category", "source", "tags"}

# Required markdown sections
REQUIRED_SECTIONS = {"## Problem", "## Solution", "## References"}


class PatternValidator:
    """Validator for pattern files."""

    def __init__(self, strict: bool = False):
        """
        Initialize the validator.

        Args:
            strict: If True, treat warnings as errors
        """
        self.strict = strict

    def validate_file(self, filepath: str) -> ValidationResult:
        """
        Validate a single pattern file.

        Returns ValidationResult with all issues found.
        """
        result = ValidationResult(file_path=filepath, is_valid=True)

        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                lines = content.split('\n')
        except FileNotFoundError:
            result.add_issue(Severity.ERROR, "File", f"File not found: {filepath}")
            return result
        except Exception as e:
            result.add_issue(Severity.ERROR, "File", f"Could not read file: {e}")
            return result

        # Validate YAML front-matter
        self._validate_yaml_front_matter(content, lines, result)

        # Parse metadata for further validation
        metadata = parse_front_matter(filepath)

        # Validate metadata values
        self._validate_metadata(metadata, result)

        # Validate required sections
        self._validate_sections(content, lines, result)

        # Validate Mermaid diagrams
        self._validate_mermaid_diagrams(content, lines, result)

        # Validate URLs
        self._validate_urls(content, lines, result)

        # Content quality checks
        self._validate_content_quality(content, metadata, result)

        return result

    def _validate_yaml_front_matter(self, content: str, lines: List[str], result: ValidationResult):
        """Validate YAML front-matter structure."""
        if not content.startswith('---'):
            result.add_issue(
                Severity.ERROR,
                "YAML",
                "Pattern must start with YAML front-matter delimited by '---'",
                line=1,
                fix_suggestion="Add YAML front-matter at the top of the file"
            )
            return

        # Find end of front-matter (second occurrence of ---)
        end_marker_pos = content.find('\n---', 4)
        if end_marker_pos == -1:
            result.add_issue(
                Severity.ERROR,
                "YAML",
                "YAML front-matter must be closed with '---'",
                fix_suggestion="Close front-matter with '---' on its own line"
            )
            return

        # Convert character position to line number (approximate)
        end_line_num = content[:end_marker_pos].count('\n') + 1

        # Extract only the YAML section (lines 1 to end_line_num)
        yaml_section = lines[1:end_line_num] if end_line_num > 1 else []
        yaml_content = '\n'.join(yaml_section)

        # Check for empty front-matter
        if not yaml_content.strip():
            result.add_issue(
                Severity.ERROR,
                "YAML",
                "YAML front-matter is empty",
                line=2,
                fix_suggestion="Add required YAML fields: title, status, authors, based_on, category, source, tags"
            )

        # Check for proper YAML syntax (key: value pairs)
        for i, yaml_line in enumerate(yaml_section, start=2):
            if yaml_line.strip() and not yaml_line.strip().startswith('#'):
                # Skip empty lines and comments
                if ':' not in yaml_line and not yaml_line.strip().startswith('-'):
                    result.add_issue(
                        Severity.WARNING,
                        "YAML",
                        f"Line may not be valid YAML: {yaml_line[:50]}",
                        line=i
                    )

    def _validate_metadata(self, metadata: dict, result: ValidationResult):
        """Validate metadata field values."""

        # Check required fields
        for field in REQUIRED_YAML_FIELDS:
            if field not in metadata:
                result.add_issue(
                    Severity.ERROR,
                    "Metadata",
                    f"Missing required field: '{field}'",
                    fix_suggestion=f'Add "{field}: <value>" to YAML front-matter'
                )

        # Validate status
        if "status" in metadata:
            status = metadata["status"]
            if status not in VALID_STATUSES:
                result.add_issue(
                    Severity.ERROR,
                    "Metadata",
                    f"Invalid status: '{status}'. Must be one of: {', '.join(sorted(VALID_STATUSES))}",
                    fix_suggestion=f"Use one of: {', '.join(sorted(VALID_STATUSES))}"
                )

        # Validate category
        if "category" in metadata:
            category = metadata["category"]
            if category not in VALID_CATEGORIES:
                result.add_issue(
                    Severity.WARNING,
                    "Metadata",
                    f"Unknown category: '{category}'. Known categories: {', '.join(sorted(VALID_CATEGORIES))}",
                    fix_suggestion=f"Use one of: {', '.join(sorted(VALID_CATEGORIES))}"
                )

        # Validate authors is a list
        if "authors" in metadata:
            authors = metadata["authors"]
            if not isinstance(authors, list):
                result.add_issue(
                    Severity.ERROR,
                    "Metadata",
                    f"'authors' must be a list: ['Name (@username)']",
                    fix_suggestion="Format as: authors: [\"Name (@username)\"]"
                )

        # Validate tags is a list
        if "tags" in metadata:
            tags = metadata["tags"]
            if not isinstance(tags, list):
                result.add_issue(
                    Severity.ERROR,
                    "Metadata",
                    f"'tags' must be a list: [tag1, tag2, tag3]",
                    fix_suggestion="Format as: tags: [tag1, tag2, tag3]"
                )
            # Check for empty tags
            elif any(not tag.strip() for tag in tags):
                result.add_issue(
                    Severity.WARNING,
                    "Metadata",
                    "Tags list contains empty strings",
                    fix_suggestion="Remove empty tags"
                )

        # Validate source is a URL
        if "source" in metadata:
            source = metadata["source"]
            if not source.startswith(("http://", "https://", "arxiv://")):
                result.add_issue(
                    Severity.WARNING,
                    "Metadata",
                    f"'source' should be a URL: {source}",
                    fix_suggestion="Use a valid URL starting with http:// or https://"
                )

        # Title quality checks
        if "title" in metadata:
            title = metadata["title"]
            if len(title) < 10:
                result.add_issue(
                    Severity.WARNING,
                    "Metadata",
                    f"Title seems too short: '{title}'",
                    fix_suggestion="Use a more descriptive title"
                )
            if title.islower():
                result.add_issue(
                    Severity.INFO,
                    "Metadata",
                    "Title should use Title Case",
                    fix_suggestion="Capitalize the first letter of each word"
                )

    def _validate_sections(self, content: str, lines: List[str], result: ValidationResult):
        """Validate required markdown sections."""
        # Skip YAML front-matter
        start_idx = content.find('\n---', 4)
        if start_idx == -1:
            start_idx = 0
        else:
            start_idx += 5

        main_content = content[start_idx:]

        for section in REQUIRED_SECTIONS:
            if section not in main_content:
                result.add_issue(
                    Severity.ERROR,
                    "Structure",
                    f"Missing required section: '{section}'",
                    fix_suggestion=f"Add '## {section}' section"
                )

        # Check for recommended sections (without ## prefix for matching)
        recommended = {"How to use it", "Trade-offs"}
        found_sections = set(re.findall(r'^## (.+)$', main_content, re.MULTILINE))
        missing_recommended = recommended - found_sections

        if missing_recommended:
            for section in missing_recommended:
                result.add_issue(
                    Severity.INFO,
                    "Structure",
                    f"Missing recommended section: '## {section}'",
                    fix_suggestion=f"Consider adding '## {section}' section"
                )

    def _validate_mermaid_diagrams(self, content: str, lines: List[str], result: ValidationResult):
        """Validate Mermaid diagram syntax."""

        # Find all Mermaid code blocks
        mermaid_blocks = re.finditer(r'```mermaid\n(.*?)```', content, re.DOTALL)

        if not mermaid_blocks:
            # Check if pattern might benefit from a diagram
            if "## Solution" in content and len(content) > 2000:
                result.add_issue(
                    Severity.INFO,
                    "Content",
                    "Consider adding a Mermaid diagram to illustrate the pattern",
                    fix_suggestion="Add a Mermaid diagram in the Solution section"
                )
            return

        for match in mermaid_blocks:
            diagram = match.group(1)
            block_start = content[:match.start()].count('\n') + 1

            # Basic Mermaid syntax checks
            valid_diagram_types = {
                "graph", "flowchart", "sequenceDiagram", "classDiagram",
                "stateDiagram", "erDiagram", "gantt", "pie", "gitGraph"
            }

            first_line = diagram.strip().split('\n')[0].strip()
            diagram_type = first_line.split()[0] if first_line else ""

            if diagram_type and diagram_type not in valid_diagram_types:
                result.add_issue(
                    Severity.WARNING,
                    "Mermaid",
                    f"Unrecognized diagram type: '{diagram_type}'",
                    line=block_start + 1,
                    fix_suggestion=f"Use one of: {', '.join(valid_diagram_types)}"
                )

            # Check for common syntax errors
            if ' --' in diagram and '-->' not in diagram:
                result.add_issue(
                    Severity.WARNING,
                    "Mermaid",
                    "Found ' --' which might be a typo for ' -->' (arrow)",
                    line=block_start
                )

            # Check for unclosed brackets/parentheses (basic check)
            open_brackets = diagram.count('[') + diagram.count('(') + diagram.count('{')
            close_brackets = diagram.count(']') + diagram.count(')') + diagram.count('}')
            if open_brackets != close_brackets:
                result.add_issue(
                    Severity.WARNING,
                    "Mermaid",
                    "Unclosed brackets or parentheses detected",
                    line=block_start
                )

    def _validate_urls(self, content: str, lines: List[str], result: ValidationResult):
        """Validate URLs in the document."""
        # Find all URLs
        url_pattern = re.compile(r'https?://[^\s\)]+')

        for i, line in enumerate(lines, start=1):
            urls = url_pattern.findall(line)
            for url in urls:
                # Clean URL (remove trailing punctuation)
                clean_url = re.sub(r'[.,;:]$', '', url)

                # Basic URL format check
                if not re.match(r'^https?://[a-zA-Z0-9\-._~:/?#\[\]@!$&\'()*+,;=%]+$', clean_url):
                    result.add_issue(
                        Severity.WARNING,
                        "URL",
                        f"Potentially malformed URL: {clean_url[:60]}...",
                        line=i
                    )

                # Check for common issues
                if 'arxiv.org' in clean_url.lower():
                    if 'abs/' in clean_url and not clean_url.startswith('https://arxiv.org/abs/'):
                        result.add_issue(
                            Severity.INFO,
                            "URL",
                            f"arXiv URL format may need standardization",
                            line=i
                        )

    def _validate_content_quality(self, content: str, metadata: dict, result: ValidationResult):
        """Perform content quality checks."""

        # Get word counts for sections
        def count_section_text(section_name):
            pattern = rf'## {section_name}\s*\n(.*?)(?=\n## |\Z)'
            match = re.search(pattern, content, re.DOTALL)
            if match:
                text = match.group(1)
                # Remove code blocks
                text = re.sub(r'```.*?```', '', text, flags=re.DOTALL)
                return len(text.split())
            return 0

        # Check Problem section length
        problem_words = count_section_text("Problem")
        if problem_words > 0 and problem_words < 20:
            result.add_issue(
                Severity.WARNING,
                "Content",
                f"Problem section seems too short ({problem_words} words)",
                fix_suggestion="Expand the problem description to at least 2-3 sentences"
            )

        # Check Solution section length
        solution_words = count_section_text("Solution")
        if solution_words > 0 and solution_words < 50:
            result.add_issue(
                Severity.WARNING,
                "Content",
                f"Solution section seems too short ({solution_words} words)",
                fix_suggestion="Expand the solution description with more implementation details"
            )

        # Check for empty sections
        section_pattern = re.compile(r'## ([^\n]+)\s*\n(.*?)(?=\n## |\Z)', re.DOTALL)
        for match in section_pattern.finditer(content):
            section_name = match.group(1)
            section_content = match.group(2).strip()
            if not section_content or section_content == "```":
                result.add_issue(
                    Severity.ERROR,
                    "Content",
                    f"Section '{section_name}' is empty",
                    fix_suggestion=f"Add content to the '{section_name}' section"
                )

        # Check for required blank lines after headers
        header_pattern = re.compile(r'##[^\n]+\n([^\s#])')
        for match in header_pattern.finditer(content):
            line_num = content[:match.start()].count('\n') + 2
            char_after = match.group(1)
            if char_after and char_after != '\n':
                result.add_issue(
                    Severity.WARNING,
                    "Formatting",
                    "Headers should be followed by a blank line for proper list rendering",
                    line=line_num,
                    fix_suggestion="Add a blank line after the header"
                )


def print_validation_result(result: ValidationResult, verbose: bool = False):
    """Print validation results to stdout."""

    # Group issues by severity
    errors = [i for i in result.issues if i.severity == Severity.ERROR]
    warnings = [i for i in result.issues if i.severity == Severity.WARNING]
    infos = [i for i in result.issues if i.severity == Severity.INFO]

    # Print status
    status_icon = "✅" if result.is_valid else "❌"
    filename = Path(result.file_path).name
    print(f"{status_icon} {filename}: {len(result.issues)} issue(s)")

    if not verbose and result.is_valid and not warnings:
        return

    # Print issues
    for issue in result.issues:
        severity_icon = {
            Severity.ERROR: "❌",
            Severity.WARNING: "⚠️ ",
            Severity.INFO: "ℹ️ ",
        }[issue.severity]

        line_info = f":{issue.line}" if issue.line else ""
        print(f"  {severity_icon} [{issue.category}]{line_info} {issue.message}")

        if issue.fix_suggestion:
            print(f"     💡 {issue.fix_suggestion}")

    # Print summary
    if errors:
        print(f"  Summary: {len(errors)} error(s), {len(warnings)} warning(s), {len(infos)} info")


def print_validation_summary(results: List[ValidationResult]):
    """Print overall validation summary."""

    total = len(results)
    valid = sum(1 for r in results if r.is_valid)
    total_issues = sum(len(r.issues) for r in results)

    print(f"\n{'='*60}")
    print(f"SUMMARY: {valid}/{total} files valid, {total_issues} total issue(s)")
    print(f"{'='*60}")

    # Aggregate counts
    all_errors = []
    all_warnings = []

    for result in results:
        all_errors.extend([i for i in result.issues if i.severity == Severity.ERROR])
        all_warnings.extend([i for i in result.issues if i.severity == Severity.WARNING])

    # Common issues
    if all_errors:
        error_cats = {}
        for e in all_errors:
            error_cats[e.category] = error_cats.get(e.category, 0) + 1
        print(f"\nTop error categories:")
        for cat, count in sorted(error_cats.items(), key=lambda x: -x[1])[:5]:
            print(f"  - {cat}: {count}")


def export_validation_report(results: List[ValidationResult], output_file: str):
    """Export validation report to Markdown."""

    lines = [
        "# Pattern Validation Report",
        "",
        f"Generated: {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "",
        "---",
        "",
    ]

    for result in results:
        filename = Path(result.file_path).name
        status = "✅ PASS" if result.is_valid else "❌ FAIL"

        lines.extend([
            f"## {status}: {filename}",
            "",
            f"Issues found: {len(result.issues)}",
            "",
        ])

        if result.issues:
            for issue in result.issues:
                severity = issue.severity.value
                line_info = f":{issue.line}" if issue.line else ""
                lines.extend([
                    f"**{severity}** [{issue.category}]{line_info}",
                    f"{issue.message}",
                ])
                if issue.fix_suggestion:
                    lines.append(f"_Fix: {issue.fix_suggestion}_")
                lines.append("")

        lines.extend(["---", ""])

    with open(output_file, "w") as f:
        f.write("\n".join(lines))

    print(f"\nReport exported to: {output_file}")


def main():
    parser = argparse.ArgumentParser(
        description="Validate pattern files for completeness and quality",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s patterns/new-pattern.md
  %(prog)s --all
  %(prog)s --all --verbose --export report.md
        """,
    )
    parser.add_argument(
        "pattern_file",
        nargs="?",
        help="Path to pattern file to validate",
    )
    parser.add_argument(
        "--all",
        "-a",
        action="store_true",
        help="Validate all pattern files",
    )
    parser.add_argument(
        "--patterns-dir",
        "-d",
        type=str,
        default="patterns",
        help="Path to patterns directory (default: patterns)",
    )
    parser.add_argument(
        "--verbose",
        "-v",
        action="store_true",
        help="Print detailed output for each issue",
    )
    parser.add_argument(
        "--strict",
        "-s",
        action="store_true",
        help="Treat warnings as errors",
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

    # Initialize validator
    validator = PatternValidator(strict=args.strict)

    # Collect files to validate
    files_to_validate = []

    if args.all:
        patterns_dir = Path(args.patterns_dir)
        if not patterns_dir.exists():
            print(f"Error: Patterns directory not found: {patterns_dir}")
            return 1

        for filepath in sorted(patterns_dir.glob("*.md")):
            if filepath.name != "TEMPLATE.md":
                files_to_validate.append(str(filepath))
    else:
        files_to_validate.append(args.pattern_file)

    # Run validation
    print(f"Validating {len(files_to_validate)} file(s)...\n")

    results = []
    for filepath in files_to_validate:
        if not Path(filepath).exists():
            print(f"❌ File not found: {filepath}")
            continue

        result = validator.validate_file(filepath)
        results.append(result)
        print_validation_result(result, verbose=args.verbose)

    # Print summary
    if len(results) > 1:
        print_validation_summary(results)

    # Export if requested
    if args.export:
        export_validation_report(results, args.export)

    # Return exit code
    return 0 if all(r.is_valid for r in results) else 1


if __name__ == "__main__":
    sys.exit(main())
