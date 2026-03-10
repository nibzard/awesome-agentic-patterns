---
title: "Curated File Context Window"
status: best-practice
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Internal AI Dev Team"]
category: "Context & Memory"
source: "https://docs.anthropic.com/en/docs/claude-code/common-workflows"
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
- The sub-agent runs a quick search using agentic techniques (ripgrep, grep, AST heuristics) over the repository for symbols, imports, or keywords related to the task.
- Modern implementations favor direct search (e.g., `rg`) over complex vector embeddings for simplicity and freshness.
- It returns a ranked list of file paths (e.g., "UserController.java," "UserService.kt," "models/user.rs").

**3. Fetch & Summarize Secondary Files**
- For each top-N file (e.g., N = 5), determine loading strategy by file size and relevance:
  - Small files (<~200 tokens): load full content
  - Medium files with high relevance: load full content or specific sections
  - Large or peripheral files: load summaries, function signatures, or class structure only
- Append those summaries (or extracted code snippets) to the **Main Context Window** if they pass a relevance threshold:
  - **Symbol overlap**: file shares ≥50% of symbols with primary files
  - **Dependency distance**: file is within 1-2 hops in dependency graph
  - **Semantic similarity**: content exceeds similarity threshold (when embeddings available)

**4. Proceed with Coding Task**
- With a compact, high‐signal context, the agent generates or refactors code, focusing solely on the curated set.

This ensures that the agent has precisely the files it needs (no more, no less), keeps inference costs low, and improves accuracy by removing irrelevant noise.

## How to use it

- **Initialization:**
  1. Agent receives a natural-language or structured request (e.g., "Add validation to `signup()` in `UserController.java`").
  2. Automatically parse the request to identify "primary files" (`UserController.java`).

- **Sub-Agent Workflow:**
  1. Invoke a **Search Sub-Agent** via shell commands (e.g., `rg "signup" -tjava`) or lightweight AST traversal.
  2. For each matched file, run snippet extraction (method signatures, class definitions referencing task symbols).
  3. Pass snippets back to main agent; filter for purely relevant code (ignore long comments, unrelated classes).

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
  - Agentic search (ripgrep/AST) works with uncommitted changes and requires no indexing infrastructure.

- **Cons/Considerations:**
  - Requires a file-search mechanism (ripgrep for simplicity, or indexed AST for scale).
  - May miss edge cases if the sub-agent's ranking heuristic is suboptimal—critical files can be omitted.
  - When using indexed approaches, the index must stay up-to-date as code changes (agentic search avoids this).

## References

- Anthropic Claude Code - Curated file context workflow with agentic search (ripgrep, AST heuristics) over vector embeddings for always-fresh results: https://docs.anthropic.com/en/docs/claude-code/common-workflows
- Cursor AI - `.cursorignore` exclusion rules and semantic codebase-wide queries for production-scale curated context: https://cursor.sh/docs
- Sourcegraph Cody - AST-based code graph for large-scale repositories with agent-aware tooling: https://docs.sourcegraph.com
- Will Brown / Prime Intellect Talk (2025) - "Context is sacred" principle for agent efficiency: https://www.youtube.com/watch?v=Xkwok_XXQgw
- Zhang et al. "RepoCoder" (2023) - Iterative retrieval-refinement loops validate sub-agent search approach
