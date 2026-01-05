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
Human preference labels are costly and quickly become outdated as base models improve.

## Solution
Train a **self-taught evaluator** that bootstraps from synthetic data:

1. Generate multiple candidate outputs for an instruction.  
2. Ask the model to judge and explain which is better (reasoning trace).  
3. Fine-tune that judge on its own traces; iterate.  
4. Use the judge as a reward model or quality gate for the main agent.  
5. Periodically refresh with new synthetic debates to stay ahead of model drift.

## Pros & Cons
- **Pros:** near-human eval accuracy without labels; scales with compute.  
- **Cons:** risk of evaluator-model collusion; needs adversarial tests.

## References
- Wang et al., *Self-Taught Evaluators*