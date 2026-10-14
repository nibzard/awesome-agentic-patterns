---
title: "Fair-Share Task Queues with Heartbeat Leases"
status: "proposed"
authors: ["Retsumdk (@Retsumdk)"]
based_on: []
category: "Orchestration & Control"
source: "https://github.com/Retsumdk/agent-decentralized-task-allocation-framework"
tags: [task-queue, load-balancing, fault-tolerance, multi-agent, scheduling]
summary: "Distributes tasks across a shared agent fleet using weighted deficit-round-robin scheduling, with heartbeat leases and dead-letter retries to recover from crashed workers"
signals:
  - "Multiple stateless or semi-stateless agents consume from one shared task queue"
  - "Tasks differ in cost and workers differ in capacity, so naive round-robin starves some workers or floods others"
  - "Workers crash or hang mid-task and tasks must be reassigned without human intervention"
anti_signals:
  - "A single agent processes tasks sequentially and the queue is short-lived"
  - "Tasks require affinity to a specific worker's local state that cannot be externalized"
updated_at: "2026-10-14"
---

## Problem

When a fleet of autonomous agents pulls work from a shared task queue, three failure modes show up in combination:

1. **Unfair distribution.** Plain round-robin assigns tasks evenly by count, not by cost. A worker that drew two long tasks falls behind while an idle worker receives the next one anyway.
2. **Lost leases.** A worker that crashes mid-task leaves its task claimed forever. Without a timeout-and-recovery mechanism the task is never retried and the queue silently stalls.
3. **Poison tasks.** A task that fails repeatedly gets retried forever, consuming fleet capacity and masking the underlying bug.

Traditional job systems (Celery, Sidekiq, SQS) solve these for processes, but agent fleets have an additional wrinkle: tasks are long-running, non-idempotent by default, and the "worker" may be an LLM-driven agent whose failure mode is a hang rather than a clean exception.

## Solution

Combine three mechanisms in one dispatch layer sitting between the task queue and the agent fleet:

- **Weighted deficit round-robin scheduling.** Each worker has a capacity weight. Every cycle, each active worker accumulates deficit credits proportional to its weight; the dispatcher assigns the next task to the worker whose deficit is largest and whose in-flight load is lowest. This generalizes least-loaded (weight 1) and round-robin (equal weights) in one rule.
- **Capability matching at dispatch time.** Tasks carry a required-capability set; workers advertise theirs. The scheduler only considers workers whose capabilities are a superset of the task's requirements, then applies deficit ordering within that subset.
- **Heartbeat leases with dead-lettering.** Each claim carries a lease with a heartbeat requirement. A worker must renew its lease while working; if heartbeats stop, the dispatcher reclaims the task and reassigns it (or marks it dead-lettered after N reclaim attempts).

```pseudo
dispatch(task):
    eligible = workers where capabilities ⊇ task.required
    candidate = argmax(w.deficit - w.in_flight_load for w in eligible)
    candidate.lease = {task, expires: now() + LEASE_TTL}
    assign(task, candidate)

heartbeat(worker):          # worker-side, every interval
    renew(worker.lease)

reconciler():               # dispatcher-side, every RECONCILE_INTERVAL
    for lease in leases where now() > lease.expires:
        task = lease.task
        task.attempts += 1
        if task.attempts > MAX_RECLAIMS:
            dead_letter(task)
        else:
            dispatch(task)   # reassign to another eligible worker
```

The reconciler loop is what turns a plain scheduler into a fault-tolerant one: recovery is periodic and bounded, not event-driven guesswork.

## Evidence

- **Evidence Grade:** `medium`
- **Most Valuable Findings:**
  - Deficit round-robin is a established scheduling discipline (Shreedhar & Varghese, 1995) that provides fair bandwidth allocation with O(1) per-task work; applying it to agent task dispatch preserves those properties.
  - Lease-with-heartbeat recovery is the same mechanism used by ZooKeeper sessions and Kubernetes node leases, adapted here to per-task granularity.
  - Dead-letter queues are standard practice in message systems; bounding reclaim attempts prevents the poison-task retry storm.
- **Unverified / Unclear:** Behavior under adversarial workers (a worker that renews its lease but never progresses the task) needs a progress-acknowledgment signal beyond the heartbeat itself.

## How to use it

- **When:** You run more than one coding/ops agent against a shared backlog (PR reviews, data jobs, monitoring sweeps) and task durations vary widely.
- **Prerequisites:** Tasks must be externally inspectable (so a reclaimed task can be re-executed or its partial work discarded), and workers must be able to send heartbeats cheaply.
- **Implementation notes:**
  - Set `LEASE_TTL` to 2–3× the heartbeat interval so a single missed beat doesn't cause spurious reclaims.
  - Make the dead-letter threshold visible in monitoring — a rising dead-letter count is your best signal that a task type is systematically failing.
  - Keep worker capability sets coarse (3–6 capabilities); fine-grained matching collapses the eligible set and reintroduces starvation.

## Trade-offs

- **Pros:**
  - Fair distribution by cost, not just by count.
  - Automatic recovery from crashed or hung workers without operator action.
  - One scheduling rule covers least-loaded, round-robin, and weighted variants.
- **Cons:**
  - Requires tasks to be re-executable after reclaim; truly non-idempotent tasks need an external journal.
  - The reconciler adds a moving part that itself needs monitoring.
  - Heartbeat traffic grows linearly with fleet size.

## References

- Reference implementation: [agent-decentralized-task-allocation-framework](https://github.com/Retsumdk/agent-decentralized-task-allocation-framework) — TypeScript, zero-dependency, MIT.
- Shreedhar, M. & Varghese, G., "Efficient Fair Queuing using Deficit Round Robin" (SIGCOMM '95) — origin of deficit round-robin.
- Kleppmann, M., *Designing Data-Intensive Applications* — lease and fencing discussion (Ch. 8).
- Related pattern in this catalogue: [Dead Man's Switch for Scheduled Agent Jobs](dead-mans-switch-for-scheduled-agent-jobs.md).
