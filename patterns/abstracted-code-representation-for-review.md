---
title: Abstracted Code Representation for Review
status: proposed
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Aman Sanger (Cursor, referencing Michael Grinich)"]
category: UX & Collaboration
source: "https://www.youtube.com/watch?v=BGgsoIgbT_Y"
tags: [code-review, verification, abstraction, pseudocode, intent-based-review, explainability, software-quality, human-ai-interface]
---

## Problem

Reviewing AI-generated code line-by-line is time-intensive and cognitively demanding. Research shows developers prefer understanding *why* changes were made over *how* they were implemented—intent-level review is faster and more effective than syntax-level verification. The 91% increase in PR review time following AI adoption creates a bottleneck that abstractions can address.

## Solution

Provide abstracted representations of code changes for human review:

-   **Pseudocode:** Concise, human-readable representation of logic
-   **Intent Summaries:** Functional description of what changes achieve
-   **Logical Diffs:** Behavioral changes rather than textual differences
-   **Visualizations:** Control flow, data flow, or architectural diagrams

**Critical requirement:** Abstracted representations must have strong guarantees that they accurately map to actual code changes. Formal verification of this mapping remains an open research challenge; current implementations rely on confidence scoring and drill-down capability for verification.

**Production examples:** GitHub Copilot Workspace (multi-stage workflows), Cursor AI (intent-based editing), Claude Code (plan-then-execute verification), PR summarization tools (Augment, CodeRabbit, Greptile).

## Example

Instead of reviewing 50 lines of Python implementing a new sorting algorithm, review:
"Changed sorting logic for `user_list` from bubble sort to quicksort to improve performance for large lists. Test coverage maintained."

With drill-down capability to verify the underlying Python code matches the abstraction.

**Enterprise impact:** Tekion achieved 60% faster merge times with intent-based summaries; Microsoft reviews 600K+ PRs/month using AI-assisted abstraction.

## How to use it

- Use this when humans and agents share ownership of work across handoffs.
- Start with clear interaction contracts for approvals, overrides, and escalation.
- Capture user feedback in structured form so prompts and workflows can improve.

## Trade-offs

* **Pros:** Creates clearer human-agent handoffs and better operational trust.
* **Cons:** Needs explicit process design and coordination across teams.

## References

- Aman Sanger (Cursor, referencing Michael Grinich) at 0:09:48: "...operating in a different representation of the codebase. So maybe it looks like pseudo code. And if you can represent changes in this really concise way and you have guarantees that it maps cleanly onto the actual changes made in the in the real software, that just shorten the time of verification a ton."

- Primary source: https://www.youtube.com/watch?v=BGgsoIgbT_Y

- Buse & Weimer (FSE 2010): "What Did They Change?"—developers prefer intent-level understanding over implementation details

- Storey et al. (IEEE TSE 2002): Software visualization improves program comprehension through multiple abstraction views

- Bayer et al. (ICSE 2017): Modern Code Review at Google—reviewers focus on logical correctness over implementation details

- Zhang et al. (arXiv 2026): EyeLayer—human attention patterns improve code summarization quality

- Schäfer et al. (ICSE 2020): Semantic Differencing for Software Refactoring—behavioral vs. textual changes
