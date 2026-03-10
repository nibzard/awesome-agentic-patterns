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
VALIDATE_REPORTS=0
TARGET_PATTERN=""
VALIDATION_MODE="strict"

usage() {
  cat <<'EOF'
Usage:
  scripts/claude-research-loop.sh [--bootstrap-only] [--once]
  scripts/claude-research-loop.sh --pattern <pattern-slug>
  scripts/claude-research-loop.sh --validate-reports
  scripts/claude-research-loop.sh --validate-reports --validation-mode research

Options:
  --bootstrap-only      Create/sync the tracker JSON and exit.
  --once                Run a single pending pattern and exit.
  --pattern <slug>      Force one run for a specific pattern slug.
  --validate-reports    Validate report quality for tracked patterns without running Claude.
  --validation-mode <strict|research>
                        strict (default): unresolved/status failures are hard.
                        research: unresolved/status failures are warnings.
                        Add `**Validation Override:** pass` in a report header
                        to opt out of strict status/unresolved checks.
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
    if [ ! -s "$TRACKER_FILE" ]; then
      echo "Warning: tracker file is empty; reinitializing: $TRACKER_FILE" >&2
      rm -f "$TRACKER_FILE"
    elif jq -e '.patterns | type == "array"' "$TRACKER_FILE" >/dev/null 2>&1; then
      return 0
    else
      echo "Warning: tracker file is invalid or missing patterns; reinitializing: $TRACKER_FILE" >&2
      rm -f "$TRACKER_FILE"
    fi
  fi

  local now tmp
  now=$(now_utc)
  tmp=$(mktemp)
  jq -n --arg now "$now" --arg root "$ROOT_DIR" '
    {
      version: 1,
      root: $root,
      created_at: $now,
      updated_at: $now,
      patterns: []
    }
  ' > "$tmp"

  mv "$tmp" "$TRACKER_FILE"
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

recover_completed_reports() {
  local now tmp
  now=$(now_utc)
  local completed_patterns=()
  local pattern report_file report_abs

  while IFS='|' read -r pattern report_file status; do
    if [ -z "$pattern" ] || [ -z "$report_file" ] || [ "$status" = "done" ]; then
      continue
    fi

    report_abs="$ROOT_DIR/$report_file"
    if [ ! -f "$report_abs" ]; then
      continue
    fi

    if is_report_quality_complete "$report_abs"; then
      completed_patterns+=("$pattern")
    fi
  done < <(jq -r '.patterns[] | "\(.pattern)|\(.report_file)|\(.status // "")"' "$TRACKER_FILE")

  for pattern in "${completed_patterns[@]}"; do
    tmp=$(mktemp)

    jq --arg pattern "$pattern" --arg now "$now" '
      .updated_at = $now
      | .patterns |= map(
          if .pattern == $pattern then
            .status = "done"
            | .last_error = null
            | .last_exit_code = (.last_exit_code // 0)
            | .run_count = (.run_count // 0)
            | .last_run_finished_at = $now
          else
            .
          end
        )
    ' "$TRACKER_FILE" > "$tmp"

    mv "$tmp" "$TRACKER_FILE"
  done
}

is_report_complete() {
  local report_file="$1"
  local status_line
  local override

  [ -f "$report_file" ] || return 1

  if rg -q '^COMPLETED_REPORT=' "$report_file"; then
    return 0
  fi

  override="$(report_validation_override "$report_file")"
  if [ "$override" = "pass" ]; then
    return 0
  fi

  status_line="$(
    rg -m1 -i '^\s*(\|\s*)?\*{0,2}(?:pattern\s+|research\s+|report\s+)?(?:status|status\s+assessment|research\s+status|pattern\s+status|readiness)(?:\s+assessment)?\*{0,2}\s*:' "$report_file" \
      | sed -E 's/^[^:]*:[[:space:]]*//'
  )"

  [ -z "$status_line" ] && return 1

  status_line="$(printf '%s' "$status_line" | tr '[:upper:]' '[:lower:]' | sed -E 's/[|*]//g; s/^[[:space:]]+//; s/[[:space:]]+$//')"

  case "$status_line" in
    *complete*|*done*|*established*|*production*|*validated*|*active*|*final*)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

report_metadata_value() {
  local report_file="$1"
  local metadata_key="$2"

  rg -m1 -i "^\\s*\\*{0,2}${metadata_key}\\*{0,2}\\s*:" "$report_file" \
    | sed -E 's/^[^:]*:[[:space:]]*//; s/^[[:space:]]+//; s/[[:space:]]+$//'
}

report_validation_override() {
  local report_file="$1"
  local value

  value="$(report_metadata_value "$report_file" "Validation Override")"
  if [ -z "$value" ]; then
    printf "%s" ""
    return 0
  fi

  value="$(printf '%s' "$value" | tr '[:upper:]' '[:lower:]' | sed -E 's/[[:space:]]+/-/g; s/[^a-z0-9-]//g; s/^-+//; s/-+$//')"

  case "$value" in
    pass|manual-pass|manual|approved|accepted|allow-warnings|allow-issues|manual-pass-ok|research-pass|researchok|research-mode|override-pass|validated)
      printf "%s" "pass"
      return 0
      ;;
    *)
      printf "%s" ""
      return 1
      ;;
  esac
}

