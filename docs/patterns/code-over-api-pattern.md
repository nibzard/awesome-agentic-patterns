---
title: Code-Over-API Pattern
status: established
authors: ["Anthropic Engineering Team"]
category: Tool Use & Environment
source: "https://www.anthropic.com/engineering/code-execution-with-mcp"
tags: [token-optimization, code-execution, data-processing, mcp]
---

## Problem

When agents make direct API or tool calls, all intermediate data must flow through the model's context window. For data-heavy workflows (processing spreadsheets, filtering logs, transforming datasets), this creates massive token consumption and increased latency. A workflow that fetches 10,000 spreadsheet rows and filters them can easily consume 150,000+ tokens just moving data through the context.

## Solution

Instead of making direct tool calls, agents write and execute code that interacts with tools. Data processing, filtering, and transformation happens in the execution environment, with only results flowing back to the model context.

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

- Dramatic token reduction (150K → 2K in reported cases)
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

- Sandboxed execution environment (containers, VMs, WebAssembly)
- Resource limits (CPU, memory, execution time)
- Monitoring and logging infrastructure
- Error handling and recovery mechanisms

## References

* Anthropic Engineering: Code Execution with MCP (2024)
* Related: Code-Then-Execute Pattern (focuses on security/formal verification)
