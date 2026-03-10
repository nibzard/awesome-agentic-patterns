#!/usr/bin/env python3
"""
Auto-fix pattern quality issues:
- Add missing recommended sections: "## How to use it", "## Trade-offs"
- Ensure every pattern has "## References"
- Ensure References contains at least one URL (falling back to front-matter source)
- Use category-specific boilerplate when inserting recommended sections
"""

import argparse
import re
from pathlib import Path


DEFAULT_HOW_TO_USE_LINES = [
    "- Use this when the pattern appears repeatedly across workflows.",
    "- Start with a narrow rollout and clear success criteria.",
    "- Track outcomes in logs and evals so you can refine the pattern safely.",
]

HOW_TO_USE_BY_CATEGORY = {
    "Orchestration & Control": [
        "- Use this when tasks need explicit control flow between planning, execution, and fallback.",
        "- Start with one high-volume workflow before applying it across all agent lanes.",
        "- Define ownership for each phase so failures can be routed and recovered quickly.",
    ],
    "Context & Memory": [
        "- Use this when model quality depends on selecting or retaining the right context.",
        "- Start with strict context budgets and explicit memory retention rules.",
        "- Measure relevance and retrieval hit-rate before increasing memory breadth.",
    ],
    "Feedback Loops": [
        "- Use this when agent quality improves only after iterative critique or retries.",
        "- Start with one objective metric and one feedback loop trigger.",
        "- Record failure modes so each loop produces reusable learning artifacts.",
    ],
    "Learning & Adaptation": [
        "- Use this when behavior must improve over time from data, outcomes, or policy updates.",
        "- Start with offline experiments before enabling adaptive behavior in production.",
        "- Keep a holdout evaluation set to catch regressions during adaptation.",
    ],
    "Reliability & Eval": [
        "- Use this when you need predictable outcomes under changing load or model behavior.",
        "- Start with explicit SLOs for quality, latency, and error rates.",
        "- Add release gates so violations block rollout automatically.",
    ],
    "Security & Safety": [
        "- Use this when tool access, data exposure, or action authority must be tightly controlled.",
        "- Start with deny-by-default policy and minimal required privileges.",
        "- Continuously audit logs for attempted policy bypass and anomalous behavior.",
    ],
    "Tool Use & Environment": [
        "- Use this when agent success depends on reliable tool invocation and environment setup.",
        "- Start with a narrow tool surface and explicit parameter validation.",
        "- Add observability around tool latency, failures, and fallback paths.",
    ],
    "UX & Collaboration": [
        "- Use this when humans and agents share ownership of work across handoffs.",
        "- Start with clear interaction contracts for approvals, overrides, and escalation.",
        "- Capture user feedback in structured form so prompts and workflows can improve.",
    ],
}

DEFAULT_TRADE_OFFS = {
    "pros": "Better consistency and easier handoff across teams.",
    "cons": "Added process overhead and ongoing maintenance cost.",
}

TRADE_OFFS_BY_CATEGORY = {
    "Orchestration & Control": {
        "pros": "Improves coordination across multi-step workflows and reduces hidden control flow.",
        "cons": "Adds orchestration complexity and more states to debug.",
    },
    "Context & Memory": {
        "pros": "Raises answer quality by keeping context relevant and reducing retrieval noise.",
        "cons": "Requires ongoing tuning of memory policies and indexing quality.",
    },
    "Feedback Loops": {
        "pros": "Turns repeated failures into measurable improvements over time.",
        "cons": "Can increase runtime and operational cost due to iterative passes.",
    },
    "Learning & Adaptation": {
        "pros": "Compounds model and workflow performance as new data arrives.",
        "cons": "Raises governance burden around drift, regressions, and data quality.",
    },
    "Reliability & Eval": {
        "pros": "Improves predictability and catches regressions before user impact.",
        "cons": "Requires robust instrumentation and disciplined evaluation maintenance.",
    },
    "Security & Safety": {
        "pros": "Reduces blast radius and data risk in high-privilege environments.",
        "cons": "May restrict capability and increase policy management overhead.",
    },
    "Tool Use & Environment": {
        "pros": "Improves execution success and lowers tool-call failure rates.",
        "cons": "Introduces integration coupling and environment-specific upkeep.",
    },
    "UX & Collaboration": {
        "pros": "Creates clearer human-agent handoffs and better operational trust.",
        "cons": "Needs explicit process design and coordination across teams.",
    },
}

URL_RE = re.compile(r"https?://\S+")


def split_front_matter(text: str) -> tuple[str, str]:
    if not text.startswith("---\n"):
        return "", text
    match = re.match(r"\A---\n.*?\n---\n?", text, flags=re.DOTALL)
    if not match:
        return "", text
    return match.group(0), text[match.end():]


