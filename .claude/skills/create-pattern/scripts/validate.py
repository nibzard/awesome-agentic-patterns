#!/usr/bin/env python3
"""Validate pattern front-matter against repository schema."""

import sys
from pathlib import Path

# Allowed values for validation
ALLOWED_CATEGORIES = [
    "Orchestration & Control",
    "Context & Memory",
    "Feedback Loops",
    "Learning & Adaptation",
    "Reliability & Eval",
    "Security & Safety",
    "Tool Use & Environment",
    "UX & Collaboration",
    "Uncategorized",
]

ALLOWED_STATUSES = [
    "proposed",
    "emerging",
    "established",
    "validated-in-production",
    "best-practice",
    "experimental-but-awesome",
    "rapidly-improving",
]

REQUIRED_FIELDS = ["title", "status", "authors", "based_on", "category", "source", "tags"]


def extract_frontmatter(file_path: Path) -> tuple[str, dict]:
    """Extract YAML frontmatter from a markdown file."""
    content = file_path.read_text()
    if not content.startswith("---"):
        raise ValueError("File does not start with frontmatter delimiter")

    # Find the end of frontmatter
    end_idx = content.find("\n---", 4)
    if end_idx == -1:
        raise ValueError("Frontmatter not properly closed")

    yaml_str = content[4:end_idx]
    return content, parse_yaml_simple(yaml_str)


def parse_yaml_simple(yaml_str: str) -> dict:
    """Simple YAML parser for frontmatter - handles basic key: value pairs."""
    result = {}
    for line in yaml_str.strip().split("\n"):
        if ":" in line and not line.strip().startswith("#"):
            key, value = line.split(":", 1)
            key = key.strip()
            value = value.strip()

            # Handle lists
            if value.startswith("[") and value.endswith("]"):
                value = [v.strip().strip('"\'') for v in value[1:-1].split(",")]
            # Strip quotes from strings
            elif value.startswith('"') and value.endswith('"'):
                value = value[1:-1]
            elif value.startswith("'") and value.endswith("'"):
                value = value[1:-1]

            result[key] = value

    return result


def validate_pattern(file_path: str | Path) -> bool:
    """Validate a pattern file's frontmatter."""
    path = Path(file_path)

    if not path.exists():
        print(f"❌ File not found: {path}")
        return False

    try:
        content, frontmatter = extract_frontmatter(path)
    except ValueError as e:
        print(f"❌ {e}")
        return False

    errors = []

    # Check required fields
    for field in REQUIRED_FIELDS:
        if field not in frontmatter:
            errors.append(f"Missing required field: {field}")

    # Validate category
    if "category" in frontmatter and frontmatter["category"] not in ALLOWED_CATEGORIES:
        errors.append(
            f"Invalid category: {frontmatter['category']}. "
            f"Must be one of: {', '.join(ALLOWED_CATEGORIES)}"
        )

    # Validate status
    if "status" in frontmatter and frontmatter["status"] not in ALLOWED_STATUSES:
        errors.append(
            f"Invalid status: {frontmatter['status']}. "
            f"Must be one of: {', '.join(ALLOWED_STATUSES)}"
        )

    # Validate authors is a list
    if "authors" in frontmatter and not isinstance(frontmatter["authors"], list):
        errors.append("authors must be a list (e.g., [\"Name (@username)\"])")

    # Validate tags is a list
    if "tags" in frontmatter and not isinstance(frontmatter["tags"], list):
        errors.append("tags must be a list (e.g., [tag1, tag2, tag3])")

    if errors:
        for error in errors:
            print(f"❌ {error}")
        return False

    # Check for required sections in content
    required_sections = ["## Problem", "## Solution", "## References"]
    for section in required_sections:
        if section not in content:
            errors.append(f"Missing section: {section}")

    if errors:
        for error in errors:
            print(f"❌ {error}")
        return False

    print(f"✅ Pattern validation passed: {path.name}")
    return True


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python validate.py <pattern-file.md>")
        sys.exit(1)

    success = validate_pattern(sys.argv[1])
    sys.exit(0 if success else 1)
