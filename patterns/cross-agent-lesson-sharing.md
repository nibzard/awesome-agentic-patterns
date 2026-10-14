---
title: Cross-Agent Lesson Sharing via Git
status: emerging
authors: ["MisakaNet community"]
based_on: ["MisakaNet", "GitHub Issues"]
category: Context & Memory
source: "https://github.com/Ikalus1988/MisakaNet"
tags: [distributed-memory, knowledge-sharing, git-based, swarm-memory, lessons-learned]
summary: "Agents write solved problems as markdown lessons in a shared Git repo and search them before debugging, with GitHub Issues as the coordination layer"
signals: ["Several agents hit the same environment or tooling problems independently", "Agents need shared knowledge that works offline", "You want to avoid infrastructure beyond Git and GitHub"]
anti_signals: ["A single agent with no fleet to share lessons with", "No one maintains lessons, so stale entries would mislead agents"]
updated_at: "2026-10-13"
---

## Problem

AI agents working in isolation waste hours debugging issues that other agents have already solved. ChromaDB crashes on NTFS, pip install fails on WSL encoding, Feishu webhook URLs get committed to git — each agent discovers these independently. There is no mechanism for one agent's debugging session to benefit the entire fleet.

## Solution

Use **Git as the shared memory substrate** and **GitHub Issues as the message bus** for cross-agent knowledge sharing:

1. When an agent solves a non-trivial problem, it writes a structured "lesson" (markdown with problem/fix/verify sections) and pushes to a shared `lessons/` directory.
2. Other agents pull the repo and search lessons before debugging — MisakaNet retrieves with BM25 keyword search over the markdown files, built on the Python standard library with no vector database or embedding model.
3. Intake flows through an MCP tool (`misakanet_submit_intake`) or a GitHub Issue template: agents submit a short failure note, and lessons are reviewed like code with DCO-signed commits before they merge.
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
tags: [chromadb, wsl, ntfs]
status: published
evidence_level: "E2"
---

## Problem
ChromaDB fails with "Invalid cross-device link" on NTFS-mounted WSL paths.

## Root Cause
The cache directory sits on a filesystem that does not support the link
operations ChromaDB uses.

## Solution
Set `CHROMA_CACHE_DIR` to a native ext4 path:
export CHROMA_CACHE_DIR=/tmp/chroma-cache

## Verification
python3 -c "import chromadb; chromadb.Client()"
```

## How to use it

1. Set up a shared Git repository with a `lessons/` directory.
2. Define a lesson template (problem/fix/verify with YAML frontmatter for metadata).
3. After solving a non-trivial problem, agents write a lesson and push via PR or direct commit.
4. Before debugging, agents search the lessons corpus: MisakaNet uses BM25 keyword search; a plain `grep -r "keyword" lessons/` is the minimal local equivalent.
5. Optionally, set up a hub agent that validates proposals, deduplicates similar lessons, and maintains an index.

For a reference implementation, see [MisakaNet](https://github.com/Ikalus1988/MisakaNet). Its README carries a live lesson-count badge, and its corpus spans domains such as rag, devops, docker, mcp, network, ci, and wsl. The project publishes its own maturity caveats, noting that whether search finds the right lesson for a described failure "is measured nowhere yet".

## Trade-offs

**Pros:** Every debugging session benefits the entire fleet; knowledge compounds over time; works offline; no additional infrastructure beyond GitHub.
**Cons:** Requires discipline to write lessons; stale lessons can mislead; merge conflicts possible (but rare for append-heavy workloads); GitHub rate limits on API access.

## References

- [MisakaNet](https://github.com/Ikalus1988/MisakaNet) — the reference implementation: a git-backed lesson corpus retrieved with BM25 over the Python standard library, plus an MCP intake tool (`misakanet_submit_intake`)
- [Lesson template](https://github.com/Ikalus1988/MisakaNet/blob/main/lessons/TEMPLATE.md) — the required front-matter fields (`title`, `domain`, `tags`, `status`, `evidence_level`) and the Problem → Root Cause → Solution → Verification section order
- [New-lesson issue template](https://github.com/Ikalus1988/MisakaNet/blob/main/.github/ISSUE_TEMPLATE/new-lesson.yml) — the GitHub Issue intake path for a short failure note
- [Limitations](https://github.com/Ikalus1988/MisakaNet/blob/main/docs/LIMITATIONS.md) — the project's own honesty caveats about evidence levels and unmeasured retrieval quality
