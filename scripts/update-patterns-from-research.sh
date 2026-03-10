#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
ROOT_DIR=$(cd -- "$SCRIPT_DIR/.." && pwd)

PATTERNS_DIR=${PATTERNS_DIR:-"$ROOT_DIR/patterns"}
RESEARCH_DIR=${RESEARCH_DIR:-"$ROOT_DIR/research"}
LOG_DIR=${LOG_DIR:-"$ROOT_DIR/research/logs"}
CLAUDE_BIN=${CLAUDE_BIN:-claude}
CLAUDE_MODEL=${CLAUDE_MODEL:-}
LOOP_DELAY_SECONDS=${LOOP_DELAY_SECONDS:-0}
TARGET_PATTERN=${TARGET_PATTERN:-}
TEMPLATE_LINK=${TEMPLATE_LINK:-"https://github.com/nibzard/awesome-agentic-patterns/blob/main/TEMPLATE.md"}

usage() {
  cat <<'EOF'
Usage:
  scripts/update-patterns-from-research.sh
  scripts/update-patterns-from-research.sh --pattern <slug-or-path>

Options:
  --pattern <slug-or-path>  Run one specific pattern (slug like "plan-then-execute-pattern"
                            or a path like patterns/plan-then-execute-pattern.md)
  -h, --help               Show this help.

Environment:
  PATTERNS_DIR             Override pattern directory (default: <repo>/patterns)
  RESEARCH_DIR             Override research directory (default: <repo>/research)
  LOG_DIR                  Override log directory (default: <repo>/research/logs)
  CLAUDE_BIN               Claude CLI binary (default: claude)
  CLAUDE_MODEL             Optional model override
  LOOP_DELAY_SECONDS       Optional delay between runs in seconds (default: 0)
  TEMPLATE_LINK            Pattern template reference URL injected into Claude prompt
EOF
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Error: required command not found: $1" >&2
    exit 1
  fi
}

log_contains_update_marker() {
  local log_path="$1"
  local marker="$2"

  if command -v rg >/dev/null 2>&1; then
    rg -F -q "$marker" "$log_path"
    return $?
  fi

  require_cmd grep
  grep -F -q "$marker" "$log_path"
}

slug_from_pattern_file() {
  local path="$1"
  path="${path##*/}"
  path="${path%.md}"
  printf "%s" "$path"
}

find_research_file() {
  local slug="$1"
  local candidate
  local -a matches

  shopt -s nullglob

  candidate="$RESEARCH_DIR/${slug}-report.md"
  if [ -f "$candidate" ]; then
    printf "%s" "$candidate"
    return 0
  fi

  matches=("$RESEARCH_DIR/${slug}-"*".md")
  if [ "${#matches[@]}" -eq 0 ]; then
    return 1
  fi

  for candidate in "${matches[@]}"; do
    if [[ "$candidate" == "$RESEARCH_DIR/${slug}-report.md" ]]; then
      printf "%s" "$candidate"
      return 0
    fi
  done

  printf "%s" "${matches[0]}"
  return 0
}

run_update_once() {
  local pattern_file="$1"
  local research_file="$2"
  local run_id log_file log_abs prompt
  local exit_code=0

  run_id="$(date -u +%Y%m%d-%H%M%S)-$$-$(basename "$pattern_file" .md)"
  log_file="pattern-update-${run_id}.log"
  log_abs="$LOG_DIR/$log_file"

  prompt="You are editing existing pattern docs only. Read these two files and update the pattern with findings from research:

- Pattern: ${pattern_file}
- Research: ${research_file}
- Template (style reference): ${TEMPLATE_LINK}

Guidelines:
1) Edit only '${pattern_file}'. Do not create or edit any other file.
2) Follow template style from: ${TEMPLATE_LINK}.
3) Keep existing top-level sections; do not add new top-level sections.
4) Update only existing content with high-confidence findings from '${research_file}'.
5) Keep net diff small (target <= 25 added lines and <= 3 new references).
6) Prioritize mechanism clarity over case-study detail; avoid long company/vendor examples.
7) Numeric claim rule: include only if explicit in research with source/year context; otherwise omit.
8) If evidence is uncertain or conflicting, shorten/remove the claim instead of elaborating.
9) Preserve concise tone and avoid speculative language.
10) If there is no clear improvement, leave the file unchanged.

