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
summary: >-
  TODO: Add a concise summary for "Progressive Tool Discovery" describing the
  pattern's purpose and key benefits.
updated_at: '2026-01-05'
---

## Problem

When agents have access to large tool catalogs (dozens to thousands of available tools), loading all tool definitions upfront consumes excessive context window space. Most tools won't be used in a given workflow, making this preloading wasteful and limiting the context available for actual task execution.

## Solution

Present tools through a filesystem-like hierarchy where agents discover capabilities on-demand by exploring the structure. This pattern scales to 1000+ tools and is production-validated across major platforms (MCP, Cloudflare Code Mode, OpenAI, LangChain).

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

- Reduces initial context consumption by 70-90% (based on production data)
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

* Anthropic Engineering: Code Execution with MCP (2024)
* Model Context Protocol specification
* Lewis et al. "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks" (NeurIPS 2020)
* Yao et al. "ReAct: Synergizing Reasoning and Acting in Language Models" (ICLR 2023)
* Packer et al. "MemGPT: Towards LLMs as Operating Systems" (arXiv 2023)

- Primary source: https://www.anthropic.com/engineering/code-execution-with-mcp
