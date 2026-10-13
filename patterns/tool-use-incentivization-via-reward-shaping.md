---
title: "Tool Use Incentivization via Reward Shaping"
status: emerging
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Will Brown (Prime Intellect Talk)"]
category: "Feedback Loops"
source: "https://www.youtube.com/watch?v=Xkwok_XXQgw"
tags: [tool-use, reward-shaping, coding-agent, RL]
summary: "Gives dense RL rewards for useful intermediate tool calls such as compile, lint, and test so the agent learns to use tools instead of only thinking"
signals: ["Training a coding agent with reinforcement learning", "Agent uses thinking tokens instead of calling tools", "Final-only rewards are too sparse to learn from"]
anti_signals: ["No RL training loop, only prompting", "Team cannot design and tune per-tool reward functions"]
updated_at: "2026-10-13"
---

## Problem

Coding agents often underutilize specialized tools (e.g., compilers, linters, test runners) when left to optimize only for final task success. They default to "thinking" tokens—generating internal chain-of-thought—instead of invoking external tools, which can slow down development and lead to suboptimal code outputs.

- Reasoning models trained in the R1 style are, as the source talk puts it, single-turn reasoners that are not yet general-purpose agents: they reason in thinking tokens by default and do not reliably reach for tools unless the reward structure makes tool use pay off.
- Without intermediate incentives, the agent has no incentive to write code, compile, or run tests until the very end.
- Sparse final rewards provide insufficient signal for learning optimal tool-use patterns across multi-step episodes.

## Solution

Provide **dense, shaped rewards** for every intermediate tool invocation that contributes toward final code correctness. Key components:

**1. Define Tool-Specific Reward Signals** (magnitudes below are illustrative starting points to tune, not established values from any source)
- **Compile Reward:** +1 if code compiles without errors.
- **Lint Reward:** +0.5 if linter returns zero issues.
- **Test Reward:** +2 if test suite passes a new test case.
- **Documentation Reward:** +0.2 for adding or correcting docstrings.
- **Efficiency Reward:** +0.1 for parallelizing independent tool calls; -0.05 for redundant invocations.
- **Format Reward:** +0.2 for proper tool invocation schema compliance.

**2. Episode-Level Aggregation**
- Sum intermediate rewards to form a cumulative "coding progress" score.
- Combine with final reward (e.g., full test suite pass or PR merge) to guide policy updates.
- Use turn-level credit assignment to attribute rewards correctly across multi-step tool sequences.

**3. Policy Update Mechanism**
- Use Proximal Policy Optimization (PPO), Advantage Actor-Critic (A2C), or GRPO with these shaped rewards.
- During each RL rollout, track `(state, action, tool_result, local_reward)` tuples.

```python
# Pseudo-code: at each RL step, after tool call:
if action == "compile":
    local_reward = 1 if compile_success else -0.5
elif action == "run_tests":
    local_reward = 2 if new_tests_passed else 0
elif action == "parallel_tool_batch":
    local_reward = 0.1  # efficiency bonus

# Check for redundant calls
if is_redundant_call(action, history):
    local_reward -= 0.05

trajectory.append((state, action, tool_output, local_reward))
```

## How to use it

- **Instrumentation:** Wrap tool calls (e.g., `compile()`, `run_linter()`, `pytest`) with functions that return a binary or graded success signal.
- **Hyperparameter Tuning:** Adjust reward magnitudes so that the agent does not "overfit" to one tool (e.g., getting lint rewards repeatedly without actual functionality).
- **Curriculum Design:** Start with simpler tasks (e.g., "fix one failing test") to collect early positive signals and gradually scale to multi-file refactors.
- **Multi-Criteria Grading:** Use weighted combinations of correctness, format, tool-use quality, and efficiency to prevent reward hacking.
- **RLAIF for Scalability:** Consider AI-generated feedback (vs. human labels) for cost-effective reward signal generation at scale.

## Trade-offs

- **Pros:**
  - **Denser Feedback:** Guides the agent step by step, reducing reliance on sparse, final success signals.
  - **Tool Adoption:** Encourages the agent to learn how and when to invoke compilers and test runners.
- **Cons/Considerations:**
  - **Reward Engineering Overhead:** Requires careful design and maintenance of reward functions for each tool.
  - **Potential Overfitting:** The agent may game intermediate rewards (e.g., repeatedly running lint without changing code); dense process rewards carry a documented hacking risk — see [Anti-Reward-Hacking Grader Design](anti-reward-hacking-grader-design.md) before shipping dense rewards.

Distinct from [Agent Reinforcement Fine-Tuning (Agent RFT)](agent-reinforcement-fine-tuning.md), the umbrella training loop this fits into, and from [Parallel Tool Call Learning](parallel-tool-call-learning.md), which rewards call batching specifically: this pattern is about per-tool-type reward shaping.

## References

- Primary source: https://www.youtube.com/watch?v=Xkwok_XXQgw (Will Brown, Prime Intellect, "Open Questions in Agentic RL," May 2025)
- [Reinforcing Multi-Turn Reasoning in LLM Agents via Fine-Grained Reward Structure and Credit Assignment](https://arxiv.org/abs/2505.11821) - Wei et al., 2025
- [A Practitioner's Guide to Multi-turn Agentic Reinforcement Learning](https://arxiv.org/abs/2510.01132) - Wang & Ammanabrolu, 2025
- [TRACE: Turn-level Reward Assignment via Credit Estimation for Long-Horizon Agents](https://arxiv.org/abs/2607.13988) - 2026
- [Information Gain-based Policy Optimization (IGPO)](https://arxiv.org/abs/2510.14967) - ICLR 2026 - intrinsic turn-level rewards for multi-turn search agents
- Lightman et al. (2023). [Let's Verify Step by Step](https://arxiv.org/abs/2305.20050). Process supervision for reasoning.
- Shao et al. (2024). "DeepSeekMath: Pushing the Limits of Mathematical Reasoning." Introduces GRPO for step-by-step reasoning ([arXiv 2402.03300](https://arxiv.org/abs/2402.03300)).
- Yao et al. (2023). [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629). ICLR 2023.
