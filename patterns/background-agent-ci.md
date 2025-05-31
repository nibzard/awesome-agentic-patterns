---
title: Background Agent with CI Feedback
status: 🔬 validated-in-production
authors: ["Quinn Slack"]
category: Feedback Loops
tags: [asynchronous, ci, feedback]
---

## Problem
Long-running tasks tie up the editor and require developers to babysit the agent.

## Solution
Run the agent **asynchronously**; it pushes a branch, waits for CI, ingests pass/fail output, iterates, and pings the user when green. Perfect for mobile kick-offs (“fix flaky test while I'm at soccer practice”).

## Example (flow)
```mermaid
sequenceDiagram
  Dev->>Agent: "Upgrade to React 19"
  Agent->>Git: push branch react19-upgrade
  Agent-->>CI: trigger tests
  CI-->>Agent: 12 failures
  Agent->>Files: patch imports
  Agent-->>CI: re-run
  CI-->>Agent: ✅ all green
  Agent-->>Dev: PR ready
```

## References

* Episode 6: Background agents use existing CI as the feedback loop.

[Source](https://ampcode.com/manual#background)