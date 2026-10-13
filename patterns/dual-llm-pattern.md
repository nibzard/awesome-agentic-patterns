---
title: Dual LLM Pattern
status: emerging
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Simon Willison (orig.)", "Luca Beurer-Kellner et al. (2025)"]
category: Orchestration & Control
source: "https://arxiv.org/abs/2506.08837"
tags: [privilege-separation, quarantined-llm, symbolic-variables]
summary: "Splits work between a privileged LLM that calls tools but never sees untrusted data and a quarantined LLM that reads untrusted data but has no tools"
signals: ["One agent reads untrusted input and also calls high-privilege tools", "Prompt injection could trigger writes, sends, or external API calls", "Untrusted content can be reduced to typed values or opaque handles"]
anti_signals: ["The agent has no privileged tools or side effects", "All input comes from trusted sources", "The task needs the tool-calling model to reason over raw untrusted text"]
updated_at: "2026-10-13"
---

## Problem

When the same model both reads untrusted content and controls high-privilege tools, a single prompt-injection path can convert benign context into privileged actions. This coupling collapses trust boundaries and makes it hard to reason about where dangerous behavior originated.

## Solution

Split roles:

- **Privileged LLM:** Plans and calls tools but **never sees raw untrusted data**.  
- **Quarantined LLM:** Reads untrusted data but **has zero tool access**.  
- Pass data as **symbolic variables** or validated primitives; privileged side only manipulates references.

Use an explicit contract between the two models: the quarantined model may only emit typed values (or opaque handles), while the privileged model may only operate over approved schemas and tools. This preserves capability while preventing raw untrusted text from entering high-authority reasoning paths.

```pseudo
var1 = QuarantineLLM("extract email", text)  # returns $VAR1
PrivLLM.plan("send $VAR1 to boss")           # no raw text exposure
execute(plan, subst={ "$VAR1": var1 })
```

## How to use it

Email/calendar assistants, booking agents, API-powered chatbots, or any system handling untrusted user input with privileged actions (e.g., database writes, external API calls, file system operations).

## Trade-offs

* **Pros:** Clear trust boundary; compatible with static analysis.
* **Cons:** Complexity; debugging across two minds.
* **Security limits:** Dual LLM alone is not provably secure. CaMeL (Debenedetti et al., 2025) asks directly whether the pattern suffices and argues the data flow can still be manipulated even when control flow is protected.

## References

* Willison, [The Dual LLM pattern for building AI assistants that can resist prompt injection](https://simonwillison.net/2023/Apr/25/dual-llm-pattern/) (Apr 2023); adopted in Beurer-Kellner et al., §3.1 (4).

- Primary source: https://arxiv.org/abs/2506.08837
- [Defeating Prompt Injections by Design (CaMeL)](https://arxiv.org/abs/2503.18813) - Debenedetti et al., 2025: system-design defense with security guarantees; questions whether Dual LLM alone is enough
- [Designing AI agents to resist prompt injection](https://openai.com/index/designing-agents-to-resist-prompt-injection/) - OpenAI, 2026: same-space industry guidance on constraining risky actions in agent workflows
