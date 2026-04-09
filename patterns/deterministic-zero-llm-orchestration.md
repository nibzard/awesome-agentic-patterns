---
title: Deterministic Zero-LLM Orchestration
status: emerging
authors: ["Alex Chernysh (@chernistry)"]
based_on: ["Plan-Then-Execute Pattern", "Bernstein (chernistry)"]
category: Orchestration & Control
source: "https://arxiv.org/abs/2405.15103"
tags: [orchestration, multi-agent, parallel-execution, deterministic, test-driven, zero-llm-overhead]
---

## Problem

Multi-agent coding systems typically spend LLM tokens on coordination -- deciding which agent works on what, routing tasks, merging results. This coordination overhead adds cost, latency, and non-determinism where none is needed. When the LLM is also the router, you get unpredictable task assignments and fragile orchestration that breaks when the model changes.

## Solution

Keep the orchestrator as **deterministic code** that spends zero LLM tokens on coordination. The LLM budget goes entirely to the agents doing actual work.

```
Goal → Decompose (deterministic) → Assign to parallel agents → Verify (tests) → Commit
```

The orchestrator handles:

- Task decomposition via rule-based planning (file heuristics, dependency graphs, or convention-based splits)
- Agent assignment and parallel spawning
- Result verification through test execution
- Git operations (branching, merging, committing)

Agents handle:

- Code generation
- Problem solving
- Implementation decisions

```pseudo
// Deterministic planner: split goal by file/module convention
function plan(goal):
    files = affected_files(goal)           // e.g. parse goal for file patterns
    tasks = []
    for file_group in partition(files):
        tasks.append({
            agent: select_agent(file_group),  // rule-based, not LLM
            scope: file_group,
            tests: find_tests(file_group)
        })
    return tasks

// Parallel execution with test-gated merge
function orchestrate(goal):
    tasks = plan(goal)
    results = parallel_execute(tasks)  // each agent in own worktree
    for result in results:
        if not run_tests(result.scope):
            reject(result)
    merge(results)
```

Key design choices:

- **No LLM router** -- task-to-agent mapping is code, not prompts
- **Test-driven verification** -- run tests after each agent completes; reject regressions
- **Workspace isolation** -- each agent works in its own branch or worktree to avoid conflicts
- **Circuit breaker** -- halt on test regression, no silent failures

## How to use it

1. **Define a deterministic planner** that decomposes goals into tasks using project conventions. Common strategies:
   - File-path heuristics: split tasks by directory or module boundary
   - Dependency graph: identify independent subgraphs for parallel work
   - Convention-based: one task per test suite, API endpoint, or feature flag

2. **Assign agents by capability**, not by LLM reasoning. Map task types to agent backends:
   - Code generation tasks → your strongest coding model
   - Documentation tasks → a cheaper or faster model
   - Review tasks → a separate model for independent evaluation

3. **Isolate agent workspaces.** Give each agent its own git worktree or branch so parallel work never conflicts. Merge only after verification passes.

4. **Gate every merge on tests.** Run the relevant test suite after each agent completes. If tests fail, reject the result and optionally retry with the failure as context.

5. **Set a budget.** Track token spend per agent and enforce caps to prevent runaway costs on stuck tasks.

## Trade-offs

- **Pros:**
  - Predictable coordination cost (zero LLM tokens on orchestration)
  - Deterministic behavior -- same goal produces same task breakdown
  - Faster iteration -- no waiting for an LLM to decide what to do next
  - Supports heterogeneous agents (Claude Code, Codex CLI, Gemini CLI, or any agent CLI)

- **Cons:**
  - Rigid decomposition -- can't handle ambiguous goals that need LLM judgment to split
  - Requires well-defined project structure for rule-based planning to work
  - Less adaptive than LLM-routed orchestration for novel or ill-specified task types
  - Planner must be maintained as the project evolves

## References

- [Plan-Then-Execute Pattern](plan-then-execute-pattern.md) -- the general planning phase approach this pattern builds on
- [Sub-Agent Spawning](sub-agent-spawning.md) -- the general multi-agent delegation pattern
- [Bernstein](https://github.com/chernistry/bernstein) -- open-source implementation of this pattern with parallel agent orchestration and test-gated merging
