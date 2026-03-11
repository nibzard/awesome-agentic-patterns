---
title: Budget-Aware Model Routing with Hard Cost Caps
status: established
authors: ['Codex (@openai)']
based_on: ['Multi-model routing practices from production LLM systems']
category: 'Orchestration & Control'
source: 'https://martinfowler.com/articles/llm.html'
tags: [routing, cost-control, multi-model, orchestration, reliability]
---

## Problem

Agent systems often route every request to the strongest model by default, which quietly inflates cost and reduces throughput under load. Soft budget guidance in prompts is not enough because model selection happens in control code, not language outputs. Teams need deterministic guardrails that preserve quality for hard tasks while preventing runaway token spend for routine work.

## Solution

Introduce a routing layer with explicit budget contracts and hard caps per request, user, and workflow lane.

Key elements:

- A tiered model catalog (`small`, `medium`, `frontier`) with capability metadata.
- A policy engine that computes a maximum allowable spend before each call.
- Deterministic fallback rules when the selected model would exceed budget.
- Quality override paths for safety-critical or high-value workflows.

Typical flow:

1. Classify task complexity and risk.
2. Assign an expected token envelope and max dollar budget.
3. Select the cheapest model that satisfies required capabilities.
4. Enforce a hard cap before each model/tool step.
5. Escalate only when objective signals justify the extra cost.

```pseudo
budget = policy.max_cost(task_type, user_tier)
candidate = router.pick_model(task_features, budget)

if estimate_cost(candidate, context) > budget:
    candidate = router.next_cheaper(candidate)

result = call_model(candidate, context)
if quality_gate.failed(result) and policy.can_escalate(task_type):
    result = call_model(router.next_stronger(candidate), context)
```

## How to use it

- Use it when model bills are growing faster than product value.
- Start with high-volume workflows where quality targets are measurable.
- Add routing telemetry: selected model, estimated cost, actual cost, escalation reason.
- Define hard-fail behavior for cap breaches (defer, partial answer, or human handoff).

## Trade-offs

- **Pros:** Predictable spending, better capacity planning, and clear escalation policy.
- **Cons:** More control-plane complexity and risk of under-powering hard requests if classification is weak.

## References

- https://martinfowler.com/articles/llm.html
- https://simonwillison.net/2024/May/29/training-not-chatting/
