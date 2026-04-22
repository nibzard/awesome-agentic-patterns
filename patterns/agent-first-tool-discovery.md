---
title: "Agent-First Tool Discovery"
status: emerging
authors: ["Shane Cheek (@unitedideas, affiliated with Not Human Search)"]
based_on: ["llms.txt community specification", "MCP (Model Context Protocol)", "Anthropic MCP Registry"]
category: "Tool Use & Environment"
source: "https://modelcontextprotocol.io/specification/2025-06-18/basic/transports"
tags: [tool-discovery, mcp, agent-search, service-registry, llms-txt, api-discovery, agent-infrastructure]
slug: "agent-first-tool-discovery"
summary: "Build search indexes designed for agent consumers, returning structured tool metadata ranked by agent-relevant signals instead of human SEO metrics."
---

## Problem

Individual services can declare their agent-readiness via static manifests (`llms.txt`, `ai-plugin.json`, OpenAPI specs). But an agent that needs a new capability at runtime has no way to search *across* services to find, compare, and select the best match. Static manifests describe one service; they do not solve cross-service discovery.

Today, tool catalogs are hardcoded into system prompts, manually curated in static lists, or require human-mediated searches through documentation designed for humans. When an agent needs a capability it does not have -- say, a calendar API or a code review tool -- there is no programmatic search that returns structured, verified results ranked by agent-relevant signals.

## Solution

Build or use a search index specifically designed for agent consumers. The index catalogs tools, APIs, and MCP servers with structured metadata that agents can parse without HTML scraping or natural-language interpretation. Key components:

1. **Machine-readable search API**: A REST or MCP endpoint that returns structured JSON with tool name, description, endpoint URL, protocol, authentication type, and capability tags.

2. **Agentic scoring**: Rank results by agent-relevant signals rather than SEO metrics -- API uptime, documentation completeness, MCP compliance, response latency, schema availability.

3. **Protocol-native access**: Expose the search itself via the same protocols agents already speak (MCP JSON-RPC, REST with OpenAPI spec, `llms.txt`), so discovery does not require a different integration path than usage.

4. **Verification layer**: Actively probe indexed services to confirm they respond correctly, support claimed protocols, and return valid schemas -- not just trust self-reported metadata.

```pseudo
agent_needs("calendar integration")
  → query tool_discovery_index("calendar API", filters={protocol: "mcp"})
  → receive [{name: "cal-service", url: "...", auth: "api_key", mcp_verified: true, score: 92}]
  → agent evaluates candidates by score, protocol match, auth requirements
  → agent connects to top candidate directly
```

The workflow replaces the human loop of "search Google → read docs → evaluate → integrate" with a single programmatic query that returns agent-ready results.

## How to use it

**Best for:**

- Autonomous agents that need to acquire new capabilities at runtime without human guidance
- Agent orchestrators that route tasks to specialized tools based on capability matching
- Development environments where agents suggest or auto-configure integrations

**Implementation considerations:**

- Index should catalog at minimum: service name, description, base URL, supported protocols, authentication method, and a machine-parseable capability schema
- Active verification (probing endpoints, validating MCP handshakes) dramatically improves result quality over passive catalog approaches
- Expose discovery via the same protocol the tools use -- if indexing MCP servers, offer discovery as an MCP tool itself
- Include `llms.txt` and OpenAPI specs at well-known URLs so agents can discover the discovery service

**Relationship to other patterns:**

- Extends [Static Service Manifest for Agents](static-service-manifest-for-agents.md): manifests describe a single service; this pattern indexes across many services
- Complements [Progressive Tool Discovery](progressive-tool-discovery.md): this pattern finds candidates; progressive discovery handles runtime detail-loading after selection

## Trade-offs

**Pros:**

- Removes human from the tool-selection loop entirely
- Structured results eliminate HTML parsing and prompt-injection risks from web scraping
- Verification layer filters out dead or non-compliant services before the agent wastes calls
- Protocol-native access means zero additional integration work for agents already using MCP or REST

**Cons:**

- Requires a maintained index with active crawling and verification -- not free to operate
- Coverage depends on index breadth; niche or private tools may not be indexed
- Trust model: agents must trust the index operator's scoring and verification methodology
- Adds a dependency -- if the discovery service is down, agents cannot find new tools

## References

- llms.txt community specification: https://llmstxt.org
- Model Context Protocol (MCP): https://modelcontextprotocol.io
- Not Human Search (known implementation): https://nothumansearch.ai
- OpenAI ChatGPT Plugin manifest (prior art for machine-readable service description): https://platform.openai.com/docs/plugins
