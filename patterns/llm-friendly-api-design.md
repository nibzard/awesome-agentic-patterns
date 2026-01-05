---
title: LLM-Friendly API Design
status: emerging
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Lukas Möller (Cursor)"]
category: Tool Use & Environment
source: "https://www.youtube.com/watch?v=BGgsoIgbT_Y"
tags: [api-design, llm-interaction, tool-use, system-design, code-structure, agent-compatibility]
---

## Problem
For AI agents to reliably and effectively use tools, especially APIs or internal libraries, the design of these interfaces matters. APIs designed solely for human consumption might be ambiguous or overly complex for an LLM to use correctly without extensive fine-tuning or elaborate prompting.

## Solution
Design or adapt software APIs (including internal libraries and modules) with explicit consideration for LLM consumption. This involves:

-   **Explicit Versioning:** Making API version information clearly visible and understandable to the LLM, so it can request or adapt to specific versions.
-   **Self-Descriptive Functionality:** Ensuring function names, parameter names, and documentation (if accessible to the LLM) clearly describe what the API does and how to use it.
-   **Simplified Interaction Patterns:** Favoring simpler, more direct API calls over highly nested or complex interaction sequences where possible, to reduce the chances of the LLM making errors.
-   **Clear Error Messaging:** Designing error responses that are informative and actionable for an LLM, helping it to self-correct or understand why a call failed.
-   **Reduced Indirection:** Structuring code and libraries such that an LLM doesn't have to navigate through many layers of indirection to achieve a task, making it easier for the model to reason about the codebase.

The aim is to create interfaces that are robust and intuitive for LLMs to interact with, thereby improving the reliability and effectiveness of agent tool use.

## References
- Lukas Möller (Cursor) at 0:16:00: "API design is already adjusting such that LLMs are more comfortable with that. For example, changing not only the the version number internally but making it like very visible to the model that this is a new version of some software just to make sure that the the API is used correctly." And at 0:16:20: "...structuring the code in a way where one doesn't have to go through like n level of indirection but maybe just through two levels of indirection makes, yeah, LLM models better at at working with that code base."