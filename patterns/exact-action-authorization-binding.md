---
title: Exact-Action Authorization Binding
status: proposed
authors: ["Austin Bell (@robertaustinbell)"]
based_on: ["NOA Action Digest", "TOCTOU-safe authorization design"]
category: Security & Safety
source: "https://datatracker.ietf.org/doc/html/draft-toraman-noa-action-digest-01"
tags: [authorization, approval, tool-use, action-binding, TOCTOU, receipts]
summary: Bind a short-lived approval to the complete action presented to the reviewer, then rederive and compare that identity at the acting boundary before execution.
maturity: early
complexity: medium
effort: days
impact: high
signals:
  - "A human or policy service approves consequential agent actions before execution"
  - "Approved targets, arguments, identities, or policies can change while an action is queued"
  - "Approval and execution occur in different processes, services, or agent turns"
anti_signals:
  - "The action is read-only, low consequence, and cannot affect sensitive data or external state"
  - "Approval and execution are one indivisible operation over immutable arguments"
prerequisites:
  - "An acting adapter that mediates every governed execution path"
  - "A deterministic canonical representation of authorization-relevant fields"
  - "An authenticated authorization envelope and bounded validity period"
related: ["authenticated-authority-channel", "human-in-loop-approval-framework", "policy-gated-tool-proxy", "cryptographic-governance-audit-trail"]
domains: ["ops", "coding", "fintech"]
updated_at: "2026-08-21"
---

## Problem

Approval systems often ask a person or policy service to approve a proposed tool call, then execute it later. Between those steps, the request can be reconstructed, transformed, retried, delegated, or resumed from stored state. A seemingly valid approval may therefore be applied to a materially different action: another recipient, target, operation, payload, actor, acting surface, or policy version.

Ordinary audit logs show what was approved and what was executed, but comparison after the fact does not prevent the mismatch. Tool-level allowlists and human approval gates decide whether an action may proceed; unless the acting boundary verifies the exact approved action, they do not close this approval-to-execution time-of-check/time-of-use gap.

This is narrower than deciding where approval is required or which policy allows a tool call. It binds one authenticated approval to the authorization-relevant representation that a correctly mediated adapter will consume.

## Solution

Bind authorization to a deterministic identity of the **complete authorization-relevant representation presented for approval**, and require the acting adapter to rederive that identity immediately before execution.

1. Define the authorization-relevant fields, such as task, approver, actor, acting surface, operation, resolved target identity, arguments, governing policy, expiry, and a nonce or single-use identifier.
2. Canonicalize that representation with a documented profile. Compute a versioned, collision-resistant, domain-separated digest and bind the profile identifier into the authorization.
3. Issue an authenticated, short-lived authorization envelope. A signature or MAC, protected opaque capability, or trusted transactional lookup must bind the issuer, digest, profile, expiry, nonce, policy, and intended enforcement surface.
4. At the execution boundary, authenticate the envelope and reconstruct the action from the immutable values the adapter will actually consume. Canonicalize independently and compare the digest.
5. Atomically compare-and-consume the single-use authorization before execution. Deny mismatches, expiry, replay, or integrity failure. Any material transformation after comparison requires a new authorization.
6. Record authorization match, execution attempt, and independently observed external effect as separate claims. Digest equality correlates records; it does not prove that execution occurred or succeeded.

```pseudo
profile = "example.action-binding/v1+sha256"
approved = canonicalize(profile, {
  task_id, actor, acting_surface, operation,
  target, arguments, policy_id, expires_at, nonce
})
authorization = authenticated_approve(
  domain_digest(profile, approved), profile, expires_at, nonce
)

# Later, inside the adapter that will perform the action:
verify_envelope_integrity_and_issuer(authorization)
presented = canonicalize(profile, immutable_values_used_by_adapter())

if domain_digest(profile, presented) != authorization.action_digest:
    deny("approved action changed")

atomic_compare_and_consume(authorization)  # fails on expiry, replay, or race
result = execute(presented)
record_attempt(authorization.id, result)
# Resolve a stable external handle or read-back separately before claiming effect.
```

The adapter is the enforcement point. A prompt instruction to "execute only what was approved" is not this pattern because the same model can reinterpret both the approval and the action. If the adapter crashes after atomic consumption, reconcile through an idempotency key or authoritative status lookup; otherwise report the effect as unknown rather than replaying blindly.

## Evidence

- **Evidence Grade:** `mixed`
- **Most Valuable Findings:**
  - The NOA Action Digest defines an attempt-scoped correlation construction derived from an authorization record, parameter commitment, execution grant, and single-use nonce, while explicitly stating that it does not define execution binding and that equality proves neither execution nor effect.
  - The SCITT AI-agent action-receipt profile separates an issuer-authenticated action record from prior authorization, controller-reported outcome, and external-world effect claims.
  - Google AIP-151 supports stable operation handles for later status retrieval; Kubernetes API conventions separately distinguish desired specification from observed status.
- **Unverified / Unclear:** The fail-closed adapter comparison is this pattern's synthesis, not a guarantee established by the cited specifications. Comparative production evidence is not yet established. Security depends on authenticated authorization, collision-resistant domain-separated canonicalization, atomic consumption, immutable post-check values, and complete mediation.

## How to use it

- Apply it to actions where post-approval drift would matter: payments, messages, deployments, permission changes, destructive operations, or externally visible commitments.
- Include every field that could change the meaning or blast radius. Hashing only the tool name while leaving recipient or arguments outside the identity creates approval theater. Resolve aliases before approval when later resolution could change the resource.
- Use a documented canonicalization profile. Reject duplicate keys, unsupported numeric forms, ambiguous paths, and unknown fields rather than normalizing them differently across services.
- Keep authorization short-lived and preferably single-use. Authenticate it and bind it to the acting surface and policy version so it cannot be replayed through a broader adapter.
- Make alternative execution paths pass through the same verification point. An unmediated CLI, browser, or fallback API can bypass an otherwise correct contract.
- Test mutations and races deliberately: change one target, argument, actor, operation, policy, expiry, or nonce; then make two workers consume the same authorization. Prove rejection before duplicate execution.
- After a matching attempt, verify the stated success criterion through an appropriately trusted status lookup, stable handle, or independent read-back. Report `unknown` when observation cannot resolve the outcome; do not reuse the authorization digest as success evidence.

## Trade-offs

- **Pros:** Detects and rejects committed-field drift on correctly mediated paths; makes approval scope machine-checkable; localizes enforcement at the acting boundary; improves correlation among approval, attempt, and observation records.
- **Cons:** Requires authenticated envelopes, strict canonicalization, atomic consumption, crash reconciliation, and mediation of every acting path; changed requests incur another approval; aliases and unchecked post-comparison transformations can still defeat naive implementations.
- **Limits:** A digest is an integrity identity, not authentication, authorization, or execution proof. A compromised approver, adapter, canonicalizer, or signing key remains dangerous. The pattern does not establish that supplied facts were true, that the action was wise, or that the external effect occurred.

## References

- Toraman et al., [*The NOA Action Digest: a Domain-Separated Correlation Value for Human-Approved Agent Actions*](https://datatracker.ietf.org/doc/html/draft-toraman-noa-action-digest-01)
- Noa et al., [*A SCITT Profile for AI-Agent Action Receipts*](https://datatracker.ietf.org/doc/html/draft-noa-scitt-ai-agent-receipt-01)
- [Google AIP-151: Long-running operations](https://google.aip.dev/151)
- [Kubernetes API conventions: spec and status](https://github.com/kubernetes/community/blob/master/contributors/devel/sig-architecture/api-conventions.md#spec-and-status)
