---
title: Action-Selector Pattern
status: emerging
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Luca Beurer-Kellner et al. (2025)"]
category: Orchestration & Control
source: "https://arxiv.org/abs/2506.08837"
tags: [prompt-injection, control-flow, safety, tool-use]
---

## Problem

In tool-enabled agents, untrusted data from emails, web pages, and API responses is often fed back into the model between steps. That creates a control-flow vulnerability: injected text can influence which action the agent chooses next, not just what it writes. Even if individual tools are safe, a compromised action-selection loop can trigger harmful sequences at the orchestration layer.

## Solution

Treat the LLM as an instruction decoder, not a live controller. The model maps user intent to a pre-approved action ID plus schema-validated parameters, and execution is handled by deterministic code.

- Map natural language to a constrained action allowlist.
- Validate parameters against strict schemas before execution.
- Prevent tool outputs from re-entering the selector prompt.
- For multi-step workflows, compose actions in code with explicit state transitions.

This preserves natural-language usability while removing post-selection prompt-injection leverage.

```pseudo
action = LLM.translate(prompt, allowlist)
execute(action)
# tool output NOT returned to LLM
```

## How to use it

Provide a hard allowlist of actions (API calls, SQL templates, page links) and version it like an API contract. Use it for customer-service bots, routing assistants, kiosk flows, and approval systems where allowed actions are finite and auditable.

## Trade-offs

* **Pros:** Near-immunity to prompt injection; trivial to audit.
* **Cons:** Limited flexibility; new capabilities require code updates.

## References

* Beurer-Kellner et al., §3.1 (1) Action-Selector.

- Primary source: https://arxiv.org/abs/2506.08837
