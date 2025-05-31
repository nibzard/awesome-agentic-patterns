---
title: Rich Feedback Loops > Perfect Prompts
status: validated-in-production
authors: ["Thorsten Ball", "Quinn Slack"]
category: Feedback Loops
tags: [feedback, testing, reliability]
---

## Problem
Polishing a single prompt can't cover every edge-case; agents need ground truth to self-correct.

## Solution
Expose **iterative, machine-readable feedback**—compiler errors, test failures, linter output, screenshots—after every tool call.
The agent uses diagnostics to plan the next step, leading to emergent self-debugging.

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

* Episode 1 & 3 discussions on "give it errors, not bigger prompts."

[Source](https://www.nibzard.com/ampcode)