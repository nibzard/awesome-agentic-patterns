---
title: Cryptographic Governance Audit Trail
status: emerging
authors: ["jagmarques (@jagmarques)"]
based_on: ["SCITT (Supply Chain Integrity, Transparency and Trust)", "OWASP Agentic AI Threats and Mitigations (2025)"]
category: "Security & Safety"
source: "https://github.com/jagmarques/asqav-sdk"
tags: [governance, audit-trail, compliance, cryptographic-signing, policy-enforcement, eu-ai-act, owasp]
summary: "Middleware checks each tool call against a policy file, then signs a receipt of the action with ML-DSA and appends it to a tamper-evident chain"
signals: ["Regulated environment such as finance, healthcare, or EU AI Act", "You must prove what an agent did and whether it stayed within policy", "Agent framework supports tool-calling middleware"]
anti_signals: ["Per-call signing latency is not acceptable", "You cannot manage signing keys or store receipts that grow with activity"]
updated_at: "2026-10-13"
---

## Problem

When AI agents execute tool calls autonomously, there is no tamper-evident record of what happened. Traditional logging is mutable - logs can be altered after the fact. In regulated environments (finance, healthcare, EU AI Act), teams need to prove exactly what an agent did, when, and whether it operated within policy. Conventional logs already carry compliance weight (SOC 2 and EU AI Act Article 12 accept conventional record-keeping); what they lack is tamper-evidence and resistance to after-the-fact repudiation, which is what cryptographic signing adds.

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
  - OWASP's Agentic AI Threats and Mitigations guide (February 2025) covers logging and traceability as part of agent security hygiene, though neither it nor the OWASP Top 10 for Agentic Applications (ASI01-ASI10) lists lack of an audit trail as a named top vulnerability
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

- [asqav SDK](https://github.com/jagmarques/asqav-sdk) - Reference implementation. Disclosure: this SDK is a client for the author's own commercial signing service at asqav.com (Elastic License 2.0, Free/Pro/Enterprise plans); ML-DSA signing runs server-side in that service, and Ed25519/ES256 cover locally signed receipts, so "sign at the point of execution" is the pattern's design goal rather than a description of how this SDK's cloud-issued receipts are produced
- [IETF SCITT](https://datatracker.ietf.org/wg/scitt/about/) - Supply Chain Integrity architecture
- [OWASP Agentic AI Threats and Mitigations](https://genai.owasp.org/resource/agentic-ai-threats-and-mitigations/) - Agent security risks (the OWASP Top 10 for Agentic Applications is a separate document)
- [ML-DSA (FIPS 204)](https://csrc.nist.gov/pubs/fips/204/final) - Post-quantum digital signature standard
- Related pattern: [Policy-Gated Tool Proxy](policy-gated-tool-proxy.md) - covers the same policy-checking middleware and immutable audit trail; this pattern adds cryptographic tamper-evidence and non-repudiation on top, where the proxy pattern leaves the audit log unsigned
