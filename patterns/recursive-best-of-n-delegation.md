---
title: "Recursive Best-of-N Delegation"
status: emerging
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Labruno (GitHub)", "Daytona RLM Guide", "Recursive Language Models (arXiv 2512.24601)", "Self-Consistency (Wang et al. 2022)", "Tree-of-Thoughts (Yao et al. 2023)"]
category: "Orchestration & Control"
source: "https://github.com/nibzard/labruno-agent"
tags: [recursion, best-of-n, parallel-sandboxes, judge, delegation, rlms, selection, sub-agents]
---

## Problem

Recursive delegation (parent agent → sub-agents → sub-sub-agents) decomposes big tasks, but has a failure mode:

- A single weak sub-agent result can poison the parent's next steps (wrong assumption, missed file, bad patch)
- Errors compound up the tree: "one bad leaf" can derail the whole rollout
- Pure recursion underuses parallelism when a node is uncertain: you want multiple shots *right where the ambiguity is*

Meanwhile, "best-of-N" parallel attempts help reliability, but without structure they waste compute by repeatedly solving the *same* problem instead of decomposing it. The pattern applies parallelism only where uncertainty exists—at the subtask level—while maintaining structured decomposition.

## Solution

At *each node* in a recursive agent tree, run **best-of-N** for the current subtask before expanding further. This combines the structured decomposition of recursive delegation with the reliability of self-consistency sampling:

1. **Decompose:** Parent turns task into sub-tasks (like normal recursive delegation)
2. **Parallel candidates per subtask:** For each subtask, spawn **K candidate workers** in isolated sandboxes (K=2-5 typical)
3. **Score candidates:** Use a judge that combines:
   - Automated signals (tests, lint, exit code, diff size, runtime)
   - LLM-as-judge rubric (correctness, adherence to constraints, simplicity)
4. **Select + promote:** Pick the top candidate as the "canonical" result for that subtask
5. **Escalate uncertainty:** If the judge confidence is low (or candidates disagree), either:
   - Increase K for that subtask, or
   - Spawn a focused "investigator" sub-agent to gather missing facts, then re-run selection
6. **Aggregate upward:** Parent synthesizes selected results and continues recursion

```mermaid
flowchart TD
    A[Parent task] --> B[Decompose into subtasks]
    B --> C1[Subtask 1]
    B --> C2[Subtask 2]

    C1 --> D1[Worker 1a]
    C1 --> D2[Worker 1b]
    C1 --> D3[Worker 1c]
    D1 --> J1[Judge + tests]
    D2 --> J1
    D3 --> J1
    J1 --> S1[Select best result 1]

    C2 --> E1[Worker 2a]
    C2 --> E2[Worker 2b]
    E1 --> J2[Judge + tests]
    E2 --> J2
    J2 --> S2[Select best result 2]

    S1 --> Z[Aggregate + continue recursion]
    S2 --> Z
```

## How to use it

Best for tasks where:

- Subtasks are *shardable*, but each shard can be tricky (ambiguous API use, repo-specific conventions)
- You can score outputs cheaply (unit tests, type checks, lint, golden files)
- "One wrong move" is costly (migration diffs, security-sensitive changes, large refactors)

Practical defaults:

- Start with **K=2** for most subtasks
- Increase to **K=5** only on "high uncertainty" nodes (low judge confidence, conflicting outputs, failing tests)
- Keep the rubric explicit: "must pass tests; minimal diff; no new dependencies; follow style guide"

## Trade-offs

**Pros:**

- Much more robust than single-recursion: local uncertainty gets extra shots
- Compute is targeted: you spend K where it matters, not globally
- Works naturally with sandboxed execution and patch-based workflows

**Cons:**

- More orchestration complexity (judge, scoring, confidence thresholds)
- Higher cost/latency if you overuse K
- Judge quality becomes a bottleneck; add objective checks whenever possible

## References

* [Self-Consistency (Wang et al. 2022): Foundation for best-of-N sampling via majority voting](https://arxiv.org/abs/2203.11171)
* [Recursive Language Models (arXiv 2512.24601, 2025): Recursion as inference-time scaling](https://arxiv.org/abs/2512.24601)
* [Tree-of-Thoughts (Yao et al. 2023): Tree-based reasoning with evaluation mechanisms](https://arxiv.org/abs/2305.10601)
* [Labruno (GitHub): Parallel sandboxes + LLM judge selects best implementation](https://github.com/nibzard/labruno-agent)
* [Daytona RLM Guide: Recursive delegation with sandboxed execution](https://www.daytona.io/docs/en/recursive-language-models/)
* Related patterns: [Sub-Agent Spawning](sub-agent-spawning.md), [Swarm Migration Pattern](swarm-migration-pattern.md), [Self-Critique / Evaluator loops](self-critique-evaluator-loop.md)
