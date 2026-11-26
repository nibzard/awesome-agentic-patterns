---
title: "Sandboxed Tool Authorization"
status: foundational
authors: ["OpenClaw Contributors"]
based_on: ["OpenClaw, formerly Clawdbot (https://github.com/openclaw/openclaw)"]
category: "Security & Safety"
source: "https://github.com/openclaw/openclaw/blob/main/src/agents/tool-policy.ts"
tags: [authorization, policy, allowlist, policy-inheritance, pattern-matching, subagent-security]
summary: "Filters an agent's tools through deny-first allow and deny patterns, profile presets, and subagent policies that inherit parent restrictions"
signals: ["Agents with different roles need different tool access", "Subagents must get stricter permissions than their parent", "Plugin tools must join policies without manual allowlist updates", "Development and production need different permissions"]
anti_signals: ["Single agent with a small, fixed tool set", "Team cannot audit many per-agent policies"]
related: ["lethal-trifecta-threat-model", "tool-capability-compartmentalization", "egress-lockdown-no-exfiltration-channel", "sub-agent-spawning", "policy-gated-tool-proxy"]
updated_at: "2026-10-13"
---

## Problem

Tool authorization needs flexibility and security. Static allowlists do not scale across:

- **Multiple environments**: development (permissive) versus production (restrictive)
- **Different agent roles**: coding agents need filesystem access; messaging agents should not have it
- **Hierarchical delegation**: subagents inherit restrictions from their parent, with additional constraints
- **Plugin ecosystems**: external tools need dynamic inclusion without manual allowlist updates

Agents need a policy system that supports pattern matching, deny precedence, opt-in restriction, and hierarchical inheritance.

## Solution

Pattern-based policies with deny precedence and inheritance. The approach aligns with the academic Action Selector pattern (Beurer-Kellner et al., 2025), which treats the LLM as an instruction decoder rather than a live controller, validates tool parameters against strict schemas before execution, and prevents tool outputs from re-entering the selector prompt without more validation.

**Core concepts:**

- **Pattern matching**: exact matches (`exec`), wildcards (`fs:*`), and substring patterns (`*test*`).
- **Allow by default**: an empty allow list permits every tool; restriction is opt-in. A wildcard stays allow-all even when additive entries are present, so extra allow entries cannot accidentally narrow a delegated session.
- **Deny precedence**: deny lists are evaluated first. A matching deny pattern blocks a tool regardless of the allow list.
- **Related tool inheritance**: some tools implicitly grant related permissions (`exec` allows `apply_patch`).
- **Hierarchical policy inheritance**: delegated (subagent) sessions inherit the requester's denylist and add restrictions on top. A captured deny floor survives requester config changes.
- **Profile-based tiers**: predefined profiles (`minimal`, `coding`, `messaging`, `full`) give quick configuration.

**Policy matcher (deny first, then opt-in allow):**

```typescript
type CompiledPattern =
  | { kind: "all" }
  | { kind: "exact"; value: string }
  | { kind: "regex"; value: RegExp };

function compilePattern(pattern: string): CompiledPattern {
  const normalized = normalizeToolName(pattern);
  if (!normalized) return { kind: "exact", value: "" };
  if (normalized === "*") return { kind: "all" };
  if (!normalized.includes("*")) return { kind: "exact", value: normalized };
  const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // "fs:*" -> /^fs:.*$/
  return { kind: "regex", value: new RegExp(`^${escaped.replaceAll("\\*", ".*")}$`) };
}

function matchesAny(name: string, patterns: CompiledPattern[]): boolean {
  const normalized = normalizeToolName(name);
  return patterns.some((pattern) =>
    pattern.kind === "all" ||
    (pattern.kind === "exact" && normalized === pattern.value) ||
    (pattern.kind === "regex" && pattern.value.test(normalized)));
}

function makeToolPolicyMatcher(policy: ToolPolicy) {
  const deny = compilePatterns(policy.deny);
  const allow = compilePatterns(policy.allow);
  return (name: string) => {
    if (matchesAny(name, deny)) return false;          // Deny takes precedence
    if (allow.length === 0) return true;               // Empty allow = allow all
    return matchesAny(name, allow) ||                  // Explicit allow required
      (normalizeToolName(name) === "apply_patch" && matchesAny("exec", allow));
  };
}
```

**Profiles and tool groups:**

