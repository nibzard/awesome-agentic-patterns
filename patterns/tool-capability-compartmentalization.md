---
title: Tool Capability Compartmentalization
status: emerging
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Simon Willison (MCP critique)"]
category: Orchestration & Control
source: "https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/"
tags: [capability-segregation, least-privilege, tool-permissions]
summary: "Splits tools into reader, processor, and writer classes with scoped permissions and blocks tool chains that combine private data, untrusted input, and external writes"
signals: ["Agent tools read private data and also reach the network", "Untrusted input can reach tools that write or send data", "MCP or framework tools mix several capability classes"]
anti_signals: ["All tools are read-only and local", "Team cannot maintain per-tool permission manifests"]
updated_at: "2026-10-13"
---

## Problem

Model Context Protocol (MCP) and agent frameworks often combine three capability classes in a single tool: private-data readers (email, filesystem), web fetchers (HTTP clients), and writers (API mutators). This creates the "lethal trifecta"—malicious input can trigger chains that read sensitive data, exfiltrate it, and modify systems in one operation.

## Solution

Adopt **capability compartmentalization** at the tool layer:

- Split monolithic tools into *reader*, *processor*, and *writer* micro-tools.  
- Require explicit, per-call user consent when composing tools across capability classes.  
- Run each class in an isolated subprocess with scoped API keys and file permissions.

Treat each capability class as a separate trust zone with its own runtime identity and policy checks. Cross-zone composition should require explicit policy evaluation and short-lived delegation tokens so the agent cannot silently chain read+fetch+write into a high-risk path.

**Scope note:** Willison's post diagnoses the trifecta and prescribes keeping at least one of the three capabilities out of any execution path; it does not propose reader/processor/writer splitting or manifests. The micro-tool splitting below is this pattern's extrapolation of his principle. The call-time blocking rule itself belongs to the sibling pattern [Lethal Trifecta Threat Model](lethal-trifecta-threat-model.md); what this pattern adds is the per-class isolation and manifest machinery that makes such a rule enforceable.

```yaml
# tool-manifest.yml
email_reader:
  capabilities: [private_data, untrusted_input]
  permissions:
    fs: read-only:/mail
    net: none

issue_creator:
  capabilities: [external_comm]
  permissions:
    net: allowlist:github.com
```

## How to use it

* Generate the manifest automatically from CI.
* Your agent runner consults the manifest before constructing action plans.
* Flag any attempt to chain tools that would recreate the lethal trifecta.
* Group tools by capability class (fs, web, runtime, memory) and assign profiles (minimal, coding, messaging) to prevent mixing.
* Validate tool chains at call time: reject if all three capability classes are present.

```typescript
// Cross-zone validation
function validateToolChain(tools: string[]): boolean {
  const classes = new Set(tools.map(t => getCapabilityClass(t)));
  if (classes.has("PRIVATE_DATA") &&
      classes.has("UNTRUSTED_INPUT") &&
      classes.has("EXTERNAL_COMM")) {
    return false; // Lethal trifecta detected
  }
  return true;
}
```

## Trade-offs

**Pros:** Fine-grained; plays well with modular architectures.
**Cons:** More tooling overhead; risk of permission creep over time.

## References

* Willison's warning that "one MCP mixed all three patterns in a single tool."

- Primary source: [The lethal trifecta for AI agents: private data, untrusted content, and external communication](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/) (Simon Willison, June 16, 2025)
- [MCP security best practices](https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices) — official Model Context Protocol guidance on least-privilege tool design and attack vectors
- [OpenClaw](https://github.com/openclaw/openclaw) (formerly Clawdbot) — open-source agent with profile-based tool policies; `github.com/clawdbot/clawdbot` now redirects here
- Beurer-Kellner et al., [Design Patterns for Securing LLM Agents against Prompt Injections](https://arxiv.org/abs/2506.08837) (arXiv:2506.08837, June 2025) — academic catalog of agent security patterns, including capability-based isolation
- NVIDIA NeMo Guardrails (policy-based enforcement): https://github.com/NVIDIA/NeMo-Guardrails
