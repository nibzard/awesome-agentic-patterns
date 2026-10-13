---
title: "Reliability Problem Map Checklist for RAG and Agents"
status: proposed
authors: ["PSBigBig (@onestardao)"]
based_on: ["WFGY Problem Map (@onestardao)"]
category: "Reliability & Eval"
source: "https://github.com/onestardao/WFGY/blob/main/ProblemMap/README.md"
tags: [reliability, evaluation, rag, agents, debugging, failure-modes, checklist]
summary: "Runs a fixed 16-question failure checklist on each RAG or agent incident, maps the result to repair actions, and re-tests the same failing case"
signals: ["RAG or agent failures are hard to diagnose", "Team fixes incidents by changing prompts at random", "Team needs a shared vocabulary for failure modes"]
anti_signals: ["Automated evals and metrics already find root causes", "Team will not run the full triage sequence first"]
updated_at: "2026-10-13"
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

## Example

Consider a RAG system where answers cite the wrong snippet despite high vector similarity scores. Traditional debugging would involve tuning retriever weights or adjusting prompts.

**Using the WFGY Problem Map:**

1. Run through the checklist and identify Problem #1 (Hallucination & Chunk Drift) and Problem #5 (Semantic != Embedding)
2. For Problem #1: Apply Delta S meter to measure semantic tension (>0.6 indicates failure), use lambda_observe to flag divergent logic flow
3. For Problem #5: Apply BBMC residue minimization to compute semantic residue, reject chunks with high tension
4. Re-run the same query and check it against the project's own targets (Delta S <= 0.45, coverage >= 0.70)

**Result:** In the project's own telling, the system now explicitly rejects misleading chunks before generation, creating a "semantic firewall" rather than patching after output.

## Technical Details

### The 16 Problem Map Modes

| # | Problem Domain | What Breaks |
|---|----------------|-------------|
| 1 | **[IN]** hallucination & chunk drift | retrieval returns wrong/irrelevant content |
| 2 | **[RE]** interpretation collapse | chunk is right, logic is wrong |
| 3 | **[RE]** long reasoning chains | drifts across multi-step tasks |
| 4 | **[RE]** bluffing / overconfidence | confident but unfounded answers |
| 5 | **[IN]** semantic != embedding | cosine match != true meaning |
| 6 | **[RE]** logic collapse & recovery | dead-ends, needs controlled reset |
| 7 | **[ST]** memory breaks across sessions | lost threads, no continuity |
| 8 | **[IN]** debugging is a black box | no visibility into failure path |
| 9 | **[ST]** entropy collapse | attention melts, incoherent output |
| 10 | **[RE]** creative freeze | flat, literal outputs |
| 11 | **[RE]** symbolic collapse | abstract/logical prompts break |
| 12 | **[RE]** philosophical recursion | self-reference loops, paradox traps |
| 13 | **[ST]** multi-agent chaos | agents overwrite or misalign logic |
| 14 | **[OP]** bootstrap ordering | services fire before deps ready |
| 15 | **[OP]** deployment deadlock | circular waits in infra |
| 16 | **[OP]** pre-deploy collapse | version skew / missing secret on first call |

**Layer Codes:** [IN] Input & Retrieval, [RE] Reasoning & Planning, [ST] State & Context, [OP] Infra & Deployment

### Core WFGY Instruments

These instruments are project-internal concepts defined by a single personal project. They have no independent validation, and the numeric thresholds below are the project's own self-reported values, which the README itself hedges as internal and setup-dependent. Treat them as one team's vocabulary, not as validated measurement tools.

- **Delta S (ΔS):** Measures semantic tension (self-reported thresholds: ≤0.45 good, >0.60 failure)
- **lambda_observe:** Monitors logic directionality (convergent, divergent, chaotic)
- **epsilon_resonance:** Domain-level harmony tuning
- **BBMC:** Minimizes semantic residue
- **BBCR:** Rollback and branch spawn for logic recovery
- **BBPF:** Maintains divergent branches
- **BBAM:** Suppresses noisy tokens
- **Semantic Tree:** Hierarchical memory structure with Delta S-tagged nodes

### Key Insight

WFGY implements a "semantic firewall" that validates semantic stability **before** generation rather than patching after output. Once a failure mode is clearly mapped and monitored, it tends to stay fixed for that configuration. This checklist-based triage approach is not novel in kind: direct academic and industry prior work exists on RAG/agent-specific failure taxonomies, most prominently Barnett et al.'s "Seven Failure Points When Engineering a Retrieval Augmented Generation System" (arXiv:2401.05856). WFGY's four-area, 16-mode taxonomy and its instruments are a personal-project contribution on top of that prior work, not a first.

## References

- [WFGY Problem Map README](https://github.com/onestardao/WFGY/blob/main/ProblemMap/README.md)
- [WFGY Problem Map Repository](https://github.com/onestardao/WFGY/tree/main/ProblemMap)
- [Technical Deep Dive Report](https://github.com/nibzard/awesome-agentic-patterns/blob/main/research/wfgy-reliability-problem-map-technical-deep-dive.md)
- [Semantic Clinic Index](https://github.com/onestardao/WFGY/blob/main/ProblemMap/SemanticClinicIndex.md)
- [Grandma's Clinic (Beginner-Friendly)](https://github.com/onestardao/WFGY/blob/main/ProblemMap/GrandmaClinic/README.md)
- Barnett et al., "Seven Failure Points When Engineering a Retrieval Augmented Generation System" ([arXiv:2401.05856](https://arxiv.org/abs/2401.05856), 2024) — prior academic work on RAG failure taxonomies
- "Agentic Retrieval-Augmented Generation: A Survey" (arXiv:2501.09136, 2025)
