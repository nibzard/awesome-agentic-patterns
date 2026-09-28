---
title: Tier Auto-Apply by Mechanical Impact
status: emerging
authors: ["James Ross (@jimy-r)"]
based_on: ["James Ross (@jimy-r), Agent Workspace Architecture"]
category: "Reliability & Eval"
source: "https://github.com/jimy-r/agent-workspace-architecture/blob/main/PATTERNS.md#4-tier-by-mechanical-impact-not-by-tone"
tags: [auto-apply, tiered-autonomy, self-improving-agent, findings-triage, reversibility]
summary: "Decides which self-proposed changes auto-apply by matching the real diff's file paths and change kinds against a trusted tier table, not by finding text"
signals: ["System proposes changes to its own code or config", "Some changes should ship without human review", "Findings can come from fetched or external content"]
anti_signals: ["Every change already goes to human review", "No way to derive a real diff before applying a change", "Team cannot maintain a path and change-kind table"]
related: ["canary-rollout-and-automatic-rollback-for-agent-policy-changes", "human-in-loop-approval-framework"]
updated_at: "2026-09-26"
---

## Problem

A system that reviews itself and applies its own findings, a self-auditing agent, say, needs a line between "apply automatically" and "ask a human first." The tempting way to draw that line is from how confident or severe a finding sounds. That heuristic is gameable. Phrasing drifts over time, a cautious write-up can make a risky change sound safe, and a model classifying its own proposal has every incentive to rate it low-risk for the same reasons it proposed it in the first place.

## Solution

Classify every finding by what it mechanically touches, not by its natural-language severity. A trusted, read-only `(file path pattern, change kind)` table is the authority. Derive both fields from the actual staged diff and canonical target paths, including generated and incidental writes; do not trust the finding’s description of what it changes. Changes to the tier table, its enforcement code, credentials, or approval policy always require human review. A new file in a pre-approved location is a different tier from a rewrite of an existing one, regardless of how either is described in the finding text. Anything that doesn't match a row in the table falls through to the highest, human-approval tier by default. Two refinements matter in practice. A provenance gate forces anything sourced from outside the system, a fetched web page, an external research finding, to the human tier regardless of its mechanical shape, because an auto-apply path is the highest-value target for injected content. And a small set of hard, pre-write checks (has this file been touched in the last day, does the target path match this tier's own allowlist, does a validator still pass after the write) can downgrade a classification at the moment of writing, before a stale write ever lands.

```pseudo
patch = stage_without_live_side_effects(finding)
changes = derive_changes_from_diff(patch)       # complete write set, canonical paths
if not changes: return no_op()
tier = strictest(TIER_TABLE.match(c.path, c.kind) or TIER_3_HUMAN_APPROVAL
                 for c in changes)
if any_unmatched(changes) or touches_protected_policy(changes):
    tier = TIER_3_HUMAN_APPROVAL
if provenance_unknown_or_external(finding):
    tier = TIER_3_HUMAN_APPROVAL
if tier in (TIER_1_SILENT, TIER_2_SURFACED):
    with exclusive_write_lock(changes):
        if not baseline_hashes_match(patch) or not validate_staged(patch):
            tier = TIER_3_HUMAN_APPROVAL
        else:
            apply_exact_validated_patch(patch)
            if post_write_validator_fails(changes):
                revert_only_this_patch_while_lock_held(patch)
                tier = TIER_3_HUMAN_APPROVAL
surface_or_queue_for_approval(finding, tier)
```

## Evidence

- **Evidence Grade:** `low`
- **Most Valuable Findings:** the table-based tiering explicitly replaced an earlier tone-based heuristic in a production self-auditing agent, on the stated reasoning that natural-language severity is gameable while mechanical impact is a property of the action rather than its description. This is one practitioner’s design record, not an independently measured safety improvement.
- **Unverified / Unclear:** no public incident count of false positives the tone-based heuristic produced before the switch, or false positives the table has produced since. The provenance gate and per-write guardrails are stated design decisions, not independently measured safety margins.

## How to use it

Worth adopting anywhere a system proposes changes to its own configuration or code and some of those changes should ship without a human in the loop. Build the table before the auto-apply logic. Enumerate the specific path-pattern-and-change-kind combinations you are actually willing to trust unattended, and default everything else to the human tier. An incomplete table should fail closed, not open. Add the provenance gate early if any finding can originate from fetched or externally sourced content; that is the path an attacker would use first. Keep a rate limit on top of the tiering, a fixed cap on auto-applies per run, so a classification bug cannot cascade into a large unattended diff.

## Trade-offs

- **Pros:** removes a gameable, drifting heuristic from a safety-relevant decision; the table is auditable on its own, independent of any specific finding; the provenance gate closes the most obvious injection path into an auto-apply system; per-write guardrails catch a stale classification, say a file already edited since the finding was generated, that a review-time-only check would miss.
- **Cons:** the table needs upkeep as new kinds of change appear, and an unmatched change silently, if correctly, defaults to the slow path, which can feel like the automation stalled rather than behaved safely. Mechanical impact is a proxy for risk, not risk itself, so a technically small change in a sensitive location still needs its own row rather than an assumption that small means safe.

## References

- [PATTERNS.md #4 (agent-workspace-architecture)](https://github.com/jimy-r/agent-workspace-architecture/blob/main/PATTERNS.md#4-tier-by-mechanical-impact-not-by-tone). Contributor-maintained design record; affiliation disclosed in front matter.
- [samples/.claude/agents/audit.md (agent-workspace-architecture)](https://github.com/jimy-r/agent-workspace-architecture/blob/main/samples/.claude/agents/audit.md). The concrete tier table, provenance gate, rate limit, and per-write guardrails this pattern is extracted from.
