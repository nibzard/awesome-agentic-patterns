---
title: Spec-As-Test Feedback Loop
status: emerging
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Jory Pestorious"]
category: Feedback Loops
source: "http://jorypestorious.com/blog/ai-engineer-spec/"
tags: [validation, drift-detection, continuous-testing]
summary: "Generates executable tests from the spec on every spec or code commit and opens agent PRs that fix code or flag unclear spec parts"
signals: ["Project has a formal spec that code must follow", "Spec and code change often and drift apart", "CI can run generated tests on each commit"]
anti_signals: ["Small or one-off tasks with no written spec", "Spec wording is too ambiguous to turn into tests", "CI capacity is limited"]
updated_at: "2026-10-13"
---

## Problem

Even in spec-first projects, implementations can drift as code evolves and the spec changes (or vice-versa). Silent divergence erodes trust.

## Solution

Generate **executable assertions** directly from the spec (e.g., unit or integration tests) and keep them synchronized with every spec change:

- Regenerate the test suite from the latest spec snapshot on each spec commit.
- Run tests in CI on each code commit; if failures appear, route them either to an *agent-authored* PR that:
    
- updates code to match spec, or
    - flags unclear spec segments for human review.

The source article describes a human-driven version of this loop (a person re-derives the checks after each spec change); automated commit-watching and agent-authored PRs are extensions that coding agents now make practical.

This creates a continuous feedback loop ensuring specification and implementation remain synchronized. Distinct from [Specification-Driven Agent Development](specification-driven-agent-development.md) (spec-first scaffolding, which shares this source and the SPEC/EXPOSURE/TASK DELTA framework) and from [Feature List as Immutable Contract](feature-list-as-immutable-contract.md) (an immutable checklist rather than generated tests): this entry is specifically the spec-to-test automation loop.

**Four-phase architecture:**
1. Specification Layer: Parse specs (YAML/JSON/BDD) into internal representation
2. Test Generation Layer: Create executable tests (unit, integration, property)
3. Execution Layer: Run tests in parallel via CI/CD
4. Feedback Layer: Route failures to auto-fix PRs or human review

## Evidence

- **Evidence Grade:** `low`
- **Most Valuable Findings:**
  - Academic foundations in QuickCheck (property-based testing) and Design by Contract
  - Effective when combined with Feature List as Immutable Contract
- **Unverified:** The earlier claim of production use at Anthropic, OpenAI, and LangChain misattributed training-time and model-eval techniques to this CI pattern and has been removed.

## Trade-offs

- **Pros:**
  - Catches drift early; prevents silent spec-implementation divergence
  - Immune to "pass by deletion" when combined with immutable feature lists
  - Provides measurable progress metrics (X/Y features passing)
  - Survives session boundaries; test state persists across context loss
- **Cons:**
  - Heavy CI usage; false positives if spec wording is ambiguous
  - Upfront spec investment required; overhead exceeds benefit for small/one-off tasks
  - Test explosion risk without intelligent selection; spec churn creates test churn

## How to use it

- Keep the spec in a machine-parseable subset (structured Markdown, YAML, JSON Schema, or BDD) so tests can be regenerated from it.
- Regenerate the derived test suite on every spec commit, not on a schedule, so tests never lag the spec.
- Run generated tests in CI on every code commit and treat a spec-test failure as drift, not as a flaky test.
- Route each failure explicitly: agent-authored fix PR, or a flagged spec-ambiguity issue for a human.
- Record which spec clause each test came from, so spec edits show exactly which tests must change.

## References

- Primary source: [The AI Engineer Spec](http://jorypestorious.com/blog/ai-engineer-spec/) - Jory Pestorious, describes the SPEC / EXPOSURE / TASK DELTA loop as a human-driven verification process
- [GitHub Spec Kit](https://github.com/github/spec-kit) - spec-driven development toolkit (`/speckit-specify`, `/speckit-plan`, `/speckit-tasks`, `/speckit-implement`, `/speckit-converge`) representing the 2025 spec-driven tooling wave
- Anthropic Engineering: [Effective Harnesses for Long-Running Agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- QuickCheck (Claessen & Hughes, ICFP 2000) - property-based testing foundation
