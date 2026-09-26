---
title: Evidence Questions, Not Verdict Questions
status: emerging
authors: ["Doron Podoleanu (@doronp)"]
based_on: ["jevc (https://github.com/doronp/jevc)", "Beurer-Kellner et al., Design Patterns for Securing LLM Agents (2025)"]
category: "Security & Safety"
source: "https://github.com/doronp/jevc"
tags: [policy-authoring, admission-control, decomposition, calibration, confidence, guard-rails, determinism]
summary: "Never ask the model for allow/ask/block. Ask it narrow, typed, observational questions and let code reduce the answers to the verdict, because the collapsed question is the low-confidence one."
maturity: "early"
complexity: "low"
effort: "days"
impact: "high"
signals: ["A gate asks a model to classify a proposed action as allow / ask / block", "Your written policy lives in prose (CLAUDE.md, AGENTS.md, a runbook) and a model reads it at decision time", "The gate's mistakes are near-misses rather than wild misreads"]
anti_signals: ["The decision genuinely needs open-ended judgement that cannot be decomposed into observable features", "The gate is already a pure code predicate with no model in the loop"]
prerequisites: ["An enumerable set of observable features the decision depends on", "The ability to record and replay model calls so thresholds can be measured"]
related: ["policy-gated-tool-proxy", "consequence-family-coverage-audit", "deterministic-grader-in-the-loop", "hook-based-safety-guard-rails"]
domains: ["security", "ops", "coding"]
updated_at: "2026-09-26"
---

## Problem

A gate in front of an agent's tools has to turn a proposed action into a decision. The
default implementation hands the model the policy and the action and asks for the decision:

> Here is the policy. The agent wants to run `rm -rf node_modules`. Answer `allow`, `ask`, or `block`.

This looks like the cheapest possible design, and the failure it produces is quiet. The model
does answer. The answer is usually reasonable. What is missing is any signal about *how close
the call was* — and on a gate, the close calls are the whole problem. A gate that blocks
`rm -rf node_modules` is not a safety win, it is an outage; a gate that allows
`rm -rf ~/Documents` is the incident.

The collapsed question also destroys the structure the policy had. A written rule usually
says something like *"deleting regenerable build output is fine, deleting user data is not."*
That rule names an observable property of the target — regenerable or not. Collapsing it into
one allow/ask/block question throws that property away and asks the model to re-derive it,
weigh it, and commit to an action, all inside a single token distribution.

## Solution

Split the one verdict question into two different kinds of work and give each to the party
that is good at it.

1. **Ask the model only observational questions.** Each one is narrow, typed, and has a small
   closed answer set that describes the world rather than what to do about it:
   `blast_radius ∈ {none, regenerable_artifacts, project_source, user_data, system}`,
   `reversible ∈ {yes, no}`, `target_is_tracked_by_vcs ∈ {yes, no}`. The model never sees the
   words allow, ask, or block.
2. **Reduce the answers in code.** An ordinary first-match rule list maps evidence to the
   verdict. It is deterministic, diffable, unit-testable, and reviewable by someone who does
   not know how the model works.

The evidence questions are the compiled form of the prose rule; the reducer is the part a
security reviewer actually reads.

```pseudo
// Evidence: use trusted probes for directly observable facts; models may abstain
blast_radius  = ask_enum("What does this command destroy?", BLAST_LEVELS)
reversible    = ask_enum("Can the effect be undone without a backup?", YES_NO)

// Verdict: computed in code, no model involved
if invalid_or_missing(blast_radius, reversible) -> ask
if below_calibrated_threshold(blast_radius, reversible) -> ask
if blast_radius in {user_data, system}     -> block
if blast_radius == project_source and !reversible -> ask
if blast_radius in {none, regenerable_artifacts} -> allow
otherwise                                  -> ask
```

Filesystem and VCS facts should come from trusted probes against the actual target, not from a command string alone. Reject malformed or out-of-enum answers, and escalate missing, ambiguous, or insufficiently confident evidence. A deterministic reducer does not make its model-supplied evidence deterministic or correct. Bind the checked facts to the action executed so target changes cannot invalidate the decision.

Two properties motivate this design.

**The recorded example gives higher confidence on decomposed questions.** Confidence on a narrow
observational question is not the same as confidence on the collapsed one, even in the same
call to the same model.

**The verdict stops depending on an unmeasured threshold.** Once the model only returns
evidence, the question "what confidence is good enough" is asked per feature, against
recorded calls, instead of once and invisibly over the whole decision.

