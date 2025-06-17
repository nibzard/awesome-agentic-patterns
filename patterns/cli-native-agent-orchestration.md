---
title: CLI-Native Agent Orchestration
status: proposed
authors: ["Jory Pestorious"]
category: Tool Use & Environment
source_link: "http://jorypestorious.com/blog/ai-engineer-spec/"
tags: [cli, automation, local-dev, headless]
---

## Problem
Web chat UIs are awkward for repeat runs, local file edits, or scripting inside CI pipelines.

## Solution
Expose agent capabilities through a **first-class command-line interface** (here: *Claude CLI*).

- `claude spec run` — generate/update code from a spec file.  
- `claude spec test` — run the Spec-As-Test suite.  
- `claude repl` — drop into an interactive shell with all project context pre-loaded.

Developers can integrate these commands in Makefiles, Git hooks, or cron jobs, enabling headless automation and faster local loops.

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

## References
- "Claude CLI" explicitly named in the HTML keywords.