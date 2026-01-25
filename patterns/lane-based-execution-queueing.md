---
title: "Lane-Based Execution Queueing"
status: "validated-in-production"
authors: ["Clawdbot Contributors"]
based_on: ["Clawdbot Implementation (https://github.com/clawdbot/clawdbot)"]
category: "Orchestration & Control"
source: "https://github.com/clawdbot/clawdbot/blob/main/src/process/command-queue.ts"
tags: [queueing, concurrency, lanes, isolation, parallelism, deadlock-prevention]
---

## Problem

Traditional agent systems serialize all operations through a single execution queue, creating bottlenecks that limit throughput. Concurrent execution is desirable but risky:

- **Interleaving hazards**: Multiple commands writing to stdin/stdout simultaneously corrupt user-facing output
- **Race conditions**: Shared state access without proper synchronization causes data corruption
- **Deadlock risks**: Naive concurrent queuing can create circular dependencies between operations

Agentic systems need parallelism to remain responsive (e.g., background tasks shouldn't block user interactions), but must preserve isolation guarantees.

## Solution

Isolated execution lanes with independent queues and configurable concurrency per lane. Each lane is a named queue with its own concurrency limit, drained independently without interference.

**Core concepts:**

- **Session lanes**: Per-conversation queues prevent message interleaving. Each user session gets an isolated lane (e.g., `session:telegram:user123`).
- **Global lanes**: Background tasks (cron jobs, health checks) execute in dedicated lanes (e.g., `cron`, `subagent`) without blocking session lanes.
- **Hierarchical composition**: Operations can nest lanes (session → global) via queue chaining. The outer lane waits for the inner lane, preventing deadlocks through structured queuing.
- **Configurable concurrency**: Each lane supports `maxConcurrent` workers (default 1). High-throughput lanes can run parallel tasks; serial lanes preserve ordering.
- **Wait-time warnings**: Tasks that sit queued too long trigger warnings and callbacks, surfacing performance issues.

**Implementation sketch:**

```typescript
type LaneState = {
  queue: QueueEntry[];
  active: number;           // Currently running tasks
  maxConcurrent: number;    // Concurrency limit
  draining: boolean;
};

const lanes = new Map<string, LaneState>();

function drainLane(lane: string) {
  const state = getLaneState(lane);
  // Pump tasks until concurrency limit reached
  while (state.active < state.maxConcurrent && state.queue.length > 0) {
    const entry = state.queue.shift();
    state.active += 1;
    entry.task().finally(() => {
      state.active -= 1;
      pump();  // Drain next entry
    });
  }
}

function enqueueCommandInLane<T>(
  lane: string,
  task: () => Promise<T>,
): Promise<T> {
  return new Promise((resolve, reject) => {
    getLaneState(lane).queue.push({ task, resolve, reject });
    drainLane(lane);
  });
}
```

**Deadlock prevention via hierarchical composition:**

```typescript
// Session lane queues a task that itself queues to global lane
await enqueueCommandInLane(sessionLane, () =>
  enqueueCommandInLane(globalLane, () =>
    doBackgroundWork()
  )
);
// Outer promise resolves when inner completes; no circular wait
```

**Lane examples from Clawdbot:**

- `main`: Default serial lane for CLI commands
- `cron`: Scheduled tasks, isolated from user interactions
- `subagent`: Spawned agent work, parallelizable with parent
- `session:<id>`: Per-user auto-reply queues

## How to use it

1. **Identify isolation boundaries**: Group operations that must not interleave (e.g., per-user, per-channel).
2. **Define lane names**: Use a hierarchy (e.g., `session:telegram:user123`) for scoping.
3. **Set concurrency limits**: Serial lanes use `maxConcurrent=1`; parallel lanes use higher values.
4. **Queue tasks**: Call `enqueueCommandInLane(lane, task)` to schedule work.
5. **Compose hierarchically**: When a queued task must spawn work in another lane, await the inner enqueue from the outer task.

**Pitfalls to avoid:**

- **Over-parallelization**: Too many concurrent workers can exhaust resources (file handles, memory). Monitor `active` count.
- **Starvation**: Low-priority lanes may wait indefinitely if high-priority lanes are always full. Use wait-time warnings to detect.
- **Missing hierarchy**: Direct cross-lane dependencies without nested queuing risk deadlocks. Always compose via `enqueueCommandInLane(() => enqueueCommandInLane(...))`.

## Trade-offs

**Pros:**

- **Isolation guarantees**: No interleaving between lanes; each lane preserves ordering.
- **Flexible parallelism**: Concurrency per lane allows mixed workloads (serial UI, parallel background).
- **Simple mental model**: Hierarchical composition maps to structured programming patterns.
- **Observability**: Lane-level metrics (queue depth, active count, wait times) aid debugging.

**Cons/Considerations:**

- **Memory overhead**: Each lane maintains a queue; thousands of idle lanes may waste memory.
- **Tuning required**: Concurrency limits need calibration based on workload characteristics.
- **Not a general scheduler**: No priority queues, deadlines, or work stealing. Use a proper scheduler for complex needs.

## References

- [Clawdbot command-queue.ts](https://github.com/clawdbot/clawdbot/blob/main/src/process/command-queue.ts) - Core queue implementation
- [Clawdbot lanes.ts](https://github.com/clawdbot/clawdbot/blob/main/src/process/lanes.ts) - Lane definitions
- [Clawdbot lane resolution](https://github.com/clawdbot/clawdbot/blob/main/src/agents/pi-embedded-runner/lanes.ts) - Runtime lane mapping
- Related: [Conditional Parallel Tool Execution](/patterns/parallel-tool-execution) for tool-level parallelism
