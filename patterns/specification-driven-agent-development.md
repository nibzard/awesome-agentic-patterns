---
title: Specification-Driven Agent Development
status: emerging
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Jory Pestorious (AI Engineer World's Fair 2025)"]
category: Orchestration & Control
source: "https://jorypestorious.com/blog/ai-engineer-spec/"
tags: [spec-first, scaffolding, contract, requirements, validation, drift-detection, continuous-testing]
summary: "Makes a version-controlled spec the agent's main input, scaffolds code from it, and regenerates executable tests from it on every commit to catch drift"
signals: ["Loose prompts cause agents to drift from stakeholder intent", "Requirements can be written as Markdown, OpenAPI, or JSON Schema", "Team needs audit trails from code back to requirements", "Spec and code change often and drift apart"]
anti_signals: ["Requirements are too coarse or unknown to specify", "Quick exploratory work where writing a spec costs more than it saves", "CI capacity cannot run generated tests on each commit"]
updated_at: "2026-11-23"
---

## Problem

Hand-crafted prompts or loose user stories leave room for ambiguity; agents can wander, over-interpret, or produce code that conflicts with stakeholder intent.

A spec fixes that at the start, but it introduces a second problem. Even in spec-first projects, implementations drift as code evolves and the spec changes (or vice-versa). Silent divergence erodes the trust the spec was meant to provide.

## Solution

Adopt a **spec-first workflow** in which a formal specification file (e.g., Markdown, OpenAPI, JSON Schema) is the agent's *primary* input and source of truth, and then keep that spec executable for the life of the project.

- **Parse spec** → agent builds an explicit task graph.
- **Scaffold** project structure & stub code straight from the spec.
- **Enforce** that every generated artifact links back to a spec clause.
- **Iterate** only by editing the spec, *not* by re-prompting ad-hoc.
- **Verify** by regenerating executable tests from the spec on every change.

```pseudo
if new_feature_requested:
    write_spec(update)
    agent.sync_with(spec)
    regenerate_tests(spec)
```

**Core Framework (SPEC/EXPOSURE/TASK DELTA):**

- **SPEC**: Version-controlled markdown capturing intent and values
- **EXPOSURE**: What customers experience; spec is permanent, code is temporary
- **TASK DELTA**: Continuous loop evaluating SPEC ↔ PRODUCT to identify gaps

The source article describes TASK DELTA as a human-driven loop: a person re-derives the checks after each spec change. Coding agents make the loop practical to automate, which turns the spec from a one-shot scaffolding input into a continuous feedback mechanism.

**Spec-to-test feedback loop:**

1. **Specification Layer**: Parse specs (structured Markdown, YAML, JSON Schema, BDD) into an internal representation
2. **Test Generation Layer**: Create executable tests (unit, integration, property) from that representation
3. **Execution Layer**: Run tests in parallel in CI on every code commit
4. **Feedback Layer**: Route each failure to an agent-authored PR that either fixes the code to match the spec, or flags the unclear spec segment for human review

**Vendor tooling (2025-2026):** GitHub Spec Kit drives a `/speckit-specify → /speckit-plan → /speckit-tasks → /speckit-implement` command sequence from a constitution and spec documents, and AWS Kiro ships spec-driven agentic development in the editor.

## Evidence

- **Evidence Grade:** `low`
- **Most Valuable Findings:**

  - Academic foundations in QuickCheck (property-based testing) and Design by Contract
  - Effective when combined with [Feature List as Immutable Contract](feature-list-as-immutable-contract.md), which makes the loop immune to "pass by deletion"
  - Test state persists across agent session boundaries, so context loss does not reset verification

- **Unverified:** An earlier claim of production use at Anthropic, OpenAI, and LangChain misattributed training-time and model-eval techniques to this CI pattern and has been removed.

## How to use it

Write specifications first (Markdown files in git), then let agents scaffold from them. Documentation IS the spec: write it before code.

Use tiered review: AI for patterns, humans for logic. Parallelize via git worktrees or multiple agents coordinating through shared spec files.

**Keeping the loop running:**

- Keep the spec in a machine-parseable subset so tests can be regenerated from it.
- Regenerate the derived test suite on every spec commit, not on a schedule, so tests never lag the spec.
- Run generated tests in CI on every code commit and treat a spec-test failure as drift, not as a flaky test.
- Route each failure explicitly: an agent-authored fix PR, or a flagged spec-ambiguity issue for a human.
- Record which spec clause each test came from, so spec edits show exactly which tests must change.

Pitfalls: coarse or under-specified requirements still propagate errors, and ambiguous spec wording produces false-positive test failures.

## Trade-offs

- **Pros:**

  - Repeatable, audit-friendly, easy diffing
  - Catches drift early; prevents silent spec-implementation divergence
  - Provides measurable progress metrics (X/Y features passing)

- **Cons:**

  - Up-front spec writing effort; initial ramp-up for teams new to spec formats
  - Heavy CI usage; overhead exceeds benefit for small or one-off tasks
  - Test explosion risk without intelligent selection; spec churn creates test churn

## References

- Primary source: [The AI Engineer Spec](https://jorypestorious.com/blog/ai-engineer-spec/) - Jory Pestorious (AI Engineer World's Fair 2025), describes the SPEC / EXPOSURE / TASK DELTA loop as a human-driven verification process
- Anthropic Engineering: [Effective Harnesses for Long-Running Agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- [GitHub Spec Kit](https://github.com/github/spec-kit) - spec-driven development toolkit (`/speckit-specify`, `/speckit-plan`, `/speckit-tasks`, `/speckit-implement`, `/speckit-converge`), launched September 2025
- AWS Kiro (spec-driven agentic development): https://kiro.dev
- QuickCheck (Claessen & Hughes, ICFP 2000) - property-based testing foundation
- Related pattern: [Feature List as Immutable Contract](feature-list-as-immutable-contract.md) freezes a JSON feature list with acceptance steps rather than a full specification
