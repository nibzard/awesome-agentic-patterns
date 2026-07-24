---
title: "Behavioral Diff Between Agent Runs"
status: emerging
authors: ["Arthi Arumugam (@arthi-arumugam-git)"]
category: "Reliability & Eval"
source: "https://github.com/arthi-arumugam-git/whatbroke/blob/main/docs/findings/llama32-3b-vs-qwen25-3b.md"
tags: [regression-testing, trajectory-diffing, nondeterminism, model-swap, ci-cd, behavioral-testing]
summary: "Detect silent behavior changes by structurally diffing recorded agent trajectories (tool calls, arguments, ordering, outcomes) before and after a change, using repeated samples to separate real regressions from baseline nondeterminism."
complexity: "low"
effort: "hours"
impact: "high"
signals: ["Swapping the model under an existing agent", "Prompt or framework changes on an agent already in production", "No eval rubric exists for the behavior you care about"]
anti_signals: ["Single-shot LLM calls with no tool use", "Judging absolute quality of one version in isolation"]
related: ["workflow-evals-with-mocked-tools", "llm-observability", "incident-to-eval-synthesis"]
---

## Problem

When something changes underneath an agent (a model swap, a prompt edit, a framework bump), the reply text usually still reads fine. The failures are structural and silent: a tool call disappears, arguments drift, two calls that used to run sequentially fire in parallel, an outcome flips. The transcript stays polite through all of it.

Evals mostly miss this class of failure because they score one version against a rubric, and they only fail if someone wrote a rubric for the exact behavior that broke. Text diffs are useless because nondeterministic wording changes on every run anyway.

A concrete case from the source write-up: a support agent was swapped between two open 3B models. The new model added an account-lookup call the old one always skipped, which looks like an upgrade. But it fired the lookup and the cancellation in the same turn, in parallel, so the cancel arguments were chosen before the lookup result existed. It filled the gap with a plausible, well-formed account id it invented, in 3 of 3 runs, while telling the customer the account was cancelled. Every transcript read fine.

## Solution

Treat the trajectory, not the text, as the unit of comparison, and use the previous version of the agent as the spec.

1. **Record before.** For each scenario, capture the full trajectory N times (3–5): every tool call with arguments, ordering, token usage, latency, and the final output.
2. **Make the change**, then record the same scenarios N more times.
3. **Diff structurally**, not textually: which tools appeared or disappeared, which arguments drifted, where ordering or parallelism changed, where cost and latency moved, which outcomes flipped.
4. **Demote flapping findings.** Anything that already varies between two baseline runs is baseline nondeterminism, not a regression. A finding that shows up in most before/after pairs but never within baseline pairs is a real behavior change. Report findings with their flap rate so reviewers can see the difference.
5. **Classify severities and exit nonzero on breaking changes** so the diff gates CI the way a failing test does.

The key property: there is no rubric to write. The question is not "is this version good?" but "what changed between these two versions?", and the before-trace answers it.

## How to use it

- Record trajectories as plain JSONL per scenario, several samples each (`refund-flow#1`, `refund-flow#2`, ...). If the agent stack is hard to instrument, an OpenAI-compatible proxy that logs requests/responses captures traces with zero code changes.
- Run the diff before merging any model swap, system-prompt edit, or agent-framework upgrade, and on a schedule against pinned baseline traces to catch upstream model drift.
- Read `changed` findings with a human eye: a diff tells you something changed, not which side is better. In the case above, the same swap that invented account ids also made the agent the only version that issued a correct refund.
- An open-source reference implementation of this pattern is [whatbroke](https://github.com/arthi-arumugam-git/whatbroke) (MIT, offline, deterministic), but the pattern is tool-agnostic: any structured trace store plus a structural differ works.

## Trade-offs

**Pros:**
- Catches silent structural regressions that rubric evals and transcript review both miss.
- No rubric authoring; works on day one against any existing agent.
- Deterministic comparison layer over nondeterministic systems; CI-friendly.

**Cons:**
- N samples per side costs inference time and money on every comparison.
- Direction-blind: the diff surfaces change, a human still judges better/worse.
- Only covers recorded scenarios; a thin scenario set gives false confidence.
- High-temperature or highly branching agents need larger N before the flap-rate floor is meaningful.

## References

- [Finding: llama3.2:3b vs qwen2.5:3b, same-size vendor swap, full traces](https://github.com/arthi-arumugam-git/whatbroke/blob/main/docs/findings/llama32-3b-vs-qwen25-3b.md)
- [whatbroke: reference implementation (MIT)](https://github.com/arthi-arumugam-git/whatbroke)
