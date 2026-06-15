---
title: "Commitment Ledger with Reality-Gated Credit"
status: proposed
authors: ["Max Baluev (@maxbaluev)"]
based_on: ["AccInt implementation example", "Reflexion-style episodic feedback", "SRE postmortem practice"]
category: "Learning & Adaptation"
source: "https://github.com/maxbaluev/accreted-intelligence"
tags: [commitment-ledger, outcome-feedback, agent-memory, credit-assignment, reality-gating]
summary: "Records agent promises and credits retrieved memory only after an externally verifiable outcome settles."
maturity: early
complexity: medium
effort: days
impact: high
signals: ["Multi-step agent work", "Clear success or failure signal", "Need auditable learning history"]
anti_signals: ["One-shot answers", "No observable outcome", "Highly sensitive data without retention policy"]
prerequisites: ["Persistent ledger", "Outcome verifier", "Memory retrieval provenance"]
related: ["episodic-memory-retrieval-injection", "memory-reinforcement-learning-memrl", "incident-to-eval-synthesis"]
tools: ["memory-store", "verifier", "ledger"]
domains: ["coding", "research", "operations"]
updated_at: "2026-06-15"
---

## Problem

Agents often write memories or update heuristics immediately after generating an answer. That creates weak learning signals:

- A plausible answer can be recorded as if it worked.
- Retrieved memories get credited even when the final action later fails.
- Human review, tests, production incidents, and real replies are disconnected from the memory records that influenced the action.
- Future agents cannot audit which past commitments were predictions, which were settled facts, and which were never verified.

The result is memory that compounds confidence faster than it compounds truth.

## Solution

Add a **commitment ledger** between retrieval and memory updates.

1. Before acting, record the goal, the retrieved memories or context IDs, the planned action, and the expected success condition.
2. Execute the action normally: code change, email, research answer, deployment, ticket update, or tool call.
3. Wait for a real outcome: passing tests, merged PR, user confirmation, incident resolution, benchmark result, support reply, or other external signal.
4. Settle the commitment with a provenance tier and update memory credit only from that settlement.

```pseudo
commitment = ledger.open({
  goal,
  retrieved_ids,
  planned_action,
  success_condition
})

result = act(planned_action)
outcome = verifier.wait_for_signal(result, success_condition)

ledger.close(commitment.id, outcome)
memory.credit(
  retrieved_ids,
  reward=outcome.score,
  provenance=outcome.provenance
)
```

Useful provenance tiers:

- **self-graded:** the agent believes it worked; weak prior only.
- **runtime:** a local tool, test, or evaluator produced a checkable result.
- **external:** the outside world answered, such as a merge, reply, production metric, or incident closure.
- **owner:** a responsible human explicitly accepted or rejected the result.

This separates "the agent predicted this would help" from "reality confirmed it helped."

## Evidence

- **Evidence Grade:** `medium`
- **Most Valuable Findings:**
  - Reflexion shows that explicit episodic feedback can improve repeated task performance without model weight updates.
  - SWE-bench-style evaluation demonstrates the value of real repository tests as settlement signals for coding agents.
  - SRE postmortem practice supports converting real outcomes into durable learning artifacts rather than relying on unaudited recollection.
- **Unverified / Unclear:** How to assign fractional credit across many retrieved memories remains implementation-specific.

## How to use it

Use this when an agent repeatedly works in the same environment and later reality can verify whether the action helped.

Implementation checklist:

- Define the smallest commitment record that preserves auditability: goal, retrieved context IDs, planned action, and expected outcome.
- Make unsettled commitments first-class. Do not let them silently become validated memories.
- Use weak credit for self-grades and stronger credit for runtime, external, or owner-verified outcomes.
- Store negative outcomes too. Failed commitments are useful counterexamples when future tasks look semantically similar.
- Periodically summarize settled commitments into higher-level guidance, but keep links back to the original evidence.

Common applications:

- Coding agents that retrieve past fixes, then settle credit from tests, CI, review, or merge status.
- Research agents that cite prior notes, then settle credit from human acceptance or downstream reuse.
- Operations agents that propose mitigations, then settle credit from incident metrics or postmortems.

## Trade-offs

**Pros:**

- Prevents unverified self-belief from becoming high-confidence memory.
- Creates an auditable chain from retrieved context to action to outcome.
- Makes failures reusable without erasing the evidence trail.
- Supports delayed learning when the real answer arrives minutes, days, or weeks later.

**Cons:**

- Requires durable storage for open commitments.
- Needs a verifier or human process that can map outcomes back to commitments.
- Adds latency to high-confidence learning because credit waits for settlement.
- Can overfit to easy-to-measure outcomes if qualitative review is never included.

## References

- AccInt uses this pattern as an implementation example: https://github.com/maxbaluev/accreted-intelligence
- Reflexion: Language Agents with Verbal Reinforcement Learning: https://arxiv.org/abs/2303.11366
- SWE-bench: Can Language Models Resolve Real-World GitHub Issues?: https://arxiv.org/abs/2310.06770
- Google SRE Book, Postmortem Culture: https://sre.google/sre-book/postmortem-culture/