report_has_unresolved_markers() {
  local report_file="$1"

  rg -n -i 'Needs verification|UNVERIFIED|\\[ID\\]|needs-verification' "$report_file" >/dev/null
}

report_has_invalid_arxiv_markers() {
  local report_file="$1"

  rg -n -i 'https?://arxiv\\.org/(abs|html|pdf)/\\[[^]]+\\]|arxiv\\.org/(abs|html|pdf)/[0-9]{4}\\.[Xx]{5,}\\b|arxiv:[0-9]{4}\\.[Xx]{5,}\\b' "$report_file" >/dev/null
}

is_report_quality_complete() {
  local report_file="$1"

  if ! is_report_complete "$report_file"; then
    return 1
  fi

  if report_has_unresolved_markers "$report_file"; then
    return 1
  fi

  if report_has_invalid_arxiv_markers "$report_file"; then
    return 1
  fi

  return 0
}

report_quality_issues() {
  local report_file="$1"
  local override

  override="$(report_validation_override "$report_file")"

  if [ ! -f "$report_file" ]; then
    echo "missing_report_file"
    return 0
  fi

  if [ "$override" != "pass" ] && ! is_report_complete "$report_file"; then
    if [ "$VALIDATION_MODE" = "research" ]; then
      echo "warning:report_status_incomplete"
    else
      echo "report_status_incomplete"
    fi
  fi

  if [ "$override" != "pass" ] && report_has_unresolved_markers "$report_file"; then
    if [ "$VALIDATION_MODE" = "research" ]; then
      echo "warning:unresolved_markers"
    else
      echo "unresolved_markers"
    fi
  fi

  if report_has_invalid_arxiv_markers "$report_file"; then
    echo "invalid_arxiv_placeholder"
  fi
}

validate_reports() {
  local pattern report_file report_abs
  local hard_issues_count=0
  local warning_count=0
  local pattern_count=0

  printf "pattern,report_file,issue\n"

  while IFS='|' read -r pattern report_file; do
    if [ -z "$pattern" ] || [ -z "$report_file" ] || [ "$report_file" = "null" ]; then
      ((hard_issues_count+=1))
      printf "%s,%s,missing_report_file\n" "$pattern" "" "missing_report_file"
      continue
    fi

    pattern_count=$((pattern_count + 1))
    report_abs="$ROOT_DIR/$report_file"

    while IFS= read -r issue; do
      [ -z "$issue" ] && continue
      if [ "${issue#warning:}" != "$issue" ]; then
        warning_count=$((warning_count + 1))
      else
        hard_issues_count=$((hard_issues_count + 1))
      fi
      printf "%s,%s,%s\n" "$pattern" "$report_file" "$issue"
    done < <(report_quality_issues "$report_abs")
  done < <(jq -r '.patterns[] | "\(.pattern)|\(.report_file | select(type == "string"))"' "$TRACKER_FILE")

  if [ "$hard_issues_count" -eq 0 ]; then
    if [ "$warning_count" -gt 0 ]; then
      echo "Validation passed with ${warning_count} warning(s)."
    fi
    echo "All ${pattern_count} report files pass quality checks."
    return 0
  fi

  echo "Validation failed: ${hard_issues_count} hard issue(s) found in report files." >&2
  if [ "$warning_count" -gt 0 ]; then
    echo "Non-blocking warnings: ${warning_count}. Add --validation-mode research for warning-only mode." >&2
  fi
  return 1
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
  jq -r '[.patterns[] | select(.status == "pending") | .pattern][0] // empty' "$TRACKER_FILE"
}

pattern_report_exists() {
  local pattern="$1"
  local report_file
  report_file="$(get_pattern_report_file "$pattern")"

  if [ -z "$report_file" ] || [ "$report_file" = "null" ]; then
    return 1
  fi

  [ -f "$ROOT_DIR/$report_file" ]
}

pattern_report_is_complete() {
  local pattern="$1"
  local report_file
  report_file="$(get_pattern_report_file "$pattern")"

  if [ -z "$report_file" ] || [ "$report_file" = "null" ]; then
    return 1
  fi

  is_report_quality_complete "$ROOT_DIR/$report_file"
}

