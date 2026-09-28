---
title: Classify-Then-Act for Background Agents
status: emerging
authors: ["James Ross (@jimy-r)"]
based_on: ["Google's Large-Scale Changes process (speculative change generation + human review queues)", "Agent Workspace Architecture (production workspace)"]
category: "Orchestration & Control"
source: "https://github.com/jimy-r/agent-workspace-architecture/blob/main/PATTERNS.md#2-classify-then-act-not-ask-then-wait"
tags: [background-agents, task-triage, sandboxed-build, review-queue, autonomy-boundary]
summary: "Sorts each task into has-default, needs-intent, or out-of-scope, builds only has-default work in a sandbox, and queues it for human review"
signals: ["Background agent handles many task shapes", "Full autonomy is too risky but asking about everything stalls work", "Same rejected ideas keep coming back"]
anti_signals: ["No explicit human-delegated mandate defines which tasks belong to the agent", "No one reads the review queue on their normal path"]
related: ["human-in-loop-approval-framework", "custom-sandboxed-background-agent"]
updated_at: "2026-09-26"
---

## Problem

A background agent working through a task list has two failure modes at the extremes. Act on everything with full confidence and it ships work nobody wanted. Ask before doing anything and it becomes a nag that stalls on every ambiguous item, until the human stops trusting it to do anything alone.

## Solution

Classify every incoming task into exactly one of three buckets before doing anything else. `has-default` means an obviously correct action exists, `needs-intent` means genuinely ambiguous and a human call, and `out-of-scope` means not the agent's job. Only `has-default` work gets built, and even then it is built speculatively in a sandbox and lodged in a review queue rather than applied directly, so the human approves before anything lands. Every rejection is written back as a short decision record (task, what was attempted, why it was rejected, the lesson for next time) that the agent greps before classifying anything that looks similar again. Three or more matched rejections force the classification down to `needs-intent` rather than a fourth speculative attempt at the same shape.

```pseudo
def classify(task):
    if grep(rejection_log, task.slug_or_keywords).count >= 3:
        bucket = NEEDS_INTENT  # still surface the task; do not silently return
    else:
        bucket = triage(task)  # has-default | needs-intent | out-of-scope
    if bucket not in {HAS_DEFAULT, NEEDS_INTENT, OUT_OF_SCOPE}:
        bucket = NEEDS_INTENT  # malformed, unknown, or failed triage needs review
    if bucket == HAS_DEFAULT:
        build_in_sandbox(task)
        lodge_for_review(task)
    elif bucket == NEEDS_INTENT:
        surface_for_human_decision(task)
    return bucket
```

Only tasks within an explicit human-delegated mandate enter this loop. A `has-default` label cannot authorize external side effects: sandbox builds still need bounded credentials, spending and network permissions. Surface `needs-intent` items on the operator’s normal review path, with a durable pending record, rather than blocking unrelated ready tasks.

## Evidence

- **Evidence Grade:** `medium`
- **Most Valuable Findings:** the classify-and-sandbox mechanism ran as the core of a scheduled background agent for several months, and the production retrospective on that agent's eventual retirement explicitly states the classifier and the rejection log "still hold wherever the mandate is already unambiguous." The failure that ended the background agent was specific to how it decided a task belonged to it at all (see Trade-offs), not to the three-way classification or the sandbox-then-review mechanics.
- **Unverified / Unclear:** the "still holds" claim is the workspace's own retrospective judgment, not an independently re-run test of the classifier in isolation from the system around it. It has not been evaluated at any scale beyond this one workspace.

## How to use it

Worth adopting once a background or scheduled agent handles more than a handful of task shapes and full autonomy is too risky to grant outright. The three-way split only works if `has-default` stays genuinely conservative. Reserve it for actions a competent human would approve near-automatically, and route anything with real judgment content to `needs-intent`. The rejection log needs a consistent block format (task, attempt, reason, lesson) and a grep step wired into classification, rather than a file nobody reads back.

## Trade-offs

- **Pros:** avoids both failure extremes of pure autonomy and pure question-asking; the sandbox-then-review step means a wrong classification costs a discarded draft, not a live mistake; the rejection log stops the same bad idea being re-proposed on a fixed schedule.
- **Cons:** this pattern only classifies work that already reached the agent; it says nothing about how the agent decided a task belonged to it in the first place. In the source workspace, the surrounding self-discovery loop, a scheduled agent scanning its own task list and inferring intent, is exactly what failed. `needs-intent` questions landed in a tracker file nobody read on their normal path, thirteen piled up unanswered, and each one stalled the task behind it. Separately, the unattended runtime's credential expired silently and roughly five weeks of cycles ran dark. Both failures sat in the authorization and discovery layer around the classifier, not in the classify-then-act logic itself, and the fix was to replace self-discovery with an explicit human-delegated queue while keeping the classifier, the sandbox build, and the rejection log unchanged. Treat this pattern as the inner loop of a system whose outer authorization boundary still needs a separate, deliberate answer.

## References

- [PATTERNS.md #2 (agent-workspace-architecture)](https://github.com/jimy-r/agent-workspace-architecture/blob/main/PATTERNS.md#2-classify-then-act-not-ask-then-wait). The pattern as originally stated.
- [PATTERNS.md #14 (agent-workspace-architecture)](https://github.com/jimy-r/agent-workspace-architecture/blob/main/PATTERNS.md#14-delegation-is-a-queue-you-fill-not-work-the-agent-finds). The successor pattern, and the retrospective on what specifically failed and what carried forward.
- [CHANGELOG.md, 2026-08-08 (agent-workspace-architecture)](https://github.com/jimy-r/agent-workspace-architecture/blob/main/CHANGELOG.md#2026-08-08). The dated record of the retirement, and the note that the classifier and rejection log "still hold."
- [Software Engineering at Google, ch. 22: Large-Scale Changes](https://abseil.io/resources/swe-book/html/ch22.html). Long-standing industry precedent for the build-speculatively-then-lodge-for-human-review half of this pattern: machine-generated changes sharded into per-owner review queues, with humans approving before anything lands.
