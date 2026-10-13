---
title: Black-Box Skill Invocation
status: emerging
authors: ["Ziwei Zhao (@ZiwayZhao)"]
based_on: ["Capability-Based Security (Dennis & Van Horn, 1966)", "Remote Procedure Call (Birrell & Nelson, 1984)"]
category: "Security & Safety"
source: "https://github.com/ZiwayZhao/agent-coworker"
tags: [privacy, skill-sharing, black-box, schema-only, prompt-protection, inter-agent, trust]
summary: "Shares skills through input and output schemas only and runs them on the provider side, so prompts and code never cross the boundary"
signals: ["Agents from different organizations collaborate without exposing proprietary logic", "Provider wants to offer a skill without revealing its implementation", "Collaboration is temporary and trust must expire"]
anti_signals: ["Caller must inspect, debug, or verify how the skill ran", "Schemas cannot express valid inputs for the skill"]
updated_at: "2026-10-13"
---

## Problem

When agents collaborate by sharing skills, the typical approach exposes implementation details: source code, prompts, internal logic, and model configurations. This creates knowledge leakage — a collaborator's agent can learn and replicate proprietary workflows after a single interaction.

Traditional mitigations (NDAs, API gateways, access control lists) constrain humans but do not constrain agent memory. Once an agent observes implementation details during collaboration, the knowledge cannot be "unlearned."

## Solution

Separate **what a skill can do** from **how it works** at the protocol level:

- **Schema-only discovery**: Peers discover skill capabilities through input/output schema contracts (name, description, parameter types, return types, minimum trust tier). Implementation code, prompts, and internal logic are never transmitted.
- **Remote execution, local processing**: The skill runs on the provider's machine. The caller sends structured input and receives structured output. No intermediate state, chain-of-thought, or model artifacts cross the boundary.
- **Uniform error responses**: Hidden skills, nonexistent skills, and trust-insufficient skills all return the same generic error ("Unknown skill"), preventing existence enumeration.
- **Revocable trust tiers**: Access is granted per collaboration, not permanently. Trust automatically downgrades when the task objective completes, ensuring short-term collaboration does not become long-term access.

The attack surface shrinks from "the entire LLM context" to "the function parameter boundary."

**How this differs from ordinary remote tool invocation.** Protocols such as MCP, A2A, and plain tool APIs already give callers schema-only discovery of a remote capability that executes on the provider side, so schema-only remote execution alone is not new. The delta is what never crosses the boundary and how long trust lasts: in those protocols the provider's prompts, tool descriptions, and often source-visible logic are shared with the caller and access is granted until revoked, whereas here the provider's code and prompts never leave the provider, and trust tiers expire automatically when the collaboration's objective completes.

## How to use it

Adopt it as a protocol between two agents you control on each side:

1. **Publish skills as schemas.** For each skill you want to share, expose only its name, description, input/output schema, and minimum trust tier. Keep implementation, prompts, and model configuration off the wire.
2. **Execute on the provider side.** Accept structured input from the peer, run the skill locally, and return structured output. Never send intermediate state or chain-of-thought back.
3. **Collapse error cases.** Return one generic "Unknown skill" error for hidden, nonexistent, and trust-insufficient skills, so the caller cannot enumerate what exists.
4. **Grant trust per collaboration.** Map peers to trust tiers (for example untrusted, known, internal, privileged) and downgrade automatically when the task objective completes.
5. **Verify the boundary.** Test that no prompt text, code, or model artifact appears in outbound traffic, and that a lapsed tier yields the same error as a nonexistent skill.

## Trade-offs

- **Pros:** Prevents knowledge leakage across agent collaboration boundaries; enables monetization without IP exposure; reduces attack surface to parameter boundaries only.
- **Cons:** The caller cannot inspect or debug the skill implementation — they must trust the output. Schema contracts must be expressive enough for valid input construction. Asynchronous execution is needed when the provider is not always online. No verifiable computation — the caller cannot prove the skill ran correctly.

## References

- CoWorker Protocol (reference implementation): https://github.com/ZiwayZhao/agent-coworker — a single-project proof of concept (21 stars at the time of writing), not a widely adopted standard; its README also carries self-reported ecosystem statistics that this pattern file does not rely on
- Capability-Based Security: Dennis, J. B., & Van Horn, E. C. (1966). "Programming Semantics for Multiprogrammed Computations." *Communications of the ACM*.
- Remote Procedure Call: Birrell, A. D., & Nelson, B. J. (1984). "Implementing Remote Procedure Calls." *ACM TOCS*.
- Related catalogue patterns: [Zero-Trust Agent Mesh](zero-trust-agent-mesh.md), [Policy-Gated Tool Proxy](policy-gated-tool-proxy.md), [Tool Capability Compartmentalization](tool-capability-compartmentalization.md)
