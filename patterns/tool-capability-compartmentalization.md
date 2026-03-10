---
title: Tool Capability Compartmentalization
status: emerging
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Simon Willison (MCP critique)"]
category: Orchestration & Control
source: "https://simonwillison.net/2025/Jun/16/lethal-trifecta/"
tags: [capability-segregation, least-privilege, tool-permissions]
---

## Problem

Model Context Protocol (MCP) and agent frameworks often combine three capability classes in a single tool: private-data readers (email, filesystem), web fetchers (HTTP clients), and writers (API mutators). This creates the "lethal trifecta"—malicious input can trigger chains that read sensitive data, exfiltrate it, and modify systems in one operation.

## Solution

Adopt **capability compartmentalization** at the tool layer:

- Split monolithic tools into *reader*, *processor*, and *writer* micro-tools.  
- Require explicit, per-call user consent when composing tools across capability classes.  
- Run each class in an isolated subprocess with scoped API keys and file permissions.

Treat each capability class as a separate trust zone with its own runtime identity and policy checks. Cross-zone composition should require explicit policy evaluation and short-lived delegation tokens so the agent cannot silently chain read+fetch+write into a high-risk path.

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

- Primary source: https://simonwillison.net/2025/Jun/16/lethal-trifecta/
- Clawdbot (validated-in-production reference implementation with profile-based policies): https://github.com/clawdbot/clawdbot
- Action Selector pattern (Beurer-Kellner et al., 2025): https://arxiv.org/abs/2506.08837
- NVIDIA NeMo Guardrails (policy-based enforcement): https://github.com/NVIDIA/NeMo-Guardrails
