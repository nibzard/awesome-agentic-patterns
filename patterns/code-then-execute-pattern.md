---
title: Code-Then-Execute Pattern
status: emerging
authors: ["Nikola Balic (@nibzard)"]
based_on: ["DeepMind CaMeL (orig.)", "Luca Beurer-Kellner et al. (2025)"]
category: Tool Use & Environment
source: "https://arxiv.org/abs/2506.08837"
tags: [dsl, sandbox, program-synthesis, auditability]
summary: "LLM writes a sandboxed program or DSL script, a static taint checker verifies data flows, and an interpreter runs it in a locked sandbox"
signals: ["Security-sensitive workflows where tainted input must not reach dangerous sinks", "Multi-step agents such as SQL copilots or workflow automators that need auditability", "You need formal verification or replay logs of agent actions"]
anti_signals: ["You cannot invest in DSL design and static-analysis infrastructure", "Simple tasks where sandbox execution overhead outweighs audit value"]
updated_at: "2026-10-13"
---

## Problem

Free-form plan-and-act loops are difficult to audit because critical control decisions stay implicit in natural-language reasoning. In security-sensitive workflows, teams need verifiable guarantees that tainted inputs cannot flow into dangerous sinks (for example, external messages, payments, or destructive commands). Plain-text plans are too weak for formal validation.

## Solution

Have the LLM output a **sandboxed program or DSL script**:

1. LLM writes code that calls tools and untrusted-data processors.
2. Static checker/Taint engine verifies flows (e.g., no tainted var to `send_email.recipient`).
3. Interpreter runs the code in a locked sandbox.

The key shift is to move from "reasoning about actions" to "compiling actions" into an inspectable artifact. Once actions are code, policy engines and static analyzers can enforce data-flow rules before execution.

Scope note: step 2 is an optional hardening layer, not part of the base pattern. The survey's Code-Then-Execute pattern (Beurer-Kellner et al., §3.1, pattern 5) defines no checker step and states it cannot stop injected content that arrives inside tool data. CaMeL (Debenedetti et al.) is the stronger variant that adds taint tracking and security-classified variables on top.

This pattern also serves a complementary purpose: **token optimization**. When tool calls execute within the sandbox rather than through special tokens, only condensed results return to the LLM context. Published measurements: Anthropic reports 98.7% (150K → 2K tokens) for tool definitions loaded on demand, and Bifrost measures 58.2-92.8% input-token reductions for code-mode tool calling.

```dsl
x = calendar.read(today)
y = QuarantineLLM.format(x)
email.write(to="john@acme.com", body=y)
```

## Example

The calendar-to-email flow above illustrates the three steps separately:

**1. The DSL script (what the LLM writes):** three lines, each a tool call with explicit arguments; the recipient and body are visible as data flows, not buried in prose.

**2. The checker (optional CaMeL-style hardening):** a static pass over the script that rejects forbidden flows before anything runs:

```pseudo
tainted = {x}                       # calendar data is untrusted
policy: email.recipient must be untainted_constant
check(x -> y -> email.body)  = ok   # body may carry quaranted content
check(email.recipient == "john@acme.com")  = ok
# email.write(to=user_input) would be rejected at compile time
```

**3. The sandbox (where it runs):** an interpreter with no network egress except the two tool endpoints, a per-run time and write budget, and a replay log keyed by script hash, so any executed action can be re-verified after the fact.

## How to use it

Use this for complex multi-step agents such as SQL copilots, software-engineering bots, and workflow automators where auditability matters. Start with a small DSL and explicit forbidden flows, then expand language features as checks mature.

## Trade-offs

* **Pros:** Formal verifiability; replay logs; reduced token costs for data-heavy workflows.
* **Cons:** Requires DSL design and static-analysis infra; sandbox execution overhead.

## References

* Debenedetti et al., [CaMeL: Defeating Prompt Injections by Design](https://arxiv.org/abs/2503.18813) (Google DeepMind, 2025) - origin of the taint-tracked variant
* Beurer-Kellner et al., [Design Patterns for Securing LLM Agents against Prompt Injections](https://arxiv.org/abs/2506.08837) (2025) - names Code-Then-Execute as §3.1 pattern 5, without a checker step
* Anthropic Engineering, [Code Execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp) (November 4, 2025) - 98.7% tool-definition token reduction
* Bifrost, [Code Mode benchmarks](https://docs.getbifrost.ai/mcp/code-mode) - 58.2-92.8% measured input-token reduction
* Distinct from [Plan-Then-Execute Pattern](plan-then-execute-pattern.md): that pattern structures reasoning before acting, while this pattern compiles actions into a verifiable program
* Distinct from [Code-Over-API Pattern](code-over-api-pattern.md): that pattern optimizes tokens for data processing, while this pattern prioritizes auditability and data-flow control

- Primary source: https://arxiv.org/abs/2506.08837
- Industry implementation: https://www.anthropic.com/engineering/code-execution-with-mcp
