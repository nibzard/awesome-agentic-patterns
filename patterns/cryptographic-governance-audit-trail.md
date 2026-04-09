---
title: Cryptographic Governance Audit Trail
status: emerging
authors: ["jagmarques (@jagmarques)"]
based_on: ["SCITT (Supply Chain Integrity, Transparency and Trust)", "OWASP Agentic Top 10"]
category: "Security & Safety"
source: "https://datatracker.ietf.org/wg/scitt/about/"
tags: [governance, audit-trail, compliance, cryptographic-signing, policy-enforcement, eu-ai-act, owasp]
---

## Problem

When AI agents execute tool calls autonomously, there is no tamper-evident record of what happened. Traditional logging is mutable - logs can be altered after the fact. In regulated environments (finance, healthcare, EU AI Act), teams need to prove exactly what an agent did, when, and whether it operated within policy. Without cryptographic guarantees, audit trails have no legal or compliance weight.

## Solution

Sign every agent action with a post-quantum digital signature (ML-DSA) at the point of execution. Each tool call produces a signed receipt containing the action, parameters, result hash, timestamp, and policy evaluation outcome. These receipts form an append-only chain that is tamper-evident by construction.

The governance layer operates as middleware that wraps the agent tool-calling interface:

1. **Pre-execution**: Check the tool call against a policy file (allowed tools, rate limits, data access rules)
2. **Execution**: Run the tool call normally
3. **Post-execution**: Sign the action receipt with ML-DSA and append to the audit trail

## Evidence

- **Evidence Grade:** medium
- **Most Valuable Findings:**
  - SCITT architecture (IETF RFC 9334) validates the append-only signed receipt pattern for supply chain integrity
  - OWASP Agentic Top 10 lists lack of audit trail as a top vulnerability for agent systems
- **Unverified / Unclear:** Long-term storage and verification overhead at scale needs more production data

## How to use it

- Apply to any agent framework that supports tool-calling middleware (LangChain, CrewAI, MCP, etc.)
- Define policies in YAML specifying which tools are allowed, rate limits, and data access rules
- Store signed receipts locally or export to a compliance system
- Use for EU AI Act Article 12 (record-keeping) and SOC2 audit evidence

## Trade-offs

- **Pros:** Tamper-evident audit trail, policy enforcement before execution, quantum-safe signatures, framework-agnostic
- **Cons:** Adds latency to each tool call (signing overhead), requires key management, receipt storage grows linearly with agent activity

## References

- [asqav SDK](https://github.com/jagmarques/asqav-sdk) - Reference implementation (contributor's project)
- [IETF SCITT](https://datatracker.ietf.org/wg/scitt/about/) - Supply Chain Integrity architecture
- [OWASP Agentic Top 10](https://genai.owasp.org/resource/agentic-ai-threats-and-mitigations/) - Agent security risks
- [ML-DSA (FIPS 204)](https://csrc.nist.gov/pubs/fips/204/final) - Post-quantum digital signature standard
