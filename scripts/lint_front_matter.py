#!/usr/bin/env python3
"""
lint_front_matter.py

Validate pattern front-matter for schema drift and obvious errors.
"""

from pathlib import Path
import sys

ALLOWED_CATEGORIES = {
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

ALLOWED_STATUSES = {
    "proposed",
    "emerging",
    "established",
    "validated-in-production",
    "best-practice",
    "experimental-but-awesome",
    "rapidly-improving",
}

REQUIRED_KEYS = {"title", "status", "category", "tags"}
WARN_KEYS = {"authors", "based_on", "source"}


def parse_front_matter(lines, path):
    if not lines or lines[0].strip() != "---":
        return None
    data = {}
    for line in lines[1:]:
        if line.strip() == "---":
            break
        if ":" not in line:
            continue
        key, val = line.split(":", 1)
        key = key.strip()
        value = val.strip()
        if "#" in value:
            value = value.split("#", 1)[0].strip()
        value = value.strip('"').strip("'")
        data[key] = value
    return data


def lint_file(path):
    lines = path.read_text(encoding="utf-8").splitlines()
    data = parse_front_matter(lines, path)
    errors = []
    warnings = []

    if data is None:
        errors.append("missing front-matter block")
        return errors, warnings

    if "source_link" in data:
        errors.append("uses source_link (use source instead)")

    missing_required = REQUIRED_KEYS - data.keys()
    if missing_required:
        errors.append(f"missing required keys: {', '.join(sorted(missing_required))}")

    status = data.get("status", "")
    if status and status not in ALLOWED_STATUSES:
        errors.append(f"invalid status: {status}")

    category = data.get("category", "")
    if category and category not in ALLOWED_CATEGORIES:
        errors.append(f"invalid category: {category}")

    tags = data.get("tags", "")
    if tags and not (tags.startswith("[") and tags.endswith("]")):
        warnings.append("tags is not a list literal (expected [tag1, tag2])")

    for key in sorted(WARN_KEYS):
        if not data.get(key):
            warnings.append(f"missing {key}")

    return errors, warnings


def main():
    root = Path(__file__).resolve().parents[1]
    patterns_dir = root / "patterns"
    errors_by_file = {}
    warnings_by_file = {}

    for path in sorted(patterns_dir.glob("*.md")):
        if path.name == "TEMPLATE.md":
            continue
        errors, warnings = lint_file(path)
        if errors:
            errors_by_file[str(path)] = errors
        if warnings:
            warnings_by_file[str(path)] = warnings

    for file_path in sorted(errors_by_file):
        for err in errors_by_file[file_path]:
            print(f"ERROR {file_path}: {err}")

    for file_path in sorted(warnings_by_file):
        for warn in warnings_by_file[file_path]:
            print(f"WARN  {file_path}: {warn}")

    if errors_by_file:
        print(f"\nFound {len(errors_by_file)} files with errors.")
        return 1

    if warnings_by_file:
        print(f"\nFound {len(warnings_by_file)} files with warnings.")
    else:
        print("Front-matter lint clean.")

    return 0


if __name__ == "__main__":
    sys.exit(main())
