---
title: "Inference-Healed Code Review Reward"
status: "Proposed"
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Anonymous Speaker (Open Source Agent RL Talk)", "Will Brown (Prime Intellect Talk)"]
category: "Feedback Loops"
source_link: "https://www.youtube.com/watch?v=Xkwok_XXQgw"
tags: [reward-modeling, code-review, inference-healing, quality-assessment]
---

## Problem

Simple reward functions that only check for "all tests passed" fail to capture nuanced code quality issues (e.g., performance regressions, style violations, missing edge-case handling). A single binary signal at the end cannot guide the agent to produce maintainable, high-quality code.

- Verifying **only** final correctness misses suboptimal commits (e.g., a patch that removes error handling but still passes tests).
- Reward models that produce a single scalar lack **explainability** to tell the agent which aspect of the code needs improvement.

## Solution

Use an **inference-healed reward model**—a code-review critic that:

**1. Decomposes Code Quality into Subcriteria**
- **Correctness:** Does the code pass all existing and newly added tests?
- **Style:** Are linters (e.g., ESLint, pylint) satisfied (zero or minimal warnings)?
- **Performance:** Are there clear performance regressions gauged by simple benchmarks?
- **Security:** Does a static analyzer (e.g., Bandit, SonarQube) flag no critical issues?

**2. Runs Internal Chain-of-Thought (CoT) Reasoning**
- If uncertain about a subcriterion (e.g., performance), the critic runs a short CoT inside itself:
  ```text
  "Step: performance check. Baseline runtime: 50ms. New code runtime: 65ms. 
  Regression > 20%. Score: 0.4."  
  ```
- This "inference healing" allows the reward model to **explain** each sub-score.

**3. Aggregates Subscores**
- Each subcriterion returns a float ∈ [0, 1].
- A weighted sum (e.g., 0.4 × correctness + 0.2 × style + 0.2 × performance + 0.2 × security) yields the final code-review score.

**4. Generates Human-Readable Feedback**
- Alongside a numerical score, return a short analysis:
  ```json
  {
    "correctness": 1.0,
    "style": 0.8,
    "performance": 0.4,
    "security": 0.6,
    "comments": "Performance regression due to O(n²) loop."
  }
  ```

## Example

```python
# Pseudo-code for one code-review reward invocation
subscores = {
    "correctness": test_critic.score(patch),
    "style": linter_critic.score(patch),
    "performance": perf_critic.score(patch),
    "security": security_critic.score(patch),
}
final_score = sum(weight[k]*subscores[k] for k in subscores)
return final_score, subscores, comments
```

## How to use it

- **Critic Dataset Collection:** Gather examples of good vs. bad code patches, labeled along each subcriterion.
- **Critic Training:** Fine-tune a small LLM (e.g., 1–2 B parameters) to produce sub-scores and CoT justifications.
- **Integration into RL Loop:** Replace or augment the existing binary "tests-passed" reward with `inference_healed_reward(patch)`.
- **Human-in-the-Loop Checkpoints:** If a patch is borderline (e.g., final_score ∈ [0.5, 0.7]), route it for manual code review to generate better labels for future training.

## Trade-offs

- **Pros:**
  - **Explainable Feedback:** The agent knows *why* a patch scored poorly, allowing targeted improvements.
  - **Higher Code Quality:** Incorporates non-functional criteria (performance, security), leading to more robust code.
- **Cons/Considerations:**
  - **Compute Overhead:** Each reward invocation may involve running tests, linters, benchmarks, and a static analysis, adding latency.
  - **Critic Maintenance:** As coding standards or security rules evolve, retrain or update the critic models and rubrics.

## References

- Derived from "inference healing" in reward modeling, as discussed in the Open Source Agent RL talk (May 2025) and by Will Brown (Prime Intellect).
- Similar principles in "Criterion-Led Reward Models" (DeepMind blog, April 2025).