---
title: Context Budget as a Governed Resource
status: validated-in-production
authors: ["James Ross (@jimy-r)"]
based_on: ["Anthropic context-engineering guidance", "Agent Workspace Architecture (production workspace)"]
category: "Context & Memory"
source: "https://github.com/jimy-r/agent-workspace-architecture/blob/main/META_ARCHITECTURE.md"
tags: [context-budget, token-costs, ghost-tokens, compaction, scheduled-agents]
last_updated: "2026-06-11"
---

## Problem

Always-loaded context accretes silently. Instruction files, memory indexes, skill descriptions, and hook configuration each add "ghost tokens" the agent pays on every turn of every session. No single addition is big; the aggregate grows a few percent a week. Quality degrades, costs climb, and nothing fails loudly enough to notice. Unattended agents make it worse: scheduled jobs spend tokens with nobody watching, so one job's appetite regression can run for weeks.

## Solution

Treat the context budget like any other governed resource: measured, trended, and capped.

- **Baseline counter.** Measure every always-loaded source (instruction files, memory index, skill and agent descriptions, hook command strings) per source. A chars/4 approximation is good enough. Persist each measurement so there is history.
- **Trend alarm, not just a ceiling.** Alert when the baseline exceeds its prior 4–8 week median by a relative margin (+10–25%). Absolute ceilings catch catastrophes; trends catch accretion, which is the common failure.
- **Hard budget caps on unattended runs.** Every scheduled agent invocation carries a spend ceiling (a `--max-budget-usd`-style flag), sized 10–50x a normal cycle. It is a belt against runaway loops, not a tuning knob.
- **Fan-out bounded by construction.** Estimate agent count before running any multi-agent workflow and cap every stage. A workflow whose agent count scales with discovered data (claims, files, matches) is a cost bomb until bounded.
- **Index ceilings.** Memory and index files carry explicit line/KB caps with an overflow rule (migrate detail to per-topic files), so the always-loaded set cannot grow unbounded by design.
- **Compaction instructions.** A standing note tells the runtime what must survive context compaction (decisions with rationale, in-flight edits, open questions) and what may be discarded, so compaction never silently deletes the load-bearing parts.

```pseudo
baseline = sum(estimate_tokens(src) for src in always_loaded_sources)
record(baseline, per_source_breakdown)
if baseline > median(history, weeks=4..8) * (1 + margin):
    alert(top_growth_sources())
```

## Evidence

- **Evidence Grade:** `medium`
- **Most Valuable Findings:** a production workspace caught a ~20% week-over-week baseline jump and named the three growth sources the same day (the per-source breakdown is what makes the alarm actionable); budget caps and fan-out bounds were adopted after a research workflow over-fanned past 100 agents in a single run.
- **Unverified / Unclear:** the thresholds (+10–25% margin, 10–50x cap sizing) are one workspace's tuning; chars/4 undercounts code-heavy text, so treat estimates as relative, not absolute.

## How to use it

Adopt once any file is auto-loaded into every session or any agent runs unattended. Start with the baseline counter (an afternoon of work), attach the trend alarm to whatever recurring review already exists (a weekly audit is the natural host), then add caps to scheduled jobs. The per-source breakdown is the part that pays for itself: a total says something grew; sources say what to trim.

## Trade-offs

- **Pros:** catches the silent-cost failure class; per-source attribution makes trimming targeted instead of vibes-based; caps convert runaway failures into bounded ones.
- **Cons:** one more counter to maintain; estimates drift from true tokenizer counts; a budget cap can abort a legitimately heavy run if sized as a governor instead of a belt.

## References

- [Agent Workspace Architecture](https://github.com/jimy-r/agent-workspace-architecture) — production implementation (Token Budget module in META_ARCHITECTURE.md: ghost-token baseline counter, per-run cost ledger, budget caps, compaction instructions)
- [Anthropic: Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) — the vendor guidance this governance layer operationalises
