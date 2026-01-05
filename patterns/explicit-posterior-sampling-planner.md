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
Agents that rely on ad-hoc heuristics explore poorly, wasting tokens and API calls on dead ends.

## Solution
Embed a *fully specified* RL algorithm—Posterior Sampling for Reinforcement Learning (PSRL)—inside the LLM's reasoning:

- Maintain a Bayesian posterior over task models.  
- Sample a model, compute an optimal plan/policy, execute, observe reward, update posterior.  
- Express each step in natural language so the core LLM can carry it out with tool calls.

## How to use it
Wrap the algorithm in a reusable prompt template or code skeleton the LLM can fill.

## References
- Arumugam & Griffiths, *Toward Efficient Exploration by LLM Agents*