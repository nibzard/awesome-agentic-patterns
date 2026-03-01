---
title: Verbose Reasoning Transparency
status: best-practice
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Boris Cherny (via Claude Code)"]
category: UX & Collaboration
source: "https://www.nibzard.com/claude-code"
tags: [explainability, debugging, transparency, agent reasoning, verbose mode, introspection]
---

## Problem

AI agents, especially those using complex models or multiple tools, can sometimes behave like "black boxes." Users may not understand why an agent made a particular decision, chose a specific tool, or generated a certain output. This lack of transparency can hinder debugging, trust, and the ability to effectively guide the agent.

## Solution

Implement a feature that allows users to inspect the agent's internal "thought process" or reasoning steps on demand. This could be triggered by a keybinding (e.g., `Ctrl+R` in Claude Code) or a command.

When activated, the verbose output might reveal:

-   The agent's interpretation of the user's prompt.
-   Alternative actions or tools it considered.
-   The specific tool(s) it selected and why (if available).
-   Intermediate steps or sub-tasks it performed.
-   Confidence scores or internal states.
-   Raw outputs from tools before they are processed or summarized.

This transparency helps users understand the agent's decision-making process, identify issues if the agent is stuck or producing incorrect results, and learn how to prompt more effectively.

## Example (transparency activation)

```mermaid
sequenceDiagram
    participant User
    participant Agent
    participant UI as Interface

    User->>Agent: Complex task request
    Agent->>Agent: Process internally
    Agent-->>User: Standard output

    User->>UI: Ctrl+R (or verbose command)
    UI->>Agent: Request verbose details
    Agent-->>UI: Internal reasoning steps
    Agent-->>UI: Tool selection rationale
    Agent-->>UI: Confidence scores
    Agent-->>UI: Raw tool outputs
    UI-->>User: Detailed transparency view
```

## How to use it

- Debugging agents that produce incorrect or unexpected outputs
- Learning how to prompt more effectively by studying agent reasoning patterns
- Building trust in high-stakes scenarios where understanding "why" matters
- Complementing human-in-the-loop approval workflows with transparency

## Trade-offs

* **Pros:** Enables debugging of unexpected agent behavior, supports prompt engineering, and builds trust through explainability.
* **Cons:** Adds modest performance overhead (+10-30% tokens) and requires careful handling of sensitive information (system prompts, credentials).

## References

-   Based on the `Ctrl+R` keybinding for showing verbose output in "Mastering Claude Code: Boris Cherny's Guide & Cheatsheet," section V.
-   Wei et al. (2022). "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models." *NeurIPS*. https://arxiv.org/abs/2201.11903
-   Mohseni et al. (2021). "HCI Guidelines for Explainable AI." *arXiv:2108.05206*. https://arxiv.org/abs/2108.05206

[Source](https://www.nibzard.com/claude-code)
