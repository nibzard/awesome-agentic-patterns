---
title: Sub-Agent Spawning
status: validated-in-production
authors: ["Quinn Slack", "Thorsten Ball"]
category: Orchestration & Control
source_link: "https://www.nibzard.com/ampcode"
tags: [orchestration, context, scalability]
---

## Problem
Large multi-file tasks blow out the main agent's context window and reasoning budget.

## Solution
Let the main agent **spawn focused sub-agents**, each with its own fresh context, to work in parallel on shardable subtasks. Aggregate their results when done.

Recent developments show that improved agent [state externalization capabilities](proactive-agent-state-externalization.md) may make subagent delegation more practical by helping agents better identify which tasks are suitable for delegation and how to communicate necessary context to subagents.

## Example (YAML front-matter refactor)
```mermaid
sequenceDiagram
  MainAgent->>GlobTool: "*.md"
  MainAgent->>TaskTool: spawn 4 sub-agents with 9 files each
  loop per SubAgent
      SubAgent->>Files: update front-matter
      SubAgent->>Git: commit
  end
  MainAgent->>Git: merge branches ➜ single PR
```

## References

* Raising An Agent - Episode 6: Claude 4 Sonnet edits 36 blog posts via four sub-agents.
* [Cognition AI: Devin & Claude Sonnet 4.5](https://cognition.ai/blog/devin-sonnet-4-5-lessons-and-challenges) - discusses how improved model judgment about state externalization may make subagent delegation more practical

[Source](https://www.nibzard.com/ampcode)