---
title: "Sandboxed Tool Authorization"
status: "validated-in-production"
authors: ["Clawdbot Contributors"]
based_on: ["Clawdbot Implementation (https://github.com/clawdbot/clawdbot)"]
category: "Security & Safety"
source: "https://github.com/clawdbot/clawdbot/blob/main/src/agents/tool-policy.ts"
tags: [authorization, policy, allowlist, deny-by-default, pattern-matching, subagent-security]
---

## Problem

Tool authorization needs flexibility but also security. Static allowlists don't scale across:

- **Multiple environments**: Development (permissive) vs. production (restrictive)
- **Different agent roles**: Coding agents need filesystem access; messaging agents shouldn't
- **Hierarchical delegation**: Subagents should inherit restrictions from parents but with additional constraints
- **Plugin ecosystems**: External tools need dynamic inclusion without manual allowlist updates

Agents need a policy system that supports pattern matching, deny-by-default semantics, and hierarchical inheritance.

## Solution

Pattern-based policies with deny-by-default and inheritance. Tools are authorized by matching against compiled patterns (exact, regex, wildcard), with deny lists taking precedence over allow lists. Subagents inherit parent policies with additional restrictions, and profile-based tiers provide presets for common agent types.

**Core concepts:**

- **Pattern matching**: Supports exact matches (`exec`), wildcards (`fs:*`), and regex-like patterns (`*test*`).
- **Deny-by-default**: Empty allow list denies all tools; explicit allow list permits only matched tools.
- **Deny precedence**: Deny lists are evaluated first; matching deny patterns block tools regardless of allow list.
- **Related tool inheritance**: Some tools implicitly grant related permissions (e.g., `exec` allows `apply_patch`).
- **Hierarchical policy inheritance**: Subagent policies inherit from parent with additional deny rules.
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
    // Empty allow = allow all (deny-by-default handled by caller)
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
  "group:clawdbot": ["browser", "canvas", "nodes", "cron", "message", "gateway", /* ... */],
};
```

**Subagent policy inheritance:**

```typescript
const DEFAULT_SUBAGENT_TOOL_DENY = [
  // Session management - main agent orchestrates
  "sessions_list",
  "sessions_history",
  "sessions_send",
  "sessions_spawn",
  // System admin - dangerous from subagent
  "gateway",
  "agents_list",
  // Status/scheduling - main agent coordinates
  "session_status",
  "cron",
];

function resolveSubagentToolPolicy(config?: Config): ToolPolicy {
  const configured = config?.tools?.subagents?.tools;
  const deny = [
    ...DEFAULT_SUBAGENT_TOOL_DENY,      // Base restrictions
    ...(configured?.deny ?? []),        // Additional restrictions
  ];
  const allow = configured?.allow;       // Optional allowlist
  return { allow, deny };
}
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
- **Security by default**: Deny-by-default semantics prevent accidental permission grants.
- **Hierarchical control**: Subagents can be restricted further without modifying parent policies.
- **Profile presets**: Common agent types (coding, messaging) have pre-configured policies.
- **Plugin support**: Tool groups can include plugin tools via dynamic discovery.

**Cons/Considerations:**

- **Pattern complexity**: Regex-like patterns can be confusing; errors in pattern syntax may grant unintended access.
- **Policy explosion**: Many agents with different policies can be difficult to manage and audit.
- **Evaluation order**: Deny-before-allow precedence must be consistently applied; bugs can cause security issues.
- **Related tool ambiguity**: Deciding which tools are "related" (e.g., `exec` → `apply_patch`) is subjective and may not cover all cases.

## References

- [Clawdbot tool-policy.ts](https://github.com/clawdbot/clawdbot/blob/main/src/agents/tool-policy.ts) - Policy resolution
- [Clawdbot pi-tools.policy.ts](https://github.com/clawdbot/clawdbot/blob/main/src/agents/pi-tools.policy.ts) - Policy enforcement
- [Clawdbot sandbox policies](https://github.com/clawdbot/clawdbot/tree/main/src/agents/sandbox) - Sandbox-specific policies
- Related: [Egress Lockdown (No-Exfiltration Channel)](/patterns/egress-lockdown-no-exfiltration-channel) for security patterns
