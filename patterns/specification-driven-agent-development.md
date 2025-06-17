---
title: Specification-Driven Agent Development
status: proposed
authors: ["Jory Pestorious (AI Engineer World's Fair 2025)"]
category: Orchestration & Control
source_link: "http://jorypestorious.com/blog/ai-engineer-spec/"
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

## How to use it
Give the agent a well-structured spec file, then run `claude spec run`.
Pitfalls: coarse or under-specified requirements still propagate errors.

## Trade-offs

- **Pros:** repeatable, audit-friendly, easy diffing.
- **Cons:** up-front spec writing effort; initial ramp-up for teams new to spec formats.

## References
- Talk teaser in the World's Fair meta-description about "shift to specification-driven development."