---
title: Reflection Loop
status: production
authors:
  - Nikola Balic (@nibzard)
based_on:
  - Shinn et al. (2023)
category: Feedback Loops
source: 'https://arxiv.org/abs/2303.11366'
tags:
  - self-feedback
  - iterative-improvement
  - evaluation
slug: reflection
id: reflection-loop
summary: "Scores each draft against a fixed rubric, feeds the critique into a revision, and repeats until the draft passes a threshold or the retry budget ends"
signals: ["Output must meet explicit quality criteria", "Single-pass answers miss edge cases or constraints", "Writing, reasoning, or code tasks with a clear scoring metric"]
anti_signals: ["No well-defined metric to score drafts", "Extra compute per answer is not acceptable"]
related: ["deterministic-grader-in-the-loop", "inference-time-scaling", "self-critique-evaluator-loop", "rlaif-reinforcement-learning-from-ai-feedback", "output-verification-loop"]
updated_at: '2026-11-25'
---

## Problem

Single-pass generation frequently misses edge cases, constraints, or quality criteria that become obvious on review. Without a structured revision loop, agents return the first plausible answer even when a better answer is reachable with lightweight critique.

## Solution

After generating a draft, run an explicit self-evaluation pass against defined criteria and feed the critique into a revision attempt. Repeat until the output clears a threshold or retry budget is exhausted.

Use stable scoring rubrics (correctness, completeness, safety, style) so the loop improves objective quality rather than free-form restyling. For reduced bias, use a separate model for critique (dual-model architecture) at the cost of additional compute.

**Inputs, state, and outputs:**

- **Inputs:** the task prompt, a fixed rubric (criteria, weights, pass threshold), a retry budget, and any external signals available (unit tests, linters, schema validators).
- **State per iteration:** the current draft, a score per criterion, the critique, and the best draft seen so far.
- **Output:** the best-scoring draft, not the last one, together with its scores.

```pseudo
best = None
for attempt in range(max_iters):               # hard cap, chosen up front
    draft = generate(prompt)
    external = run_checks(draft)               # tests, linters, validators; may be empty
    score, critique = evaluate(draft, rubric, external)
    if best is None or score > best.score:
        best = (draft, score)
    if score >= threshold:
        return draft
    if deltas_flattened(attempt):
        break                                  # stop early instead of burning the budget
    prompt = incorporate(critique, prompt)     # revise the draft; keep the task and rubric fixed
return best.draft
```

## How to use it

Use this when quality must meet explicit criteria in writing, reasoning, or code generation. Keep loop budgets small; there is no universally established optimum, so log score deltas per iteration and stop when the deltas flatten rather than assuming a fixed iteration count. Note that 2025-2026 reasoning models already internalize a form of self-checking in their thinking, so hand-rolled reflection scaffolds pay off mostly with non-reasoning models or when the rubric is domain-specific.

- Anchor at least one rubric criterion in something outside the model: a test, a validator, a retrieved source.
- Score criterion by criterion, and require the critic to point at the part of the draft that fails.
- Keep the original task and rubric as a fixed prefix; revise only the draft.
- Return the best-scoring draft, and record the scores so a rejected loop is still auditable.

Related patterns: [CriticGPT-Style Code Review](criticgpt-style-evaluation.md) and [Self-Critique Evaluator Loop](self-critique-evaluator-loop.md) use a dedicated critic instead of self-feedback; [Deterministic Grader in the Loop](deterministic-grader-in-the-loop.md) replaces the model judge with code; [Inference-Time Scaling](inference-time-scaling.md) covers the sibling strategy of sampling many candidates and selecting rather than revising one.

### Failure modes

- **Sycophantic self-critique.** The model that wrote the draft also scores it, under-reports its own blind spots, and the loop settles on the first draft with a high score. Use a separate critic model or a critic prompt that cannot see the generator's reasoning, score per criterion with required evidence, and move whatever can be checked into deterministic code.
- **Oscillation without an external signal.** With nothing to anchor to, each critique asks for a different change and drafts swing between alternatives while scores move without improving. Cap iterations, stop when score deltas flatten, return the best draft rather than the last, and ground at least one criterion externally.
- **Rubric gaming and critique leakage.** Drafts drift toward the rubric's surface: padded length, boilerplate edge-case sections, the critic's own wording repeated back. Score with criteria the generator never sees, penalize padding, pass the critique as private feedback, and strip meta-commentary before returning the draft.
- **Prompt compounding.** Appending every critique to the prompt makes later drafts chase stale or contradictory notes while the task instructions get diluted. Revise the previous draft using only the latest critique, and keep the task and rubric verbatim as a fixed prefix.

## Trade-offs

* **Pros:** Improves outputs with little supervision.
* **Cons:** Extra compute; may stall if the metric is poorly defined.

## References

* [Self-Refine: Iterative Refinement with Self-Feedback](https://arxiv.org/abs/2303.17651) - Madaan et al., 2023
* [Reflexion: Language Agents with Verbal Reinforcement Learning](https://arxiv.org/abs/2303.11366) - Shinn et al., NeurIPS 2023 - adds episodic memory for persistent learning across trials
