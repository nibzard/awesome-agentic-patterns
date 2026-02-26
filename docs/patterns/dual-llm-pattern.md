---
title: Dual LLM Pattern
status: emerging
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Simon Willison (orig.)", "Luca Beurer-Kellner et al. (2025)"]
category: Orchestration & Control
source: "https://arxiv.org/abs/2506.08837"
tags: [privilege-separation, quarantined-llm, symbolic-variables]
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

Email/calendar assistants, booking agents, API-powered chatbots.

## Trade-offs

* **Pros:** Clear trust boundary; compatible with static analysis.
* **Cons:** Complexity; debugging across two minds.

## References

* Willison, *Dual LLM Pattern* (Apr 2023); adopted in Beurer-Kellner et al., §3.1 (4).

- Primary source: https://arxiv.org/abs/2506.08837
