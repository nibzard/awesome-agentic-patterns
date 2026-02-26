---
title: Tree-of-Thought Reasoning
status: established
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Yao et al. (2023)"]
category: Orchestration & Control
source: "https://arxiv.org/abs/2305.10601"
tags: [branching, deliberate-reasoning, search]
---

## Problem

Linear reasoning commits early to one path and can fail silently when intermediate assumptions are wrong. On complex planning or synthesis tasks, this causes premature convergence, weak recovery from mistakes, and missed alternatives that a broader search would discover.

## Solution

Explore a search tree of intermediate thoughts instead of a single chain. Generate multiple candidate continuations, score partial states, prune weak branches, and continue expanding the most promising paths until a stopping condition is met.

This turns reasoning into guided search: backtracking is explicit, branch quality is measurable, and the final answer can be chosen from competing candidates rather than the first trajectory.

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
