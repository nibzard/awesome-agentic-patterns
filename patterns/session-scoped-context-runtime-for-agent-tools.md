---
title: Session-Scoped Context Runtime for Agent Tools
status: emerging
authors: ["Yves Gugger (@yvgude)"]
based_on: ["Anthropic Model Context Protocol Specification"]
category: "Context & Memory"
source: "https://github.com/yvgude/lean-ctx"
tags: [mcp, context-compression, session-cache, agent-tools, coding-assistants]
summary: "Interpose a context runtime that caches structured reads and normalizes tool output so sessions reuse compact representations instead of repeating raw tokens."
tools: [mcp-server, editor-integration]
domains: [coding]
updated_at: "2026-04-29"
---

## Problem

Coding agents read the same files and command outputs many times per session. Each hop typically pastes full text into the model context, so cost and latency grow with repetition and verbosity even when the underlying artifact has not changed.

## Solution

Introduce a **context runtime** alongside the agent—commonly as an MCP server—that owns how workspace state enters the model:

1. **Session-scoped cache** for read operations with cheap revalidation (for example, file mtime) so identical reads collapse to small cache hits instead of full payloads.
2. **Structured read modes** (for example, dependency maps, signatures, diffs, or task-filtered excerpts) so the agent requests the smallest representation that still supports the next decision.
3. **Normalized tool channels** so shell and search results pass through compressing adapters where patterns are stable (for example, common `git` or package-manager shapes).

The runtime sits between the IDE or host and the model: tools call into it first; it returns compact, typed context and records what is already hot in-session.

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

## References

- lean-ctx (Apache-2.0 reference implementation): https://github.com/yvgude/lean-ctx
- Model Context Protocol specification: https://modelcontextprotocol.io/
- Related catalogue patterns: [MCP Pattern Injection](mcp-pattern-injection.md), [Context-Minimization Pattern](context-minimization-pattern.md), [Semantic Context Filtering Pattern](semantic-context-filtering.md)
