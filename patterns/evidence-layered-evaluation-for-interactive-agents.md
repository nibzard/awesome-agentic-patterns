---
title: "Evidence-Layered Evaluation for Interactive Agents"
status: emerging
authors: ["Yuxuan Zhang (@reacher-z)"]
based_on: ["BrowserGym contributors", "WebArena contributors"]
category: "Reliability & Eval"
source: "https://github.com/TIGER-AI-Lab/ClawBench"
tags: [evaluation, browser-agents, computer-use, reproducibility, observability]
evidence_grade: medium
evidence_snapshot: "Separating outcome checks from execution traces makes interactive-agent failures easier to diagnose; the general trade-off is additional storage and instrumentation."
last_updated: "2026-07-28"
---

## Problem

Interactive agents can reach the wrong outcome for many different reasons: a bad plan, an incorrect click, a transient site response, or an evaluator that cannot observe the relevant state. A single success/failure score hides these causes and makes regressions difficult to reproduce, especially when tasks run on live websites or desktop applications.

## Solution

Capture evaluation evidence in layers, while keeping the task outcome as the primary decision signal. A run records (1) the final-state or request-level assertion, (2) the ordered actions taken, (3) screenshots or other visual state, (4) a session replay when timing matters, (5) network requests when the browser state is not sufficient, and (6) the agent messages that led to each action. A verifier can then report the outcome and link it to the smallest evidence layer that explains the result.

A practical pipeline is:

```text
task + policy -> isolated run -> action/visual/network/message capture
                              |
                              v
                         outcome verifier
                              |
                     score + evidence bundle
```

The layers should be timestamped and correlated by run ID. Collectors may be disabled for privacy-sensitive tasks, but the evaluator should state which layers were available rather than silently treating missing evidence as a successful run.

## Evidence

- **Evidence Grade:** `medium`
- **Most Valuable Findings:** Separate evidence layers support diagnosis of planning, interaction, and environment failures; request-level assertions can verify state transitions that are not visually exposed; replayable bundles make human adjudication and regression analysis practical.
- **Unverified / Unclear:** The relative value of each layer depends on the task and site; no universal layer ordering or storage budget has been established.

## How to use it

1. Define a task-level success assertion before running the agent, such as a state change or intercepted request.
2. Run the agent in an isolated browser or desktop environment and attach a stable run identifier to every event.
3. Record actions and agent messages by default; add screenshots, video, and network capture when they answer a known observability gap.
4. Evaluate the assertion first, then use the evidence bundle to classify failures and adjudicate ambiguous outcomes.
5. Retain a compact manifest with timestamps, harness/model versions, task version, and enabled evidence layers so another evaluator can reproduce the comparison.

## Trade-offs

- **Pros:** More actionable failure analysis; easier regression triage; supports both automated verification and human review; makes claims about live-task performance auditable.
- **Cons/Considerations:** Storage and instrumentation overhead increase with each layer; network and message logs can contain sensitive data; clock drift and incomplete capture can complicate correlation; richer evidence does not guarantee a correct evaluator.

## References

- [ClawBench](https://github.com/TIGER-AI-Lab/ClawBench) — an example implementation of layered evidence capture for live-web agent evaluation (contributor-maintained; cited as an implementation, not as a normative standard).
- [BrowserGym](https://github.com/ServiceNow/BrowserGym) — web-agent environments and evaluation tooling.
- [WebArena](https://github.com/web-arena-x/webarena) — realistic web environments for autonomous-agent evaluation.
