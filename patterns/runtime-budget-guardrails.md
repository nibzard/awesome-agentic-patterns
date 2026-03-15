---
title: Runtime Budget Guardrails
status: established
authors: ["arieradle (@arieradle)"]
based_on: ["shekel - https://github.com/arieradle/shekel"]
category: "Orchestration & Control"
source: "https://github.com/arieradle/shekel"
tags: [cost-control, budget, guardrails, spending-limits, agents, orchestration]
---

## Problem

AI agents accumulate unexpected costs through retries, tool loops, and long-running LLM calls. Setting soft budget guidance in prompts is insufficient because token spend compounds silently across nested calls, parallel sub-agents, and retry storms. Without hard runtime limits, a single runaway agent can exhaust a month's budget in minutes.

## Solution

Wrap agent execution in a context manager that enforces a hard spending cap by intercepting LLM provider calls at runtime, accumulating cost, and raising a `BudgetExceeded` exception before each call that would exceed the limit.

Key elements:
- A `budget(max_usd=N)` context manager that intercepts all outbound LLM calls.
- Per-call cost estimation using provider-specific token pricing tables.
- Cumulative spend tracking across nested agents and tool invocations.
- An immediate hard stop (exception) when the limit is reached.

```python
from shekel import budget

with budget(max_usd=5.00):
    run_my_agent()  # raises BudgetExceeded if cost exceeds $5
```

**CLI usage:**

```bash
shekel run agent.py --budget 5
```

Supports: OpenAI, Anthropic, Gemini, LangChain, LangGraph, CrewAI, AutoGen, LlamaIndex, MCP, OpenAI Agents SDK, LiteLLM, HuggingFace.

## Evidence

- **Evidence Grade:** `low` (practical engineering pattern, limited academic study)
- **Most Valuable Findings:**
  - Retry storms and tool loops are a primary cause of runaway LLM spend in production agents.
  - Hard caps enforced at the call level are more reliable than soft prompt-based budget guidance.
- **Unverified / Unclear:** Optimal budget allocation strategies across heterogeneous multi-agent workflows.

## How to use it

- Apply `budget(max_usd=N)` at the agent entrypoint to limit total spend per run.
- Use `budget(max_usd=N, per_call=True)` to cap individual LLM calls.
- Nest budgets for sub-agents to enforce hierarchical spending limits.
- Set alerts below the hard cap to catch runaway agents before they hit the limit.

## Trade-offs

- **Pros:**
  - Zero-config protection against cost explosions in production.
  - Works across all major LLM providers with a single import.
  - Compatible with existing agent frameworks (LangGraph, CrewAI, AutoGen, etc.).
- **Cons:**
  - Hard stops may interrupt partially completed agent workflows mid-task.
  - Cost estimation relies on provider pricing tables that can become stale.
  - Does not throttle—it stops rather than slows.

## References

- [shekel on GitHub](https://github.com/arieradle/shekel)
- [LangGraph demo with budget guardrails](https://github.com/arieradle/shekel/blob/main/examples/langgraph_demo.py)
- [Nested research agent example](https://github.com/arieradle/shekel/blob/main/examples/nested_research_agent.py)
