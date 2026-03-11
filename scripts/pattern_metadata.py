#!/usr/bin/env python3
"""
Minimal front-matter parsing utilities shared by legacy Python scripts.

The repo no longer has the old build_readme.py module, but a few Python tools
still need basic access to pattern metadata. This helper keeps that surface area
small without reintroducing the previous README build script.
"""

from __future__ import annotations

import ast
from typing import Any, Dict


def _parse_scalar(value: str) -> Any:
    value = value.strip()
    if not value:
        return ""

    if value.startswith("[") and value.endswith("]"):
        inner = value[1:-1].strip()
        if not inner:
            return []
        try:
            parsed = ast.literal_eval(value)
            if isinstance(parsed, list):
                return parsed
        except (SyntaxError, ValueError):
            pass
        return [_parse_scalar(item) for item in inner.split(",")]

    if value.startswith(("[", "{", '"', "'")):
        try:
            return ast.literal_eval(value)
        except (SyntaxError, ValueError):
            return value.strip("\"'")

    lowered = value.lower()
    if lowered == "true":
        return True
    if lowered == "false":
        return False
    if lowered in {"null", "none"}:
        return None

    for cast in (int, float):
        try:
            return cast(value)
        except ValueError:
            continue

    return value.strip("\"'")


def parse_front_matter(file_path: str) -> Dict[str, Any]:
    with open(file_path, "r", encoding="utf-8") as handle:
        content = handle.read()

    if not content.startswith("---\n"):
        return {}

    end_index = content.find("\n---", 4)
    if end_index == -1:
        raise ValueError(f"Unclosed front matter in {file_path}")

    metadata: Dict[str, Any] = {}
    current_key: str | None = None

    for raw_line in content[4:end_index].splitlines():
        line = raw_line.rstrip()
        stripped = line.strip()

        if not stripped or stripped.startswith("#"):
            continue

        if line.startswith((" ", "\t")) and current_key and isinstance(metadata.get(current_key), list):
            item = stripped
            if item.startswith("- "):
                metadata[current_key].append(_parse_scalar(item[2:]))
            continue

        if ":" not in line:
            continue

        key, raw_value = line.split(":", 1)
        key = key.strip()
        raw_value = raw_value.strip()

        if raw_value == "":
            metadata[key] = []
            current_key = key
            continue

        metadata[key] = _parse_scalar(raw_value)
        current_key = key

    return metadata
