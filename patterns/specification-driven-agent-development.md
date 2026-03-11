---
title: Specification-Driven Agent Development
status: proposed
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Jory Pestorious (AI Engineer World's Fair 2025)"]
category: Orchestration & Control
source: "http://jorypestorious.com/blog/ai-engineer-spec/"
tags: [spec-first, scaffolding, contract, requirements]
---

## Problem

Hand-crafted prompts or loose user stories leave room for ambiguity; agents can wander, over-interpret, or produce code that conflicts with stakeholder intent.

## Solution

Adopt a **spec-first workflow** in which a formal specification file (e.g., Markdown, OpenAPI, JSON Schema) is the agent's *primary* input and source of truth.

- **Parse spec** → agent builds an explicit task graph.
- **Scaffold** project structure & stub code straight from the spec.
- **Enforce** that every generated artifact links back to a spec clause.
- **Iterate** only by editing the spec, *not* by re-prompting ad-hoc.

```pseudo
if new_feature_requested:
    write_spec(update)
    agent.sync_with(spec)
```

**Core Framework (SPEC/EXPOSURE/TASK DELTA):**
- **SPEC**: Version-controlled markdown capturing intent and values
- **EXPOSURE**: What customers experience; spec is permanent, code is temporary
- **TASK DELTA**: Continuous loop evaluating SPEC ↔ PRODUCT to identify gaps

## How to use it

Write specifications first (Markdown files in git), then let agents scaffold from them. Documentation IS the spec—write it before code.

Use tiered review: AI for patterns, humans for logic. Parallelize via git worktrees or multiple agents coordinating through shared spec files.

Pitfalls: coarse or under-specified requirements still propagate errors.

## Trade-offs

- **Pros:** repeatable, audit-friendly, easy diffing.
- **Cons:** up-front spec writing effort; initial ramp-up for teams new to spec formats.

## References

- Primary source: http://jorypestorious.com/blog/ai-engineer-spec/ (AI Engineer World's Fair 2025)
- Anthropic Engineering: https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
- Parisien et al. (2024): "Deliberation Before Action" (ICLR 2024) - https://arxiv.org/abs/2403.05441