```typescript
const TOOL_PROFILES = {
  minimal:   { allow: ["session_status"] },                      // Bare minimum
  coding:    { allow: ["group:fs", "group:runtime", "group:sessions", "group:memory", "image"] },
  messaging: { allow: ["group:messaging", "sessions_list", "sessions_history", "sessions_send", "session_status"] },
  full:      {},                                                  // Empty policy = allow all
};

const TOOL_GROUPS = {
  "group:fs":       ["read", "write", "edit", "apply_patch"],
  "group:runtime":  ["exec", "process"],
  "group:sessions": ["sessions_list", "sessions_history", "sessions_send", "sessions_spawn"],
  "group:memory":   ["memory_search", "memory_get"],
  "group:web":      ["web_search", "web_fetch"],
  "group:openclaw": ["browser", "canvas", "nodes", "cron", "message", "gateway" /* ... */],
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

// Effective deny set = floor ∪ inherited denylist ∪ requester snapshot.
// Delegation can only narrow the parent surface, never widen it. The floor
// keeps earlier revocations in force even if the requester config changes mid-run.
```

**Policy resolution across layers:**

The effective policy for an agent is merged from four layers before the matcher runs:

1. `globalPolicy`, from `config.tools`
2. `agentPolicy`, from the agent's own `tools` block
3. `providerPolicy`, from `tools.byProvider`, matched on `modelProvider` and `modelId`
4. `profile`, the agent-level profile or the global one, expanded through the tool groups

The agent id comes from the session key (`resolveAgentIdFromSessionKey`), so one runtime can host agents with different policies.

## How to use it

1. **Define tool groups**: group related tools (`group:fs`, `group:runtime`) for bulk policy rules.
2. **Choose a profile**: select a predefined profile (`minimal`, `coding`, `messaging`, `full`) as the baseline.
3. **Add explicit rules**: layer allow and deny rules on top of the profile.
4. **Configure subagent restrictions**: add deny rules for spawned agents. A deny floor captured at spawn time survives later requester config changes.
5. **Filter tools at runtime**: pass only the tools that the matcher allows to the agent.

**Failure modes / gotchas:**

- **Overly broad patterns**: a wildcard such as `*` grants excessive permissions. Prefer specific patterns.
- **Missing deny precedence**: if allow is evaluated before deny, an allow rule bypasses the security intent. Always evaluate deny first.
- **Forgetting related tools**: if `exec` is allowed, remember that `apply_patch` should also be permitted (it is a file operation).
- **Inheritance confusion**: subagent policies add restrictions on top of the parent policy; they do not replace it.
- **Accepting a deny floor from tool arguments**: the host prepares the floor. A model-supplied floor lets a subagent widen its own surface.
- **A pattern that matches too much**: regex-like patterns can be confusing, and a syntax error can grant unintended access. Test each pattern against the tools it must and must not match.

## Trade-offs

**Pros:**

- **Flexible patterns**: wildcards and groups give concise policies for large tool sets
- **Security by precedence**: deny rules cannot be bypassed by allow rules, and opt-in allowlists narrow the default surface when a role needs it
- **Hierarchical control**: subagents can be restricted further without changes to parent policies
- **Profile presets**: common agent types (coding, messaging) have preconfigured policies
- **Plugin support**: tool groups can include plugin tools through dynamic discovery

**Cons:**

- **Pattern complexity**: regex-like patterns can confuse, and a syntax error can grant unintended access
- **Policy explosion**: many agents with different policies are difficult to manage and audit
- **Evaluation order**: deny-before-allow precedence must be applied consistently; a bug is a security issue
- **Related tool ambiguity**: which tools are "related" (`exec` to `apply_patch`) is a judgment call and may not cover all cases

## References

- [OpenClaw tool-policy.ts](https://github.com/openclaw/openclaw/blob/main/src/agents/tool-policy.ts) - Policy resolution and restrictive-allow analysis (`hasRestrictiveAllowPolicy`)
- [OpenClaw tool-policy-shared.ts](https://github.com/openclaw/openclaw/blob/main/src/agents/tool-policy-shared.ts) - Pattern matching and `resolveToolProfilePolicy` re-export
- [OpenClaw delegated-tool-policy.ts](https://github.com/openclaw/openclaw/blob/main/src/agents/delegated-tool-policy.ts) - Subagent/delegated inheritance and deny floors
- [OpenClaw sandbox policies](https://github.com/openclaw/openclaw/tree/main/src/agents/sandbox) - Sandbox-specific policies
- Beurer-Kellner et al. (2025). "Design Patterns for Securing LLM Agents against Prompt Injections." arXiv:2506.08837 - Action Selector pattern academic foundation
- [Model Context Protocol](https://modelcontextprotocol.io) - Protocol standard for tool interoperability (Anthropic, 2025); tool authorization itself stays application-level
- Related: [Egress Lockdown (No-Exfiltration Channel)](/patterns/egress-lockdown-no-exfiltration-channel) for security patterns