The linting rule that makes the pattern enforceable rather than aspirational: **reject any
lowered program whose questions mention the verdict vocabulary.** If a generated question
contains allow / deny / block / approve, the decomposition was not done and the program
should fail to build rather than run.

## Evidence

- **Evidence Grade:** `low` — one public instrumented corpus, single maintainer, no
  independent replication.
- **Most Valuable Findings:**
  - In one recorded call on `rm -rf node_modules`, the collapsed allow/ask/block question
    returned allow 0.42 / block 0.35 / ask 0.23 — a 0.07 winner margin, roughly seven times
    the ±0.01 drift seen across repeated identical calls, so the ordering is real but the
    model has weak preference among the verdict labels; these probabilities do not measure correctness. The narrow `blast_radius` question, asked of the same
    model in the same call, answered "only regenerable artifacts" at 0.97.
  - Predicted thresholds do not survive measurement. Of 58 thresholds predicted ahead of time
    for one corpus, 23 held against the live model and **35 were wrong** and had to be
    recalibrated. This is one corpus, not a transferable failure rate; measure thresholds on
    independently labelled cases from the deployment before relying on them.
- **Unverified / Unclear:** whether the confidence gap between collapsed and decomposed
  questions holds across model families and sizes; how far a decision can be decomposed
  before the reducer becomes the thing that is wrong; whether smaller local models answer the
  narrow questions well enough to run the gate offline.

## How to use it

1. **Find the verdict question.** Search your prompts for the place a model is asked for an
   action rather than a fact. It is usually one prompt and it is usually the gate.
2. **Name the features the written rule already depends on.** Take the prose rule and
   underline its nouns and adjectives: *regenerable*, *user data*, *reversible*, *tracked*.
   Those are your questions. If the rule has no observable nouns, this pattern does not apply
   and you have a judgement problem, not a decomposition problem.
3. **Type each question tightly.** Prefer a 3–5 value enum over free text, and over a
   0–1 score. Enums are what make the reducer a table instead of a threshold.
4. **Write the reducer as first-match rules in code.** Put invalid, missing, ambiguous, and low-confidence evidence on an explicit escalation path before any allow rule. Order matters and should be explicit.
   This file is the artifact you put in front of a reviewer.
5. **Record calls and measure, per feature.** Keep a fixture corpus you can replay offline so
   the thresholds are asserted by tests, and so a model upgrade shows up as a diff rather than
   as a behaviour change nobody noticed.
6. **Lint for regressions.** Fail the build if any evidence question mentions the verdict
   vocabulary, or if any verdict path has no covering rule.

Complements rather than replaces the enforcement layer: this pattern decides what the gate
believes, [policy-gated-tool-proxy](policy-gated-tool-proxy.md) decides where the gate sits,
and [consequence-family-coverage-audit](consequence-family-coverage-audit.md) checks that the
reducer's rules cover the families of consequence your tools can actually cause.

## Trade-offs

**Pros**

- The reducer is deterministic, diffable, and unit-testable; the same evidence always produces
  the same verdict, which a collapsed model call does not.
- Confidence becomes per-feature and therefore actionable — a low-confidence
  `blast_radius` names exactly what to escalate on, where a low-confidence verdict names
  nothing.
- Policy review moves to a small code file that a reviewer can read without prompt-engineering
  knowledge.
- The evidence questions are cheap and narrow enough to be plausible work for a small or local
  model, which the collapsed question generally is not.

**Cons**

- More calls, or a more structured single call, and more moving parts than one prompt.
- The feature set is now a design commitment: a consequence nobody enumerated has no question,
  so the gate is silent on it rather than wrong about it. That is a different failure mode,
  not the absence of one.
- Someone has to do the measurement. Skipping it and hand-picking thresholds reproduces the
  original problem with extra steps — and, in the one corpus measured here, hand-picked
  thresholds were wrong six times in ten.
- Decomposition can be taken too far; a twelve-question evidence set with a sprawling reducer
  is a worse review artifact than three questions and a table.

## References

- Beurer-Kellner et al., *Design Patterns for Securing LLM Agents against Prompt Injections*
  (2025) — <https://arxiv.org/abs/2506.08837>. Argues the same direction from the injection
  side: keep the security-relevant decision outside what the model controls.
- [jevc](https://github.com/doronp/jevc) — Apache-2.0 reference implementation by this
  pattern's author; compiles prose instruction files into evidence questions plus a
  first-match reducer, lints programs that ask for a verdict, and ships the recorded corpus
  the numbers above come from. Disclosed as a self-reference; the pattern does not depend on
  it.
- [deterministic-grader-in-the-loop](deterministic-grader-in-the-loop.md) — the same
  substitution applied to self-review rather than admission control.
