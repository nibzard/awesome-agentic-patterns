---
title: Deterministic Zero-LLM Orchestration
status: emerging
authors: ["Alex Chernysh (@chernistry)"]
based_on: []
category: Orchestration & Control
source: "https://github.com/sipyourdrink-ltd/bernstein"
tags: [orchestration, multi-agent, parallel-execution, deterministic, test-driven, zero-llm-overhead]
summary: "A deterministic code orchestrator splits goals, runs parallel coding agents, verifies with tests, and commits, spending LLM tokens only on the one-time goal decomposition"
signals: ["Multi-agent coding system spends tokens on routing and coordination", "Project structure is well defined enough for rule-based planning", "You want the same goal to produce the same task breakdown"]
anti_signals: ["Ambiguous goals need LLM judgment to split", "Novel task types need adaptive routing"]
updated_at: "2026-10-13"
---

## Problem

Multi-agent coding systems typically spend LLM tokens on coordination — deciding which agent works on what, routing tasks, merging results. This coordination overhead adds cost, latency, and non-determinism where none is needed.

## Solution

Keep the orchestrator as **deterministic Python code** that spends almost no LLM tokens on coordination. Decomposition makes a single LLM call ("One LLM call, then plain Python from there"), and everything after it — assignment, verification, git — is plain code. The LLM budget goes almost entirely to the agents doing actual work.

```
Goal → Decompose (one LLM call) → Assign to parallel agents → Verify (tests) → Commit
```

For a fully LLM-free path, write the plan file yourself and run it directly with `bernstein run plan.yaml`, skipping LLM planning entirely.

The orchestrator handles:
- Task decomposition via one LLM call, then rule-based planning in code
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

# Fully LLM-free: execute a plan file directly, skipping LLM planning
bernstein run plan.yaml

# Initialize a project, watch a run, stop it
bernstein init
bernstein live
bernstein stop
```

Key implementation choices:
- **No LLM router** — task-to-agent mapping is code, not prompts
- **Test-driven verification** — a janitor process runs tests after each agent completes
- **Git worktree isolation** — each agent works in its own worktree, no conflicts
- **Circuit breaker** — halt on test regression, no silent failures

## Trade-offs

**Pros:**
- Predictable coordination cost (one LLM call at setup, then plain Python; zero with a hand-written plan file)
- Deterministic behavior — same goal produces same task breakdown
- Faster iteration — no waiting for LLM to decide what to do next
- Supports heterogeneous agents (Claude Code, Codex CLI, Gemini CLI, Qwen)

**Cons:**
- Rigid decomposition — can't handle ambiguous goals that need LLM judgment to split
- Requires well-defined project structure for rule-based planning
- Less adaptive than LLM-routed orchestration for novel task types

## References

* [Bernstein](https://github.com/sipyourdrink-ltd/bernstein) — reference implementation of this pattern (repo transferred from `chernistry/bernstein`, which now redirects). Status per its README: beta, solo-maintained, under active development.
* See also: [Sub-Agent Spawning](sub-agent-spawning.md) for the general multi-agent delegation pattern
* See also: [Plan-Then-Execute Pattern](plan-then-execute-pattern.md) for the planning phase approach
