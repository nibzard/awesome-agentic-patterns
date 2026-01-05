---
title: Episodic Memory Retrieval & Injection
status: validated-in-production
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Cursor AI (MCP)", "Windsurf Flows"]
category: Context & Memory
source: "https://forum.cursor.com/t/agentic-memory-management-for-cursor/78021"
tags: [episodic-memory, vector-db, retrieval-augmented, context-hint]
---

## Problem
Stateless calls make agents forget prior decisions, causing repetition and shallow reasoning.

## Solution
Add a **vector-backed episodic memory store**:

1. After every episode, write a short "memory blob" (event, outcome, rationale) to the DB.  
2. On new tasks, embed the prompt, retrieve top-k similar memories, and inject as *hints* in the context.  
3. Apply TTL or decay scoring to prune stale memories.

## Trade-offs
**Pros:** richer continuity, fewer repeated mistakes.  
**Cons:** retrieval noise if memories aren't curated; storage cost.

## References
- Cursor "10x-MCP" persistent memory layer
- Windsurf Memories docs