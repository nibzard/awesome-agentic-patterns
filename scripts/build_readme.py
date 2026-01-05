#!/usr/bin/env python3
"""
build_readme.py

Scans all Markdown files in patterns/, parses YAML front-matter to collect
metadata (title, tags, path, category), then regenerates the auto-generated section in
README.md (between the two HTML comment markers) and also updates mkdocs.yaml's nav.

Now uses git-based automatic detection of NEW and UPDATED patterns based on commit dates.

Usage:
    python scripts/build_readme.py
"""

import os
import re
import sys
import unicodedata

# Import git-based pattern dating
from git_pattern_dates import get_all_pattern_labels

def slugify(value):
    """
    Normalizes string, converts to lowercase, removes non-alpha characters,
    and converts spaces to hyphens.
    """
    value = unicodedata.normalize('NFKD', str(value)).encode('ascii', 'ignore').decode('ascii')
    value = re.sub(r'[^\w\s-]', '', value).strip().lower()
    value = re.sub(r'[-\s]+', '-', value)
    return value

def parse_front_matter(filepath):
    """
    Parse YAML front-matter from a Markdown file.
    Returns a dict of the front-matter keys and values.
    """
    front_matter = {}
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    if not lines or lines[0].strip() != '---':
        return front_matter

    # Find the end of front-matter
    end_index = None
    for idx, line in enumerate(lines[1:], start=1):
        if line.strip() == '---':
            end_index = idx
            break
    if end_index is None:
        return front_matter

    yaml_lines = lines[1:end_index]
    for line in yaml_lines:
        if ':' not in line:
            continue
        key, val = line.split(':', 1)
        key = key.strip()
        val = val.strip().strip('"').strip("'")
        if val.startswith('[') and val.endswith(']'):
            # Parse a simple YAML list literal: [a, b, c]
            items = [
                item.strip().strip('"').strip("'")
                for item in val[1:-1].split(',')
                if item.strip()
            ]
            front_matter[key] = items
        else:
            front_matter[key] = val
    return front_matter

def slug_from_filename(filepath):
    base = os.path.basename(filepath)
    return os.path.splitext(base)[0]

def get_pattern_labels_git_based(repo_root, patterns_dir):
    """
    Get NEW and UPDATED pattern labels using git-based detection.
    Returns tuple: (new_patterns_set, updated_patterns_set)
    """
    try:
        return get_all_pattern_labels(repo_root, patterns_dir)
    except Exception as e:
        print(f"Warning: Git-based labeling failed, falling back to no labels: {e}")
        return set(), set()

# Legacy tracker function removed - now using git-based detection

def collect_patterns(patterns_dir):
    """
    Walk through patterns_dir, find all .md files, parse front-matter,
    and collect a list of pattern dicts:
      {
        'slug': 'inversion-of-control',
        'title': 'Inversion of Control',
        'tags': ['orchestration', 'autonomy'],
        'category': 'Orchestration & Control',
        'path': 'patterns/inversion-of-control.md'
      }
    """
    patterns = []
    default_category = "Uncategorized"
    for fname in sorted(os.listdir(patterns_dir)):
        if not fname.lower().endswith('.md') or fname == 'TEMPLATE.md':
            continue
        full = os.path.join(patterns_dir, fname)
        meta = parse_front_matter(full)
        title = meta.get('title', slug_from_filename(full).replace('-', ' ').title())
        tags = meta.get('tags', [])
        category = meta.get('category', default_category)
        slug = slug_from_filename(full)
        patterns.append({
            'slug': slug,
            'title': title,
            'tags': tags,
            'category': category,
            'path': f"patterns/{fname}"
        })
    return patterns

def group_by_category(patterns):
    """
    Given a list of pattern dicts, return a dict mapping each category → list of patterns.
    """
    category_map = {}
    for p in patterns:
        category_map.setdefault(p['category'], []).append(p)
    return category_map

# Category descriptions for the "Quick Tour of Categories" table
CATEGORY_DESCRIPTIONS = {
    "Context & Memory": "Sliding‑window curation, vector cache, episodic memory",
    "Feedback Loops": "Compilers, CI, human review, self‑healing retries",
    "Learning & Adaptation": "Agent RFT, skill libraries, variance‑based RL",
    "Orchestration & Control": "Task decomposition, sub‑agent spawning, tool routing",
    "Reliability & Eval": "Guardrails, eval harnesses, logging, reproducibility",
    "Security & Safety": "Isolated VMs, PII tokenization, security scanning",
    "Tool Use & Environment": "Shell, browser, DB, Playwright, sandbox tricks",
    "UX & Collaboration": "Prompt hand‑offs, staged commits, async background agents",
}

