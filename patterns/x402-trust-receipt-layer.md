---
title: "x402 Trust Receipt Layer"
status: "emerging"
authors: ["TWZRD (@twzrd-sol)"]
based_on: ["x402 protocol (HTTP 402 payment standard)", "Solana on-chain trust scoring"]
category: "Security & Safety"
source: "https://intel.twzrd.xyz"
tags: [trust, x402, payment-receipts, ai-agents, solana, mcp, identity, micropayments]
---

## Problem

AI agents that call paid APIs over x402 have no lightweight way to verify the trust or reputation of a counterparty before committing payment. Trust decisions are made blind: an agent either pays and hopes the resource is legitimate, or skips the resource entirely. There is no standard pattern for issuing cryptographically-signed receipts that prove payment occurred and attest to the trustworthiness of the payer.

Two separate failure modes appear in production:
- **Pre-payment**: the agent cannot assess counterparty reputation without spending tokens first.
- **Post-payment**: the agent holds no durable, verifiable proof that payment occurred, making disputes and audit trails impossible.

## Solution

Insert a trust-scoring and receipt layer between the agent and the x402 resource server. The layer provides:

1. **Free preflight scoring**: before paying, the agent queries a trust endpoint with the target wallet or service identifier. The response includes an on-chain trust score derived from payment history, repeat-payer behavior, and dispute rate — no payment required.
2. **Signed V5 receipt**: after a successful x402 transaction, the agent requests a signed receipt. The receipt is a structured object signed by the trust layer's Ed25519 keypair, binding the payment proof to the payer's wallet address and the resource's identifier.
3. **MCP-native delivery**: the trust layer exposes both operations as a Streamable-HTTP MCP server, so any MCP-compatible agent can call `preflight_check` and `get_receipt` as ordinary tool calls without custom HTTP logic.

```
Agent
  │
  ├── tool: preflight_check(target_wallet) ──► Trust Layer (free)
  │         ◄── trust_score, risk_flags
  │
  ├── [agent decides to pay via x402]
  │
  └── tool: get_receipt(tx_signature) ──► Trust Layer (paid, x402)
            ◄── signed_receipt { payer, resource, amount, timestamp, sig }
```

The trust score is computed from Solana on-chain data: historical x402 payment frequency, repeat-payer ratio, and flagged dispute events. The signed receipt can be presented to any third party as proof of payment without contacting the original resource server.

## How to use it

**When to apply:**
- Agent-to-agent marketplaces where counterparty reputation is unknown.
- Long-running agents that accumulate payment history and want to build verifiable trust.
- Any x402-gated resource where dispute resolution or audit trails are required.

**Prerequisites:**
- Agent must support MCP tool calls (Streamable-HTTP transport).
- Agent must have a Solana wallet address (for on-chain trust scoring input).
- Agent must be capable of x402 payments (any x402-compatible client library).

**Implementation steps:**
1. Connect your MCP client to the trust layer endpoint (`https://intel.twzrd.xyz/mcp`).
2. Before paying a new counterparty, call `preflight_check` with their wallet. Gate payment on `trust_score >= threshold`.
3. After a successful x402 payment, call `get_receipt` with the transaction signature. Store the returned signed receipt.
4. Present stored receipts to downstream agents or auditors as verifiable payment proof.

## Trade-offs

- **Pros:**
  - Preflight is free — no cost to assess trust before committing payment.
  - Signed receipts are verifiable offline using the trust layer's public key.
  - MCP delivery means no custom HTTP integration — works with any MCP-compatible agent runtime.
  - On-chain scoring is tamper-resistant and transparent.

- **Cons/Considerations:**
  - Cold-start problem: new wallets with no on-chain history receive neutral scores, not negative ones.
  - Trust scores reflect past behavior, not future intent — a previously trusted wallet can still defect.
  - Receipt generation is a paid call (x402 micropayment required), adding one round-trip latency.
  - Solana-specific on-chain data means scoring is only meaningful for Solana-settled x402 payments.

## References

- [x402 Protocol](https://x402.org) — HTTP 402 open payment standard
- [TWZRD Agent Intel](https://intel.twzrd.xyz) — live trust + receipt MCP server
- [x402 SVM specification](https://github.com/x402-foundation/x402/tree/main/specs) — Solana network scheme
