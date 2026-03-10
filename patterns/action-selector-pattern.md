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

In tool-enabled agents, untrusted data from emails, web pages, and API responses is often fed back into the model between steps. That creates a control-flow vulnerability: injected text can influence which action the agent chooses next, enabling control-flow hijacking. Even if individual tools are safe, a compromised action-selection loop can trigger harmful sequences at the orchestration layer and enable cascading prompt injection attacks.

## Solution

Treat the LLM as an instruction decoder, not a live controller. The model maps user intent to a pre-approved action ID plus schema-validated parameters, and execution is handled by deterministic code.

- Map natural language to a constrained action allowlist.
- Validate parameters against strict schemas before execution.
- Prevent tool outputs from re-entering the selector prompt.
- For multi-step workflows, compose actions in code with explicit state transitions.

This preserves natural-language usability while removing post-selection prompt-injection leverage. By preventing tool outputs from re-entering the LLM context, the pattern provides provable resistance to prompt injection through separation of duties and input/output control.

```pseudo
action = LLM.translate(prompt, allowlist)
execute(action)
# tool output NOT returned to LLM
```

## Evidence

- **Evidence Grade:** `high` (academically grounded; industry adoption confirmed)
- **Most Valuable Findings:**
  - Provides provable resistance to control-flow hijacking via separation of duties and no feedback loop
  - Supported by major frameworks: LangChain (tool allowlists, Pydantic validation), Anthropic Claude (function calling with response schemas), OpenAI (function calling with JSON Schema)
  - Does NOT protect against parameter poisoning—malicious data can still influence parameters passed to approved tools
- **Unverified:** Detailed quantitative evaluation results from source paper

## How to use it

Provide a hard allowlist of actions (API calls, SQL templates, page links) and version it like an API contract. Use strict schema validation (e.g., Pydantic, JSON Schema) for all parameters. Use it for customer-service bots, routing assistants, kiosk flows, and approval systems where allowed actions are finite and auditable.

## Trade-offs

* **Pros:** Near-immunity to prompt injection; trivial to audit.
* **Cons:** Limited flexibility; new capabilities require code updates.

## References

* Beurer-Kellner et al., §3.1 (1) Action-Selector.

- Primary source: https://arxiv.org/abs/2506.08837
- "ReAct" (Yao et al., 2022): Foundational reasoning-acting pattern that Action-Selector secures against injection
- SecAlign (Chen et al., 2024): Preference optimization defense against prompt injection
- StruQ (Chen et al., 2024): Structured query defense with type-safe construction
- "Learning From Failure" (Wang et al., 2024): Categories of tool-use errors in LLM agents
