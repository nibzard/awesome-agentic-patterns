---
title: Deterministic Zero-LLM Orchestration
status: validated-in-production
authors: ["Alex Chernysh (@chernistry)"]
based_on: []
category: Orchestration & Control
source: "https://github.com/chernistry/bernstein"
tags: [orchestration, multi-agent, parallel-execution, deterministic, test-driven, zero-llm-overhead]
---

## Problem

Multi-agent coding systems typically spend LLM tokens on coordination — deciding which agent works on what, routing tasks, merging results. This coordination overhead adds cost, latency, and non-determinism where none is needed.

## Solution

Keep the orchestrator as **deterministic Python code** that spends zero LLM tokens on coordination. The LLM budget goes entirely to the agents doing actual work.

```
Goal → Decompose (deterministic) → Assign to parallel agents → Verify (tests) → Commit
```

The orchestrator handles:
- Task decomposition via rule-based planning
- Agent assignment and parallel spawning (Claude Code, Codex CLI, Gemini CLI)
- Result verification through test execution
- Git operations (branching, merging, committing)

Agents handle:
- Code generation
- Problem solving
- Implementation decisions

## How to use it

```bash
# Single goal → parallel agents → verified commits
bernstein -g "Add JWT auth with refresh tokens, tests, and API docs"

# Headless for CI pipelines
bernstein --headless

# Self-evolution mode: propose and sandbox improvements
bernstein --evolve --budget 5.00
```

Key implementation choices:
- **No LLM router** — task-to-agent mapping is code, not prompts
- **Test-driven verification** — a janitor process runs tests after each agent completes
- **Git worktree isolation** — each agent works in its own worktree, no conflicts
- **Circuit breaker** — halt on test regression, no silent failures

## Trade-offs

**Pros:**
- Predictable coordination cost (zero LLM tokens)
- Deterministic behavior — same goal produces same task breakdown
- Faster iteration — no waiting for LLM to decide what to do next
- Supports heterogeneous agents (Claude Code, Codex CLI, Gemini CLI, Qwen)

**Cons:**
- Rigid decomposition — can't handle ambiguous goals that need LLM judgment to split
- Requires well-defined project structure for rule-based planning
- Less adaptive than LLM-routed orchestration for novel task types

## References

* [Bernstein](https://github.com/chernistry/bernstein) — Production implementation of this pattern
* See also: [Sub-Agent Spawning](sub-agent-spawning.md) for the general multi-agent delegation pattern
* See also: [Plan-Then-Execute Pattern](plan-then-execute-pattern.md) for the planning phase approach
