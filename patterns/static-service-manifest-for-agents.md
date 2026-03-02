---
title: Static Service Manifest for Agents
status: emerging
authors: ["Clawdia (@OzorOwn)"]
based_on: ["llms.txt community specification", "OpenAI ChatGPT Plugin manifest (ai-plugin.json)"]
category: Tool Use & Environment
source: "https://llmstxt.org"
tags: [service-discovery, agent-infrastructure, llms-txt, machine-readable, api-design, well-known, tool-discovery]
---

## Problem

Before an agent can use an API, it needs to know what the API offers. Today, agents typically learn about available services through hardcoded tool lists in their system prompt, runtime exploration of tool catalogs, or human-written documentation that must be parsed and interpreted. None of these scale well when agents need to interact with unfamiliar platforms that expose many services. The agent either wastes context window on a full catalog it may not need, or has no way to learn about the platform at all without human intervention.

## Solution

Serve a static, machine-readable manifest at a well-known URL that describes the platform's capabilities, available services, authentication requirements, and usage constraints. The manifest is fetched once, parsed cheaply, and gives the agent enough information to decide which services to invoke -- without runtime tool-call overhead or human curation.

Two complementary formats have emerged:

1. **`llms.txt`** (convention from [llmstxt.org](https://llmstxt.org)): A plain-text or markdown file served at `/llms.txt` that provides a human-and-machine-readable summary of what the site offers to LLMs. Analogous to `robots.txt` for crawlers, but inverted: it describes what is *available* rather than what is *restricted*.

2. **`agent.json`** / **`ai-plugin.json`**: A structured JSON manifest (served at the root or `/.well-known/`) that declares service endpoints, authentication schemes, rate limits, and capability metadata in a schema agents can parse deterministically.

```json
// Example agent.json
{
  "name": "Platform Name",
  "description": "What this platform provides",
  "auth": { "type": "api_key", "header": "X-API-Key" },
  "services": [
    {
      "name": "memory",
      "path": "/v1/memory",
      "description": "Persistent key-value and vector store",
      "methods": ["GET", "POST", "DELETE"]
    },
    {
      "name": "scheduler",
      "path": "/v1/scheduler",
      "description": "Cron-based task scheduling",
      "methods": ["GET", "POST"]
    }
  ]
}
```

```
# Example llms.txt

> Platform Name: One API key, multiple infrastructure services.

## Available Services
- Memory: Persistent storage with vector search (/v1/memory)
- Scheduler: Cron-based task scheduling (/v1/scheduler)
- Event Bus: Pub/sub messaging (/v1/events)

## Authentication
All endpoints require X-API-Key header.

## Rate Limits
100 requests/minute per key.
```

The agent workflow becomes:

```pseudo
1. fetch("{base_url}/llms.txt")     → Natural-language overview
2. fetch("{base_url}/agent.json")   → Structured service catalog
3. Select relevant services from manifest
4. Call only those endpoints
```

## How to use it

**Best for:**

- API platforms that expose multiple services behind a single base URL
- Infrastructure providers where agents need to discover capabilities before planning
- Multi-tenant platforms where different API keys unlock different service subsets

**Implementation considerations:**

- Serve `llms.txt` as `text/plain` or `text/markdown` at the site root
- Serve `agent.json` as `application/json` at root or `/.well-known/agent.json`
- Keep manifests small (under 4K tokens for `llms.txt`, under 8KB for `agent.json`)
- Include version fields so agents can detect manifest changes
- List only stable, publicly documented endpoints
- Update manifests as part of CI/CD when services change

**Relationship to other patterns:**

- Complements [Progressive Tool Discovery](progressive-tool-discovery.md): static manifests provide the initial catalog; progressive discovery handles runtime detail-loading
- Complements [LLM-Friendly API Design](llm-friendly-api-design.md): manifests describe the interface; LLM-friendly design governs how endpoints behave

## Trade-offs

**Pros:**

- Zero runtime overhead for capability discovery (single HTTP fetch)
- Works across any transport -- not tied to MCP, function calling, or a specific agent framework
- Agents can plan before acting, reducing wasted tool calls
- Analogous to well-understood web conventions (`robots.txt`, `sitemap.xml`, `manifest.json`)
- Easy to implement -- just a static file

**Cons:**

- No established universal standard yet (multiple competing formats)
- Static manifests can drift from actual API state if not kept in sync
- Only describes *what* is available, not *how* to use each endpoint in detail (still need OpenAPI or MCP for full schemas)
- May expose surface area to adversarial agents if not paired with proper auth

## References

- llmstxt.org: Community specification for `llms.txt` convention: https://llmstxt.org
- OpenAI ChatGPT Plugins manifest specification (`ai-plugin.json`): https://platform.openai.com/docs/plugins/getting-started/plugin-manifest
- Anthropic Model Context Protocol: Complementary runtime tool protocol: https://modelcontextprotocol.io
- `robots.txt` (RFC 9309): The original well-known convention file that inspired this pattern: https://www.rfc-editor.org/rfc/rfc9309
- Agent Gateway: Production implementation using both `agent.json` and `llms.txt` for 37+ service discovery: https://agent-gateway-kappa.vercel.app