recover_inconsistent_done_reports() {
  local now tmp
  local pattern report_file
  local done_patterns=()
  now=$(now_utc)

  while IFS='|' read -r pattern report_file; do
    if [ -z "$pattern" ] || [ -z "$report_file" ]; then
      continue
    fi

    if ! is_report_quality_complete "$ROOT_DIR/$report_file"; then
      done_patterns+=("$pattern")
    fi
  done < <(jq -r '.patterns[] | select(.status == "done") | "\(.pattern)|\(.report_file | select(type == "string"))"' "$TRACKER_FILE")

  for pattern in "${done_patterns[@]}"; do
    tmp=$(mktemp)
    jq --arg pattern "$pattern" --arg now "$now" '
      .updated_at = $now
      | .patterns |= map(
          if .pattern == $pattern then
            .status = "pending"
            | .last_error = "Recovered stale done status"
            | .last_exit_code = null
            | .last_run_finished_at = null
          else
            .
          end
        )
    ' "$TRACKER_FILE" > "$tmp"

    mv "$tmp" "$TRACKER_FILE"
  done
}

mark_pattern_skipped_existing_report() {
  local pattern="$1"
  local now tmp
  now=$(now_utc)
  tmp=$(mktemp)

  jq --arg pattern "$pattern" --arg now "$now" '
    .updated_at = $now
    | .patterns |= map(
        if .pattern == $pattern then
          .status = "done"
          | .last_error = null
          | .last_exit_code = 0
          | .last_run_id = ("skipped-existing-report-" + $now)
          | .last_run_started_at = $now
          | .last_run_finished_at = $now
          | .run_count = (.run_count // 0)
        else
          .
        end
      )
  ' "$TRACKER_FILE" > "$tmp"

  mv "$tmp" "$TRACKER_FILE"
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
  prompt="Create a team of agents. Your only deliverable is one markdown report at ${report_rel} for the pattern ${pattern}, and it must be written by updating this single file as work progresses. Constraints: 1) Write to only one file: ${report_rel}. 2) If ${report_rel} exists, update it in-place; if not, create it. 3) Do not create, edit, or reference any other files in research/. 4) If any content is uncertain, mark it as \"Needs verification\". 5) Keep the tracker canonical: this run is recorded in ${TRACKER_FILE} and the report_file for this pattern must be ${report_rel}. 6) Set the report status header to \"**Status:** Completed\". 7) If unresolved or incomplete items are intentionally acceptable, include: **Validation Override:** pass. 8) At completion print exactly: COMPLETED_REPORT=${report_rel}. 9) If the report is completed, do not leave placeholder citation markers (for example: [ID], arxiv.org/[...], or needs-verification rows)."

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
  elif ! is_report_quality_complete "$report_abs"; then
    final_status="failed"
    error_msg="report_status_incomplete"
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
      --validate-reports)
        VALIDATE_REPORTS=1
        shift
        ;;
      --validation-mode)
        if [ -z "${2:-}" ]; then
          echo "Error: --validation-mode requires a value." >&2
          usage
          exit 1
        fi
        case "$2" in
          strict|research)
            VALIDATION_MODE="$2"
            ;;
          *)
            echo "Error: unknown validation mode '$2'. Expected strict or research." >&2
            usage
            exit 1
            ;;
        esac
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
  require_cmd rg
  if [ "$BOOTSTRAP_ONLY" -ne 1 ] && [ "$VALIDATE_REPORTS" -ne 1 ]; then
    require_cmd "$CLAUDE_BIN"
  fi

  ensure_dirs
  ensure_tracker_file
  sync_tracker_with_patterns
  if [ "$VALIDATE_REPORTS" -eq 1 ]; then
    if ! validate_reports; then
      exit 1
    fi
    exit 0
  fi

  recover_inconsistent_done_reports
  recover_completed_reports
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

    if pattern_report_exists "$TARGET_PATTERN"; then
      if pattern_report_is_complete "$TARGET_PATTERN"; then
        report_file="$(get_pattern_report_file "$TARGET_PATTERN")"
        echo "Skipping pattern (existing report): $TARGET_PATTERN ($report_file)"
        mark_pattern_skipped_existing_report "$TARGET_PATTERN"
        print_summary
        exit 0
      fi
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

    if pattern_report_exists "$pattern"; then
      if pattern_report_is_complete "$pattern"; then
        report_file="$(get_pattern_report_file "$pattern")"
        echo "Skipping pattern (existing report): $pattern ($report_file)"
        mark_pattern_skipped_existing_report "$pattern"
        if [ "$RUN_ONCE" -eq 1 ]; then
          break
        fi
        continue
      fi
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
