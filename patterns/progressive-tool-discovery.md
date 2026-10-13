---
title: Progressive Tool Discovery
status: established
authors:
  - Nikola Balic (@nibzard)
based_on:
  - Anthropic Engineering Team
category: Tool Use & Environment
source: 'https://www.anthropic.com/engineering/code-execution-with-mcp'
tags:
  - mcp
  - tool-discovery
  - context-optimization
  - lazy-loading
slug: progressive-tool-discovery
id: progressive-tool-discovery
summary: "Organizes tools in a browsable hierarchy and lets the agent load names, descriptions, or full schemas only for the tools it needs"
signals: ["Agent has 20 or more tools or integrations", "Tool definitions take a large part of the context window", "MCP servers or plugin architectures expose many capabilities"]
anti_signals: ["Agent needs most of its tools in every workflow", "Extra discovery calls before execution are not acceptable"]
updated_at: '2026-10-13'
---

## Problem

When agents have access to large tool catalogs (dozens to thousands of available tools), loading all tool definitions upfront consumes excessive context window space. Most tools won't be used in a given workflow, making this preloading wasteful and limiting the context available for actual task execution.

## Solution

Present tools through a filesystem-like hierarchy where agents discover capabilities on-demand by exploring the structure. This pattern scales to 1000+ tools. Anthropic ships it in two first-party forms: hierarchical tool files with on-demand definition loading (documented in its MCP engineering guidance) and the Tool Search Tool with `defer_loading` (announced November 24, 2025); Claude Code exposes tool search in the Agent SDK.

Implement a `search_tools` capability that allows agents to request different levels of detail:

1. **Name only**: Minimal context for initial browsing
2. **Name + description**: Enough to understand tool purpose
3. **Full definition with schemas**: Complete API details only when needed

Tools are organized hierarchically (e.g., `servers/google-drive/getDocument.ts`, `servers/slack/sendMessage.ts`) so agents can:

- List the `./servers/` directory to see available integrations
- Navigate into specific server directories to find relevant tools
- Load full definitions only for tools they intend to use

```pseudo
# Agent workflow
1. list_directory("./servers/")
   → Returns: ["google-drive/", "slack/", "github/", ...]

2. search_tools(pattern="google-drive/*", detail_level="name+description")
   → Returns: Brief descriptions of Google Drive tools

3. get_tool_definition("servers/google-drive/getDocument")
   → Returns: Full JSON schema with parameters, types, examples
```

## How to use it

**Best for:**

- Systems with 20+ available tools or integrations
- Model Context Protocol (MCP) server implementations
- Plugin architectures where agents select from many capabilities

**Implementation considerations:**

- Organize tools in a clear hierarchy (by integration, by domain, by function)
- Provide meaningful names and descriptions at each level
- Support pattern matching (glob or regex) for tool searches
- Cache tool definitions that are frequently requested together
- Use OpenAPI/JSON Schema compatible formats for tool definitions

**Example directory structure:**

```
servers/
├── google-drive/
│   ├── getDocument.ts
│   ├── listFiles.ts
│   └── shareFile.ts
├── slack/
│   ├── sendMessage.ts
│   └── getChannels.ts
└── github/
    ├── createIssue.ts
    └── listRepos.ts
```

## Trade-offs

**Pros:**

- Reduces initial context consumption: Anthropic reports 98.7% (150K → 2K tokens) for tool definitions loaded on demand, and 85% token reduction with the Tool Search Tool
- Scales to 1000+ tools efficiently
- Agents learn about tool ecosystem through exploration
- Natural mapping to code-based tool interfaces
- Supports versioning and deprecation gracefully

**Cons:**

- Adds discovery overhead (extra tool calls before execution)
- Requires thoughtful organization and naming schemes
- Less effective if agents need most tools anyway
- May require multiple round-trips to find the right tool

## References

* Anthropic Engineering: [Code Execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp) (November 4, 2025) - hierarchical tool files; 150K → 2K tokens (98.7%) for definitions loaded on demand
* Anthropic Engineering: [Advanced Tool Use](https://www.anthropic.com/engineering/advanced-tool-use) (November 24, 2025) - Tool Search Tool and `defer_loading`; 85% token reduction
* Claude Code: [Tool search in the Agent SDK](https://code.claude.com/docs/en/agent-sdk/tool-search)
* Model Context Protocol specification: https://modelcontextprotocol.io/
* Distinct from [Tool Search Lazy Loading](tool-search-lazy-loading.md): that pattern retrieves tools by searching when needed, while this pattern organizes the catalog as a browsable hierarchy the agent walks

- Primary source: https://www.anthropic.com/engineering/code-execution-with-mcp
