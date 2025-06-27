---
title: Tree-of-Thought Reasoning
status: established
authors: ["Yao et al. (2023)"]
category: Orchestration & Control
source: "https://arxiv.org/abs/2305.10601"
tags: [branching, deliberate-reasoning, search]
---

## Problem
Linear chain-of-thought reasoning can get stuck on complex problems, missing alternative approaches or failing to backtrack.

## Solution
Explore a search tree of intermediate "thoughts" instead of a single chain. The agent expands multiple possible steps and evaluates partial solutions before committing to a path.

```pseudo
queue = [root_problem]
while queue:
    thought = queue.pop()
    for step in expand(thought):
        score = evaluate(step)
        queue.push((score, step))
select_best(queue)
```

## How to use it
Apply when tasks benefit from exploring many potential strategies—puzzles, code generation, or planning. Use heuristics or a value function to prune unpromising branches.

## Trade-offs
* **Pros:** Covers more possibilities; improves reliability on hard tasks.
* **Cons:** Higher compute cost; needs a good scoring method to guide the search.

## References
* [Tree of Thoughts: Deliberate Problem Solving with Large Language Models](https://arxiv.org/abs/2305.10601)
