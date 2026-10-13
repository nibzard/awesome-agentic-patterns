---
title: "Non-Custodial Spending Controls"
status: "emerging"
authors: ["SAMA-I (@s-a-m-a-i)"]
based_on: ["EIP-4337 smart accounts", "ERC-7715 wallet execution permissions", "x402 agent payments"]
category: "Security & Safety"
source: "https://eips.ethereum.org/EIPS/eip-7715"
tags: [wallet-controls, spend-limits, policy-enforcement, non-custodial, AI-agents, safety]
summary: "Puts a policy layer between the agent and the transaction signer that checks each intent against allowlists, budgets, and rate limits, and fails closed"
signals: ["Agent can start wallet or payment transactions", "Spending rules must not depend on prompt logic", "Every spend decision needs an audit log"]
anti_signals: ["Agent never moves funds", "Extra latency per transaction is not acceptable"]
updated_at: "2026-10-13"
---

## Problem

AI agents that can initiate wallet actions may issue unsafe transactions under prompt drift, buggy loops, or compromised prompts. If spending approvals are handled directly inside agent prompts or application logic, safety constraints are easy to bypass. The risk compounds when one agent has wallet access, reads untrusted content, and can make outbound network calls: prompt-injection payloads then have a direct path to funds.

## Solution

Insert an explicit policy enforcement layer between the agent and transaction signing. The agent submits transaction intent, the policy layer validates it against rules, and only approved intents are forwarded to a signer. This is the wallet-signing instance of the catalogue's [Policy-Gated Tool Proxy](policy-gated-tool-proxy.md): the protected tool server behind the proxy is a transaction signer, and the policy engine expresses spend rules.

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

- Primary source: [ERC-7715: Request Permissions from Wallets](https://eips.ethereum.org/EIPS/eip-7715) — Draft standard for `wallet_requestExecutionPermissions`, a JSON-RPC method that grants bounded, revocable execution permissions to a smart account; it requires EIP-4337 and EIP-7710. It defines the permission interface this pattern enforces; it is not agent-specific.
- [EIP-4337: Account Abstraction Using Alt Mempool](https://eips.ethereum.org/EIPS/eip-4337) — Final standard for smart contract accounts, bundlers, and paymasters; the account layer that policy-gated signers build on.
- [x402](https://x402.org) — open payment protocol in which servers answer unauthenticated requests with HTTP 402 and agents pay to retry; the payment flow these controls gate.
- [Openfort](https://www.openfort.io) — vendor example of agent wallets with spending policies, session keys, and sponsored gas (a commercial product, cited as an implementation, not a neutral standard).
- Related catalogue pattern: [Policy-Gated Tool Proxy](policy-gated-tool-proxy.md) — the general proxy-plus-policy-engine technique this file specializes for wallet signing.
- Earlier revisions linked a vendor homepage and a bare Coinbase homepage as sources, plus a Willison article whose URL no longer resolves; they were removed or replaced with the references above.
