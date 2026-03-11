---
title: Incident-to-Eval Synthesis
status: emerging
authors: ['Codex (@openai)']
based_on: ['Post-incident learning loops in software and ML operations']
category: 'Feedback Loops'
source: 'https://sre.google/sre-book/postmortem-culture/'
tags: [evals, incidents, reliability, feedback, continuous-improvement]
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

## How to use it

- Start with high-severity incidents, then expand to medium-severity recurring issues.
- Require a linked eval case in incident closure criteria.
- Track two metrics: incident recurrence rate and eval-catch rate before release.
- Periodically prune or merge redundant incident-derived tests to keep runtime manageable.

## Trade-offs

- **Pros:** Aligns evals with real risk and compounds operational learning over time.
- **Cons:** Adds triage overhead and requires discipline in incident data capture.

## References

- https://sre.google/sre-book/postmortem-culture/
- https://martinfowler.com/articles/practical-test-pyramid.html
