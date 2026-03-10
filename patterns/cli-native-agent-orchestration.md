---
title: CLI-Native Agent Orchestration
status: proposed
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Jory Pestorious"]
category: Tool Use & Environment
source: "http://jorypestorious.com/blog/ai-engineer-spec/"
tags: [cli, automation, local-dev, headless]
---

## Problem

Most agent workflows start in chat UIs that are optimized for one-off conversations, not repeatable engineering operations. Teams struggle to automate runs, compose agent steps with existing shell tools, and enforce the same behavior in local development and CI. Without a CLI surface, orchestration logic becomes manual and hard to reproduce.

The CLI-Native approach applies 50+ years of Unix design principles—modularity, composition, and explicit execution—to agent orchestration.

## Solution

Expose agent capabilities through a **first-class command-line interface** (here: *Claude CLI*).

- `claude spec run` — generate/update code from a spec file.
- `claude spec test` — run the Spec-As-Test suite.
- `claude repl` — drop into an interactive shell with all project context pre-loaded.

**Key mechanisms:**
- **Structured output**: JSON for scripts (`--json` flag), human-readable for terminals
- **Exit code semantics**: `0` for success, non-zero for failure
- **TTY detection**: Auto-switch output format based on execution context

Developers can integrate these commands into Makefiles, Git hooks, cron jobs, and CI workflows. The CLI becomes the stable contract between humans, scripts, and automation systems, enabling headless operation with auditable command history.

## Example

```bash
# In your project Makefile
generate-from-spec:
	claude spec run --input api.yaml --output src/

test-spec-compliance:
	claude spec test --spec api.yaml --codebase src/

# Git pre-commit hook
claude spec test || exit 1
```

## Trade-offs

- **Pros:** scriptable, works offline with local context, easy to embed in other tools.
- **Cons:** initial install & auth; learning curve for CLI flags.

**When NOT to use:** exploratory tasks with unclear next steps; real-time conversational workflows; high-frequency operation (>100 calls/sec).

## How to use it

- Start by wrapping one high-friction workflow (for example, spec-to-code generation) in a single CLI command.
- Standardize flags and output formats so scripts can parse outcomes deterministically.
- Add CLI commands to `make` targets and CI jobs before expanding scope.
- Log command invocations and artifact paths for replay and debugging.

## References

- Primary source: http://jorypestorious.com/blog/ai-engineer-spec/
- "Why Human-Agent Systems Should Precede AI Autonomy" (arXiv:2506.09420, 2025) — supports CLI transparency for human oversight
- The Art of Unix Programming — Eric S. Raymond (2003) — 17 design rules applicable to agent orchestration
