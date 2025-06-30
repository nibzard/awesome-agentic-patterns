---
title: "Curated Code Context Window"
status: "Established"
authors: ["Anonymous Speaker (Open Source Agent RL Talk)", "Will Brown (Prime Intellect Talk)"]
category: "Context & Memory"
source_link: "https://www.youtube.com/watch?v=Xkwok_XXQgw"
tags: [context-management, code-agent, file-selection, noise-reduction]
---

## Problem

Loading **all source files** or dumping entire repositories into the agent's context overwhelms the model, introduces noise, and slows inference. Coding agents need to focus on **only the most relevant modules** to efficiently reason about changes or generate new functionality.

- Including every file biases the agent with irrelevant code; it "loses coherence" over large contexts.
- Large contexts inflate token usage, slowing down multi-turn RL training.

## Solution

Maintain a **minimal, high-signal code context** for the main coding agent by:

**1. Context Sterilization**
- Exclude unrelated modules (e.g., test utilities when working on a UI component).
- Automatically identify relevant files via a lightweight **search agent** that returns top-K matches for a function or class name.

**2. Helper Subagent for Code Discovery**
- Spawn a **SearchSubagent** (a small LLM or vector-search index) that takes a file path or query (e.g., "find definitions of `UserModel`") and returns a ranked list of file snippets.
- Only top-3 snippets (each ≤ 150 tokens) are injected into the main agent's context.

**3. Context Update Cycle**
- **Main Agent:** "I need to refactor `UserService`."
- **SearchSubagent:** "Found `user_service.py`, `models/user.py`, `utils/auth.py`."
- **Context Injection:** Only those three files (or their summaries) enter the main agent's window.

## Example

```mermaid
sequenceDiagram
    MainAgent->>SearchSubagent: "Find files defining UserModel"
    SearchSubagent-->>MainAgent: List of 3 file paths/snippets
    MainAgent->>Context: Inject these three code snippets only
    MainAgent->>Tool: edit_file(UserService)
```

## How to use it

- **Indexing Stage (Offline):** Build a simple **code index** (e.g., with `ripgrep` or a vector store) to map function/class names to file paths.
- **Subagent Definition:** Define `SearchSubagent` as a function that queries the code index and uses a small LLM to filter and rank matches.
- **Context Management Library:** Create a wrapper (e.g., `CuratedContextManager`) that automatically invokes `SearchSubagent` when the main agent asks for relevant code.

## Trade-offs

- **Pros:**
  - **Noise Reduction:** Keeps the context focused on pertinent code, improving reasoning clarity.
  - **Token Efficiency:** Dramatically reduces tokens consumed per step, boosting RL throughput.
- **Cons/Considerations:**
  - **Index Freshness:** If code changes frequently, the index must be updated to avoid stale results.
  - **Complexity:** Adds an extra component (SearchSubagent + index) to the training and inference pipeline.

## References

- "Context is sacred" principle from the Open Source Agent RL talk (May 2025).
- Will Brown's commentary on "avoiding blowing up your context length" for long-horizon tasks.