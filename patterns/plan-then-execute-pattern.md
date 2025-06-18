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

## Trade-offs

* **Pros:** Strong control-flow integrity; moderate flexibility.
* **Cons:** Content of outputs can still be poisoned (e.g., bad email body).

## References

* Beurer-Kellner et al., §3.1 (2) Plan-Then-Execute.