def parse_front_matter_value(front_matter: str, key: str) -> str:
    key_prefix = f"{key}:"
    for line in front_matter.splitlines():
        stripped = line.strip()
        if not stripped.startswith(key_prefix):
            continue
        value = stripped.split(":", 1)[1].strip()
        value = re.sub(r"\s+#.*$", "", value).strip()
        value = value.strip('"').strip("'")
        return value
    return ""


def parse_source_url(front_matter: str) -> str:
    value = parse_front_matter_value(front_matter, "source")
    if value.startswith(("http://", "https://")):
        return value
    return ""


def parse_category(front_matter: str) -> str:
    return parse_front_matter_value(front_matter, "category")


def find_heading_index(lines: list[str], heading_regex: str) -> int | None:
    pattern = re.compile(heading_regex, flags=re.IGNORECASE)
    for idx, line in enumerate(lines):
        if pattern.match(line.strip()):
            return idx
    return None


def build_how_to_use_block(category: str) -> list[str]:
    lines = HOW_TO_USE_BY_CATEGORY.get(category, DEFAULT_HOW_TO_USE_LINES)
    return ["## How to use it", ""] + lines + [""]


def build_trade_offs_block(category: str) -> list[str]:
    trade = TRADE_OFFS_BY_CATEGORY.get(category, DEFAULT_TRADE_OFFS)
    return [
        "## Trade-offs",
        "",
        f"* **Pros:** {trade['pros']}",
        f"* **Cons:** {trade['cons']}",
        "",
    ]


def ensure_reference_hygiene(lines: list[str], source_url: str) -> tuple[list[str], bool]:
    changed = False
    refs_idx = find_heading_index(lines, r"^##\s+References\b")

    if refs_idx is None:
        if lines and lines[-1].strip():
            lines.append("")
        lines.extend(["## References", ""])
        if source_url:
            lines.append(f"- Primary source: {source_url}")
        else:
            lines.append("- Add at least one public reference link.")
        return lines, True

    next_heading = len(lines)
    for idx in range(refs_idx + 1, len(lines)):
        if re.match(r"^##\s+", lines[idx].strip()):
            next_heading = idx
            break

    ref_lines = lines[refs_idx + 1:next_heading]
    ref_text = "\n".join(ref_lines)
    if not URL_RE.search(ref_text):
        if ref_lines and ref_lines[-1].strip():
            ref_lines.append("")
        if source_url:
            ref_lines.append(f"- Primary source: {source_url}")
        else:
            ref_lines.append("- Add at least one public reference link.")
        lines = lines[:refs_idx + 1] + ref_lines + lines[next_heading:]
        changed = True

    return lines, changed


def fix_pattern_content(content: str, source_url: str, category: str) -> tuple[str, bool]:
    lines = content.splitlines()
    changed = False

    has_how = find_heading_index(lines, r"^##\s+How to use") is not None
    has_trade = find_heading_index(lines, r"^##\s+Trade-?offs\b") is not None
    refs_idx = find_heading_index(lines, r"^##\s+References\b")

    insertion_blocks: list[str] = []
    if not has_how:
        insertion_blocks.extend(build_how_to_use_block(category))
    if not has_trade:
        insertion_blocks.extend(build_trade_offs_block(category))

    if insertion_blocks:
        changed = True
        if refs_idx is None:
            if lines and lines[-1].strip():
                lines.append("")
            lines.extend(insertion_blocks)
        else:
            before = lines[:refs_idx]
            after = lines[refs_idx:]
            if before and before[-1].strip():
                before.append("")
            lines = before + insertion_blocks + after

    lines, refs_changed = ensure_reference_hygiene(lines, source_url)
    changed = changed or refs_changed

    fixed = "\n".join(lines).rstrip() + "\n"
    return fixed, changed


def iter_target_files(patterns_dir: Path, single_file: str | None) -> list[Path]:
    if single_file:
        return [Path(single_file)]
    return [path for path in sorted(patterns_dir.glob("*.md")) if path.name != "TEMPLATE.md"]


def main() -> int:
    parser = argparse.ArgumentParser(description="Auto-fix missing sections and references in patterns.")
    parser.add_argument("--patterns-dir", default="patterns", help="Patterns directory (default: patterns)")
    parser.add_argument("--file", help="Fix a single pattern file")
    args = parser.parse_args()

    patterns_dir = Path(args.patterns_dir)
    targets = iter_target_files(patterns_dir, args.file)

    changed_files = []
    for path in targets:
        text = path.read_text(encoding="utf-8")
        front_matter, body = split_front_matter(text)
        source_url = parse_source_url(front_matter)
        category = parse_category(front_matter)
        fixed_body, changed = fix_pattern_content(body, source_url, category)
        if changed:
            updated = f"{front_matter}{fixed_body}" if front_matter else fixed_body
            path.write_text(updated, encoding="utf-8")
            changed_files.append(str(path))

    print(f"Updated {len(changed_files)} pattern file(s).")
    for file_path in changed_files:
        print(f"- {file_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
