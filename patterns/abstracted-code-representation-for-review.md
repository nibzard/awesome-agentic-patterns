---
title: Abstracted Code Representation for Review
status: proposed
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Aman Sanger (Cursor, referencing Michael Grinich)"]
category: UX & Collaboration
source: "https://www.youtube.com/watch?v=BGgsoIgbT_Y"
tags: [code-review, verification, abstraction, pseudocode, intent-based-review, explainability, software-quality, human-ai-interface]
summary: "Shows reviewers pseudocode, intent summaries, and logical diffs of code changes, with drill-down to the real code to confirm the mapping"
signals: ["Reviewers spend too long reading AI-generated code line by line", "Reviewers care more about why code changed than how"]
anti_signals: ["No reliable way to confirm the abstraction matches the actual code", "Changes are small enough to review directly"]
updated_at: "2026-10-13"
---

## Problem

Reviewing AI-generated code line-by-line is time-intensive and cognitively demanding. Research shows developers prefer understanding *why* changes were made over *how* they were implemented—intent-level review is faster and more effective than syntax-level verification.

## Solution

Provide abstracted representations of code changes for human review:

-   **Pseudocode:** Concise, human-readable representation of logic
-   **Intent Summaries:** Functional description of what changes achieve
-   **Logical Diffs:** Behavioral changes rather than textual differences
-   **Visualizations:** Control flow, data flow, or architectural diagrams

**Critical requirement:** Abstracted representations must have strong guarantees that they accurately map to actual code changes. Formal verification of this mapping remains an open research challenge; current implementations rely on confidence scoring and drill-down capability for verification.

**Scope:** this pattern is strictly about verified-abstraction and semantic-diff review. For the broader practice of AI tools flagging issues and summarizing change intent, see [AI-Assisted Code Review / Verification](ai-assisted-code-review-verification.md); that pattern summarizes changes for reviewers, while this one hinges on a guaranteed mapping between the abstraction shown and the real code.

**Production examples:** GitHub Copilot Workspace (multi-stage workflows), Cursor AI (intent-based editing), Claude Code (plan-then-execute verification), PR review tools as scored by Augment's vendor benchmark for bug detection in AI review tools (Augment 59%, Cursor Bugbot 49%, Greptile 45%, CodeRabbit 39%, Claude Code 31%, GitHub Copilot 25%).

## Example

Instead of reviewing 50 lines of Python implementing a new sorting algorithm, review:
"Changed sorting logic for `user_list` from bubble sort to quicksort to improve performance for large lists. Test coverage maintained."

With drill-down capability to verify the underlying Python code matches the abstraction.

**Enterprise signal:** Microsoft reports reviewing 600K+ PRs per month with AI assistance (Microsoft DevBlogs, July 2025).

## How to use it

- Use this when reviewers must approve large AI-generated changes they cannot read line by line.
- Pair every abstraction with drill-down to the real code so reviewers can sample-verify the mapping.
- Treat the mapping guarantee as the central risk: confirm the abstraction matches the code before trusting the summary.
- Prefer semantic or AST-aware diffs over textual diffs when reviewing behavior changes.

## Trade-offs

* **Pros:** Cuts review time for large mechanical changes; surfaces intent that textual diffs bury; fits the existing PR review flow.
* **Cons:** An unfaithful abstraction hides defects, which is the mapping-guarantee problem; pseudocode can omit error handling and edge cases; reviewers may over-trust confident summaries.

## References

- Aman Sanger (Cursor, referencing Michael Grinich) at 0:09:48: "...operating in a different representation of the codebase. So maybe it looks like pseudo code. And if you can represent changes in this really concise way and you have guarantees that it maps cleanly onto the actual changes made in the in the real software, that just shorten the time of verification a ton."

- Primary source: https://www.youtube.com/watch?v=BGgsoIgbT_Y

- Alon et al. (POPL 2019): code2vec—learning distributed representations of code via AST path-based embeddings

- Feng et al. (EMNLP 2020): CodeBERT—bimodal pre-training for programming and natural languages

- Buse & Weimer (FSE 2010): "What Did They Change?"—developers prefer intent-level understanding over implementation details

- Storey et al. (IEEE TSE 2002): Software visualization improves program comprehension through multiple abstraction views

- Bayer et al. (ICSE 2017): Modern Code Review at Google—reviewers focus on logical correctness over implementation details

- Zhang et al. (arXiv 2026): EyeLayer—human attention patterns improve code summarization quality

- Schäfer et al. (ICSE 2020): Semantic Differencing for Software Refactoring—behavioral vs. textual changes

- [CodeRabbit: Introducing Semantic Diff](https://www.coderabbit.ai/blog/introducing-semantic-diff) — production semantic-diff tooling

- [SemanticDiff](https://semanticdiff.com/) — language-aware diff tool that hides non-functional changes

- [Evaluating AST-aware semantic diffing for code review at scale](https://rammehta1899.github.io/blog/2026/09/25/evaluating-ast-aware-semantic-diffing-for-code-review-at-scale/) (2026) — practitioner evaluation of the mapping problem at scale
