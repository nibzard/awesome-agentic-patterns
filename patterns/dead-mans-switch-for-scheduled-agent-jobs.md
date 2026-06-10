---
title: Dead-Man's Switch for Scheduled Agent Jobs
status: validated-in-production
authors: ["James Ross (@jimy-r)"]
based_on: ["Healthchecks.io-style cron monitoring (inverted to success-sentinel checking)"]
category: "Reliability & Eval"
source: "https://github.com/jimy-r/agent-workspace-architecture/blob/main/PATTERNS.md"
tags: [scheduled-agents, silent-failure, watchdog, observability, automation]
last_updated: "2026-06-10"
---

## Problem

An agent workspace accumulates scheduled jobs: a morning digest, a background task manager, a weekly self-audit, a memory consolidation pass. These fail silently. A scheduler misconfiguration, an expired OAuth token, or a permission regression doesn't throw an error anywhere a human looks — the job's logs simply stop appearing. Nothing watches for absence, so a broken daily job can stay broken for weeks before anyone notices the output is missing.

## Solution

Invert the monitoring direction: alert on missing success instead of on errors.

- Every scheduled job writes an explicit success sentinel (for example `MORNING_BRIEF_OK`) into its per-run log as its final act.
- A freshness checker knows each tracked task, its cadence, and its staleness window. It scans the most recent log per task: sentinel present and recent means FRESH; missing, stale, or sentinel-less files a finding.
- Findings land in the agent's own task queue — the place the operator already reads — not a separate dashboard nobody opens.
- A per-task `manual` flag exempts on-demand jobs from staleness, so the watchdog doesn't cry wolf on tasks that legitimately run irregularly.
- The checker runs from a different cadence than the jobs it watches (a weekly audit plus on-demand), which answers who-watches-the-watchman without new infrastructure.

```pseudo
for task in tracked_tasks:
    log = latest_log(task)
    if task.manual and log is None:        status = MANUAL_OK
    elif log is None or age(log) > task.window: status = STALE
    elif task.sentinel not in log.text:    status = NO_SENTINEL
    else:                                  status = FRESH
    if status not in (FRESH, MANUAL_OK):
        file_finding(task, status)   # lands in the agent's task queue
```

## Evidence

- **Evidence Grade:** `medium`
- **Most Valuable Findings:** caught a multi-day silent failure in production (a permission regression left a daily job running read-only; config looked correct, the missing sentinel proved otherwise). The underlying inversion is long-established for human cron jobs (Healthchecks.io).
- **Unverified / Unclear:** the agent-specific variant is validated in one production workspace; it says nothing about jobs that run but produce wrong output (pair with synthetic canaries for that class).

## How to use it

Worth adopting once a workspace has two or more scheduled agent jobs. Requirements: durable per-run logs, a success-sentinel convention written into every job's instructions, and a checker invoked by a cadence you already trust (a recurring self-audit is the natural host). Tune staleness windows per task — a 2-hourly job and a weekly job need different definitions of "late."

## Trade-offs

- **Pros:** catches the failure class config inspection cannot ("configured" is not "running"); no external service; the sentinel convention costs one line per job.
- **Cons:** per-task configuration to keep current as jobs come and go; a job that runs but produces garbage still passes its sentinel; the checker needs a host cadence of its own.

## References

- [agent-workspace-architecture — PATTERNS.md](https://github.com/jimy-r/agent-workspace-architecture/blob/main/PATTERNS.md) — production implementation this pattern is extracted from (freshness-checker detail in META_ARCHITECTURE.md)
- [Healthchecks.io](https://healthchecks.io/) — the cron-monitoring service that established the missing-success inversion for human jobs
