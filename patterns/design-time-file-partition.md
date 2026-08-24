---
title: Design-Time File Partition as Concurrency Control
status: established
authors: ["Jed Arden (@jedarden)"]
based_on: ["Jed Arden (jedarden.com workflow manual, §06)"]
category: "Orchestration & Control"
source: "https://jedarden.com/guides/workflow/#s06-decomposition-is-concurrency-control"
tags: [multi-agent, concurrency, decomposition, task-queue, shared-checkout, headless]
---

## Problem

Several headless coding agents working the same repository collide on files. The usual fixes are a per-agent worktree (disk and build-cache duplication, merge-back debt) or a runtime coordination channel between agents (more moving parts, and agents negotiating while tokens burn). Neither addresses the actual failure: two tasks that were never safe to run concurrently were both marked ready.

## Solution

Decide concurrency when you cut the work, not when you run it. Every task declares the files or components it **owns**. Two tasks whose ownership overlaps get a blocking dependency edge so the queue never offers both at once; tasks with disjoint ownership are free to run in parallel on a single shared checkout. Depth of parallelism is therefore bounded by the partition (how many disjoint owners exist), and the agents need no inter-agent channel at all.

```pseudo
for each task in plan:
    task.owns = explicit file/component list
for (a, b) in pairs(tasks):
    if overlap(a.owns, b.owns): add_edge(b blocked_by a)
ready = tasks with no unresolved blockers   # only disjoint work is claimable
```

## Evidence

Run in production on a fleet of ~20 headless workers sharing one checkout per repository since 2026; the residual failure mode observed was duplicate *claims* on one task (fixed by an atomic single-transaction claim), not file collisions. Write-up and the divergence from message-based coordination: https://jedarden.com/guides/workflow/#s06-decomposition-is-concurrency-control and §12 (lineage).

## Trade-offs

- Requires the planner to know the code layout well enough to write honest `Owns` lines; vague tasks invite two workers to fix the same obvious thing.
- Over-partitioning serialises work that could have run in parallel; under-partitioning reintroduces collisions.
- Pairs with atomic claiming — the partition is only as safe as the queue that enforces it.

## References

- Workflow manual §06–§07: https://jedarden.com/guides/workflow/
- Failure taxonomy: https://jedarden.com/notes/what-breaks-at-twenty-agents/
