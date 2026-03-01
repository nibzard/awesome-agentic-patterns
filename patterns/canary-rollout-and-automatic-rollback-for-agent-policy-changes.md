---
title: Canary Rollout and Automatic Rollback for Agent Policy Changes
status: established
authors: ["Codex (@openai)"]
based_on: ["Canary deployment and SRE rollback practices"]
category: "Reliability & Eval"
source: "https://martinfowler.com/bliki/CanaryRelease.html"
tags: [canary, rollback, reliability, policy, evaluation]
---

## Problem

Agent behavior changes frequently through prompt updates, tool policies, routing rules, and evaluator thresholds. Even small policy edits can produce broad regressions in cost, latency, safety, or task quality. Full rollouts without staged exposure make rollback slow and user impact large.

## Solution

Treat agent policy changes like production releases: ship to a small traffic slice first, monitor leading indicators, and auto-rollback when guardrails are breached.

Core components:
- A traffic splitter that routes a fixed percentage to the new policy.
- A policy version registry with immutable identifiers.
- Real-time monitors for quality, latency, failure rate, safety flags, spend, goal achievement rate, and infinite loop detection.
- Rollback automation that restores the previous stable policy without manual intervention.
- Optional shadow mode: validate technical stability before user exposure.

Recommended stages:
1. `1%` traffic canary for fast anomaly detection.
2. `5-10%` validation phase with stricter thresholds.
3. `25-50%` soak period for stability under mixed load.
4. `100%` rollout only if all SLO and safety conditions hold.

```pseudo
policy = registry.current_candidate()
traffic = splitter.assign(request, canary_percent=5)

response = run_agent(policy if traffic.canary else registry.stable())
metrics.ingest(response, policy.version)

if monitors.breach(policy.version):
    registry.rollback_to_stable()
    alert("auto rollback executed", policy.version)
```

## How to use it

- Use this for any change that can alter external behavior: prompts, tools, evaluator logic, memory policies, and routing.
- Define rollback triggers before rollout starts. Set observation windows (e.g., 2+ minutes) to avoid false positives.
- Keep rollback deterministic: always restore the last known-good version.
- Store policy artifacts with versioned metadata so incidents are reproducible.

## Trade-offs

* **Pros:** Limits blast radius and shortens time-to-recovery.
* **Cons:** Requires release orchestration, richer telemetry, and clear version hygiene.

## References

- https://martinfowler.com/bliki/CanaryRelease.html
- https://sre.google/sre-book/monitoring-distributed-systems/
- https://arxiv.org/html/2508.03858v3 - MI9 Runtime Governance Framework (2025)
- https://arxiv.org/html/2512.03180v1 - AGENTSAFE Safety Evaluation (2025)
