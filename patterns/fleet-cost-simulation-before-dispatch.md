---
title: "Fleet Cost Simulation Before Dispatch"
status: "proposed"
authors: ["Retsumdk (@Retsumdk)"]
based_on: []
category: "Reliability & Eval"
source: "https://github.com/Retsumdk/agent-budget-simulator"
tags: [cost-control, simulation, starvation, priority-scheduling, multi-agent]
summary: "Replays an agent fleet's budget, priority, and failure-recovery policy against deterministic scenarios before committing real spend, so starvation and exhaustion verdicts arrive in CI instead of in production"
signals:
  - "A fleet of agents draws on a shared resource budget (tokens, API calls, dollars) that renews slowly or not at all"
  - "Priority and fairness policies look correct in code review but starve low tiers under load"
  - "Budget exhaustion in production is expensive and noisy, while replaying the same load in a simulator is cheap and silent"
anti_signals:
  - "A single agent with a simple per-request cost cap and no queue"
  - "Workloads whose cost distribution is unknowable, where simulation would only restate the assumptions fed into it"
updated_at: "2026-10-17"
---

## Problem

Agent fleets spend three scarce resources — tokens, API calls, and dollars — on work whose cost profile is only known after the work runs. The failure modes are invisible until they are expensive:

1. **Budget exhaustion mid-flight.** The fleet runs out of tokens or dollars partway through a batch, leaving half the work aborted and the rest degraded — after the money is already spent.
2. **Starvation by priority.** A `strict_priority` policy that reads as obviously correct starves `background` agents indefinitely under load. Nobody notices until a background task that mattered never ran.
3. **Unvalidated recovery.** Retry / abort / degrade / fallback rules are chosen per call site and are rarely exercised against a realistic resource ceiling, so the first real quota outage is also the first test.

Live canaries partially help, but they find these bugs in production, where each finding costs real spend and real incidents.

## Solution

Put a deterministic simulator between the fleet's policy and production. Model the resource budget, agent tiers, fairness policy, and failure-recovery behavior, then replay packaged scenarios — baseline, stress, starvation, deadline, token-bucket — and read the verdict before a single real task is dispatched.

```pseudo
for scenario in [baseline, stress, starvation, deadline, token_bucket]:
    result = simulate(fleet_policy, scenario, seed=fixed)
    report = evaluate(result)   # per-agent dispatch/complete/degrade/reject,
                                # per-resource consumed/remaining/utilization
    if report.verdict == FAIL:   # e.g. Status: STARVED, background tier got 0 dispatches
        tune(fleet_policy, budget)   # before production, not after
```

The mechanics that make this a real gate rather than a demo:

- **Resource-kind budgets.** Track `tokens`, `api_calls`, and `dollars` separately — a fleet can be token-starved while sitting on unspent dollars, and the fix differs by resource.
- **Agent tiers with effective priority.** `critical`, `high`, `normal`, `background`, `best_effort` tiers compose with the fairness policy (`fifo`, `strict_priority`, `weighted_fair`, `deadline_aware`) to produce effective priority, which is what actually decides dispatch order under contention.
- **Deterministic seeds.** A fixed seed makes a failure reproducible: the same scenario that starved `background-bot` yesterday starves it again today after your fix, proving the fix rather than suggesting it.
- **Bounded-spend probes.** The starvation scenario intentionally under-provisions the budget; the value is not the failure itself but the shape of it — which tiers starved, how many tasks were rejected, and whether recovery degraded or aborted.

## Evidence

- **Evidence Grade:** `low`
- **Most Valuable Findings:**
  - Deterministic discrete-event simulation is a standard validation tool for schedulers and queueing policies; applying it to agent fleets is a direct transplant of a mature technique, not a novel claim.
  - The simulator's starvation run correctly surfaced a policy failure (background tier received 0 dispatches of 4 rejections under `strict_priority`) that a code review of the same policy would pass.
- **Unverified / Unclear:** Simulation validates the policy logic against the workload model you wrote, not against production traffic. A workload distribution that misestimates task cost or arrival rate will make the verdicts confidently wrong — the evidence grade is capped for exactly this reason.

## How to use it

- **When:** You run multiple agents against a shared budget, you are about to change a priority/fairness policy, or you are sizing tier budgets for a new workload.
- **Prerequisites:** A rough per-task cost model (tokens or dollars per task per tier) and the fleet's actual tier structure. The model can be coarse; wrong-but-plausible is usually enough to expose structural bugs like starvation.
- **Implementation notes:**
  - Run the scenario suite in CI whenever the priority policy, tier table, or budget values change — the simulator is fast enough to treat as a unit-test dependency.
  - Treat `STARVED` verdicts as policy findings, not noise: a starved tier in simulation is a starved tier in production with worse visibility.
  - Keep scenarios adversarial on purpose (under-provisioned budgets, bursty arrivals); a suite that only contains the baseline scenario will only ever pass.

## Trade-offs

- **Pros:**
  - Converts the most expensive way to discover a budget bug (production) into the cheapest (a deterministic replay).
  - Makes priority-policy fairness a testable property instead of an assertion in review.
  - Reproducible failures (fixed seeds) let you verify a fix, not just observe a change.
- **Cons:**
  - Verdicts are only as honest as the workload model; simulation can create false confidence if the cost model is far from reality.
  - Maintaining scenarios is an ongoing cost — stale scenarios silently stop representing the real workload.
  - It validates policy, not agents: an agent that misreports its own consumption is invisible to the simulator.

## References

- Reference implementation: [agent-budget-simulator](https://github.com/Retsumdk/agent-budget-simulator) — deterministic TypeScript scenario simulator, clone-and-run, MIT (contributor-owned, disclosed).
- Shreedhar, M. & Varghese, G., "Efficient Fair Queuing using Deficit Round Robin" (SIGCOMM '95) — the fairness discipline underlying weighted-fair policies.
- Kleppmann, M., *Designing Data-Intensive Applications* — backpressure and load-shedding discussion (Ch. 9).
- Related pattern in this catalogue: [Budget-Aware Model Routing with Hard Cost Caps](budget-aware-model-routing-with-hard-cost-caps.md) — per-request model selection under caps, complementary to fleet-level pre-dispatch simulation.
