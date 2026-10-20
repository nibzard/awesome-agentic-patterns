---
title: Intent-Level Cost Attribution
status: proposed
authors: ["Retsumdk (@Retsumdk)"]
based_on: ["Original Creator (@Retsumdk)"]
category: "Reliability & Eval"
source: "https://github.com/Retsumdk/agent-cost-attribution-api"
tags: [cost-control, observability, budgeting, multi-agent, token-spend]
summary: "Records every LLM call against the projectId/intentId/user key that caused it, at call time, so spend can be queried and enforced per work item instead of as an opaque total"
signals:
  - "Multiple agents, users, or intents share one model budget and someone must answer for the spend"
  - "A budget cap exists or is planned, and it should bind the specific work that is expensive rather than throttling everything uniformly"
  - "Cost regressions after a prompt, model, or workflow change need to be localized to the intent that caused them"
anti_signals:
  - "A single agent with a single user and no budget enforcement - a daily total is enough"
  - "Call sites cannot name their intent or project, and threading attribution keys through the orchestration layer is not feasible"
updated_at: "2026-10-20"
---

## Problem

Agent fleets spend LLM budget continuously and opaquely. When a bill spikes or a budget cap trips, the operator can usually answer *how much* was spent but not *which work caused it*: a single daily total hides whether the spend came from a misbehaving retry loop, one user's abnormal usage, a specific intent that quietly grew, or steady baseline load across the fleet. Without attribution at the level of the work item that triggered the calls, cost control degenerates into guesswork — you can cut a budget, but you cannot cut the right thing, and you cannot tell whether a change actually reduced waste or just moved it somewhere else.

## Solution

Attribute every model call to the intent that caused it at the moment the call is made. Each usage record carries a three-part attribution key — `projectId`, `intentId`, and `userId` — plus the model, token counts, and optional free-form metadata. Cost is computed at record time from per-model pricing, so the ledger is a first-class artifact rather than something reconstructed later from provider invoices.

The mechanism has four parts:

- **Tracker** — the core engine that turns a usage event (model, input/output tokens, attribution keys) into a priced cost record.
- **Storage** — a persistence layer with atomic writes so concurrent agents recording usage cannot corrupt the ledger.
- **Reporting API** — roll-ups by project, by intent, and by user, plus filtered record retrieval, so the same ledger answers both "what did this intent cost?" and "who is driving the bill?"
- **CLI** — server startup and report generation from the command line for operators working outside the API.

```pseudo
on_model_call(agent, model, input_tokens, output_tokens, intent, project, user):
    cost = price(model, input_tokens, output_tokens)
    ledger.append({
      model, tokens, cost,
      projectId: project, intentId: intent, userId: user,
      metadata, timestamp
    })   # atomic write

when budget_question_arises:
    report(by="intent")   # find the top spenders by work item
    report(by="user")     # separate fleet load from individual demand
```

The control points are the record schema (the attribution keys are mandatory, so unattributed spend cannot hide) and the report endpoints (the same data serves alerting, post-hoc analysis, and per-intent budget enforcement).

## Evidence

- **Evidence Grade:** `low`
- **Most Valuable Findings:** Production cost-governance systems (finops practice, LLM gateway products) consistently attribute spend along workload dimensions rather than only reporting totals; recording attribution at call time avoids the reconstruction problem that makes post-hoc invoice analysis lossy. The reference implementation demonstrates the pattern end-to-end with per-model pricing and atomic ledger writes.
- **Unverified / Unclear:** Quantified savings from intent-level attribution in published agent deployments are not documented; the pattern's value in fleets with very high intent cardinality (attribution overhead vs. insight) needs field measurement.

## How to use it

Use this pattern when:

- Multiple agents, users, or intents share one model budget and someone must answer for it.
- A budget cap exists (or should): attribution is the prerequisite for caps that bind the *right* work instead of throttling everything uniformly.
- Cost regressions need diagnosis: after a prompt, model, or workflow change, per-intent deltas localize the regression instead of forcing a fleet-wide bisect.

Prerequisites: every model call site must be able to name its intent and project — attribution keys must be threaded through the orchestration layer at call time, which is a real (and one-time) instrumentation cost. Implementation considerations: price tables must stay current with model pricing changes; atomic writes or an append-only log matter once more than one agent writes concurrently.

## Trade-offs

**Pros:**

- Turns an opaque total into a queryable ledger; cost questions become lookups, not investigations.
- Makes targeted cost control possible: cap, throttle, or refactor the specific intent that is expensive.
- Attribution recorded at call time preserves intent that post-hoc reconstruction cannot recover.

**Cons:**

- Instrumentation tax: every call site must supply the attribution keys, and a mis-keyed call silently pollutes reports.
- Attribution cardinality can explode in fleets with many short-lived intents; roll-ups need designing (per project, per user) to stay useful.
- The ledger itself is state that must be persisted and retained — at scale this becomes its own storage problem.

## References

- Reference implementation: [Retsumdk/agent-cost-attribution-api](https://github.com/Retsumdk/agent-cost-attribution-api) — REST + CLI cost ledger with `projectId`/`intentId`/`userId` attribution, per-model pricing, and atomic JSON persistence (MIT).
- Related patterns in this catalog: [Budget-aware model routing with hard cost caps](budget-aware-model-routing-with-hard-cost-caps.md) — routing-level cost control that benefits from attribution data.
