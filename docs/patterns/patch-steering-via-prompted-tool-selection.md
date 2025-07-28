---
title: "Patch Steering via Prompted Tool Selection"
status: "Best Practice"
authors: ["Boris Cherny (Claude Code Concepts)", "Will Brown (Prime Intellect Talk)"]
category: "Tool Use & Environment"
source_link: "https://www.youtube.com/watch?v=Xkwok_XXQgw"
tags: [patching, prompt-steering, tool-selection, coding-agent]
---

## Problem

Coding agents with access to multiple patching or refactoring tools (e.g., `apply_patch`, `AST-refactorer`, `codemod`) may choose suboptimal tools if not explicitly guided. This leads to:

- **Unnecessary Complexity:** Agent might use a generic text-replace tool instead of a specialized AST-aware refactoring tool.
- **Inconsistent Results:** Without explicit instructions, the agent's tool selection can vary unpredictably, hampering reproducibility.

## Solution

**Steer** the agent's tool selection and patch approach through **explicit natural language instructions** in the prompt. Techniques include:

**1. Direct Tool Invocation**
- Prepend: "Use the `apply_patch` tool to insert a new function `validate_input` in `auth_service.py`."
- The agent recognizes "apply_patch" as the preferred patching mechanism.

**2. Tool Usage Teaching**
- Provide a mini-manual in the context:
  ```text
  "Our `ASTRefactor` tool takes JSON describing node edits:  
  {"file": string, "pattern": string, "replacement": string}.  
  Use it for safe refactors rather than raw `sed` commands."  
  ```
- This orients the agent to use the safer, higher-level refactoring tool when modifying function signatures or renaming classes.

**3. Implicit Shorthands**
- Introduce domain-specific abbreviations: "When instructing to rename variables, say `renameVar(old, new)`; the agent maps this to the ASTRefactor tool under the hood."

**4. Reason-Encouraging Phrases**
- Add: "Think about type safety before choosing a patch tool."
- Promotes deeper reasoning so the agent doesn't just apply surface-level text replacements.

## Example

```mermaid
flowchart TD
    A[User Prompt: "Refactor validation logic"] --> B[Augmented Prompt]
    B --> C["Please use ASTRefactor to update function signatures"]
    C --> D[Agent selects ASTRefactor]
    D --> E[ASTRefactorTool patches code]
```

## How to use it

- **Tool Registry:** Expose tool metadata (name, usage example, input schema) in the agent's initialization context.
- **Prompt Templates:** Create reusable templates with placeholders, e.g.:
  ```
  "Task: {task_description}. Preferred tool: {tool_name}.  
  Usage example: {tool_usage_snippet}."
  ```
- **Fallback Handling:** If the agent ignores the instruction and uses the wrong tool, include a directive: "If ASTRefactor fails, fallback to apply_patch."

## Trade-offs

- **Pros:**
  - **Predictable Behavior:** Reduces variance in tool usage for the same task.
  - **Higher Code Quality:** Ensures the agent uses semantically safe tools (e.g., AST-based) over string-based replacements.
- **Cons/Considerations:**
  - **Prompt Length:** Excessive tool documentation in the prompt can consume valuable tokens.
  - **Maintenance:** As new patching tools emerge, templates and tool registry need periodic updates.

## References

- Adapted from "Tool Use Steering via Prompting" in Claude Code best practices.
- Will Brown's notes on "if you want it to be a tool use agent" you must decide that's the default behavior in the prompt.