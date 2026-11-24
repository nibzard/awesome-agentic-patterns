---
title: "Fail-on-Base Filter for Generated Checks"
status: emerging
authors: ["apex-engine-dev (@apex-engine-dev)"]
based_on: ["Test-first red/green practice", "SWE-bench FAIL_TO_PASS tests", "Apex verify (author-maintained example)"]
category: "Reliability & Eval"
source: "https://github.com/apex-engine-dev/apex-verify/blob/main/docs/EXPERIMENTS.md"
tags: [verification, generated-tests, completion-gate, coding-agents]
summary: "Accepts a model-written check as evidence for a change only after running it on the pre-change code and seeing it fail"
updated_at: "2026-11-24"
signals: ["A model writes tests or checks that decide whether an agent's change is done", "The base commit is available and its tests can run", "Wrong changes pass the existing test suite"]
anti_signals: ["New features on empty code, where every check fails on the base for the wrong reason", "Tasks whose text does not state the expected behaviour"]
related: ["spec-as-test-feedback-loop"]
---

## Problem

When a model writes the checks that judge an agent's change, a passing check may prove nothing: it can assert what the code already did, or be unable to fail at all. A gate built on such checks reports success honestly against a weak test.

## Solution

Run every generated check twice. First on the base commit: a check that passes there is discarded, whatever it claims to cover. Then run the survivors on the changed code. Only checks that were red on the base and are green now count as evidence; a red survivor blocks the change. Keep a third verdict, unknown, for the case where no check survived or the check itself looks wrong, and never report it as a pass.

Write the checks from the task text with a different model than the one that made the change, not from the agent's own tests.

## Evidence

- **Evidence Grade:** `low`
- **Most Valuable Findings:**
  - One maintainer-run benchmark (author-affiliated): on 200 AI-written changes to 23 open-source libraries, the projects' tests stopped 75 in 100 wrong changes; with filtered generated checks, 91 in 100.
  - Same benchmark: 13 in 100 good changes that passed the tests were stopped by a generated check.
- **Unverified / Unclear:** one model family wrote every change; two runs of the same code disagreed on 25 of 200 verdicts; no independent replication.

## How to use it

- Build the base commit and the change in separate scratch copies; run checks in a sandbox, since generated checks are untrusted code.
- Read the gate's configuration from the base commit so the change cannot alter it.
- Cap how often the gate may block an agent, so a wrong check cannot trap it.

## Trade-offs

- **Pros:** removes checks that cannot fail; cheap and mechanical; needs no judgment from a model at decision time.
- **Cons:** "fails on the base" does not prove it fails for the right reason; false alarms on good changes; doubles check run time; a task that omits a requirement gets no check for it.

## References

- [SWE-bench](https://github.com/SWE-bench/SWE-bench) - benchmark whose FAIL_TO_PASS tests apply the same before/after rule to human-written tests
- [Apex verify experiments](https://github.com/apex-engine-dev/apex-verify/blob/main/docs/EXPERIMENTS.md) - author-maintained implementation; includes results that did not hold
