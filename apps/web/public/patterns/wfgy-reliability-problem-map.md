---
title: 'Reliability Problem Map Checklist for RAG and Agents'
status: proposed
authors: ['PSBigBig (@onestardao)']
based_on: ['WFGY Problem Map (@onestardao)']
category: 'Reliability & Eval'
source: 'https://github.com/onestardao/WFGY/blob/main/ProblemMap/README.md'
tags: [reliability, evaluation, rag, agents, debugging, failure-modes, checklist]
---

## Problem

RAG pipelines and agent systems often fail in ways that are hard to diagnose: missing context, unstable retrieval, brittle tool contracts, and flaky behavior after data updates.

Teams frequently address these failures by iterating on prompts or tuning model settings first, which makes incidents feel random and expensive to fix.

This pattern addresses the need for a shared, repeatable triage routine that turns vague failures into actionable repair paths.

## Solution

Use a fixed reliability checklist (the Problem Map) as the first step in every incident response. The checklist groups recurring failure classes across these four areas:

- Retrieval behavior
- Vector / index behavior
- Prompt and tool contracts
- Deployment and operational state

For each failing case, the team classifies the incident by answering the checklist items. Confirmed failures are then mapped to a small set of repair actions and re-tested against the same reproduction case.

This creates a consistent vocabulary for incidents and keeps responses structured instead of ad hoc.

## How to use it

1. Capture one failing trace, query, or conversation.
2. Run through the 16-question Problem Map against that case.
3. Mark the active failure mode(s).
4. Execute the repair actions associated with those modes (for example: adjust chunking, rebuild embeddings/indexes, correct prompt/tool contracts, or repair ingestion ordering).
5. Re-run the same failure case and record which checks are now resolved.

Over time this becomes a lightweight incident memory bank for the team.

## Common pitfalls to avoid

- Treating the checklist as a one-off instead of part of operations.
- Grouping multiple unrelated failures into one single fix.
- Changing prompts only while ignoring retrieval or data-layer issues.

## Trade-offs

**Pros:**

- Gives teams a shared language for common agent/RAG failures.
- Works across LLM providers, orchestration stacks, and vector stores.
- Encourages targeted fixes instead of blind prompt changes.
- Produces a repeatable incident history.

**Cons/Considerations:**

- Requires discipline to run the full triage sequence first.
- Not a replacement for automated evaluations or metrics.
- Repair actions still need to be maintained for each tech stack.

## References

- [WFGY Problem Map README](https://github.com/onestardao/WFGY/blob/main/ProblemMap/README.md)
- [WFGY Problem Map Repository](https://github.com/onestardao/WFGY/tree/main/ProblemMap)
