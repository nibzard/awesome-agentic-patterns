---
title: Self-Critique Evaluator Loop
status: established
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Meta AI (Self-Taught Evaluators)"]
category: Feedback Loops
source: "https://arxiv.org/abs/2408.02666"
tags: [self-critique, evaluator, reward-model, synthetic-data, reflexion, rlaif]
---

## Problem

Human-labeled preference datasets are expensive to produce, slow to refresh, and quickly stale as base models and domains change. Teams need scalable evaluation signals that can keep pace with model evolution without waiting on large annotation cycles. Risk of evaluator collapse and bias amplification must be mitigated.

## Solution

Train a **self-taught evaluator** that bootstraps from synthetic data:

1. Generate multiple candidate outputs for an instruction.
2. Ask the model to judge and explain which is better (reasoning trace).
3. Fine-tune that judge on its own traces; iterate.
4. Use the judge as a reward model or quality gate for the main agent.
5. Periodically refresh with new synthetic debates to stay ahead of model drift.

**Dual-model variant** (RLAIF): Use a separate critic model to evaluate the generator, reducing bias at higher cost.

To prevent evaluator collapse, keep evaluation prompts and generation prompts partially decoupled, inject adversarial counterexamples, and benchmark against a small human-labeled anchor set.

## Pros & Cons

- **Pros:** near-human eval accuracy without labels; scales with compute; ~100x cost reduction vs human labels (RLAIF).
- **Cons:** risk of evaluator-model collusion; needs adversarial tests and human anchors.

## How to use it

- Start with one narrow domain and define objective judge criteria before training.
- Maintain a fixed holdout set with periodic human audits to detect evaluator drift.
- Use the evaluator as a gate first, then expand to reward-shaping once reliability is proven.
- Track disagreement rates between evaluator and human reviewers.
- Consider dual-model setup (separate critic) for reduced bias in high-stakes domains.

## Trade-offs

* **Pros:** Scales evaluation coverage quickly and reduces dependence on expensive human labeling.
* **Cons:** Can overfit to synthetic preferences and needs careful anti-collusion safeguards.

## References

- Wang et al., *Self-Taught Evaluators* (2024)

- Shinn et al., *Reflexion: Language Agents with Verbal Reinforcement Learning* (2023)

- Bai et al., *Constitutional AI: Harmlessness from AI Feedback* (2022)

- Primary source: https://arxiv.org/abs/2408.02666
