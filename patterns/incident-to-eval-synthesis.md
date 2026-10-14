---
title: Incident-to-Eval Synthesis
status: emerging
authors: ["Codex (@openai)"]
based_on: ["Post-incident learning loops in software and ML operations"]
category: "Feedback Loops"
source: "https://platform.claude.com/docs/en/test-and-evaluate/develop-tests"
tags: [evals, incidents, reliability, feedback, continuous-improvement]
summary: "Converts each production incident into executable eval cases with pass/fail criteria and gates future releases on them"
signals: ["Production incidents recur after being fixed operationally", "The eval suite drifts away from failures seen in production", "Incident artifacts such as inputs, tool traces, and outputs can be captured"]
anti_signals: ["No production traffic or incident history exists yet", "Incident data cannot be captured or redacted safely", "The team cannot take on triage overhead for each incident"]
updated_at: "2026-10-13"
---

## Problem

Many teams run agent evaluations, but the eval suite drifts away from real failures seen in production. Incidents get resolved operationally, yet the exact failure mode is rarely converted into a durable regression test. This creates repeat incidents and false confidence from stale benchmark sets.

## Solution

Convert every production incident into one or more executable eval cases, then gate future changes on those cases.

Pattern mechanics:
- Capture incident artifacts: inputs, context, tool traces, outputs, and impact.
- Normalize sensitive data and derive a minimal reproducible scenario.
- Encode expected behavior as objective pass/fail criteria.
- Add the case to the evaluation corpus with severity and owner metadata.
- Run incident-derived evals in CI and release gates.

```pseudo
incident = ingest_incident(ticket_id)
case = build_eval_case(
  prompt=redact(incident.prompt),
  tools=incident.tool_trace,
  expected=define_acceptance_criteria(incident)
)

suite.add(case, labels=["incident", incident.severity])
if not suite.run(candidate_policy).pass(case.id):
    block_release(candidate_policy)
```

Distinct from [Persistent Test Memory Feedback Loop](persistent-test-memory-feedback-loop.md): that pattern stores test failures as persistent memory the agent itself consults later, while this pattern turns incidents into release-gating eval cases owned by the team.

## Evidence

- **Evidence Grade:** `low`
- **Most Valuable Findings:**
  - Blameless postmortem culture is established practice for capturing incident knowledge, but it stops at written action items rather than executable cases
  - Vendor evals guidance (Anthropic) describes building executable eval cases with pass/fail grading criteria; deriving those cases from incidents is this pattern's extension of that guidance
- **Unverified / Unclear:** No public source yet documents incident-derived agent evals end to end. Earlier revisions of this pattern carried adoption and success-rate statistics that had no source; they have been removed.

## How to use it

- Start with P0 (critical) incidents only, using tiered blocking: only P0 evals block releases initially; P1/P2 warn.
- Require a linked eval case in incident closure criteria.
- Track two metrics: incident recurrence rate and eval-catch rate before release.
- Periodically prune or merge redundant incident-derived tests to keep runtime manageable.

## Trade-offs

* **Pros:** Aligns evals with real risk and compounds operational learning over time.
* **Cons:** Adds triage overhead and requires discipline in incident data capture.

## References

- Primary source: [Define success criteria and build evaluations (Anthropic docs)](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests) - executable eval cases and grading criteria; the incident-to-case step is the pattern's own extension
- [Postmortem Culture (Google SRE Book)](https://sre.google/sre-book/postmortem-culture/) - adjacent practice for the incident-capture half of the loop
- https://martinfowler.com/articles/practical-test-pyramid.html
