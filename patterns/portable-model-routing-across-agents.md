---
title: "Portable Model Routing Across Agent Clients"
status: emerging
authors: ["liyangbing (@liyangbing)"]
category: "Tool Use & Environment"
source: "https://modelcontextprotocol.io/specification/2025-11-25"
tags: [model-routing, mcp, cli, interoperability, configuration]
summary: "Keep provider and model policy in one local control plane while exposing a stable MCP contract to multiple agent clients."
signals: ["Several agent clients need the same provider policy", "Provider credentials or model IDs are frequently changing"]
anti_signals: ["A single client with one fixed provider is sufficient"]
prerequisites: ["An MCP-capable client", "At least one provider with a documented API"]
tools: ["MCP", "CLI", "model gateway"]
domains: ["coding", "research", "ops"]
updated_at: "2026-08-28"
---

## Problem

Teams that use several coding agents often duplicate provider URLs, model IDs, credentials, and fallback rules in each client configuration. A provider change then requires synchronized edits across every workstation and client. Configuration drift is hard to detect, and a failed migration can leave a client in a partially updated state.

## Solution

Put provider selection and model policy behind one local routing layer, then expose that layer through a stable MCP interface. Each agent client keeps only the bridge configuration; the routing layer owns provider credentials, model discovery, fallback order, and request telemetry.

The routing layer should:

- keep credentials outside project files and expose only the minimum required scope;
- distinguish model discovery, request execution, and usage inspection as separate operations;
- make configuration changes transactional or reversible, with a visible diff or rollback path;
- return provider/model identifiers and failure reasons so clients can produce an auditable receipt;
- preserve a client-neutral request shape where possible, while documenting provider-specific limits.

This is a configuration pattern, not a requirement to proxy every request through a hosted service. A local process can implement the control plane and communicate with clients over stdio MCP.

## Example

```text
Claude Code ─┐
Cursor      ─┼─> local MCP bridge ─> provider/model policy ─> provider APIs
Codex       ─┘             └──────> usage + rollback record
```

Keep the client-side entry small and explicit. For example, a project can register one local MCP server, while the operator changes provider policy in the bridge and verifies the resulting model ID before running a write-capable task.

## Trade-offs

- **Pros:** one policy surface, less client drift, easier provider migration, and a consistent audit/rollback path.
- **Cons:** an additional local process, another credential boundary, and possible loss of provider-specific features behind the common interface.
- **Failure mode:** if the bridge is unavailable, all dependent clients may lose model access; provide a clear health check and a documented direct-provider fallback.

**When NOT to use:** a single client with one stable provider, latency-sensitive workloads that cannot tolerate an extra hop, or environments where centralizing credentials violates policy.

## How to use it

1. Inventory the clients, providers, model IDs, credential scopes, and fallback rules currently in use.
2. Define the smallest client-neutral request and inspection contract; keep destructive or billing-sensitive operations separately permissioned.
3. Install the bridge in a disposable workspace and test model discovery, one request, an intentional provider failure, and rollback.
4. Register the bridge with one client first. Compare the returned provider/model, usage, and error receipt with a direct request.
5. Add the remaining clients only after the first path is reproducible. Record the bridge version and policy revision in team documentation.
6. Revoke or rotate credentials through the bridge, then verify that every client observes the new policy and that the old route is no longer reachable.

## Known Implementations

- [SandBase CLI](https://github.com/sandbaseai/cli) — a contributor-affiliated open-source CLI and local MCP server that applies this pattern across multiple agent clients and model/API providers. It is listed as an implementation example, not as a requirement or endorsement.
- [LiteLLM Proxy](https://github.com/BerriAI/litellm) — an open-source gateway that demonstrates provider normalization, fallbacks, and usage tracking for applications.

## References

- [Model Context Protocol specification](https://modelcontextprotocol.io/specification/2025-11-25) — transport and tool interoperability constraints.
- [LiteLLM documentation](https://docs.litellm.ai/docs/proxy/virtual_keys) — an example of centralized provider policy and credential scoping.
- Disclosure: SandBase CLI is maintained by the contributor's organization; the generalized pattern and trade-offs above are intended to be useful independently of that implementation.
