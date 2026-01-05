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
A privileged agent that both sees untrusted text **and** wields tools can be coerced into dangerous calls.

## Solution
Split roles:

- **Privileged LLM:** Plans and calls tools but **never sees raw untrusted data**.  
- **Quarantined LLM:** Reads untrusted data but **has zero tool access**.  
- Pass data as **symbolic variables** or validated primitives; privileged side only manipulates references.

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