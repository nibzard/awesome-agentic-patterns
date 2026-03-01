---
title: Egress Lockdown (No-Exfiltration Channel)
status: established
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Simon Willison (observation)", "Multiple vendor incident reports"]
category: Tool Use & Environment
source: "https://simonwillison.net/2025/Jun/16/lethal-trifecta/"
tags: [network-sandbox, exfiltration, outbound-controls, security]
---

## Problem

Even with private-data access and untrusted inputs, attacks fail if the agent has **no way to transmit stolen data**. This pattern implements the Bell-LaPadula model's "no write down" property: high-privilege subjects cannot write to low-trust destinations. Many real-world fixes simply removed or filtered outbound channels.

## Solution

Implement an **egress firewall** for agent tools:

- Allow only specific domains, methods, or payload sizes.  
- Strip or hash content in any permitted outbound call.  
- Forbid dynamic link generation (e.g., `attacker.example/exfil?q=REDACTED`).  
- Where external communication is essential, run it in a separate "dumb" worker that cannot see private data.

```bash
# Docker file example
RUN iptables -P OUTPUT DROP       # default-deny
RUN iptables -A OUTPUT -d api.mycompany.internal -j ACCEPT

# For L7-aware filtering: eBPF/XDP (Linux 4.19+) or Cilium
```

## How to use it

* Place the agent inside a sandboxed VM or container with outbound rules.
* Provide needed APIs via an internal proxy; audit that proxy's request schema.
* Apply seccomp profiles or AppArmor policies to block network syscalls directly.
* Log any DROP events for forensic follow-up.

## Trade-offs

**Pros:** Drastically reduces high-impact leaks; easy to reason about.
**Cons:** Breaks legitimate integrations; requires proxy stubs for essential calls.

## References

* Multiple vendor post-mortems cited by Willison: Microsoft 365 Copilot, GitHub MCP, GitLab Duo Chatbot fixes all disabled egress paths as the first patch.

- Primary source: https://simonwillison.net/2025/Jun/16/lethal-trifecta/
- Beurer-Kellner et al. (2025). "Design Patterns for Securing LLM Agents against Prompt Injections." arXiv:2506.08837.
