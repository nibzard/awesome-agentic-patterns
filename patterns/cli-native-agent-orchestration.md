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

## Solution

Expose agent capabilities through a **first-class command-line interface** (here: *Claude CLI*).

- `claude spec run` — generate/update code from a spec file.  
- `claude spec test` — run the Spec-As-Test suite.  
- `claude repl` — drop into an interactive shell with all project context pre-loaded.

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

## How to use it

- Start by wrapping one high-friction workflow (for example, spec-to-code generation) in a single CLI command.
- Standardize flags and output formats so scripts can parse outcomes deterministically.
- Add CLI commands to `make` targets and CI jobs before expanding scope.
- Log command invocations and artifact paths for replay and debugging.

## References

- "Claude CLI" explicitly named in the HTML keywords.

- Primary source: http://jorypestorious.com/blog/ai-engineer-spec/
