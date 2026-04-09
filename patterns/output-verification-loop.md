---
title: Output Verification Loop
status: emerging
authors: ["John Weston (@JohnnyTarrr)"]
based_on: ["Chern et al. (FacTool, 2023)", "VeroQ Shield (veroq-ai)"]
category: "Reliability & Eval"
source: "https://arxiv.org/abs/2307.13528"
tags:
  - verification
  - hallucination-detection
  - trust-scores
  - fact-checking
  - multi-agent
summary: >-
  Verify LLM outputs by extracting individual claims, checking each against
  evidence sources, and returning per-claim trust scores before acting on
  the result.
complexity: low
effort: hours
impact: high
signals: ["Agent output feeds into decisions or downstream agents", "Hallucination risk is non-trivial", "Compliance requires an audit trail"]
anti_signals: ["Output is purely creative with no factual claims", "Latency budget under 500ms"]
related: ["reflection-loop", "self-critique-evaluator-loop"]
---

## Problem

LLM agents confidently produce outputs that contain factual errors, hallucinated citations, or unsupported claims. In multi-agent pipelines the problem compounds: one agent's hallucination becomes another agent's input. Standard reflection loops catch stylistic issues but lack grounding against external evidence, so factual errors pass through unchallenged.

## Solution

Insert a verification step between generation and action. The step works in three phases:

1. **Claim extraction** -- decompose the LLM output into individual, atomic claims.
2. **Evidence retrieval** -- for each claim, retrieve supporting or contradicting evidence from authoritative sources (APIs, knowledge bases, RAG stores).
3. **Scoring** -- assign a per-claim trust score based on evidence alignment and return an aggregate confidence for the full output.

The agent (or orchestrator) uses the scores to decide whether to proceed, retry with a corrected prompt, or escalate to a human.

```pseudo
output = agent.generate(prompt)
result = verify(output, context)

if result.trust_score >= threshold:
    proceed(output)
else:
    retry_with_feedback(result.flagged_claims)
```

In multi-agent systems, run verification at each hand-off between agents so errors don't propagate through the pipeline. Verification receipts (signed, timestamped results) provide an audit trail for compliance.

## How to use it

- Place a verification call after any agent step that produces factual claims others will depend on.
- Set a trust-score threshold appropriate to the domain (higher for medical/financial, lower for exploratory research).
- In a swarm or multi-agent pipeline, verify at every agent boundary rather than only at the final output.
- Store verification receipts when you need a compliance audit trail.

### Known implementations

- [VeroQ Shield](https://github.com/veroq-ai/shield) -- open-source claim-level verification library with evidence chains.

## Trade-offs

- **Pros:** Catches factual errors that reflection loops miss; provides quantified confidence rather than binary pass/fail; audit trail via receipts; composable across multi-agent pipelines.
- **Cons:** Adds latency per verification call; evidence quality bounds verification quality; requires an evidence source relevant to the domain.

## References

- [FacTool: Factuality Detection in Generative AI](https://arxiv.org/abs/2307.13528) -- academic approach to claim-level verification
- [Self-Refine: Iterative Refinement with Self-Feedback](https://arxiv.org/abs/2303.11366) -- related but lacks external evidence grounding
- [VeroQ Shield](https://github.com/veroq-ai/shield) -- open-source implementation of claim-level verification
