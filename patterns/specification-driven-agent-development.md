---
title: Specification-Driven Agent Development
status: emerging
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Jory Pestorious (AI Engineer World's Fair 2025)"]
category: Orchestration & Control
source: "https://jorypestorious.com/blog/ai-engineer-spec/"
tags: [spec-first, scaffolding, contract, requirements]
summary: "Makes a version-controlled spec file the agent's main input, scaffolds code from it, and links each artifact back to a spec clause"
signals: ["Loose prompts cause agents to drift from stakeholder intent", "Requirements can be written as Markdown, OpenAPI, or JSON Schema", "Team needs audit trails from code back to requirements"]
anti_signals: ["Requirements are too coarse or unknown to specify", "Quick exploratory work where writing a spec costs more than it saves"]
updated_at: "2026-10-13"
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

**Vendor tooling (2025-2026):** GitHub Spec Kit drives a `/specify → /plan → /tasks → /implement` command sequence from a constitution and spec documents, and AWS Kiro ships spec-driven agentic development in the editor.

## How to use it

Write specifications first (Markdown files in git), then let agents scaffold from them. Documentation IS the spec—write it before code.

Use tiered review: AI for patterns, humans for logic. Parallelize via git worktrees or multiple agents coordinating through shared spec files.

Pitfalls: coarse or under-specified requirements still propagate errors.

## Trade-offs

- **Pros:** repeatable, audit-friendly, easy diffing.
- **Cons:** up-front spec writing effort; initial ramp-up for teams new to spec formats.

## References

- Primary source: https://jorypestorious.com/blog/ai-engineer-spec/ (AI Engineer World's Fair 2025)
- Anthropic Engineering: https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
- GitHub Spec Kit (spec-driven development toolkit, launched September 2025): https://github.com/github/spec-kit
- AWS Kiro (spec-driven agentic development): https://kiro.dev
- Related patterns: [Spec-As-Test Feedback Loop](spec-as-test-feedback-loop.md) turns the spec into executable tests on every commit, while this pattern uses the spec to drive initial construction; [Feature List as Immutable Contract](feature-list-as-immutable-contract.md) freezes a JSON feature list with acceptance steps rather than a full specification.
