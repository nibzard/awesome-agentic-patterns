---
title: Milestone Escrow for Agent Resource Funding
status: proposed
authors: ["RioTheGreat-ai (@RioTheGreat-ai)"]
based_on: ["AgentFund (example implementation)"]
category: "UX & Collaboration"
source: "https://github.com/RioTheGreat-ai/agentfund-skill"
tags: [resource-funding, escrow, milestones, agent-governance, budget-controls]
summary: "Holds agent funding in escrow and releases each payment only after independent verification of a measurable milestone"
signals: ["Autonomous agent teams need ongoing compute or API spend", "Work splits into small, auditable milestones", "Budget runaway is a risk without heavy human oversight"]
anti_signals: ["Work cannot be split into objective milestones", "No one is assigned to verify milestones or handle disputes"]
updated_at: "2026-10-13"
---

## Problem

Autonomous agent teams can need ongoing resources (compute, API spend, tools) over many steps. Without a funding model that enforces guardrails, they either require heavy human intervention or risk budget runaway.

## Solution

Use milestone-based escrow with verifiable release conditions.

1. Define measurable milestones tied to expected outputs and acceptance criteria.
2. Hold committed funds in an escrow mechanism.
3. Collect proof artifacts for each milestone.
4. Release payment only after independent verification of each milestone.
5. Keep remaining funds locked until the next milestone threshold is met.

This pattern funds one team's ongoing resource spend across verified milestones. It differs from [Capability-Escrow-Receipt](capability-escrow-receipt.md), which settles per-task hires between agents through an atomic hire plus a signed proof-of-work receipt.

## How to use it

- Use only for work that can be partitioned into auditable milestones.
- Keep milestones small and objective.
- Publish clear proof formats in advance (logs, checkpoints, outputs, receipts).
- Define reject/review/appeal paths before launch.
- Treat the reference implementation as a sketch, not a vetted escrow service: it is a small personal project (13 stars as of October 2026) and its payment contract has no published security audit.

## Trade-offs

- Requires governance design for who verifies milestones.
- Verification burden can become the bottleneck.
- Disputes need explicit handling and timeout rules.
- Smart contract / payment rails add operational and legal complexity.
- Funder-controlled verification (manual) vs autonomous verification (oracle-based) trade-off: simpler but slower vs faster but more complex.

## References

- [agentfund-skill](https://github.com/RioTheGreat-ai/agentfund-skill) — skill-based reference implementation
- [agentfund-mcp](https://github.com/RioTheGreat-ai/agentfund-mcp) — MCP server for the same flow
