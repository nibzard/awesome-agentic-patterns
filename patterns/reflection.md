---
title: Reflection Loop
status: established
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Shinn et al. (2023)"]
category: Feedback Loops
source: "https://arxiv.org/abs/2303.11366"
tags: [self-feedback, iterative-improvement, evaluation]
---

## Problem

Single-pass generation frequently misses edge cases, constraints, or quality criteria that become obvious on review. Without a structured revision loop, agents return the first plausible answer even when a better answer is reachable with lightweight critique.

## Solution

After generating a draft, run an explicit self-evaluation pass against defined criteria and feed the critique into a revision attempt. Repeat until the output clears a threshold or retry budget is exhausted.

Use stable scoring rubrics (correctness, completeness, safety, style) so the loop improves objective quality rather than free-form restyling.

```pseudo
for attempt in range(max_iters):
    draft = generate(prompt)
    score, critique = evaluate(draft, metric)
    if score >= threshold:
        return draft
    prompt = incorporate(critique, prompt)
```

## How to use it

Use this when quality must meet explicit criteria in writing, reasoning, or code generation. Keep loop budgets small (for example 2-4 passes), and log score deltas to verify that extra iterations are producing measurable gains.

## Trade-offs

* **Pros:** Improves outputs with little supervision.
* **Cons:** Extra compute; may stall if the metric is poorly defined.

## References

* [Self-Refine: Improving Reasoning in Language Models via Iterative Feedback](https://arxiv.org/abs/2303.11366)
