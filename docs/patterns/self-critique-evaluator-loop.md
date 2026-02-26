---
title: Self-Critique Evaluator Loop
status: emerging
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Meta AI (Self-Taught Evaluators)"]
category: Feedback Loops
source: "https://arxiv.org/abs/2408.02666"
tags: [self-critique, evaluator, reward-model, synthetic-data]
---

## Problem

Human-labeled preference datasets are expensive to produce, slow to refresh, and quickly stale as base models and domains change. Teams need scalable evaluation signals that can keep pace with model evolution without waiting on large annotation cycles.

## Solution

Train a **self-taught evaluator** that bootstraps from synthetic data:

1. Generate multiple candidate outputs for an instruction.  
2. Ask the model to judge and explain which is better (reasoning trace).  
3. Fine-tune that judge on its own traces; iterate.  
4. Use the judge as a reward model or quality gate for the main agent.  
5. Periodically refresh with new synthetic debates to stay ahead of model drift.

To prevent evaluator collapse, keep evaluation prompts and generation prompts partially decoupled, inject adversarial counterexamples, and benchmark against a small human-labeled anchor set.

## Pros & Cons

- **Pros:** near-human eval accuracy without labels; scales with compute.  
- **Cons:** risk of evaluator-model collusion; needs adversarial tests.

## How to use it

- Start with one narrow domain and define objective judge criteria before training.
- Maintain a fixed holdout set with periodic human audits to detect evaluator drift.
- Use the evaluator as a gate first, then expand to reward-shaping once reliability is proven.
- Track disagreement rates between evaluator and human reviewers.

## Trade-offs

* **Pros:** Scales evaluation coverage quickly and reduces dependence on expensive human labeling.
* **Cons:** Can overfit to synthetic preferences and needs careful anti-collusion safeguards.

## References

- Wang et al., *Self-Taught Evaluators*

- Primary source: https://arxiv.org/abs/2408.02666
