---
title: Agentic Search Over Vector Embeddings
status: best-practice
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Cat Wu (Anthropic)", "Boris Cherny (Anthropic)"]
category: "Tool Use & Environment"
source: "https://every.to/podcast/transcript-how-to-use-claude-code-like-the-people-who-built-it"
tags: [search, vector-embeddings, bash, grep, RAG, agentic-RAG, maintenance]
---

## Problem

Vector embeddings for code search require:

- Continuous re-indexing as code changes
- Handling local uncommitted changes
- Additional security surface area for enterprise deployments
- Infrastructure overhead (embedding models, vector databases)
- Stale indices when developers work on multiple branches

Traditional RAG approaches add complexity that may not be necessary with modern capable LLMs.

## Solution

Replace vector search with **agentic search** using bash, grep, file traversal, and other command-line tools. Modern LLMs are skilled enough at using search tools iteratively to achieve comparable accuracy without the maintenance burden of vector indices.

**Key approach:**

1. **Tool-based search**: Provide grep, ripgrep, find, ls, and other search utilities
2. **Iterative refinement**: Let the agent search multiple times, narrowing results
3. **No pre-indexing**: Search happens on-demand against current file state
4. **Optional MCP integration**: If teams want semantic search, expose it via MCP tool

```pseudo
# Instead of:
vector_db.index(codebase)  # requires continuous updates
results = vector_db.query(embedding(query))

# Use:
agent.call_tool("grep", pattern="function.*authenticate")
agent.call_tool("find", pattern="**/auth/*.ts")
agent.refine_search_based_on_results()
```

## How to use it

**When to use agentic search:**

- Code bases with frequent changes
- Teams without dedicated vector infrastructure
- Security-sensitive deployments (fewer external dependencies)
- Local development where files change constantly
- Multi-branch workflows

**Implementation:**

1. Provide comprehensive search tools (grep, ripgrep, find, fd, ast-grep)
2. Give agent permission to search iteratively
3. Optimize for fast tool execution rather than perfect first results
4. Let agent learn search strategies through system prompts

**Claude Code example:**

Claude Code initially used vector embeddings but switched to pure agentic search for:

- **Cleaner deployment**: No indexing step, works immediately
- **Local changes**: Always searches current file state
- **Security**: Reduced attack surface for enterprise
- **Accuracy**: Comparable results with Sonnet 4+ models

## Trade-offs

**Pros:**

- No indexing infrastructure to maintain
- Always searches current state (no stale results)
- Works with local uncommitted changes
- Simpler security model
- Faster setup for new repositories
- No embedding model costs

**Cons:**

- May require multiple search iterations (more tokens)
- Slower on very large codebases (millions of files)
- Less semantic understanding (e.g., "authentication" vs "login")
- Requires capable models (Sonnet 4+) for good results
- Higher latency for complex queries

## References

* Cat Wu (Anthropic): "We did use vector embeddings initially. They're really tricky to maintain because you have to continuously re-index... Claude is really good at agentic search. You can get to the same accuracy level with agentic search and it's just a much cleaner deployment story."
* Cat Wu: "If you do want to bring semantic search to Claude Code, you can do so via an MCP tool."
* [AI & I Podcast: How to Use Claude Code Like the People Who Built It](https://every.to/podcast/transcript-how-to-use-claude-code-like-the-people-who-built-it)
