---
title: "Curated File Context Window"
status: "Best Practice"
authors: ["Internal AI Dev Team"]
category: "Context & Memory"
source_link: "Internal Practice"
tags: [code-context, file-scope, relevance, memory-management]
---

## Problem

A coding agent often needs to reason about multiple source files, but dumping **all** files into its prompt:

- Quickly exceeds token limits or inference budget.
- Introduces noise: unrelated files (e.g., tests for other modules, assets, docs) distract the agent.
- Makes the agent's output slower and less focused on the immediate coding task.

## Solution

Maintain a **sterile, curated "main" context window** containing only the code files directly relevant to the current task, and let **helper sub-agents** gather and rank additional files without polluting the main context:

**1. Identify Primary Files**
- At task kickoff, the agent selects the set of files where changes are intended (e.g., the module under refactoring or feature implementation).
- Load only those files (plus any explicit dependencies) into the **Main Context Window**.

**2. Spawn a File-Search Sub-Agent**
- The sub-agent runs a quick search (e.g., `rg` or simple AST heuristics) over the entire repository for symbols, imports, or keywords related to the task.
- It returns a ranked list of file paths (e.g., "UserController.java," "UserService.kt," "models/user.rs").

**3. Fetch & Summarize Secondary Files**
- For each top-N file (e.g., N = 5), load a brief **summary** or only relevant function/class definitions instead of the full file.
- Append those summaries (or extracted code snippets) to the **Main Context Window** if they pass a relevance threshold (e.g., share ≥50% of symbols with the task).

**4. Proceed with Coding Task**
- With a compact, high‐signal context, the agent generates or refactors code, focusing solely on the curated set.

This ensures that the agent has precisely the files it needs (no more, no less), keeps inference costs low, and improves accuracy by removing irrelevant noise.

## How to use it

- **Initialization:**
  1. Agent receives a natural-language or structured request (e.g., "Add validation to `signup()` in `UserController.java`").
  2. Automatically parse the request to identify "primary files" (`UserController.java`).

- **Sub-Agent Workflow:**
  1. Invoke a **Search Sub-Agent** via a shell command (e.g., `rg "signup" -tjava`) or a lightweight index lookup.
  2. For each matched file, run a snippet extraction (e.g., parse only method signatures or classes referencing `User`).
  3. Pass those snippets back to the main agent; filter for purely relevant code (ignore long comments or unrelated class definitions).

- **Context Assembly:**
  - Construct the final prompt:
    ```
    ### PRIMARY FILE: UserController.java
    (full contents here)

    ### CONTEXT SNIPPETS:
    - UserService.java: validateUser(...)
    - SignupDTO.java: fields + annotations
    - ...
    ```

## Trade-offs

- **Pros:**
  - Keeps the agent's prompt size **minimum** and directly on-target.
  - Improves response time and reduces hallucinations from irrelevant code.
  - Scales to large repositories because only a handful of files are ever loaded.

- **Cons/Considerations:**
  - Requires maintaining a simple file-search service (e.g., `ripgrep` or an indexed AST).
  - May miss edge cases if the sub-agent's ranking heuristic is suboptimal—critical files can be omitted.
  - If the repository structure changes rapidly, the sub-agent's index must stay up-to-date.

## References

- Inspired by "Curated Context Window" from Claude Code best practices; adapted for coding-agent workflows.
- Common practice seen in large-scale monorepo code assistants (e.g., Lyft's internal code AI).