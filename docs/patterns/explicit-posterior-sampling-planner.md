---
title: Explicit Posterior-Sampling Planner
status: emerging
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Dilip Arumugam", "Thomas L. Griffiths"]
category: Orchestration & Control
source: "https://arxiv.org/abs/2504.20997"
tags: [RL, PSRL, exploration, planning, decision-making]
---

## Problem

Heuristic planning loops often over-exploit the first plausible strategy and under-explore alternatives. In uncertain environments, this drives repeated dead ends, unstable learning, and high token/API spend with little information gain.

## Solution

Embed a *fully specified* RL algorithm—Posterior Sampling for Reinforcement Learning (PSRL)—inside the LLM's reasoning:

- Maintain a Bayesian posterior over task models.  
- Sample a model, compute an optimal plan/policy, execute, observe reward, update posterior.  
- Express each step in natural language so the core LLM can carry it out with tool calls.

The planner becomes an explicit exploration policy instead of an improvised chain of thoughts. By repeatedly sampling from the posterior, the agent balances exploration and exploitation with a principled uncertainty model rather than ad-hoc retries.

## How to use it

Wrap PSRL in a reusable prompt template or controller skeleton with explicit state variables (`posterior`, `reward`, `horizon`). Start in bounded environments with measurable reward signals and instrument posterior updates for debugging.

## Trade-offs

* **Pros:** More sample-efficient exploration and better decision consistency under uncertainty.
* **Cons:** Higher implementation complexity, sensitive reward design, and additional compute overhead.

## References

- Arumugam & Griffiths, *Toward Efficient Exploration by LLM Agents*

- Primary source: https://arxiv.org/abs/2504.20997
