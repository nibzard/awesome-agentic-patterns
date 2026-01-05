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
Model Context Protocol (MCP) encourages "mix-and-match" tools—often combining private-data readers, web fetchers, and writers in a single callable unit. This amplifies the lethality of prompt-injection chains.

## Solution
Adopt **capability compartmentalization** at the tool layer:

- Split monolithic tools into *reader*, *processor*, and *writer* micro-tools.  
- Require explicit, per-call user consent when composing tools across capability classes.  
- Run each class in an isolated subprocess with scoped API keys and file permissions.

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

## Trade-offs

**Pros:** Fine-grained; plays well with modular architectures.
**Cons:** More tooling overhead; risk of permission creep over time.

## References

* Willison's warning that "one MCP mixed all three patterns in a single tool."