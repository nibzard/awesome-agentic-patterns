---
title: Code-Then-Execute Pattern
status: emerging
authors: ["Nikola Balic (@nibzard)"]
based_on: ["DeepMind CaMeL (orig.)", "Luca Beurer-Kellner et al. (2025)"]
category: Tool Use & Environment
source: "https://arxiv.org/abs/2506.08837"
tags: [dsl, sandbox, program-synthesis, auditability]
---

## Problem
Plan lists are opaque; we want **full data-flow analysis** and taint tracking.

## Solution
Have the LLM output a **sandboxed program or DSL script**:

1. LLM writes code that calls tools and untrusted-data processors.  
2. Static checker/Taint engine verifies flows (e.g., no tainted var to `send_email.recipient`).  
3. Interpreter runs the code in a locked sandbox.

```dsl
x = calendar.read(today)
y = QuarantineLLM.format(x)
email.write(to="john@acme.com", body=y)
```

## How to use it

Complex multi-step agents like SQL copilots, software-engineering bots.

## Trade-offs

* **Pros:** Formal verifiability; replay logs.
* **Cons:** Requires DSL design and static-analysis infra.

## References

* Debenedetti et al., CaMeL (2025); Beurer-Kellner et al., §3.1 (5).