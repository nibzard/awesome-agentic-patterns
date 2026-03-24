---
title: Black-Box Skill Invocation
status: emerging
authors: ["Ziwei Zhao (@ZiwayZhao)"]
based_on: ["Skill-as-API (CoWorker Protocol)", "Remote Procedure Call", "Zero-Knowledge Proofs (conceptually)"]
category: "Security & Safety"
source: "https://github.com/ZiwayZhao/agent-coworker"
tags: [privacy, skill-sharing, black-box, schema-only, prompt-protection, inter-agent, trust]
---

## Problem

When agents collaborate by sharing skills, the typical approach exposes implementation details: source code, prompts, internal logic, and model configurations. This creates knowledge leakage — a collaborator's agent can learn and replicate proprietary workflows after a single interaction.

Traditional mitigations (NDAs, API gateways, access control lists) constrain humans but do not constrain agent memory. Once an agent observes implementation details during collaboration, the knowledge cannot be "unlearned."

## Solution

Separate **what a skill can do** from **how it works** at the protocol level:

- **Schema-only discovery**: Peers discover skill capabilities through input/output schema contracts (name, description, parameter types, return types, minimum trust tier). Implementation code, prompts, and internal logic are never transmitted.
- **Remote execution, local processing**: The skill runs on the provider's machine. The caller sends structured input and receives structured output. No intermediate state, chain-of-thought, or model artifacts cross the boundary.
- **Uniform error responses**: Hidden skills, nonexistent skills, and trust-insufficient skills all return the same generic error ("Unknown skill"), preventing existence enumeration.
- **Revocable trust tiers**: Access is granted per collaboration, not permanently. Trust automatically downgrades when the task objective (OKR) completes, ensuring short-term collaboration does not become long-term access.

The attack surface shrinks from "the entire LLM context" to "the function parameter boundary."

## When to Use

- Agents from different organizations need to collaborate without exposing proprietary logic
- A skill provider wants to monetize capabilities without revealing implementation
- Collaboration is temporary and trust should not persist indefinitely
- Prompt injection defense is needed at the architectural level (not just prompt-level filtering)

## Trade-offs

- The caller cannot inspect or debug the skill implementation — they must trust the output
- Schema contracts must be expressive enough for the caller to construct valid inputs
- Asynchronous execution is needed when the provider is not always online
- No verifiable computation — the caller cannot prove the skill ran correctly (future work: ZK proofs)

## Known Implementations

- [CoWorker Protocol](https://github.com/ZiwayZhao/agent-coworker) — P2P agent collaboration over XMTP with black-box skill invocation, 4-tier revocable trust, and async delegation. Python, MIT, zero dependencies.
