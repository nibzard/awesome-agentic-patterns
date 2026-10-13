---
title: Self-Critique Evaluator Loop
status: established
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Meta AI (Self-Taught Evaluators)"]
category: Feedback Loops
source: "https://arxiv.org/abs/2408.02666"
tags: [self-critique, evaluator, reward-model, synthetic-data, reflexion, rlaif]
summary: "Trains a judge model on its own synthetic comparisons of candidate outputs and uses it as a reward model or quality gate for the main agent"
signals: ["Human-labeled preference data is too expensive or goes stale", "Evaluation must keep pace with model and domain changes", "A small human-labeled anchor set is available for checks"]
anti_signals: ["No human anchor set or adversarial tests to detect evaluator collusion", "Judge criteria for the domain cannot be defined objectively"]
updated_at: "2026-10-13"
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

**Dual-model variant:** using a separate critic model to evaluate the generator (reducing bias at higher cost) is the [RLAIF](rlaif-reinforcement-learning-from-ai-feedback.md) pattern; see that entry rather than restating it here.

To prevent evaluator collapse, keep evaluation prompts and generation prompts partially decoupled, inject adversarial counterexamples, and benchmark against a small human-labeled anchor set.

## How to use it

- Start with one narrow domain and define objective judge criteria before training.
- Maintain a fixed holdout set with periodic human audits to detect evaluator drift.
- Use the evaluator as a gate first, then expand to reward-shaping once reliability is proven.
- Track disagreement rates between evaluator and human reviewers.
- Consider dual-model setup (separate critic) for reduced bias in high-stakes domains.

## Trade-offs

* **Pros:** Scales evaluation coverage quickly and reduces dependence on expensive human labeling; trains the judge from synthetic comparisons only.
* **Cons:** Can overfit to synthetic preferences and needs careful anti-collusion safeguards; risk of evaluator-model collusion.

## References

- [Self-Taught Evaluators](https://arxiv.org/abs/2408.02666) - Wang et al., 2024 (primary source)

- [Reflexion: Language Agents with Verbal Reinforcement Learning](https://arxiv.org/abs/2303.11366) - Shinn et al., 2023

- [Constitutional AI: Harmlessness from AI Feedback](https://arxiv.org/abs/2212.08073) - Bai et al., 2022

Distinct from [RLAIF](rlaif-reinforcement-learning-from-ai-feedback.md): RLAIF uses AI feedback as the training signal for the generator; this pattern trains the judge itself on its own synthetic comparisons.
