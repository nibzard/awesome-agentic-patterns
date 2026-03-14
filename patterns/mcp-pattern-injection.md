---
title: MCP Pattern Injection
status: validated-in-production
authors: ["Rajath Bharadwaj (@Rajathbharadwaj)"]
based_on: ["Claude Desktop MCP", "Cursor MCP Integration"]
category: Tool Use & Environment
source: "https://github.com/Rajathbharadwaj/langgraph-patterns-mcp"
tags: [mcp, code-patterns, tool-injection, context-enhancement, langgraph]
---

## Problem

AI coding assistants lack domain-specific knowledge about framework best practices. When building LangGraph agents, developers must repeatedly explain patterns, copy-paste from docs, or watch the AI reinvent suboptimal solutions. The assistant's training data is often outdated relative to fast-moving frameworks.

## Solution

Use **MCP (Model Context Protocol) servers** to inject production patterns directly into the AI assistant's context:

1. Create an MCP server that exposes domain patterns as tools and resources
2. Structure patterns with clear signatures, descriptions, and code snippets  
3. Configure Claude Desktop or Cursor to connect to the MCP server
4. The AI can now "call" patterns on-demand, getting current best practices

```typescript
// Example: MCP tool that returns a LangGraph pattern
server.tool("get_pattern", { name: z.string() }, async ({ name }) => {
  const pattern = PATTERNS[name];
  return {
    content: [{
      type: "text",
      text: `## ${pattern.title}\n\n${pattern.description}\n\n\`\`\`python\n${pattern.code}\n\`\`\``
    }]
  };
});
```

The key insight: MCP servers act as **live documentation** that the AI can query, rather than static context that burns tokens.

## Trade-offs

**Pros:** Always up-to-date patterns; on-demand retrieval saves context space; patterns are structured and tested.  
**Cons:** Requires MCP server setup; adds latency for tool calls; patterns must be maintained.

## How to use it

- Build MCP servers for any framework your team uses heavily (LangGraph, FastAPI, React patterns)
- Keep patterns small and focused—one pattern per tool call
- Include "when to use" and "when NOT to use" guidance in pattern descriptions
- Version your patterns alongside your codebase
- Use `npx` for easy distribution: `npx your-patterns-mcp`

## References

- Model Context Protocol: https://modelcontextprotocol.io/
- LangGraph Patterns MCP (reference impl): https://github.com/Rajathbharadwaj/langgraph-patterns-mcp
- Claude Desktop MCP Integration: https://docs.anthropic.com/en/docs/claude-code/mcp
- Cursor MCP Support: https://docs.cursor.com/context/model-context-protocol
