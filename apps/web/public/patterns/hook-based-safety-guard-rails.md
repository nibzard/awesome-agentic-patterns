---
title: "Hook-Based Safety Guard Rails for Autonomous Code Agents"
status: "validated-in-production"
authors: ["yurukusa (@yurukusa)"]
based_on: ["Claude Code Hooks (Anthropic)", "claude-code-ops-starter (https://github.com/yurukusa/claude-code-ops-starter)"]
category: "Security & Safety"
source: "https://docs.anthropic.com/en/docs/claude-code/hooks"
tags: [hooks, guard-rails, safety, autonomous-operation, destructive-command-blocking, context-monitoring, pre-tool-use, post-tool-use]
---

## Problem

Autonomous code agents running unattended can execute destructive commands (`rm -rf`, `git reset --hard`), exhaust their context window without saving state, leak secrets via `git push`, or silently produce syntax errors that cascade into later failures.

These failures share a pattern: the agent took an action that a simple automated check would have caught. The agent itself can't reliably self-police because it operates within the same context that produces the mistakes.

## Solution

Use the agent framework's hook system (PreToolUse / PostToolUse events) to inject safety checks that run outside the agent's reasoning loop. Each hook is a small shell script that inspects tool inputs or outputs and either warns, blocks, or logs.

**Four guard rails that cover the most common failure modes:**

1. **Dangerous command blocker** (PreToolUse: Bash) — Pattern-matches commands for `rm -rf`, `git reset --hard`, `DROP TABLE`, etc. Blocks or warns before execution.

2. **Syntax checker** (PostToolUse: Edit/Write) — After every file edit, runs the appropriate linter (`python -m py_compile`, `bash -n`, `jq empty`). Catches errors immediately instead of 50 tool calls later.

3. **Context window monitor** (PostToolUse: all) — Counts tool calls as a proxy for context consumption. Issues graduated warnings (soft → hard → critical) and auto-generates a checkpoint file when context is dangerously low.

4. **Autonomous decision enforcer** (PreToolUse: AskUserQuestion) — Blocks the agent from asking "should I continue?" during unattended sessions. Forces the agent to decide and log uncertainty instead.

```bash
# Example: dangerous command blocker (simplified)
#!/bin/bash
INPUT="$(cat)"
CMD="$(echo "$INPUT" | jq -r '.tool_input.command // empty')"

if echo "$CMD" | grep -qE 'rm\s+-rf|git\s+reset\s+--hard|git\s+clean\s+-fd'; then
  echo "BLOCKED: Destructive command detected: $(echo "$CMD" | head -c 100)"
  exit 2  # non-zero = block the tool call
fi
exit 0  # 0 = allow
```

## How to use it

- Register hooks in the agent's settings file (e.g., `settings.json` for Claude Code).
- Each hook is a standalone shell script — no dependencies on the agent's internal state.
- PreToolUse hooks receive the tool name and input as JSON on stdin. Return exit code 2 to block.
- PostToolUse hooks receive the tool name, input, and output. Return exit code 0 (hooks can only warn, not block after execution).
- Start with the dangerous command blocker (highest impact, lowest effort).

## Trade-offs

- **Pros:**
  - Runs outside the agent's context — immune to prompt injection or reasoning failures
  - Language-agnostic (shell scripts work with any agent framework that supports hooks)
  - Each hook is independently deployable — add one at a time
  - Zero performance overhead for the agent (hooks run in milliseconds)

- **Cons/Considerations:**
  - Pattern matching is inherently incomplete — creative destructive commands may slip through
  - Context monitoring via tool-call counting is a proxy, not exact measurement
  - Hooks can't prevent the agent from reasoning about dangerous actions, only from executing them
  - Requires the agent framework to support PreToolUse/PostToolUse events

## References

- [Claude Code Hooks documentation](https://docs.anthropic.com/en/docs/claude-code/hooks) — Official hook system for Claude Code
- [claude-code-ops-starter](https://github.com/yurukusa/claude-code-ops-starter) — Open-source implementation of these 4 hooks with a risk-score diagnostic
- [Replit AI deletes production database](https://www.theregister.com/2025/07/21/replit_bug/) — Real-world example of why guard rails matter
