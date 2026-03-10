---
title: Tree-of-Thought Reasoning
status: established
authors:
  - Nikola Balic (@nibzard)
based_on:
  - Yao et al. (2023)
category: Orchestration & Control
source: 'https://arxiv.org/abs/2305.10601'
tags:
  - branching
  - deliberate-reasoning
  - search
slug: tree-of-thought-reasoning
id: tree-of-thought-reasoning
summary: >-
  Linear chain-of-thought reasoning can get stuck on complex problems, missing
  alternative approaches or failing to backtrack.
updated_at: '2026-01-05'
---

## Problem

Linear reasoning commits early to one path and can fail silently when intermediate assumptions are wrong. On complex planning or synthesis tasks, this causes premature convergence, weak recovery from mistakes, and missed alternatives that a broader search would discover.

## Solution

Explore a search tree of intermediate thoughts instead of a single chain. Generate multiple candidate continuations, score partial states, prune weak branches, and continue expanding the most promising paths until a stopping condition is met.

This turns reasoning into guided search: backtracking is explicit, branch quality is measurable, and the final answer can be chosen from competing candidates rather than the first trajectory.

The quality of the evaluation function significantly impacts performance—external verifiers (code execution, tests) outperform self-reflection scoring.

```pseudo
queue = [root_problem]
while queue:
    thought = queue.pop()
    for step in expand(thought):
        score = evaluate(step)
        queue.push((score, step))
    prune_weak_branches(queue)
select_best(queue)
```

## How to use it

Apply when tasks benefit from exploring many potential strategies—puzzles, code generation, or planning. Use heuristics or a value function to prune unpromising branches.

Algorithm variants: BFS for exhaustive exploration, DFS for deep paths with limited memory, Beam search for memory-constrained scenarios with good heuristics.

## Trade-offs

* **Pros:** Covers more possibilities; improves reliability on hard tasks (22-28% over CoT on multi-step reasoning); enables explicit backtracking from failed paths.
* **Cons:** Higher compute cost (3-10x more tokens than Chain-of-Thought); needs a good evaluation function to guide search; inherently slower latency. Best for complex planning, mathematical reasoning, and code generation—overkill for simple linear tasks.

## References

* [Tree of Thoughts: Deliberate Problem Solving with Large Language Models](https://arxiv.org/abs/2305.10601) (Yao et al., 2023)
* [Self-Consistency Improves Chain of Thought Reasoning](https://arxiv.org/abs/2203.11171) (Wang et al., 2022) — foundational multi-path exploration method that ToT extends
* [Language Agent Tree Search](https://arxiv.org/abs/2310.04406) (Zhou et al., 2023) — extends ToT with MCTS and value backpropagation
* [Graph of Thoughts](https://arxiv.org/abs/2308.09687) (Besta et al., 2024) — generalizes ToT to arbitrary graph structures with thought aggregation
