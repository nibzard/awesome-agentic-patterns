---
title: Own-Check Fault Injection
status: emerging
authors:
  - Jeff Otterson (@Jott2121)
based_on:
  - Jia et al. (MAS-FIRE, arXiv:2602.19843)
  - Bhardwaj (AgentAssay, arXiv:2603.02601)
category: Reliability & Eval
source: 'https://github.com/Jott2121/sabot'
tags:
  - fault-injection
  - evals
  - reliability
  - self-verification
  - guardrails
  - chaos-engineering
  - observability
summary: >-
  Plant a controlled fault inside a running agent pipeline and score whether the
  pipeline's own checks emit a detection act, keeping detected, reacted and
  recovered as separate verdicts.
maturity: early
complexity: medium
effort: days
impact: high
signals:
  - You ship reviewer agents, critic stages or guardrail callbacks and treat them as your reliability story
  - You want assurance evidence stronger than "our end-to-end pass rate is high"
  - You are about to let an agent take a side effect that is expensive to undo
anti_signals:
  - Single-turn prompt pipelines with no internal verification stage to measure
  - You only need capability benchmarking, not reliability under injected failure
prerequisites:
  - A deterministic pass criterion for the task, so a no-fault baseline can be established
  - Trace or event capture at the seam where each check runs
tools:
  - eval-harness
  - tracing
domains:
  - ops
  - coding
  - research
---

## Problem

Multi-agent pipelines increasingly gate real work behind their own quality machinery:
reviewer agents, deterministic guardrail callbacks, escalation interrupts, orchestrator
progress ledgers. That machinery underwrites a widespread operational assumption — *if
something goes wrong mid-pipeline, some check will catch it.*

The assumption is rarely tested, because the usual evidence for it is the wrong
measurement. End-to-end pass rate tells you the pipeline produced a good answer. It does
not tell you whether anything would have noticed a bad input. Those come apart badly: a
pipeline can absorb a corrupted tool result, silently route around it, and still emit a
correct answer. Every dashboard stays green, and you have learned nothing about the case
your pipeline *cannot* absorb.

Worse, capability benchmarks and external monitors both miss the question. A benchmark
asks whether the agent is smart. An external monitor asks whether *you* can detect a
problem from outside. Neither asks whether the self-verification you already paid for
actually fires.

## Solution

Inject one controlled fault per run into a live execution, tell the pipeline nothing, and
score only what the pipeline's **own** components did about it. No external monitor may sit
in the detection path — if your harness is what noticed, the pipeline did not.

Three design commitments make the result trustworthy:

**1. Separate the funnel.** Score each injected fault on independent axes and never blend
them:

- **detected** — a component of the pipeline emitted a *detection act* (a reviewer reject,
  a guardrail block, an escalation, a retry carrying a reason)
- **reacted** — some corrective action followed the detection
- **recovered** — the end output still passed the same criterion as the no-fault baseline

The interesting quantity is the cell where `recovered` is true and `detected` is false:
**recovery without detection**. That is silent absorption, and it is invisible to any
accuracy-only evaluation.

**2. Adjudicate deterministically against a mapping published in advance.** Before
collecting data, write down the exhaustive list of surfaces whose events count as a
detection act, per framework, from that framework's documentation. Publishing the mapping
first is the only real defense against the accusation that it was tuned to the answer.
Keep any LLM judge in a clearly separate tier that cannot move the headline.

**3. Validate the baseline, and exclude rather than adjust.** A faulted run is only
scorable if the same cell passes with no fault injected. If the baseline fails, the cell
is excluded and itemised — never scored as a miss. Likewise, if a fault cannot be verified
as having landed, that is an exclusion, not a detection failure. Fake misses are the
easiest way to manufacture an alarming number.

Useful operator families, all of which occur naturally in production:

| Operator | What it simulates |
|---|---|
| Tool-result corruption | An API returns a plausible but wrong value |
| False success | A component reports work it did not do |
| Message alteration | Inter-agent context drifts in transit |
| Model downgrade | A silent fallback to a weaker tier |
| Stale context | Superseded data reaches one agent |
| Silent no-op | A side effect reported done, never performed |

## How to use it

1. **Pick one task with a mechanical pass criterion.** If a human has to judge success, you
   cannot establish a baseline, and everything downstream is opinion.
2. **Record the detection-act mapping for your stack before you run anything.** Which
   events, in your framework, mean "a check fired"? Write them down. If a documented
   surface turns out not to exist, strike it publicly rather than quietly.
