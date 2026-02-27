#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
ROOT_DIR=$(cd -- "$SCRIPT_DIR/.." && pwd)

PATTERNS_DIR=${PATTERNS_DIR:-"$ROOT_DIR/patterns"}
RESEARCH_DIR=${RESEARCH_DIR:-"$ROOT_DIR/research"}
TRACKER_FILE=${TRACKER_FILE:-"$RESEARCH_DIR/pattern-research-tracker.json"}
LOG_DIR="$RESEARCH_DIR/logs"
PROJECT_PINNED_CLAUDE_BIN=${PROJECT_PINNED_CLAUDE_BIN:-"$HOME/.local/share/claude/versions/2.1.34"}
if [ -z "${CLAUDE_BIN:-}" ]; then
  if command -v claude >/dev/null 2>&1; then
    CLAUDE_BIN="claude"
  elif [ -x "$PROJECT_PINNED_CLAUDE_BIN" ]; then
    CLAUDE_BIN="$PROJECT_PINNED_CLAUDE_BIN"
  else
    echo "Error: CLAUDE_BIN not set and neither 'claude' nor pinned binary '${PROJECT_PINNED_CLAUDE_BIN}' are available." >&2
    exit 1
  fi
fi
CLAUDE_MODEL=${CLAUDE_MODEL:-}
LOOP_DELAY_SECONDS=${LOOP_DELAY_SECONDS:-0}

RUN_ONCE=0
BOOTSTRAP_ONLY=0
TARGET_PATTERN=""

usage() {
  cat <<'EOF'
Usage:
  scripts/claude-research-loop.sh [--bootstrap-only] [--once]
  scripts/claude-research-loop.sh --pattern <pattern-slug>

Options:
  --bootstrap-only      Create/sync the tracker JSON and exit.
  --once                Run a single pending pattern and exit.
  --pattern <slug>      Force one run for a specific pattern slug.
  -h, --help            Show this help.

Environment:
  CLAUDE_BIN            Claude CLI binary override (default: global `claude`)
  PROJECT_PINNED_CLAUDE_BIN
                        Optional fallback pinned binary path (default: ~/.local/share/claude/versions/2.1.34)
  CLAUDE_MODEL          Optional Claude model name
  LOOP_DELAY_SECONDS    Optional delay between runs (default: 0)
  PATTERNS_DIR          Optional override (default: <repo>/patterns)
  RESEARCH_DIR          Optional override (default: <repo>/research)
  TRACKER_FILE          Optional override (default: <research>/pattern-research-tracker.json)
EOF
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Error: required command not found: $1" >&2
    exit 1
  fi
}

now_utc() {
  date -u +"%Y-%m-%dT%H:%M:%SZ"
}

normalize_pattern_slug() {
  local value="$1"
  value="${value##*/}"
  value="${value%.md}"
  printf "%s" "$value"
}

ensure_dirs() {
  mkdir -p "$RESEARCH_DIR"
  mkdir -p "$LOG_DIR"
}

list_patterns_json() {
  if [ ! -d "$PATTERNS_DIR" ]; then
    echo "[]"
    return 0
  fi

  find "$PATTERNS_DIR" -maxdepth 1 -type f -name '*.md' ! -name 'TEMPLATE.md' -print \
    | sed -E 's|.*/||; s|\.md$||' \
    | sort -u \
    | jq -R -s 'split("\n") | map(select(length > 0))'
}

ensure_tracker_file() {
  if [ -f "$TRACKER_FILE" ]; then
    if jq -e . "$TRACKER_FILE" >/dev/null 2>&1; then
      return 0
    fi
    echo "Error: tracker file is not valid JSON: $TRACKER_FILE" >&2
    exit 1
  fi

  local now
  now=$(now_utc)
  jq -n --arg now "$now" --arg root "$ROOT_DIR" '
    {
      version: 1,
      root: $root,
      created_at: $now,
      updated_at: $now,
      patterns: []
    }
  ' > "$TRACKER_FILE"
}

