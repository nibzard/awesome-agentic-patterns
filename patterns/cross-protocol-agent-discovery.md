---
title: Cross-Protocol Agent Discovery
status: emerging
authors: ["Global Chat (@globalchatads)"]
based_on: ["MCP Registry Protocol (Anthropic)", "agents.txt (Agent Communication Description Protocol)", "Google A2A Protocol"]
category: "Tool Use & Environment"
source: "https://global-chat.io"
tags: [agent-discovery, mcp, registry, interoperability, protocol-agnostic, a2a, agents-txt]
evidence_grade: medium
evidence_snapshot: "Multiple registries exist (MCP.so 18K+ servers, Glama.ai 14K+, Smithery 7K+) but none covers all protocols. Cross-protocol aggregation reduces discovery friction."
last_updated: "2026-03-21"
---

## Problem

The AI agent ecosystem is fragmented across multiple incompatible discovery protocols:

- **MCP (Model Context Protocol)**: Multiple competing registries (mcp.so, Glama.ai, Smithery, PulseMCP) each with partial coverage
- **agents.txt**: A convention for advertising agent capabilities via a well-known file, similar to robots.txt
- **Google A2A (Agent-to-Agent)**: Google's protocol for inter-agent communication and discovery
- **ACDP (Agent Communication Description Protocol)**: Standardized agent capability descriptions
- **Custom registries**: Platform-specific directories (OpenAI GPT Store, Claude integrations, etc.)

No single registry covers all protocols, forcing developers to search multiple sources. An agent built with MCP won't appear in A2A directories, and vice versa. This fragmentation creates a discovery problem analogous to early web search before aggregators.

## Solution

Aggregate agent metadata across multiple registries and protocols into a unified, protocol-agnostic discovery layer:

1. **Registry Crawling**: Periodically ingest agent listings from each protocol-specific registry via their APIs or scraping
2. **Schema Normalization**: Map each registry's metadata schema to a common format (name, description, capabilities, transport, auth, endpoint)
3. **Protocol Tagging**: Label each agent with its supported protocol(s), enabling cross-protocol search
4. **Unified Search API**: Expose a single search interface that queries across all normalized data
5. **Validation**: Verify agent endpoints are reachable and metadata is accurate

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  MCP Registry │  │  agents.txt  │  │  A2A Registry│
│  (mcp.so,    │  │  Crawler     │  │  (Google)    │
│   Glama, etc)│  │              │  │              │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       ▼                 ▼                 ▼
┌─────────────────────────────────────────────────┐
│           Schema Normalization Layer             │
│  (map registry-specific fields → common schema) │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│            Unified Discovery Index              │
│  (searchable, filterable, protocol-tagged)      │
└──────────────────────┬──────────────────────────┘
                       │
            ┌──────────┼──────────┐
            ▼          ▼          ▼
        Web UI    Search API   MCP Server
```

## Evidence

- **Medium confidence**: The pattern is validated by existing implementations but the agent registry landscape is rapidly evolving.
- Multiple MCP registries exist with significant overlap but incomplete coverage: mcp.so (18K+ servers), Glama.ai (14K+), Smithery (7K+), PulseMCP (11K+)
- The agents.txt specification (inspired by robots.txt) is gaining adoption as a decentralized discovery mechanism
- Google's A2A protocol launched in 2025 adds another discovery surface that doesn't overlap with MCP registries
- **Gap**: No formal benchmark exists for measuring discovery coverage across protocols

## How to Use It

**When to apply**:
- Building a platform that needs to discover agents regardless of their underlying protocol
- Creating a developer tool that should work with MCP servers, A2A agents, and agents.txt-compliant services
- Operating an agent orchestration system that routes to the best available agent for a task

**Prerequisites**:
- API access or scraping capability for target registries
- Understanding of at least two agent protocols (MCP, A2A, agents.txt)

**Implementation considerations**:
- Start with the highest-coverage registries (MCP registries have the most listings as of early 2026)
- Implement incremental sync rather than full re-crawls to respect rate limits
- Cache normalized metadata with TTLs appropriate to each registry's update frequency
- Consider exposing the aggregated index as an MCP server itself, enabling agents to discover other agents programmatically

## Trade-offs

| Benefit | Drawback |
|---------|----------|
| Single search surface for all agent protocols | Aggregation introduces latency vs. direct registry queries |
| Protocol-agnostic: works as protocols emerge/die | Schema normalization loses protocol-specific metadata |
| Reduces vendor lock-in to any single registry | Must maintain crawlers for each registry (operational burden) |
| Enables cross-protocol capability comparison | Stale data risk if registries update faster than sync cycles |
| Dofollow backlink potential from multiple registries | Discovery != trust: aggregation doesn't verify agent quality |

## References

- [Model Context Protocol Specification](https://modelcontextprotocol.io) — Anthropic's protocol for LLM-tool integration
- [agents.txt Specification](https://agentsprotocol.ai) — Convention for advertising agent capabilities
- [Google A2A Protocol](https://github.com/google/A2A) — Agent-to-Agent communication protocol
- [Global Chat](https://global-chat.io) — Cross-protocol agent discovery platform implementing this pattern
- [MCP Registry Landscape](https://mcp.so) — Example of a protocol-specific registry