def generate_toc_md(category_map):
    """
    Create a Markdown "Quick Tour of Categories" table from category_map.
    Returns a single concatenated string with the table.
    """
    lines = []
    if not category_map:
        return ""

    lines.append("|  Category                                              |  What you'll find                                         |\n")
    lines.append("| ------------------------------------------------------ | --------------------------------------------------------- |\n")

    for category_name in sorted(category_map.keys(), key=lambda c: c.lower()):
        category_slug = slugify(category_name)
        # Get description from mapping, or use a generic one if not found
        description = CATEGORY_DESCRIPTIONS.get(category_name, "Various patterns")
        # Create markdown link with slugified anchor
        link = f"[**{category_name}**](#{category_slug})"
        lines.append(f"| {link:<54} | {description:<57} |\n")

    return ''.join(lines)

def generate_patterns_md(category_map, new_patterns=None, updated_patterns=None):
    """
    Create a Markdown snippet (string) that groups patterns by category.
    For each category (sorted alphabetically), emits:

    ### <a name="category-slug"></a>Category Name

    - [Pattern Title](patterns/slug.md) <span class='new-badge'>NEW</span>
    - [Pattern Title](patterns/slug.md) <span class='updated-badge'>UPDATED</span>
    - …

    Returns a single concatenated string.
    """
    lines = []
    if not category_map:
        return ""
    new_patterns = new_patterns or set()
    updated_patterns = updated_patterns or set()
    
    for category_name in sorted(category_map.keys(), key=lambda c: c.lower()):
        category_slug = slugify(category_name)
        lines.append(f"### <a name=\"{category_slug}\"></a>{category_name}\n\n")
        for p in sorted(category_map[category_name], key=lambda x: x['title'].lower()):
            pattern_filename = os.path.basename(p['path'])
            if pattern_filename in new_patterns:
                lines.append(f"- [{p['title']}]({p['path']}) <span class='new-badge'>NEW</span>\n")
            elif pattern_filename in updated_patterns:
                lines.append(f"- [{p['title']}]({p['path']}) <span class='updated-badge'>UPDATED</span>\n")
            else:
                lines.append(f"- [{p['title']}]({p['path']})\n")
        lines.append("\n")
    return ''.join(lines)

def update_readme_readandreplace(readme_path, new_section_md):
    """
    Replace everything between the markers:
      <!-- AUTO-GENERATED PATTERNS START -->
      <!-- AUTO-GENERATED PATTERNS END -->

    If markers not found, exit with error.
    """
    start_marker = "<!-- AUTO-GENERATED PATTERNS START -->"
    end_marker   = "<!-- AUTO-GENERATED PATTERNS END -->"
    with open(readme_path, 'r', encoding='utf-8') as f:
        content = f.read()

    if start_marker not in content or end_marker not in content:
        print("Error: Could not find AUTO-GENERATED markers in README.md", file=sys.stderr)
        sys.exit(1)

    # Build the replacement block
    replacement = (
        f"{start_marker}\n\n"
        f"{new_section_md}"
        f"{end_marker}"
    )

    # Use regex to replace everything between markers (inclusive) with replacement
    pattern = re.compile(
        re.escape(start_marker) + r".*?" + re.escape(end_marker),
        re.DOTALL
    )
    updated = pattern.sub(replacement, content)

    with open(readme_path, 'w', encoding='utf-8') as f:
        f.write(updated)

def update_readme_toc(readme_path, toc_md):
    """
    Replace everything between the markers:
      <!-- AUTO-GENERATED TOC START -->
      <!-- AUTO-GENERATED TOC END -->

    If markers not found, exit with error.
    """
    start_marker = "<!-- AUTO-GENERATED TOC START -->"
    end_marker   = "<!-- AUTO-GENERATED TOC END -->"
    with open(readme_path, 'r', encoding='utf-8') as f:
        content = f.read()

    if start_marker not in content or end_marker not in content:
        print("Error: Could not find AUTO-GENERATED TOC markers in README.md", file=sys.stderr)
        sys.exit(1)

    # Build the replacement block (keep newlines for table formatting)
    replacement = (
        f"{start_marker}\n"
        f"{toc_md}"
        f"{end_marker}"
    )

    # Use regex to replace everything between markers (inclusive) with replacement
    pattern = re.compile(
        re.escape(start_marker) + r".*?" + re.escape(end_marker),
        re.DOTALL
    )
    updated = pattern.sub(replacement, content)

    with open(readme_path, 'w', encoding='utf-8') as f:
        f.write(updated)

