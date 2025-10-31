---
title: Rich Feedback Loops > Perfect Prompts
status: validated-in-production
authors: ["Thorsten Ball", "Quinn Slack"]
category: Feedback Loops
source_link: "https://www.nibzard.com/ampcode"
tags: [feedback, testing, reliability]
---

## Problem
Polishing a single prompt can't cover every edge-case; agents need ground truth to self-correct.

## Solution
Expose **iterative, machine-readable feedback**—compiler errors, test failures, linter output, screenshots—after every tool call.
The agent uses diagnostics to plan the next step, leading to emergent self-debugging.

Modern models like Claude Sonnet 4.5 are increasingly proactive in creating their own feedback loops by writing and executing short scripts and tests, even for seemingly simple verification tasks (e.g., using HTML inspection to verify React app behavior).

## Example
```mermaid
sequenceDiagram
  Agent->>CLI: go test ./...
  CLI-->>Agent: FAIL pkg/auth auth_test.go:42 expected 200 got 500
  Agent->>File: open auth.go
  Agent->>File: patch route handler
  Agent->>CLI: go test ./...
  CLI-->>Agent: PASS 87/87 tests
```

## References

* Raising An Agent - Episode 1 & 3 discussions on "give it errors, not bigger prompts."
* [Cognition AI: Devin & Claude Sonnet 4.5](https://cognition.ai/blog/devin-sonnet-4-5-lessons-and-challenges) - observes proactive testing behavior and custom script creation for feedback loops

[Source](https://www.nibzard.com/ampcode)