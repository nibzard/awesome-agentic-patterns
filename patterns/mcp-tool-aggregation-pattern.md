# MCP Tool Aggregation Pattern

## Category
Tool Use & Environment

## Summary
Aggregate many developer utility tools behind a single MCP (Model Context Protocol) server endpoint, giving AI agents instant access to 100+ capabilities through one configuration line.

## Problem
AI coding agents often need access to many different developer tools (code formatting, DNS lookup, hashing, QR generation, security checks, etc.). Each tool typically requires separate installation, configuration, and maintenance. This creates friction and slows down agent workflows.

## Solution
Bundle related developer utilities into a single MCP server that exposes all tools through one endpoint. The agent discovers available tools automatically via the MCP protocol and can call any of them without additional setup.

### Key characteristics:
- **Single config entry**: One MCP server URL provides access to all tools
- **Auto-discovery**: Agents discover available tools through MCP's tool listing
- **No per-tool setup**: No separate API keys, installs, or configs for individual tools
- **Consistent interface**: All tools follow the same request/response pattern
- **Scalable**: New tools added server-side are instantly available to all connected agents

## Example

```json
{
  "mcpServers": {
    "toolpipe": {
      "url": "https://toolpipe.dev/mcp"
    }
  }
}
```

This single configuration gives agents access to 120+ tools: code review, formatting, minification, QR codes, hashing, DNS, WHOIS, SSL check, security headers, fake data generation, JSON Schema validation, TypeScript type generation, and more.

## Real-World Implementation
- [ToolPipe MCP Server](https://github.com/COSAI-Labs/toolpipe-mcp-server) - 120+ developer tools via MCP
- [npm package](https://www.npmjs.com/package/@cosai-labs/toolpipe-mcp-server)

## Related Patterns
- [Progressive Tool Discovery](progressive-tool-discovery.md)
- [LLM-Friendly API Design](llm-friendly-api-design.md)
- [Static Service Manifest for Agents](static-service-manifest-for-agents.md)