3. **Baseline first.** Run the task clean, several seeds, and keep only cells that pass.
4. **Inject one fault per run** at a defined seam, and verify it landed.
5. **Score the three axes separately** and publish the recovery-without-detection rate. It
   is usually the number that changes minds.
6. **If detection is low, test whether it is a protocol gap before assuming a capability
   gap.** A cheap probe: require each reviewer to report every inconsistency it noticed,
   quoting the exact conflicting values, *before* it emits a verdict. If detection rises
   sharply, the model was already noticing and your protocol simply gave noticing nowhere
   to go.
7. **Watch what that fix does and does not buy.** Reporting is not reacting. A reviewer can
   name the contradiction and approve anyway; measured, corrective acts often do not rise
   with reports at all. Treat "the pipeline now tells you" as a genuine but partial win.

For orchestrator-style pipelines that rewrite worker instructions, a protocol requirement
survives only if it is part of the **output format contract**. Side instructions get
rewritten away; format requirements do not.

## Trade-offs

- **Cost and blast radius.** Every cell is a real model run against a real pipeline. Budget
  a circuit breaker, and never inject into a pipeline with live side effects.
- **The instrument perturbs the system.** Changing an output contract to carry a report can
  change orchestration behaviour — measured in one case as clean-run stall rates rising
  from 3/25 to 18/25 seeds. Always re-run the no-fault baseline under the changed protocol
  and publish the comparison, or you will attribute your own perturbation to the fix.
- **Text-matching adjudication has a false-positive floor.** If you score a report by
  looking for expected substrings, measure how often those substrings appear on *clean*
  runs. Tasks that embed natural discrepancies produce a non-trivial base rate, and a
  detection number without its base rate is not interpretable.
- **Some operators have no signal on some surfaces.** A silent model downgrade injects no
  text to quote, so a text-report surface cannot see it at all. Report that as no signal
  rather than as a low score.
- **Pipeline shape confounds cross-framework comparison.** If a fault lands after a given
  architecture's last check has run, that cell is a structural zero, not a detection
  failure. Compare only on the operator subset where every configuration can structurally
  detect.
- **Results are version-bound and model-bound.** Detection rates plausibly move with the
  underlying model. Pin versions, state them, and resist generalising past them.

## Evidence

Applied across three production frameworks (LangGraph, CrewAI, AutoGen/Magentic-One) over
900 injected faults, median own-check detection was **16.7%**, and recovery without
detection was the single most common outcome in **every** configuration at 51–61% of valid
faults. Best-documented guardrail configurations did not materially outperform defaults.
Adding the anomaly-first reporting requirement to the same 825 paired cells raised the
median to **55.0%**, while corrective acts stayed flat — on the original detection surface,
recovery without detection remained near 50%. The pattern's central claim is that
distinction: silent absorption became *legible*, not corrected.

## References

* [MAS-FIRE: Fault Injection and Reliability Evaluation for LLM-Based Multi-Agent Systems](https://arxiv.org/abs/2602.19843) — Jia et al. Establishes own-mechanism fault detection rates on academic multi-agent systems.
* [AgentAssay](https://arxiv.org/abs/2603.02601) — Bhardwaj. Formalises an agent mutation score with model-swap and version-downgrade operators under external adjudication.
* [On the Resilience of LLM-Based Multi-Agent Collaboration with Faulty Agents](https://arxiv.org/abs/2408.00989) — AutoInject. Injects mistakes into agent messages; reports end-task recovery, which is precisely the quantity this pattern keeps separate from detection.
* [Failing Tools: Benchmarking LLM Agent Recovery Under Runtime Tool Failures](https://openreview.net/forum?id=j7YsSnA64D) — single-agent detection and recovery under tool failure.
* [Assessing and Enhancing the Robustness of LLM-based Multi-Agent Systems Through Chaos Engineering](https://arxiv.org/abs/2505.03096) — Owotogbe. Chaos-engineering framing for agent systems.
* Known implementation: [Sabot](https://github.com/Jott2121/sabot) — an open specification and Apache-2.0 harness applying this pattern to three production frameworks, with the detection-act mappings, seeds and anchors registered before any scored run and the full raw trace corpus published for offline recomputation. Authored by this pattern's contributor; listed as a worked example of the mapping-first and funnel-separation mechanics described above.
