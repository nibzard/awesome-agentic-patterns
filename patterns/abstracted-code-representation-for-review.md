---
title: Abstracted Code Representation for Review
status: proposed
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Aman Sanger (Cursor, referencing Michael Grinich)"]
category: UX & Collaboration
source_link: "https://www.youtube.com/watch?v=BGgsoIgbT_Y"
tags: [code-review, verification, abstraction, pseudocode, intent-based-review, explainability, software-quality, human-ai-interface]
---

## Problem
Reviewing large volumes of AI-generated code line-by-line can be tedious, error-prone, and inefficient. Human reviewers are often more interested in verifying the high-level intent and logical correctness of changes rather than minute syntactic details if the generation process is trusted to some extent.

## Solution
Provide a higher-level, abstracted representation of code changes for human review, rather than (or in addition to) the raw code diff. This could include:

-   **Pseudocode:** Representing the logic of the changes in a more human-readable, concise format.
-   **Intent Summaries:** Describing what the changes aim to achieve at a functional level.
-   **Logical Diffs:** Highlighting changes in program behavior or structure rather than just textual differences.
-   **Visualizations:** Graphical representations of control flow or data flow changes.

Crucially, this abstracted representation must come with strong guarantees (or at least high confidence) that it accurately and faithfully maps to the actual low-level code modifications that will be implemented. This allows reviewers to focus on conceptual correctness, significantly speeding up the verification process.

## Example
Instead of reviewing 50 lines of Python implementing a new sorting algorithm, review:
"Changed sorting logic for `user_list` from bubble sort to quicksort to improve performance for large lists. Test coverage maintained."
With a system guarantee that this change is correctly implemented in the underlying Python code.

## References
- Aman Sanger (Cursor, referencing Michael Grinich) at 0:09:48: "...operating in a different representation of the codebase. So maybe it looks like pseudo code. And if you can represent changes in this really concise way and you have guarantees that it maps cleanly onto the actual changes made in the in the real software, that just shorten the time of verification a ton."