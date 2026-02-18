# Non-Custodial Spending Controls

## Problem

AI agents with wallet access can sign transactions autonomously. Without guardrails, a single bad prompt injection, buggy loop, or hallucination can drain a wallet. Hardcoding limits in agent code or system prompts is unreliable — prompts can be jailbroken and code limits are easily bypassed.

## Solution

Insert a policy enforcement layer between the agent and the wallet signing function. The agent submits a **transaction intent** (not a signed transaction) to the policy layer, which evaluates it against owner-defined rules. Only if the policy check passes does the wallet SDK proceed to sign.

Key properties:
- **Non-custodial** — the policy layer never holds private keys. It only sees transaction metadata.
- **Fail-closed** — if the policy service is unreachable, the agent cannot spend.
- **Two-gate enforcement** — Gate 1: policy evaluation. Gate 2: authorisation token verification before signing.

## Rules you can enforce

- Per-transaction amount limits
- Daily/hourly spending caps with automatic reset
- Recipient allowlists and blocklists
- Per-endpoint or per-API budgets
- Transaction frequency throttling
- Circuit breakers (auto-pause after consecutive failures)
- Duplicate payment detection

## Trade-offs

- Adds latency (one network call per transaction for policy check)
- Requires the policy service to be available (fail-closed is safe but can block legitimate transactions)
- Policy rules need to be configured — poorly set rules can be too restrictive or too permissive

## Known uses

- [PolicyLayer](https://policylayer.com) — non-custodial spending controls for x402 agent payments, with cryptographic decision proofs and audit logging
- Coinbase Agentic Wallets — basic session caps and per-transaction limits (custodial)
- Openfort — wallet-level spend limits and allowlists (wallet-specific)
