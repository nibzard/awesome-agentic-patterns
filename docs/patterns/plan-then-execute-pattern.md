---
title: Plan-Then-Execute Pattern
status: emerging
authors: ["Luca Beurer-Kellner et al. (2025)"]
category: Orchestration & Control
source: "https://arxiv.org/abs/2506.08837"
tags: [planning, control-flow-integrity, prompt-injection]
---

## Problem
If tool outputs can alter the *choice* of later actions, injected instructions may redirect the agent toward malicious steps.

## Solution
Split reasoning into two phases:

1. **Plan phase** – LLM generates a *fixed* sequence of tool calls **before** it sees any untrusted data.  
2. **Execution phase** – Controller runs that exact sequence. Tool outputs may shape *parameters*, but **cannot change which tools run**.

```pseudo
plan = LLM.make_plan(prompt)      # frozen list of calls
for call in plan:
    result = tools.run(call)
    stash(result)                 # outputs isolated from planner
```

## How to use it

Great for email-and-calendar bots, SQL assistants, code-review helpers—any task where the action set is known but parameters vary.

### Claude Code Plan Mode

Claude Code implements this pattern through "plan mode" which shifts the agent into planning-only mode:

1. **User shifts to plan mode**: Explicitly request planning (e.g., shift+tab in Claude Code CLI)
2. **Agent generates detailed plan**: Creates step-by-step approach without executing
3. **Human reviews and approves**: Can modify plan before execution
4. **Execution phase**: Agent follows the approved plan

**Effectiveness:**

- Can **2-3x success rates** for complex tasks by aligning on approach first
- Prevents wasted work from wrong assumptions
- Allows human expertise to guide agent execution

**Dynamic boundary:**

The threshold of what requires planning changes with each model generation:

> "The boundary changes with every model in a surprising way. Newer models are more intelligent, so the boundary of what you need plan mode for got pushed out a little bit. Before you used to need to plan, now you don't." —Boris Cherny (Anthropic)

This means simpler tasks that once required planning can now be one-shot with more capable models (e.g., Sonnet 4.5 vs. Opus 4.1).

## Trade-offs

* **Pros:** Strong control-flow integrity; moderate flexibility.
* **Cons:** Content of outputs can still be poisoned (e.g., bad email body).

## References

* Beurer-Kellner et al., §3.1 (2) Plan-Then-Execute.
* Boris Cherny (Anthropic): "Plan mode... you kind of have to understand the limits and where you get in the loop. Plan mode can 2-3x success rates pretty easily if you align on the plan first."
* Boris Cherny: "The boundary changes with every model... newer models are more intelligent so the boundary of what you need plan mode for got pushed out."
* [AI & I Podcast: How to Use Claude Code Like the People Who Built It](https://every.to/podcast/transcript-how-to-use-claude-code-like-the-people-who-built-it)