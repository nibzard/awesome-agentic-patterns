---
title: Session-Scoped Context Runtime for Agent Tools
status: emerging
authors: ["Yves Gugger (@yvgude)"]
based_on: ["Anthropic Model Context Protocol Specification"]
category: "Context & Memory"
source: "https://github.com/yvgude/lean-ctx"
tags: [mcp, context-compression, session-cache, agent-tools, coding-assistants]
summary: "Interpose a context runtime that caches structured reads and normalizes tool output so sessions reuse compact representations instead of repeating raw tokens."
signals: ["Coding agents read the same files and command outputs many times per session", "Repeated raw tool output drives up cost and latency", "The host can route tools through an MCP server"]
anti_signals: ["Short sessions with few repeated reads", "Agents cannot be pointed at the runtime consistently"]
tools: [mcp-server, editor-integration]
domains: [coding]
updated_at: "2026-10-13"
---

## Problem

Coding agents read the same files and command outputs many times per session. Each hop typically pastes full text into the model context, so cost and latency grow with repetition and verbosity even when the underlying artifact has not changed.

## Solution

Introduce a **context runtime** alongside the agent—commonly as an MCP server—that owns how workspace state enters the model:

1. **Cached reads** for read operations with cheap revalidation (for example, file mtime) so identical reads return compact references instead of full payloads.
2. **Structured read modes** (for example, dependency maps, signatures, diffs, or task-filtered excerpts) so the agent requests the smallest representation that still supports the next decision.
3. **Normalized tool channels** so shell and search results pass through compressing adapters where patterns are stable (for example, common `git` or package-manager shapes).

The runtime sits between the IDE or host and the model: tools call into it first; it returns compact, typed context and records what is already hot in-session.

The reference implementation has outgrown the session scope: lean-ctx now also persists session memory and a project knowledge graph across chats (task and fact history that survives compaction), exports that state as a portable `.ctxpkg` package, and enforces configured path permissions, content filters, and context budgets on calls that pass through it. Treat the pattern as a workspace-level context layer with a session-scoped cache, not a cache that dies with the session.

```pseudo
on_tool_read(path, mode):
  if cache_valid(path): return cache_entry(path, mode)
  ast_or_text = load_and_parse(path)
  projected = project(ast_or_text, mode)  // map | signatures | diff | ...
  store_cache(path, mode, projected)
  return projected
```

## How to use it

- Expose read, search, shell, and tree operations through the runtime so routing is consistent.
- Default to a neutral automatic mode, then tighten to maps or signatures when the task only needs structure.
- Invalidate or refresh on explicit edits, branch changes, or when the host signals a new subagent boundary.
- Pair with existing context hygiene patterns (for example, auto-compaction or minimization) so hot cache entries still respect global window budgets.

## Trade-offs

- **Pros:** Fewer redundant tokens on repeated exploration; easier enforcement of “structure-first” context; can centralize policy for what leaves the workspace.
- **Cons:** Additional moving parts and correctness responsibility (cache staleness, mode selection bugs); host integration work; behavior differs from stock tools unless agents are pointed at the runtime consistently.
- **Evidence caveat:** the only public implementation cited here is the tool author's own repository (3.9k stars); no independent production adoption has been verified, so treat the reported compression behavior as vendor-reported until you measure it.

## References

- lean-ctx (reference implementation; Trust Core under Apache-2.0): https://github.com/yvgude/lean-ctx
- Model Context Protocol specification: https://modelcontextprotocol.io/
- Related catalogue patterns: [MCP Pattern Injection](mcp-pattern-injection.md), [Context-Minimization Pattern](context-minimization-pattern.md), [Semantic Context Filtering Pattern](semantic-context-filtering.md)
- Distinct from [Semantic Context Filtering Pattern](semantic-context-filtering.md): that pattern transforms one raw input (HTML, API response) into its semantic elements at the edge, while this one interposes a persistent runtime that caches and projects every workspace read across a session
