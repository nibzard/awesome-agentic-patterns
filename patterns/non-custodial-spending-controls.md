---
title: "Non-Custodial Spending Controls"
status: "emerging"
authors: ["SAMA-I (@s-a-m-a-i)"]
based_on: ["Walleted agent execution patterns"]
category: "Security & Safety"
source: "https://policylayer.com"
tags: [wallet-controls, spend-limits, policy-enforcement, non-custodial, AI-agents, safety]
---

## Problem

AI agents that can initiate wallet actions may issue unsafe transactions under prompt drift, buggy loops, or compromised prompts. If spending approvals are handled directly inside agent prompts or application logic, safety constraints are easy to bypass. This is a specific instance of the "lethal trifecta" threat model: combining wallet access with untrusted inputs and external communication creates exploitation paths.

## Solution

Insert an explicit policy enforcement layer between the agent and transaction signing. The agent submits transaction intent, the policy layer validates it against rules, and only approved intents are forwarded to a signer.

Core mechanics:

- **Intent-first workflow**: the agent never signs directly.
- **Non-custodial boundary**: the policy service validates and returns authorization, but never stores or manages private keys.
- **Fail-closed behavior**: when policy checks are unavailable, transaction approval is denied.
- **Two-gate control**: a policy evaluation step plus a separate authorization/timing check before signing.
- **Tool-layer integration**: the agent calls wallet tools normally; the policy layer wraps the underlying wallet library, remaining transparent to the agent.

## How to use it

- Model the action space as an allowlist of transaction types and destinations.
- Add per-asset and per-endpoint spending budgets.
- Enforce cadence constraints (frequency/throttle) and daily/hourly spend caps.
- Require allowlists/blocklists for critical counterparties.
- Emit structured audit logs for every denied/allowed decision.

## Trade-offs

- **Pros:**
  - Prevents direct misuse of signing credentials by agent runtime errors.
  - Supports policy changes without touching prompt logic.
  - Clear audit trail for governance and incident review.

- **Cons/Considerations:**
  - Adds latency for each transaction.
  - Requires high availability of the policy service for normal operation.
  - Misconfigured policies can block legitimate work.
  - More operational complexity than embedded prompt checks.

## References

- [PolicyLayer](https://policylayer.com)
- [Coinbase Agentic Wallet controls](https://www.coinbase.com)
- [Openfort](https://www.openfort.xyz)
- [EIP-4337: Account Abstraction](https://eips.ethereum.org/EIPS/eip-4337) - Smart contract wallets with policy enforcement
- [ERC-7715: Permissions and Delegation](https://eips.ethereum.org/EIPS/eip-7715) - Standardized wallet delegation for agents
- [The Lethal Trifecta - Simon Willison](https://simonwillison.net/2025/Jun/16/lethal-trifecta/) - Foundational threat model
