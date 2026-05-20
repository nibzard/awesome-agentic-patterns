---
title: Cross-Agent Lesson Sharing via Git
status: validated-in-production
authors: ["MisakaNet community"]
based_on: ["MisakaNet", "GitHub Issues"]
category: Context & Memory
source: "https://github.com/Ikalus1988/MisakaNet"
tags: [distributed-memory, knowledge-sharing, git-based, swarm-memory, lessons-learned]
---

## Problem

AI agents working in isolation waste hours debugging issues that other agents have already solved. ChromaDB crashes on NTFS, pip install fails on WSL encoding, Feishu webhook URLs get committed to git — each agent discovers these independently. There is no mechanism for one agent's debugging session to benefit the entire fleet.

## Solution

Use **Git as the shared memory substrate** and **GitHub Issues as the message bus** for cross-agent knowledge sharing:

1. When an agent solves a non-trivial problem, it writes a structured "lesson" (markdown with problem/fix/verify sections) and pushes to a shared `lessons/` directory.
2. Other agents pull the repo and search lessons before debugging — `grep` or semantic search over markdown files.
3. GitHub Issues serve as the coordination layer: agents post proposals, humans (or hub agents) review and merge.
4. Each node maintains a full copy of the knowledge base, enabling offline operation and natural conflict resolution via Git merge.

Key design decisions:
- **Markdown for lessons** — human-readable, git-diffable, searchable with standard tools
- **GitHub Issues as message bus** — zero infrastructure, built-in auth, web UI for humans
- **Git for sync** — offline-first, conflict-resilient, every node has full history
- **Hub-spoke with optional arbitration** — a central hub can validate and deduplicate lessons, but nodes work independently when the hub is offline

Example lesson structure:
```markdown
---
title: ChromaDB crashes on NTFS
domain: devops
status: published
confidence: 0.9
---

## Problem
ChromaDB fails with "Invalid cross-device link" on NTFS-mounted WSL paths.

## Fix
Set `CHROMA_CACHE_DIR` to a native ext4 path:
export CHROMA_CACHE_DIR=/tmp/chroma-cache

## Verify
python3 -c "import chromadb; chromadb.Client()"
```

## Trade-offs

**Pros:** Every debugging session benefits the entire fleet; knowledge compounds over time; works offline; no additional infrastructure beyond GitHub.
**Cons:** Requires discipline to write lessons; stale lessons can mislead; merge conflicts possible (but rare for append-heavy workloads); GitHub rate limits on API access.

## How to use it

1. Set up a shared Git repository with a `lessons/` directory.
2. Define a lesson template (problem/fix/verify with YAML frontmatter for metadata).
3. After solving a non-trivial problem, agents write a lesson and push via PR or direct commit.
4. Before debugging, agents search the lessons directory: `grep -r "keyword" lessons/` or use semantic search.
5. Optionally, set up a hub agent that validates proposals, deduplicates similar lessons, and maintains an index.

For a production implementation, see [MisakaNet](https://github.com/Ikalus1988/MisakaNet) — 104+ shared lessons across 7 domains, 21+ registered nodes.
