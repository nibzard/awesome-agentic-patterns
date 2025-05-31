---
title: Curated Context Window
status: validated-in-production
authors: ["Thorsten Ball"]
category: Context & Memory
tags: [context, memory, accuracy]
---

## Problem
Dumping "everything" into context introduces noise; irrelevant files bias the agent.

## Solution
Keep the primary agent's context **sterile**: only high-signal files plus the task spec.
Spawn helper agents (e.g., *search agent*) whose noisy exploration never pollutes the main window.

## Example
```mermaid
sequenceDiagram
  Main->>SearchAgent: "Find User model usages"
  SearchAgent->>Repo: ripgrep User
  SearchAgent-->>Main: summary list of 8 files
  Main->>Files: open top-ranked matches
  Main->>Tool: edit_file
```

## References

* Raising An Agent - Episode 3's "context is sacred" + dedicated search agent pattern.

[Source](https://www.nibzard.com/ampcode)