---
title: Rendered UI Finish Gate
status: emerging
authors: ["Samuel Bushi (@samuelbushi)"]
based_on: ["UIZZE anti-ui-slop workflow (UIZZE)"]
category: "Feedback Loops"
source: "https://github.com/uizze/uizze/tree/main/skills/anti-ui-slop"
tags: [ui-quality, frontend, coding-agents, verification, design-systems, feedback-loops]
summary: "Verify an agent-built interface against its intended design contract, required states, interaction semantics, and rendered output before merging."
domains: ["coding", "design", "frontend"]
complexity: medium
effort: hours
impact: high
signals: ["An agent has changed a user-facing interface", "Visual regressions are hard to catch in code review", "The interface has multiple async, empty, error, or responsive states"]
anti_signals: ["The change is entirely non-visual", "No rendered or interactive output exists to inspect"]
---

## Problem

Coding agents can produce frontend code that compiles and passes unit tests while still shipping generic, incomplete, or misleading interfaces. Common failures include missing loading and error states, controls that look interactive but do nothing, token drift, inaccessible focus behavior, and responsive layouts that were never rendered at their target widths. A source-only review cannot reliably detect all of these problems.

## Solution

Add a bounded finish gate after implementation and before merge. The gate compares the rendered interface with a small design contract and checks both behavior and visual evidence:

1. **Contract check** -- identify the intended hierarchy, content model, tokens, responsive rules, and platform-specific constraints.
2. **State check** -- enumerate and exercise loading, empty, error, disabled, focus, success, and permission states that the feature can reach.
3. **Interaction check** -- verify that visible controls have real handlers, keyboard paths, labels, focus treatment, and correct navigation or submission behavior.
4. **Render check** -- inspect the page at representative viewport sizes and compare the result with the contract, not with a generic template.
5. **Finish verdict** -- report concrete findings with evidence, severity, and the smallest change needed to resolve each blocking issue.

```pseudo
contract = read_design_contract(change)
states = enumerate_required_states(change)
implementation = inspect_source(change)
rendered = render_at_viewports(change, contract.viewports)

findings = []
findings += check_tokens_and_hierarchy(implementation, contract)
findings += check_state_coverage(implementation, states)
findings += check_interactions(rendered, contract)
findings += check_responsive_rendered_output(rendered, contract)

return verdict(findings, evidence=findings.evidence)
```

The gate is deliberately separate from product-specific visual taste. It blocks missing behavior and unsupported claims first, then records visual quality findings that a human can review.

## Evidence

- **Evidence Grade:** `medium`
- **Most Valuable Findings:** Source checks catch inert controls and missing branches; rendered checks expose layout and state failures that source checks miss; a written contract makes review criteria repeatable.
- **Unverified / Unclear:** The best viewport set, severity thresholds, and amount of human review vary by product and platform.

## How to use it

- Require the gate for pull requests that change user-facing web or native UI.
- Ask the implementing agent to write or update the design contract before coding when hierarchy, states, or responsive behavior are unclear.
- Keep the first pass deterministic: inspect changed files, enumerate reachable states, render representative paths, and attach findings to the change.
- Treat missing states, inert controls, broken keyboard paths, and token violations as merge blockers. Treat subjective polish as a review item unless the contract makes it explicit.
- Store the rendered evidence and verdict with the pull request when the project needs an audit trail.

### Known implementations

- [UIZZE anti-ui-slop Skill](https://github.com/uizze/uizze/tree/main/skills/anti-ui-slop) -- a free local workflow that applies this pattern to coding-agent UI changes; the optional full workflow uses 800,000+ real web and iOS screens as reference evidence.

## Trade-offs

- **Pros:** Finds failures that compile-time checks and source-only review miss; makes UI review repeatable; keeps required states and interaction semantics visible; produces actionable evidence rather than a vague quality score.
- **Cons:** Adds render and review time; requires representative test data and viewport choices; visual comparison can still encode reviewer bias; not every issue can be reduced to a deterministic rule.

## References

- [UIZZE anti-ui-slop Skill](https://github.com/uizze/uizze/tree/main/skills/anti-ui-slop) -- disclosed primary implementation.
- [UIZZE public design contract](https://github.com/uizze/uizze/blob/main/DESIGN.md) -- example contract covering tokens, typography, states, responsive behavior, and finish criteria.
- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/standards-guidelines/wcag/) -- neutral reference for interaction and accessibility requirements.
