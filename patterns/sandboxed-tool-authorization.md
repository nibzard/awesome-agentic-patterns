---
title: "Sandboxed Tool Authorization"
status: "validated-in-production"
authors: ["OpenClaw Contributors"]
based_on: ["OpenClaw, formerly Clawdbot (https://github.com/openclaw/openclaw)"]
category: "Security & Safety"
source: "https://github.com/openclaw/openclaw/blob/main/src/agents/tool-policy.ts"
tags: [authorization, policy, allowlist, policy-inheritance, pattern-matching, subagent-security]
summary: "Filters an agent's tools through deny-first allow and deny patterns, profile presets, and subagent policies that inherit parent restrictions"
signals: ["Agents with different roles need different tool access", "Subagents must get stricter permissions than their parent", "Plugin tools must join policies without manual allowlist updates", "Development and production need different permissions"]
anti_signals: ["Single agent with a small, fixed tool set", "Team cannot audit many per-agent policies"]
updated_at: "2026-10-13"
---

## Problem

Tool authorization needs flexibility but also security. Static allowlists don't scale across:

- **Multiple environments**: Development (permissive) vs. production (restrictive)
- **Different agent roles**: Coding agents need filesystem access; messaging agents shouldn't
- **Hierarchical delegation**: Subagents should inherit restrictions from parents but with additional constraints
- **Plugin ecosystems**: External tools need dynamic inclusion without manual allowlist updates

Agents need a policy system that supports pattern matching, deny precedence, opt-in restriction, and hierarchical inheritance.

## Solution

Pattern-based policies with deny precedence and inheritance. Tools are allowed by default: an empty allow list permits every tool, and restrictive allowlists are opt-in. Deny lists are evaluated first, so a matching deny pattern blocks a tool regardless of allow entries. Delegated (subagent) sessions inherit the requester's denylist and can only narrow it, and profile-based tiers provide presets for common agent types.

This approach aligns with the academic Action Selector pattern (Beurer-Kellner et al., 2025), which treats the LLM as an instruction decoder rather than a live controller, validating tool parameters against strict schemas before execution and preventing tool outputs from re-entering the selector prompt without additional validation.

**Core concepts:**

- **Pattern matching**: Supports exact matches (`exec`), wildcards (`fs:*`), and regex-like patterns (`*test*`).
- **Allow by default**: An empty allow list permits every tool; restriction is opt-in. A wildcard stays allow-all even when additive entries are present, so extra allow entries cannot accidentally narrow a delegated session.
- **Deny precedence**: Deny lists are evaluated first; matching deny patterns block tools regardless of allow list.
- **Related tool inheritance**: Some tools implicitly grant related permissions (e.g., `exec` allows `apply_patch`).
- **Hierarchical policy inheritance**: Delegated (subagent) sessions inherit the requester's denylist and add restrictions on top; a captured deny floor survives requester config changes.
- **Profile-based tiers**: Predefined profiles (`minimal`, `coding`, `messaging`, `full`) provide quick configuration.

**Implementation sketch:**

```typescript
type CompiledPattern =
  | { kind: "all" }           // "*" matches everything
  | { kind: "exact"; value: string }
  | { kind: "regex"; value: RegExp };

function compilePattern(pattern: string): CompiledPattern {
  const normalized = normalizeToolName(pattern);
  if (!normalized) return { kind: "exact", value: "" };
  if (normalized === "*") return { kind: "all" };
  if (!normalized.includes("*")) return { kind: "exact", value: normalized };
  // Convert "fs:*" to /^fs:.*$/ regex
  const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return {
    kind: "regex",
    value: new RegExp(`^${escaped.replaceAll("\\*", ".*")}$`),
  };
}

function matchesAny(name: string, patterns: CompiledPattern[]): boolean {
  const normalized = normalizeToolName(name);
  for (const pattern of patterns) {
    if (pattern.kind === "all") return true;
    if (pattern.kind === "exact" && name === pattern.value) return true;
    if (pattern.kind === "regex" && pattern.value.test(name)) return true;
  }
  return false;
}

function makeToolPolicyMatcher(policy: ToolPolicy) {
  const deny = compilePatterns(policy.deny);
  const allow = compilePatterns(policy.allow);
  return (name: string) => {
    const normalized = normalizeToolName(name);
    // Deny takes precedence
    if (matchesAny(normalized, deny)) return false;
    // Empty allow = allow all; restriction is opt-in
    if (allow.length === 0) return true;
    // Explicit allow required
    if (matchesAny(normalized, allow)) return true;
    // Related tool inheritance
    if (normalized === "apply_patch" && matchesAny("exec", allow)) return true;
    return false;
  };
}
```

**Profile-based tiers:**

```typescript
const TOOL_PROFILES: Record<ToolProfileId, ToolProfilePolicy> = {
  minimal: {
    allow: ["session_status"],  // Bare minimum
  },
  coding: {
    allow: [
      "group:fs",        // read, write, edit, apply_patch
      "group:runtime",   // exec, process
      "group:sessions",  // sessions_list, sessions_spawn, etc.
      "group:memory",    // memory_search, memory_get
      "image",
    ],
  },
  messaging: {
    allow: [
      "group:messaging", // message tool
      "sessions_list",
      "sessions_history",
      "sessions_send",
      "session_status",
    ],
  },
  full: {},  // Empty policy = allow all
};
```

**Tool groups for bulk policies:**

