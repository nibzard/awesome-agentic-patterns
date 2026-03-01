---
title: Spec-As-Test Feedback Loop
status: emerging
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Jory Pestorious"]
category: Feedback Loops
source: "http://jorypestorious.com/blog/ai-engineer-spec/"
tags: [validation, drift-detection, continuous-testing]
---

## Problem

Even in spec-first projects, implementations can drift as code evolves and the spec changes (or vice-versa). Silent divergence erodes trust.

## Solution

Generate **executable assertions** directly from the spec (e.g., unit or integration tests) and let the agent:

- Watch for any spec or code commit.  
- Auto-regenerate test suite from latest spec snapshot.  
- Run tests; if failures appear, open an *agent-authored* PR that either:
    
- updates code to match spec, or
    - flags unclear spec segments for human review.

This creates a continuous feedback loop ensuring specification and implementation remain synchronized.

**Four-phase architecture:**
1. Specification Layer: Parse specs (YAML/JSON/BDD) into internal representation
2. Test Generation Layer: Create executable tests (unit, integration, property)
3. Execution Layer: Run tests in parallel via CI/CD
4. Feedback Layer: Route failures to auto-fix PRs or human review

## Evidence

- **Evidence Grade:** `medium`
- **Most Valuable Findings:**
  - Production use at Anthropic (Constitutional AI), OpenAI (Evals), and LangChain
  - Academic foundations in QuickCheck (property-based testing) and Design by Contract
  - Effective when combined with Feature List as Immutable Contract
- **Unverified:** Long-term impact on agent quality scores; most implementations are recent (2022-2024)

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

- Use this when agent quality improves only after iterative critique or retries.
- Start with one objective metric and one feedback loop trigger.
- Record failure modes so each loop produces reusable learning artifacts.

## References

- Primary source: http://jorypestorious.com/blog/ai-engineer-spec/
- Anthropic Engineering: [Effective Harnesses for Long-Running Agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- OpenAI Evals: https://github.com/openai/evals
- QuickCheck (Claessen & Hughes, ICFP 2000) - property-based testing foundation
- Constitutional AI (Bai et al., Anthropic 2022) - principles as specifications
