---
title: Zero-Knowledge Verified Agent Egress
status: emerging
authors: ["Provably (@aural-psynapse)"]
based_on: ["Zero-knowledge proofs", "Zero trust architecture", "Trusted-endpoint allow-listing"]
category: "Security & Safety"
source: "https://csrc.nist.gov/pubs/sp/800/207/final"
tags: [egress, zero-knowledge-proof, source-of-truth, allow-list, mcp, outbound-verification, runtime-protection]
---

## Problem

An agent can be tricked into making an outbound request that looks fine at the network layer but carries a false claim: a payment to the wrong recipient, an API call with tampered parameters, a tool call whose arguments do not match what the user approved. A domain allow-list or egress firewall lets the call through because the destination is allowed; it never checks whether the *content* of the request is truthful. In regulated or high-value flows, teams need each outbound call to prove it matches a trusted source of truth before it leaves, without exposing that source of truth to the agent or the destination.

## Solution

Put a verification layer in front of every outbound request. Before the call leaves, the agent's claims about it get checked against a source of truth, and a zero-knowledge proof confirms the claims hold without revealing the underlying data. The call only goes out if the proof verifies.

The layer wraps the agent's HTTP path and MCP handoffs:

1. **Intercept**: hook the HTTP libraries the agent already uses, plus MCP tool calls, so every outbound request passes through.
2. **Verify**: check the request's claims against the source of truth and produce a zero-knowledge proof that they match. The proof runs against a backend that holds the source of truth, so neither the agent nor the destination sees it.
3. **Enforce**: block anything whose proof does not verify, and block any endpoint not on the trusted allow-list. Log every outbound call for audit.

```pseudo
on_outbound_request(req):
    proof = prove_against_source_of_truth(req.claims)   # zero-knowledge
    if not verify(proof):        return BLOCK
    if req.endpoint not in allow_list:  return BLOCK
    log(req, proof)
    return ALLOW
```

This is complementary to [Egress Lockdown (No-Exfiltration Channel)](egress-lockdown-no-exfiltration-channel.md): that pattern controls *where* an agent may send data at the network layer, while this one verifies that *what* the agent is sending is true before it goes.

## Evidence

- **Evidence Grade:** medium
- **Most Valuable Findings:**
  - NIST SP 800-207 (Zero Trust Architecture) establishes per-request verification before granting access as a core tenet; this pattern applies the same tenet to an agent's outbound calls.
  - Zero-knowledge proofs let a verifier confirm a claim without seeing the secret behind it (Goldwasser, Micali & Rackoff, 1989), so the source of truth stays private from both the agent and the destination.
  - The agentic-security literature classifies tool misuse and tampered tool arguments as a distinct threat class that network-layer egress controls do not cover (see the survey arXiv:2510.06445 and OWASP's Agentic AI threat taxonomy).
  - Hooking at the HTTP and MCP layer catches outbound calls regardless of which framework produced them.
- **Unverified / Unclear:** Proof-generation latency and the operational cost of running the verification backend at high call volumes need more production data.

## How to use it

- Wrap any agent framework that makes outbound HTTP or MCP tool calls (LangChain, CrewAI, MCP servers, custom SDKs) so every outbound request passes through the verification layer.
- Define the source of truth for the flows that matter (approved recipients, order details, policy limits) and a trusted-endpoint allow-list.
- Pick a proof mechanism: a zero-knowledge proof keeps the source of truth private from both the agent and the destination; where privacy is not a constraint, a signed attestation from the verifier achieves the same gating.
- Route outbound calls through the layer; treat a failed proof or a non-allowlisted endpoint as a hard block.
- Keep the signed logs for audit and incident review.

An existing implementation of this pattern is [SourceryKit](https://github.com/ProvablyAI/sourcerykit) (Python SDK, source-available), which hooks the HTTP libraries and runs the proof and source-of-truth check against a backend.

## Trade-offs

- **Pros:** Catches truthful-looking but false requests that a network allow-list misses; the source of truth stays private via the zero-knowledge proof; framework-agnostic through HTTP and MCP hooks; every call is logged.
- **Cons:** Proof generation adds latency per call; verification runs against a backend rather than fully offline; someone has to define and maintain the source of truth for each flow.

## References

- [NIST SP 800-207: Zero Trust Architecture](https://csrc.nist.gov/pubs/sp/800/207/final)
- [Goldwasser, Micali & Rackoff: The Knowledge Complexity of Interactive Proof Systems (SIAM J. Comput., 1989)](https://doi.org/10.1137/0218012)
- [A Survey on Agentic Security (arXiv:2510.06445)](https://arxiv.org/abs/2510.06445)
- [OWASP GenAI Security Project: Agentic AI - Threats and Mitigations](https://genai.owasp.org/resource/agentic-ai-threats-and-mitigations/)
- [Egress Lockdown (No-Exfiltration Channel)](egress-lockdown-no-exfiltration-channel.md)
- [SourceryKit](https://github.com/ProvablyAI/sourcerykit) (implementation)
