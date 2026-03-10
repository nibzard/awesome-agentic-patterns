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

Free-form plan-and-act loops are difficult to audit because critical control decisions stay implicit in natural-language reasoning. In security-sensitive workflows, teams need verifiable guarantees that tainted inputs cannot flow into dangerous sinks (for example, external messages, payments, or destructive commands). Plain-text plans are too weak for formal validation.

## Solution

Have the LLM output a **sandboxed program or DSL script**:

1. LLM writes code that calls tools and untrusted-data processors.
2. Static checker/Taint engine verifies flows (e.g., no tainted var to `send_email.recipient`).
3. Interpreter runs the code in a locked sandbox.

The key shift is to move from "reasoning about actions" to "compiling actions" into an inspectable artifact. Once actions are code, policy engines and static analyzers can enforce data-flow rules before execution.

This pattern also serves a complementary purpose: **token optimization**. When tool calls execute within the sandbox rather than through special tokens, only condensed results return to the LLM context, reducing token usage for data-heavy workflows by 75-99% in production deployments.

```dsl
x = calendar.read(today)
y = QuarantineLLM.format(x)
email.write(to="john@acme.com", body=y)
```

## How to use it

Use this for complex multi-step agents such as SQL copilots, software-engineering bots, and workflow automators where auditability matters. Start with a small DSL and explicit forbidden flows, then expand language features as checks mature.

## Trade-offs

* **Pros:** Formal verifiability; replay logs; reduced token costs for data-heavy workflows.
* **Cons:** Requires DSL design and static-analysis infra; sandbox execution overhead.

## References

* Debenedetti et al., CaMeL (2025); Beurer-Kellner et al., §3.1 (5).
* Anthropic Engineering, Code Execution with MCP (2024).

- Primary source: https://arxiv.org/abs/2506.08837
- Industry implementation: https://www.anthropic.com/engineering/code-execution-with-mcp
