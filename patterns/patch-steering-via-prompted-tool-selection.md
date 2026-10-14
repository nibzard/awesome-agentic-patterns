---
title: "Patch Steering via Prompted Tool Selection"
status: emerging
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Tool Use Steering via Prompting (this catalogue)", "Aider unified-diff benchmarks"]
category: "Tool Use & Environment"
source: "https://aider.chat/docs/unified-diffs.html"
tags: [patching, prompt-steering, tool-selection, coding-agent]
summary: "Tells the agent in the prompt which patch tool or edit format to use, with usage examples, negative rules, and a fallback order"
signals: ["Coding agent has several patching tools, such as text search/replace, AST-aware, and semantic", "Agent uses raw text replacement for refactors and breaks references", "Edit-format choice varies between runs for the same task"]
anti_signals: ["Agent has only one patching tool", "Token budget cannot hold tool documentation in the prompt"]
updated_at: "2026-10-13"
---

## Problem

Coding agents with access to multiple patching or refactoring tools (text-based search/replace, AST-based refactoring, semantic migration) may choose suboptimal tools if not explicitly guided. This leads to:

- **Unnecessary complexity:** the agent picks a generic text-replace tool instead of a specialized AST-aware refactoring tool.
- **Inconsistent results:** without explicit instructions, tool selection varies between runs for the same task.
- **Safety risks:** text-based patching on refactoring tasks can break imports, miss references, or introduce syntax errors.

The edit-format choice is measurable. In aider's refactoring benchmark, prompting GPT-4 Turbo to emit unified diffs instead of the previous search/replace block format raised the score from 20% to 61%, and lazy "rest of code unchanged" edits dropped from 12 of 89 tasks to 4. The patch format the prompt asks for is part of the tool interface.

## Solution

**Steer** the agent's patch-tool and edit-format selection through explicit natural language instructions in the prompt. This pattern is the patch-tool specialization of the catalogue's [Tool Use Steering via Prompting](tool-use-steering-via-prompting.md); apply that general pattern when the tools in question are anything other than code-editing tools.

Patch-specific techniques:

**1. Name the tool and the format**

- Prepend: "Use the `apply_patch` tool to insert a new function `validate_input` in `auth_service.py`."
- When the model's own edit format is the variable, specify it: "Return a unified diff, one hunk per function."

**2. Teach the tool in the prompt**

- Provide a mini-manual in the context:

```text
"Our `ASTRefactor` tool takes JSON describing node edits:
{"file": string, "pattern": string, "replacement": string}.
Use it for safe refactors rather than raw sed commands."
```

**3. Prefer familiar, forgiving formats**

- Aider's benchmarks found that simple, familiar formats (unified diffs) beat structured formats such as JSON tool calls for code edits, because escaping code is error-prone, and that flexibly applying imperfect patches mattered: strict application increased editing errors about 9x.

**4. Negative constraints and fallback order**

- Specify what NOT to use: "Do NOT use text-based patching for signature changes (it breaks imports)."
- Specify a fallback chain: semantic → AST → text, for when the safer tool fails.

## Example

```mermaid
flowchart TD
    A[User Prompt: "Refactor validation logic"] --> B[Augmented Prompt]
    B --> C["Use ASTRefactor for signature changes; fallback to apply_patch"]
    C --> D[Agent selects ASTRefactor]
    D --> E[ASTRefactor patches code safely]
    E -->|ASTRefactor fails| F[apply_patch fallback]
```

## How to use it

- **Tool registry:** expose tool metadata (name, usage example, input schema, capabilities and limits) in the agent's initialization context, with `use_when` and `avoid_when` criteria per tool.
- **Prompt templates:** reuse templates with placeholders, for example `"Task: {task_description}. Preferred tool: {tool_name}. Usage example: {tool_usage_snippet}."`
- **Fallback handling:** add a directive such as "If ASTRefactor fails, fall back to apply_patch," and test the chain.

## Trade-offs

- **Pros:**
  - **Predictable behavior:** reduces variance in tool usage for the same task.
  - **Higher code quality:** steers the agent to semantically safe tools and formats for the task.
  - **Measured effect:** edit-format steering shows large benchmark deltas (aider: 20% to 61% on GPT-4 Turbo).
- **Cons/Considerations:**
  - **Prompt length:** tool documentation consumes tokens.
  - **Maintenance:** as patching tools change, templates and the tool registry need updates.
  - **Format lock-in:** a format chosen for one model may not be optimal for the next; re-run benchmarks when the model changes.

## References

- Primary source: [Unified diffs make GPT-4 Turbo 3X less lazy](https://aider.chat/docs/unified-diffs.html) — aider's write-up of prompting GPT to produce unified diffs, with refactoring benchmark results (20% to 61%) and experiments over alternative edit formats. It covers edit-format steering for code changes, not multi-tool registries.
- Parent pattern: [Tool Use Steering via Prompting](tool-use-steering-via-prompting.md) — the general technique this file specializes.
- Yao, S. et al. (2022). "ReAct: Synergizing Reasoning and Acting in Language Models." ICLR 2023. https://arxiv.org/abs/2210.03629 — general foundation for interleaved reasoning and tool use; not patch-specific.
- An earlier revision cited a Prime Intellect talk on agentic RL as the primary source; that talk does not discuss patch-tool steering, so it was removed.