Before finishing, self-check:
- No new top-level sections
- No speculative claims
- References remain compact
- Pattern stays concise

After you finish editing, print exactly one line:
PATTERN_UPDATED=${pattern_file}"

  mkdir -p "$LOG_DIR"
  echo "Updating $pattern_file using $research_file"
  echo "Log: $log_file"

  local cmd=(
    "$CLAUDE_BIN"
    -p "$prompt"
    --dangerously-skip-permissions
    --add-dir "$ROOT_DIR"
  )
  if [ -n "$CLAUDE_MODEL" ]; then
    cmd+=(--model "$CLAUDE_MODEL")
  fi

  set +e
  (
    cd "$ROOT_DIR"
    # Keep Claude from consuming the parent loop's stdin (pattern file list).
    "${cmd[@]}" </dev/null
  ) >"$log_abs" 2>&1
  exit_code=$?
  set -e

  if [ "$exit_code" -ne 0 ]; then
    echo "Failure for $pattern_file (exit=$exit_code), see $log_file" >&2
    return 1
  fi

  if ! log_contains_update_marker "$log_abs" "PATTERN_UPDATED=${pattern_file}"; then
    echo "No completion marker found for $pattern_file, inspect $log_file" >&2
    return 1
  fi

  echo "Updated: $pattern_file"
  return 0
}

run_all_patterns() {
  local pattern_file slug research_file
  local status=0

  mkdir -p "$LOG_DIR"

  while IFS= read -r pattern_file; do
    slug=$(slug_from_pattern_file "$pattern_file")
    research_file=$(find_research_file "$slug" || true)

    if [ -z "$research_file" ]; then
      echo "Skipping $slug (no matching research file in $RESEARCH_DIR)"
      continue
    fi

    if ! run_update_once "$pattern_file" "$research_file"; then
      status=1
    fi

    if [ "$LOOP_DELAY_SECONDS" -gt 0 ]; then
      sleep "$LOOP_DELAY_SECONDS"
    fi
  done < <(find "$PATTERNS_DIR" -maxdepth 1 -type f -name '*.md' ! -name 'TEMPLATE.md' | sort)

  return "$status"
}

run_specific_pattern() {
  local slug="$1"
  local pattern_file="$PATTERNS_DIR/${slug}.md"

  if [ -f "$slug" ] && [[ "$slug" == *.md ]]; then
    pattern_file="$slug"
  fi

  if [ ! -f "$pattern_file" ]; then
    echo "Error: pattern file not found: $pattern_file" >&2
    exit 1
  fi

  slug=$(slug_from_pattern_file "$pattern_file")
  local research_file
  research_file=$(find_research_file "$slug" || true)
  if [ -z "$research_file" ]; then
    echo "Error: no matching research file for pattern $slug" >&2
    exit 1
  fi

  run_update_once "$pattern_file" "$research_file"
}

parse_args() {
  while [ $# -gt 0 ]; do
    case "$1" in
      --pattern)
        if [ -z "${2:-}" ]; then
          echo "Error: --pattern requires a value." >&2
          usage
          exit 1
        fi
        TARGET_PATTERN="$2"
        shift 2
        ;;
      -h|--help)
        usage
        exit 0
        ;;
      *)
        echo "Error: unknown option '$1'" >&2
        usage
        exit 1
        ;;
    esac
  done
}

main() {
  parse_args "$@"
  if command -v rg >/dev/null 2>&1; then
    :
  else
    echo "Notice: rg not found; using grep for marker checks."
  fi
  require_cmd "$CLAUDE_BIN"

  if [ ! -d "$PATTERNS_DIR" ]; then
    echo "Error: pattern directory not found: $PATTERNS_DIR" >&2
    exit 1
  fi

  if [ -n "$TARGET_PATTERN" ]; then
    run_specific_pattern "$TARGET_PATTERN"
  else
    run_all_patterns
  fi
}

main "$@"