sync_tracker_with_patterns() {
  local now slugs_json tmp
  now=$(now_utc)
  slugs_json=$(list_patterns_json)
  tmp=$(mktemp)

  jq --arg now "$now" --arg root "$ROOT_DIR" --argjson slugs "$slugs_json" '
    .version = 1
    | .root = $root
    | .created_at = (.created_at // $now)
    | .updated_at = $now
    | (.patterns // []) as $existing_patterns
    | .patterns = (
        $slugs
        | map(
            . as $pattern
            | ($existing_patterns | map(select(.pattern == $pattern)) | .[0]) as $existing
            | if $existing then
                $existing
                | .source_file = ("patterns/" + $pattern + ".md")
                | .report_file = ("research/" + $pattern + "-report.md")
                | .run_count = (.run_count // 0)
                | .runs = (.runs // [])
              else
                {
                  pattern: $pattern,
                  source_file: ("patterns/" + $pattern + ".md"),
                  report_file: ("research/" + $pattern + "-report.md"),
                  status: "pending",
                  run_count: 0,
                  last_run_id: null,
                  last_exit_code: null,
                  last_error: null,
                  last_run_started_at: null,
                  last_run_finished_at: null,
                  runs: []
                }
              end
          )
      )
  ' "$TRACKER_FILE" > "$tmp"

  mv "$tmp" "$TRACKER_FILE"
}

get_pattern_report_file() {
  local pattern="$1"
  jq -r --arg pattern "$pattern" '.patterns[] | select(.pattern == $pattern) | .report_file' "$TRACKER_FILE"
}

recover_running_states() {
  local now tmp
  now=$(now_utc)
  tmp=$(mktemp)

  jq --arg now "$now" '
    .updated_at = $now
    | .patterns |= map(
        if .status == "running" then
          .status = "pending"
          | .last_error = ("Recovered interrupted run on " + $now)
        else
          .
        end
      )
  ' "$TRACKER_FILE" > "$tmp"

  mv "$tmp" "$TRACKER_FILE"
}

pattern_exists() {
  local pattern="$1"
  jq -e --arg pattern "$pattern" '.patterns[] | select(.pattern == $pattern)' "$TRACKER_FILE" >/dev/null 2>&1
}

mark_pattern_pending() {
  local pattern="$1"
  local now tmp
  now=$(now_utc)
  tmp=$(mktemp)

  jq --arg pattern "$pattern" --arg now "$now" '
    .updated_at = $now
    | .patterns |= map(
        if .pattern == $pattern then
          .status = "pending"
        else
          .
        end
      )
  ' "$TRACKER_FILE" > "$tmp"

  mv "$tmp" "$TRACKER_FILE"
}

next_pending_pattern() {
  jq -r '.patterns[] | select(.status == "pending") | .pattern' "$TRACKER_FILE" | head -n 1
}

mark_pattern_running() {
  local pattern="$1"
  local run_id="$2"
  local started_at="$3"
  local now tmp
  now=$(now_utc)
  tmp=$(mktemp)

  jq --arg pattern "$pattern" \
     --arg run_id "$run_id" \
     --arg started_at "$started_at" \
     --arg now "$now" '
    .updated_at = $now
    | .patterns |= map(
        if .pattern == $pattern then
          .status = "running"
          | .last_run_id = $run_id
          | .last_run_started_at = $started_at
          | .last_run_finished_at = null
          | .last_exit_code = null
          | .last_error = null
        else
          .
        end
      )
  ' "$TRACKER_FILE" > "$tmp"

  mv "$tmp" "$TRACKER_FILE"
}

mark_pattern_finished() {
  local pattern="$1"
  local run_id="$2"
  local started_at="$3"
  local finished_at="$4"
  local final_status="$5"
  local exit_code="$6"
  local error_msg="$7"
  local log_file="$8"
  local report_file="$9"
  local tmp
  tmp=$(mktemp)

  jq --arg pattern "$pattern" \
     --arg run_id "$run_id" \
     --arg started_at "$started_at" \
     --arg finished_at "$finished_at" \
     --arg status "$final_status" \
     --arg error_msg "$error_msg" \
     --arg log_file "$log_file" \
     --arg report_file "$report_file" \
     --arg now "$finished_at" \
     --argjson exit_code "$exit_code" '
    .updated_at = $now
    | .patterns |= map(
        if .pattern == $pattern then
          .status = $status
          | .run_count = ((.run_count // 0) + 1)
          | .last_run_id = $run_id
          | .last_exit_code = $exit_code
          | .last_error = (if $error_msg == "" then null else $error_msg end)
          | .last_run_started_at = $started_at
          | .last_run_finished_at = $finished_at
          | .report_file = $report_file
          | .runs = (
              (.runs // [])
              + [{
                  run_id: $run_id,
                  started_at: $started_at,
                  finished_at: $finished_at,
                  status: $status,
                  exit_code: $exit_code,
                  log_file: $log_file,
                  report_file: $report_file,
                  error: (if $error_msg == "" then null else $error_msg end)
                }]
            )
        else
          .
        end
      )
  ' "$TRACKER_FILE" > "$tmp"

  mv "$tmp" "$TRACKER_FILE"
}

run_pattern() {
  local pattern="$1"
  local started_at finished_at run_id log_rel log_abs report_rel report_abs prompt
  local exit_code final_status error_msg

  started_at=$(now_utc)
  run_id="$(date -u +%Y%m%d-%H%M%S)-$$-${pattern}"
  log_rel="research/logs/${run_id}.log"
  log_abs="$ROOT_DIR/$log_rel"
  report_rel=$(get_pattern_report_file "$pattern")
  if [ -z "$report_rel" ] || [ "$report_rel" = "null" ]; then
    report_rel="research/${pattern}-report.md"
  fi
  report_abs="$ROOT_DIR/$report_rel"
  prompt="Create a team of agents. Your only deliverable is one markdown report at ${report_rel} for the pattern ${pattern}, and it must be written by updating this single file as work progresses. Constraints: 1) Write to only one file: ${report_rel}. 2) If ${report_rel} exists, update it in-place; if not, create it. 3) Do not create, edit, or reference any other files in research/. 4) If any content is uncertain, mark it as \"Needs verification\". 5) Keep the tracker canonical: this run is recorded in ${TRACKER_FILE} and the report_file for this pattern must be ${report_rel}. 6) At completion print exactly: COMPLETED_REPORT=${report_rel}"

  mark_pattern_running "$pattern" "$run_id" "$started_at"

  echo "Running pattern: $pattern"
  echo "Run id: $run_id"
  echo "Log file: $log_rel"

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
    "${cmd[@]}"
  ) 2>&1 | tee "$log_abs"
  exit_code=${PIPESTATUS[0]}
  set -e

  final_status="done"
  error_msg=""
  if [ "$exit_code" -ne 0 ]; then
    final_status="failed"
    error_msg="claude_exit_code_${exit_code}"
  elif [ ! -s "$report_abs" ]; then
    final_status="failed"
    error_msg="missing_or_empty_report_file"
  fi

  finished_at=$(now_utc)
  mark_pattern_finished \
    "$pattern" \
    "$run_id" \
    "$started_at" \
    "$finished_at" \
    "$final_status" \
    "$exit_code" \
    "$error_msg" \
    "$log_rel" \
    "$report_rel"

  if [ "$final_status" = "done" ]; then
    echo "Completed: $report_rel"
    return 0
  fi

  echo "Failed: $pattern ($error_msg)"
  return 1
}

print_summary() {
  jq -r '
    .patterns as $patterns
    | "Summary: total=\($patterns | length) pending=\($patterns | map(select(.status == "pending")) | length) running=\($patterns | map(select(.status == "running")) | length) done=\($patterns | map(select(.status == "done")) | length) failed=\($patterns | map(select(.status == "failed")) | length)"
  ' "$TRACKER_FILE"
}

parse_args() {
  while [ $# -gt 0 ]; do
    case "$1" in
      --bootstrap-only)
        BOOTSTRAP_ONLY=1
        shift
        ;;
      --once)
        RUN_ONCE=1
        shift
        ;;
      --pattern)
        if [ -z "${2:-}" ]; then
          echo "Error: --pattern requires a value." >&2
          usage
          exit 1
        fi
        TARGET_PATTERN=$(normalize_pattern_slug "$2")
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
  require_cmd jq
  if [ "$BOOTSTRAP_ONLY" -ne 1 ]; then
    require_cmd "$CLAUDE_BIN"
  fi

  ensure_dirs
  ensure_tracker_file
  sync_tracker_with_patterns
  recover_running_states

  if [ "$BOOTSTRAP_ONLY" -eq 1 ]; then
    echo "Tracker ready: $TRACKER_FILE"
    print_summary
    exit 0
  fi

  if [ -n "$TARGET_PATTERN" ]; then
    if ! pattern_exists "$TARGET_PATTERN"; then
      echo "Error: pattern not found in tracker: $TARGET_PATTERN" >&2
      exit 1
    fi

    mark_pattern_pending "$TARGET_PATTERN"
    if run_pattern "$TARGET_PATTERN"; then
      print_summary
      exit 0
    fi
    print_summary
    exit 1
  fi

  while true; do
    local pattern
    pattern=$(next_pending_pattern)
    if [ -z "$pattern" ]; then
      break
    fi

    if ! run_pattern "$pattern"; then
      echo "Continuing with next pending pattern."
    fi

    if [ "$RUN_ONCE" -eq 1 ]; then
      break
    fi

    if [ "$LOOP_DELAY_SECONDS" -gt 0 ]; then
      sleep "$LOOP_DELAY_SECONDS"
    fi
  done

  print_summary
}

main "$@"