def generate_mkdocs_nav(patterns, new_patterns=None, updated_patterns=None):
    """
    Build a fresh 'nav:' block for mkdocs.yaml. Keeps any top-level settings
    before 'nav:'. Replaces the old nav entirely.
    """
    nav_lines = []
    nav_lines.append("nav:\n")
    nav_lines.append("  - \"Context is short, you need patterns.\": \"index.md\"\n")
    nav_lines.append("  - Patterns:\n")
    # Group patterns by category for the nav as well
    category_map = group_by_category(patterns)
    # Sort categories for consistent nav order
    sorted_categories = sorted(category_map.keys(), key=lambda c: c.lower())
    new_patterns = new_patterns or set()
    updated_patterns = updated_patterns or set()

    for category_name in sorted_categories:
        nav_lines.append(f"      - \"{category_name}\":\n")
        for p in sorted(category_map[category_name], key=lambda x: x['title'].lower()):
            pattern_filename = os.path.basename(p['path'])
            if pattern_filename in new_patterns:
                nav_lines.append(f"          - \"{p['title']} <span class='new-badge'>NEW</span>\": \"{p['path']}\"\n")
            elif pattern_filename in updated_patterns:
                nav_lines.append(f"          - \"{p['title']} <span class='updated-badge'>UPDATED</span>\": \"{p['path']}\"\n")
            else:
                nav_lines.append(f"          - \"{p['title']}\": \"{p['path']}\"\n")
    return ''.join(nav_lines)

def update_mkdocs_yaml(mkdocs_path, new_nav_md):
    """
    Replace the entire 'nav:' section in mkdocs.yaml with new_nav_md.
    Exits with error if 'nav:' not found.
    """
    with open(mkdocs_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    out = []
    in_nav = False
    replaced = False

    for line in lines:
        if not in_nav and re.match(r'^nav:\s*$', line):
            # Write new nav block (includes 'nav:' line)
            out.append(new_nav_md)
            in_nav = True
            replaced = True
            continue

        if in_nav:
            # Skip all lines that are indented (space or dash) until a new top‐level key
            if re.match(r'^\S', line) and ':' in line and not line.startswith(' '):
                # A new top‐level key (like theme:, site_name:, etc.)
                in_nav = False
                out.append(line)
            else:
                # Drop old nav lines
                continue
        else:
            out.append(line)

    if not replaced:
        print("Error: 'nav:' not found in mkdocs.yaml", file=sys.stderr)
        sys.exit(1)

    with open(mkdocs_path, 'w', encoding='utf-8') as f:
        f.writelines(out)

def main():
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))
    patterns_dir = os.path.join(repo_root, "patterns")
    readme_path = os.path.join(repo_root, "README.md")
    mkdocs_path = os.path.join(repo_root, "mkdocs.yaml")

    if not os.path.isdir(patterns_dir):
        print(f"Error: patterns/ directory not found at {patterns_dir}", file=sys.stderr)
        sys.exit(1)

    patterns = collect_patterns(patterns_dir)
    
    # Get pattern labels using git-based detection
    new_patterns, updated_patterns = get_pattern_labels_git_based(repo_root, patterns_dir)
    
    # Group by category now for README generation
    category_map = group_by_category(patterns)
    new_section_md = generate_patterns_md(category_map, new_patterns, updated_patterns)

    # 0) Update README.md TOC first (Quick Tour of Categories table)
    toc_md = generate_toc_md(category_map)
    update_readme_toc(readme_path, toc_md)
    print("✅ README.md TOC updated.")

    # 1) Update README.md patterns section
    update_readme_readandreplace(readme_path, new_section_md)
    print("✅ README.md auto-generated section updated.")

    # 2) Update mkdocs.yaml (nav will also be grouped by category)
    new_nav_md = generate_mkdocs_nav(patterns, new_patterns, updated_patterns)
    update_mkdocs_yaml(mkdocs_path, new_nav_md)
    print("✅ mkdocs.yaml nav block updated.")
    
    if new_patterns:
        print(f"🆕 {len(new_patterns)} patterns marked as NEW (git-based): {', '.join(sorted(new_patterns))}")
    
    if updated_patterns:
        print(f"🔄 {len(updated_patterns)} patterns marked as UPDATED (git-based): {', '.join(sorted(updated_patterns))}")
    
    if not new_patterns and not updated_patterns:
        print("ℹ️  No patterns qualify for NEW or UPDATED labels based on git history")

if __name__ == "__main__":
    main()
