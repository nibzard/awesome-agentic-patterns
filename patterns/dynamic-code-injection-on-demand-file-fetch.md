---
title: "Dynamic Code Injection (On-Demand File Fetch)"
status: "Established"
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Internal AI Dev Team"]
category: "Tool Use & Environment"
source_link: "Internal Practice"
tags: [file-injection, at-mention, slash-commands, IDE-integration]
---

## Problem

During an interactive coding session, a user or agent may need to inspect or modify files **not originally loaded** into the main context. Manually copying/pasting entire files into the prompt is:

- Tedious and error-prone.
- Wastes tokens on boilerplate (e.g., large config files).
- Interrupts workflow momentum when switching between the editor and chat.

## Solution

Allow **on-demand file injection** via special syntax (e.g., `@filename` or `/load file`) that automatically:

**1. Fetches the requested file(s)** from disk or version control.
**2. Summarizes** or **extracts** only the relevant portions (e.g., function bodies or specific line ranges) if the file is large.
**3. Injects** that snippet into the agent's current context, seamlessly extending its "memory" for the ongoing task.

Concretely:

- A user types `/load src/components/Button.js:lines 10–50` or `@src/setup/db.js`.
- The agent's preprocessor intercepts this command, reads the specified file (or line range), and replaces the command with the file content (or trimmed snippet).
- The rest of the prompt remains unchanged, so the agent can continue reasoning without restarting the conversation.

## How to use it

- **Command Syntax Examples:**
  - `@path/to/file.ext` → loads entire file if < 2,000 tokens; otherwise runs a heuristic summarizer.
  - `/load path/to/file.ext:10-50` → loads exactly lines 10 through 50.
  - `/summarize path/to/test_spec.py` → runs a summary routine (e.g., extract docstrings + test names).

- **Implementation Steps:**
  1. Build a **listener** in your chat frontend or CLI that recognizes `@` and `/load` tokens.
  2. Map recognized tokens to file paths; verify permissions if outside project root.
  3. Read file text, run a **line-range parser** or **AST-based snippet extractor** if needed.
  4. Replace the token in the outgoing prompt with `/// BEGIN <filename> …content… /// END <filename>`.
  5. Forward the augmented prompt to the LLM for inference.

- **Common Pitfalls:**
  - Untrusted file paths: agent must validate that `@../../../etc/passwd` (for example) is disallowed.
  - Large injected files: if file > 4,096 tokens, automatically run a **summarizer sub-routine** to extract only function/method definitions.

## Trade-offs

- **Pros:**
  - Enables **interactive exploration** of code without leaving the chat environment.
  - Reduces human overhead: no manual copy/paste of code blocks.
  - Improves agent accuracy by ensuring the most relevant code is directly visible.

- **Cons/Considerations:**
  - Requires the chat interface (or a proxy server) to have **local file system access**.
  - Potential security risk: if the agent can load arbitrary files, it could exfiltrate sensitive credentials unless carefully sandboxed.
  - Summarization heuristics may omit subtle context (e.g., private helper functions).

## References

- Adapted from "Dynamic Context Injection" patterns (e.g., at-mention in Claude Code) for general coding-agent use.
- Common in AI-powered IDE plugins (e.g., GitHub Copilot X live code browsing).