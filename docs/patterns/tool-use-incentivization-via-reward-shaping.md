---
title: "Tool Use Incentivization via Reward Shaping"
status: "Emerging"
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Will Brown (Prime Intellect Talk)"]
category: "Feedback Loops"
source_link: "https://www.youtube.com/watch?v=Xkwok_XXQgw"
tags: [tool-use, reward-shaping, coding-agent, RL]
---

## Problem

Coding agents often underutilize specialized tools (e.g., compilers, linters, test runners) when left to optimize only for final task success. They default to "thinking" tokens—generating internal chain-of-thought—instead of invoking external tools, which can slow down development and lead to suboptimal code outputs.

- Models like R1 "use their think tokens" almost exclusively rather than calling tools unless explicitly rewarded for tool use.
- Without intermediate incentives, the agent has no incentive to write code, compile, or run tests until the very end.

## Solution

Provide **dense, shaped rewards** for every intermediate tool invocation that contributes toward final code correctness. Key components:

**1. Define Tool-Specific Reward Signals**
- **Compile Reward:** +1 if code compiles without errors.
- **Lint Reward:** +0.5 if linter returns zero issues.
- **Test Reward:** +2 if test suite passes a new test case.
- **Documentation Reward:** +0.2 for adding or correcting docstrings.

**2. Episode-Level Aggregation**
- Sum intermediate rewards to form a cumulative "coding progress" score.
- Combine with final reward (e.g., full test suite pass or PR merge) to guide policy updates.

**3. Policy Update Mechanism**
- Use Proximal Policy Optimization (PPO) or Advantage Actor-Critic (A2C) with these shaped rewards.
- During each RL rollout, track `(state, action, tool_result, local_reward)` tuples.

```python
# Pseudo-code: at each RL step, after tool call:
if action == "compile":
    local_reward = 1 if compile_success else -0.5
elif action == "run_tests":
    local_reward = 2 if new_tests_passed else 0
# ... other tool rewards ...
trajectory.append((state, action, tool_output, local_reward))
```

## How to use it

- **Instrumentation:** Wrap tool calls (e.g., `compile()`, `run_linter()`, `pytest`) with functions that return a binary or graded success signal.
- **Hyperparameter Tuning:** Adjust reward magnitudes so that the agent does not "overfit" to one tool (e.g., getting lint rewards repeatedly without actual functionality).
- **Curriculum Design:** Start with simpler tasks (e.g., "fix one failing test") to collect early positive signals and gradually scale to multi-file refactors.

## Trade-offs

- **Pros:**
  - **Denser Feedback:** Guides the agent step by step, reducing reliance on sparse, final success signals.
  - **Tool Adoption:** Encourages the agent to learn how and when to invoke compilers and test runners.
- **Cons/Considerations:**
  - **Reward Engineering Overhead:** Requires careful design and maintenance of reward functions for each tool.
  - **Potential Overfitting:** The agent may game intermediate rewards (e.g., repeatedly running lint without changing code).

## References

- Will Brown's discussion on how "if you set these models up to use tools, they just won't" unless incentivized.
- Concepts from "Reinforcing Multi-Turn Reasoning in LLM Agents via Turn-Level Credit Assignment" (Prime Intellect paper previewed in talk).