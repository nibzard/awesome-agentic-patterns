---
title: Design-Time File Partition as Concurrency Control
status: emerging
authors: ["Jed Arden (@jedarden)"]
based_on: ["Jed Arden (@jedarden), NEEDLE ADR-015"]
category: "Orchestration & Control"
source: "https://github.com/jedarden/NEEDLE/blob/main/docs/adr/015-concurrent-same-repo-worker-isolation.md"
tags: [multi-agent, concurrency, decomposition, task-queue, shared-checkout, headless]
summary: "Decide which tasks may run concurrently when the work is decomposed: every task declares the full set of paths it will write, overlapping tasks get a blocking dependency edge, and only disjoint work is ever offered to agents at once."
maturity: early
complexity: low
effort: hours
impact: medium
signals:
  - "Several headless agents work one repository from a shared checkout"
  - "Per-agent worktrees or clones are too expensive in disk or build cache"
  - "Collisions show up as clobbered files, duplicate fixes, or broken generated artifacts"
anti_signals:
  - "One agent at a time, or agents on unrelated repositories"
  - "Tasks cannot be scoped to a predictable set of paths before they start"
prerequisites:
  - "A task queue that supports blocking dependencies and atomic claims"
  - "A decomposition step that produces tasks with explicit path ownership"
related: ["lane-based-execution-queueing", "workspace-native-multi-agent-orchestration", "board-mediated-inter-agent-coordination", "deterministic-zero-llm-orchestration"]
domains: ["coding", "ops"]
updated_at: "2026-09-26"
---

## Problem

Several headless coding agents working the same repository collide on files. The usual fixes are a per-agent worktree (disk and build-cache duplication, merge-back debt) or a runtime coordination channel between agents (more moving parts, and agents negotiating while tokens burn). Neither addresses the actual failure: two tasks that were never safe to run concurrently were both marked ready.

## Solution

Decide concurrency when you cut the work, not when you run it. Every task declares the paths it **owns** — the complete set of files it will write, not just the files it intends to edit. Two tasks whose ownership overlaps get a blocking dependency edge so the queue never offers both at once; tasks with disjoint ownership are free to run in parallel on a single shared checkout. Depth of parallelism is therefore bounded by the partition (how many disjoint owners exist), and the agents need no inter-agent channel at all.

```pseudo
for each task in plan:
    task.owns = intended edits
             ∪ generated outputs of those edits   # lockfiles, codegen, snapshots, rendered docs
             ∪ repo-wide files the task will touch # changelog, index, tracker checkpoint
for (a, b) in pairs(tasks):
    if overlap(a.owns, b.owns): add_edge(b blocked_by a)
ready = tasks with no unresolved blockers   # only disjoint work is claimable
```

Ownership must cover incidental writes, because those are where "disjoint" tasks actually collide:

- **Generated files.** A dependency bump rewrites the lockfile; a schema change regenerates client code, an OpenAPI document, or a snapshot; a docs change regenerates an index or sitemap. The task that changes the input owns every output the build regenerates from it.
- **Repo-wide files.** Changelogs, version files, aggregate indexes, and the task tracker's own checkpoint file are written by most tasks. Either serialise every task that touches them (they become a single owner) or exclude them from task commits and regenerate them in one downstream step.
- **Tool side effects.** A formatter or linter with `--fix` writes wherever it finds something to fix. Run it only on owned paths, or treat a repo-wide format as its own task.
- **Opportunistic edits.** An agent that notices an unrelated problem must not fix it in place; it files a new task. Mediate writes against a canonical-path allowlist before they happen, including shell and tool side effects. Committing only owned paths excludes other changes from that commit; it neither rejects nor undoes an out-of-scope write already made in the shared tree.

File partitioning does not partition `.git/`. Serialize index and commit transactions under one shared lock, and prohibit workers from independently checking out branches, resetting, or cleaning the shared tree. If writes cannot be mediated or repository-wide operations cannot be serialized, use isolated worktrees or serialize the whole task. Read dependencies also matter: serialize a task that needs a stable version of files another task will change.

## Evidence

- **Evidence Grade:** `low`
- **Most Valuable Findings:**
  - One production deployment: a fleet of ~20 headless workers sharing one checkout per repository since 2026. With explicit ownership plus atomic claims, the residual failure was duplicate *claims* on one task (two workers producing byte-identical commits), not file collisions — that is, the remaining defect was in the queue, not the partition.
  - The early collisions that did occur were incidental writes (a tracker checkpoint file and a lockfile), which is why ownership was widened from "files edited" to "files written".
- **Unverified / Unclear:** Evidence is a single practitioner's fleet; no comparative measurement against per-agent worktrees or message-based coordination at the same scale.

## How to use it

- **When:** three or more agents on one repository, especially where a per-agent worktree or clone is expensive (large Rust/Go/JS build caches) or where merge-back of worktrees has already become a chore.
- **Decompose with ownership as a first-class field.** During planning, each task gets an `Owns:` line listing paths or components. If you cannot write that line, the task is not yet decomposed enough to run unattended; split it.
- **Enumerate the write set, not the edit set.** For each task ask: what does the build, formatter, codegen, or tracker rewrite when these files change? Add those paths. Two tasks that both trigger a lockfile update overlap even if their source edits do not.
- **Derive edges mechanically.** Compute the pairwise overlap and add a blocking dependency for every overlapping pair. Do not rely on workers to notice overlap at runtime.
- **Pair with an atomic claim.** The queue must hand a ready task to exactly one worker in a single transaction; the partition is only as safe as the claim.
- **Enforce before writes, then limit commits.** Mediate write operations to owned paths. Serialize Git staging and commits under a shared lock, committing only owned paths rather than `git add -A`. Commit selection is not a write sandbox; unowned writes must be prevented before they can clobber another worker’s work.
- **Size the partition to the fleet.** The number of mutually disjoint ready tasks is your ceiling on useful concurrency. If the ceiling is lower than the fleet, repartition (split a hot module) rather than adding workers.

## Trade-offs

- **Pros:** No inter-agent protocol; one shared checkout per repository; collisions are prevented before dispatch rather than detected after; the dependency graph doubles as the record of why two tasks were serialised.
- **Cons:** Requires the planner to know the code layout and build side effects well enough to write honest ownership lines; vague tasks invite two workers to fix the same obvious thing. Over-partitioning serialises work that could have run in parallel; under-partitioning reintroduces collisions.
- **Limits:** Does not itself protect against a worker writing outside its declared set — that needs write mediation, task isolation, or whole-task serialization. Does not help when tasks genuinely need the same file at the same time; those must be serialised or the file split.

## References

- [NEEDLE ADR-015](https://github.com/jedarden/NEEDLE/blob/main/docs/adr/015-concurrent-same-repo-worker-isolation.md) — contributor-maintained design record, including shared Git-state hazards and task-level serialization.
- [Git commit documentation](https://git-scm.com/docs/git-commit) — path-limited commits select content; they do not constrain earlier filesystem writes.
