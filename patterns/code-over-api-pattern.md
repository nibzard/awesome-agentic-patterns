---
title: Code-Over-API Pattern
status: established
authors:
  - Nikola Balic (@nibzard)
based_on:
  - Anthropic Engineering Team
category: Tool Use & Environment
source: 'https://www.anthropic.com/engineering/code-execution-with-mcp'
tags:
  - token-optimization
  - code-execution
  - data-processing
  - mcp
slug: code-over-api-pattern
id: code-over-api-pattern
summary: "Agent writes code that calls tools and filters data inside a sandbox, so only summaries and samples return to the context window"
signals: ["Data-heavy workflows over spreadsheets, databases, or logs", "Intermediate results do not need model inspection", "Token cost or latency matters"]
anti_signals: ["No secure sandboxed code execution environment is available", "The model is not able to write correct code for the task", "Small tool results that fit easily in context"]
updated_at: '2026-10-13'
---

## Problem

When agents make direct API or tool calls, all intermediate data must flow through the model's context window. For data-heavy workflows (processing spreadsheets, filtering logs, transforming datasets), this creates massive token consumption and increased latency. A workflow that fetches 10,000 spreadsheet rows and filters them can easily consume 150,000+ tokens just moving data through the context.

## Solution

Instead of making direct tool calls, agents write and execute code that interacts with tools. Data processing, filtering, and transformation happens in the execution environment, with only results flowing back to the model context.

**Core insight**: LLMs are better at writing code to call APIs than at calling APIs directly—due to training data alignment with millions of open-source code repositories.

**Direct API approach (high token cost):**

```pseudo
# Agent makes tool call
rows = api_call("spreadsheet.getRows", sheet_id="abc123")
# All 10,000 rows flow through context → 150K tokens

# Agent processes in context
filtered = [row for row in rows if row.status == "active"]
# More tokens for processing

return filtered
```

**Code-Over-API approach (low token cost):**

```python
# Agent writes code that executes in environment
def process_spreadsheet():
    # Tool call happens in execution environment
    rows = spreadsheet.getRows(sheet_id="abc123")

    # Filtering happens in code, not in context
    filtered = [row for row in rows if row.status == "active"]

    # Only log summary for agent visibility
    print(f"Processed {len(rows)} rows, found {len(filtered)} active")
    print(f"First 5 active rows: {filtered[:5]}")

    return filtered

result = process_spreadsheet()
# Only summary and sample flow to context → ~2K tokens
```

The agent sees the log output and return value, but the full dataset never enters its context window.

## How to use it

**Best for:**

- Data-heavy workflows (spreadsheets, databases, logs)
- Multi-step transformations or aggregations
- Workflows with intermediate results that don't need model inspection
- Cost-sensitive applications where token usage matters

**Prerequisites:**

- Secure code execution environment with sandboxing
- Access to tools/APIs from within the execution environment
- Resource limits (CPU, memory, time) to prevent runaway execution

**Implementation pattern:**

1. Agent analyzes task and determines data processing needs
2. Agent writes code that:
   
- Calls tools/APIs within the execution environment
   - Performs filtering, transformation, aggregation in code
   - Logs only summaries or samples for visibility
   - Returns final results
3. Execution environment runs code with tool access
4. Only logs and return values flow back to agent context

## Trade-offs

**Pros:**

- Dramatic token reduction (Anthropic's 150K → 2K tokens, 98.7%, is measured on tool definitions loaded on demand; its spreadsheet example reports the agent seeing 5 of 10,000 rows, and Bifrost measures 58.2-92.8% input-token reductions for code-mode tool calling)
- Lower latency (fewer large context API calls)
- Natural fit for data processing tasks
- Intermediate data stays contained in execution environment

**Cons:**

- Requires secure code execution infrastructure
- More complex setup than direct tool calls
- Agents must be capable of writing correct code
- Debugging can be harder (errors happen in execution, not in context)
- Needs monitoring, resource limits, and sandboxing

**Operational requirements:**

- Sandboxed execution environment (containers, VMs, V8 isolates, WebAssembly)
- Resource limits (CPU, memory, execution time)
- Monitoring and logging infrastructure
- Error handling and recovery mechanisms

**Execution environment options:**

- **V8 isolates**: Millisecond startup, minimal memory, strong isolation (Cloudflare Code Mode)
- **Containers**: 2-5 second startup, full language flexibility (Modal, Docker)
- **VMs**: Complete isolation for destructive operations (Cognition/Devin)

## References

* Anthropic Engineering: [Code Execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp) (November 4, 2025) - 150K → 2K tokens (98.7%) applies to tool definitions loaded on demand; the spreadsheet example returns 5 of 10,000 rows
* Simon Willison: [Code execution with MCP](https://simonwillison.net/2025/Nov/4/code-execution-with-mcp/) (November 4, 2025) - independent commentary on the announcement
* Cloudflare: [Code Mode](https://blog.cloudflare.com/code-mode/) - V8 isolate-based execution (September 2025)
* Bifrost: [Code Mode benchmarks](https://docs.getbifrost.ai/mcp/code-mode) - third-party implementation measuring 58.2-92.8% input-token reductions through 2026
* Beurer-Kellner et al.: [Design Patterns for Securing LLM Agents against Prompt Injections](https://arxiv.org/abs/2506.08837) (2025) - names the Code-Then-Execute pattern (§3.1, pattern 5)
* Related: Code-Then-Execute Pattern (focuses on security/formal verification vs token optimization)
* Division of labor with [Code-First Tool Interface Pattern](code-first-tool-interface-pattern.md): this file documents the general technique of moving data processing into a sandbox, while that file documents Cloudflare's specific Code Mode implementation

- Primary: https://www.anthropic.com/engineering/code-execution-with-mcp
- Cloudflare: https://blog.cloudflare.com/code-mode/
