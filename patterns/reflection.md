---
title: Reflection Loop
status: established
authors:
  - Nikola Balic (@nibzard)
based_on:
  - Shinn et al. (2023)
category: Feedback Loops
source: 'https://arxiv.org/abs/2303.11366'
tags:
  - self-feedback
  - iterative-improvement
  - evaluation
slug: reflection
id: reflection-loop
summary: >-
  Generative models may produce subpar output if they never review or critique
  their own work.
updated_at: '2026-01-05'
---

## Problem

Single-pass generation frequently misses edge cases, constraints, or quality criteria that become obvious on review. Without a structured revision loop, agents return the first plausible answer even when a better answer is reachable with lightweight critique.

## Solution

After generating a draft, run an explicit self-evaluation pass against defined criteria and feed the critique into a revision attempt. Repeat until the output clears a threshold or retry budget is exhausted.

Use stable scoring rubrics (correctness, completeness, safety, style) so the loop improves objective quality rather than free-form restyling. For reduced bias, use a separate model for critique (dual-model architecture) at the cost of additional compute.

```pseudo
for attempt in range(max_iters):
    draft = generate(prompt)
    score, critique = evaluate(draft, metric)
    if score >= threshold:
        return draft
    prompt = incorporate(critique, prompt)
```

## How to use it

Use this when quality must meet explicit criteria in writing, reasoning, or code generation. Keep loop budgets small (2-3 iterations are typically optimal; beyond 3 shows diminishing returns), and log score deltas to verify that extra iterations are producing measurable gains.

## Trade-offs

* **Pros:** Improves outputs with little supervision.
* **Cons:** Extra compute; may stall if the metric is poorly defined.

## References

* [Self-Refine: Improving Reasoning in Language Models via Iterative Feedback](https://arxiv.org/abs/2303.11366)
* [Reflexion: Language Agents with Verbal Reinforcement Learning](https://neurips.cc/) (NeurIPS 2023) - adds episodic memory for persistent learning across trials
