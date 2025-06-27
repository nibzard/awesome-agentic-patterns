---
title: Reflection Loop
status: established
authors: ["Shinn et al. (2023)"]
category: Feedback Loops
source: "https://arxiv.org/abs/2303.11366"
tags: [self-feedback, iterative-improvement, evaluation]
---

## Problem
Generative models may produce subpar output if they never review or critique their own work.

## Solution
After generating a draft, have the model grade it against a given metric and refine the response using that feedback.

```pseudo
for attempt in range(max_iters):
    draft = generate(prompt)
    score, critique = evaluate(draft, metric)
    if score >= threshold:
        return draft
    prompt = incorporate(critique, prompt)
```

## How to use it
Use when you care about quality or adherence to explicit criteria—writing, reasoning, or code. Loop until the score meets your bar or max iterations are reached.

## Trade-offs
* **Pros:** Improves outputs with little supervision.
* **Cons:** Extra compute; may stall if the metric is poorly defined.

## References
* [Self-Refine: Improving Reasoning in Language Models via Iterative Feedback](https://arxiv.org/abs/2303.11366)