```typescript
const TOOL_GROUPS: Record<string, string[]> = {
  "group:memory": ["memory_search", "memory_get"],
  "group:web": ["web_search", "web_fetch"],
  "group:fs": ["read", "write", "edit", "apply_patch"],
  "group:runtime": ["exec", "process"],
  "group:sessions": ["sessions_list", "sessions_history", "sessions_send", "sessions_spawn"],
  "group:openclaw": ["browser", "canvas", "nodes", "cron", "message", "gateway", /* ... */],
};
```

**Delegated (subagent) policy inheritance:**

```typescript
type DelegatedToolPolicy = {
  requesterSessionKey: string;
  targetAgentId: string;
  inheritedToolDenylist?: string[];   // Denies inherited from the requester
  delegatedToolDenyFloor?: {          // Prepared by the host before flattening;
    policyAgentId: string;            // never accepted from tool arguments
    deny: string[];
  };
  requesterToolDenylist?: string[];   // Immediate requester snapshot
};

// The delegated session's effective deny set is the union of the floor,
// the inherited denylist, and the requester snapshot. Delegation can only
// narrow the parent surface, never widen it, and the floor keeps earlier
// revocations in force even if the requester config changes mid-run.
```

**Policy resolution across multiple layers:**

```typescript
function resolveEffectiveToolPolicy(params: {
  config?: Config;
  sessionKey?: string;
  modelProvider?: string;
  modelId?: string;
}) {
  const agentId = resolveAgentIdFromSessionKey(params.sessionKey);
  const agentConfig = resolveAgentConfig(params.config, agentId);
  const globalTools = params.config?.tools;
  const agentTools = agentConfig?.tools;

  // Profile-based tier
  const profile = agentTools?.profile ?? globalTools?.profile;

  // Provider-specific overrides
  const providerPolicy = resolveProviderToolPolicy({
    byProvider: globalTools?.byProvider,
    modelProvider: params.modelProvider,
    modelId: params.modelId,
  });

  return {
    globalPolicy: pickToolPolicy(globalTools),
    agentPolicy: pickToolPolicy(agentTools),
    providerPolicy: pickToolPolicy(providerPolicy),
    profile,
  };
}
```

## How to use it

1. **Define tool groups**: Group related tools (`group:fs`, `group:runtime`) for bulk policy rules.
2. **Choose a profile**: Select a predefined profile (`minimal`, `coding`, `messaging`, `full`) as a baseline.
3. **Add explicit rules**: Layer allow/deny rules on top of the profile for specific needs.
4. **Configure subagent restrictions**: Define additional deny rules for spawned agents.
5. **Filter tools at runtime**: Use the policy matcher to filter available tools before passing to the agent.

**Pitfalls to avoid:**

- **Overly broad patterns**: Wildcard patterns like `*` can inadvertently grant excessive permissions. Prefer specific patterns.
- **Missing deny precedence**: Always evaluate deny before allow; otherwise, allow rules can bypass security intent.
- **Forgetting related tools**: If `exec` is allowed, remember that `apply_patch` should also be permitted (it's a file operation).
- **Inheritance confusion**: Subagent policies add restrictions on top of parent policies; they don't replace them entirely.

## Trade-offs

**Pros:**

- **Flexible patterns**: Wildcards and groups enable concise policies for large tool sets.
- **Security by precedence**: Deny rules cannot be bypassed by allow rules, and opt-in allowlists narrow the default surface when a role needs it.
- **Hierarchical control**: Subagents can be restricted further without modifying parent policies.
- **Profile presets**: Common agent types (coding, messaging) have pre-configured policies.
- **Plugin support**: Tool groups can include plugin tools via dynamic discovery.

**Cons/Considerations:**

- **Pattern complexity**: Regex-like patterns can be confusing; errors in pattern syntax may grant unintended access.
- **Policy explosion**: Many agents with different policies can be difficult to manage and audit.
- **Evaluation order**: Deny-before-allow precedence must be consistently applied; bugs can cause security issues.
- **Related tool ambiguity**: Deciding which tools are "related" (e.g., `exec` → `apply_patch`) is subjective and may not cover all cases.

## References

- [OpenClaw tool-policy.ts](https://github.com/openclaw/openclaw/blob/main/src/agents/tool-policy.ts) - Policy resolution and restrictive-allow analysis (`hasRestrictiveAllowPolicy`)
- [OpenClaw tool-policy-shared.ts](https://github.com/openclaw/openclaw/blob/main/src/agents/tool-policy-shared.ts) - Pattern matching and `resolveToolProfilePolicy` re-export
- [OpenClaw delegated-tool-policy.ts](https://github.com/openclaw/openclaw/blob/main/src/agents/delegated-tool-policy.ts) - Subagent/delegated inheritance and deny floors
- [OpenClaw sandbox policies](https://github.com/openclaw/openclaw/tree/main/src/agents/sandbox) - Sandbox-specific policies
- Beurer-Kellner et al. (2025). "Design Patterns for Securing LLM Agents against Prompt Injections." arXiv:2506.08837 - Action Selector pattern academic foundation
- [Model Context Protocol](https://modelcontextprotocol.io) - Protocol standard for tool interoperability (Anthropic, 2025); tool authorization itself stays application-level
- Related: [Egress Lockdown (No-Exfiltration Channel)](/patterns/egress-lockdown-no-exfiltration-channel) for security patterns
