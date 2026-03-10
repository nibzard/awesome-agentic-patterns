---
title: Cross-Cycle Consensus Relay
status: emerging
authors: ["Nikita Dmitrieff (@NikitaDmitrieff)"]
based_on: ["auto-co autonomous AI company framework"]
category: Orchestration & Control
source: "https://github.com/NikitaDmitrieff/auto-co-meta"
tags: [multi-agent, state-management, persistence, long-running-tasks, orchestration, autonomous-loops]
---

## Problem

Autonomous multi-agent loops that run across many cycles (minutes, hours, or days) need a way to reliably transfer context, decisions, and next actions between cycles. In-memory state is lost on crash or restart. Generic checkpoint files don't encode the *structured reasoning* — what was decided, why, and what comes next — that agents need to make good decisions in subsequent cycles.

Without a structured relay mechanism, autonomous loops suffer from:
- **Drift**: each cycle restarts without awareness of prior decisions
- **Repetition**: agents re-debate already-settled questions
- **Stalls**: no convergence signal — agents loop indefinitely without shipping

## Solution

Each agent cycle reads a **consensus relay document** at the start, executes its work, then writes an updated consensus document at the end. The document is not just a checkpoint — it's a structured handoff that encodes current phase, completed actions, active decisions, open questions, and the single most important **next action** for the following cycle.

The relay document is written to a temp file and atomically renamed to prevent partial-write corruption. Every field is a deliberate relay signal, not just a log.

**Core pattern:**

```bash
# auto-loop.sh — the minimal autonomous loop
while true; do
  # Each cycle reads the relay baton, executes, writes a new one
  claude -p "$(cat PROMPT.md)" \
    --context "$(cat memories/consensus.md)"
  sleep $CYCLE_INTERVAL
done
```

**Relay document structure:**

```markdown
# Relay Consensus

## Last Updated

2026-03-07T03:00:00Z

## Current Phase

Integration and validation in progress

## What We Did This Cycle

- Completed the deployment checklist for the worker service
- Validated the retry path against the staging environment

## Key Decisions Made

- Standardized on a single relay schema for all cycles
- Deferred load testing until the integration path is stable

## Active Projects

- worker-service: deployed to staging — next: add latency instrumentation
- api-integration: in progress — next: finalize auth handoff

## Metrics

- Successful runs: 42
- Failed runs: 3
- Mean cycle time: 11m

## Next Action

Finish auth handoff between the scheduler and the API gateway

## Open Questions

- Should stalled-cycle detection trigger after 2 repeats or 3?
```

**Atomic write protocol:**

```bash
# Write to temp first, then rename — prevents partial-write corruption
cat > memories/.consensus.tmp << EOF
$(generate_updated_consensus)
EOF
mv memories/.consensus.tmp memories/consensus.md
```

## How to use it

**Best for:**

- Long-running autonomous agent loops (multi-cycle, multi-day execution)
- Multi-agent systems where context and decisions must survive restarts
- Teams of agents where shared understanding of "what we've decided" matters
- Any system where you want convergence toward shipping rather than endless discussion

**Implementation steps:**

1. **Define your relay document schema** — every field should serve the *next* cycle, not just log the current one:

   ```markdown
   ## Current Phase       # Where are we in the journey?
   ## What We Did         # What happened? (recent history)
   ## Key Decisions       # What was decided and why? (institutional memory)
   ## Active Projects     # What's in flight? (state)
   ## Next Action         # Single most important thing next cycle (directive)
   ## Open Questions      # What's unresolved? (forward pressure)
   ```

2. **Add convergence detection** — if the same Next Action appears for N consecutive cycles, the loop is stalled and must change direction:

   ```bash
   LAST_ACTION=$(grep "## Next Action" -A1 memories/consensus.md | tail -1)
   PREV_ACTION=$(grep "## Next Action" -A1 memories/prev-consensus.md | tail -1 2>/dev/null || echo "")

   if [ "$LAST_ACTION" = "$PREV_ACTION" ]; then
     echo "CONVERGENCE RULE TRIGGERED: same next action twice — forcing direction change"
     # Inject this signal into the prompt for the next cycle
   fi
   ```

3. **Encode the relay read explicitly in the prompt** — the agent must know this is a relay document, not just context:

   ```
   Read memories/consensus.md. This is your relay baton — it tells you what
   was decided before you, and what you must do next. After completing your
   work, update it with what you did, what you decided, and the next action
   for the cycle after you.
   ```

4. **Separate ephemeral logs from relay state** — don't put everything in the consensus. Per-cycle logs go in `logs/`, per-agent outputs go in `docs/<role>/`. The consensus is the relay, not the archive.

**Convergence rules (optional but recommended):**

```
- Cycle 1: Brainstorm. End with top 3 ranked options.
- Cycle 2: Pick #1. Run pre-mortem + validation. GO / NO-GO.
- Cycle 3+: GO → ship artifacts. Discussion FORBIDDEN.
- Same Next Action 2 consecutive cycles → stalled. Change direction now.
- Every cycle after Cycle 2 MUST produce artifacts (files, deployments).
```

## Trade-offs

**Pros:**

- Agents resume with full context even after crash, restart, or long pause
- Structured relay prevents context drift across cycles
- Open questions create forward pressure — cycles don't stall in comfort
- Convergence rules can be encoded directly in the relay document
- Human-readable: anyone can inspect the relay and understand the workflow state
- Git-friendly: diffs show exactly what changed between cycles

**Cons:**

- Schema discipline required — a poorly structured relay document degrades agent reasoning
- Relay grows over time; needs periodic summarization / archival of old decisions
- Single-file relay is a bottleneck for high-frequency loops (>1 cycle/minute)
- Context window limits constrain how large the relay can grow
- Sensitive state (API keys, credentials) must never be written to the relay file

**Operational considerations:**

- Keep the relay document under ~2000 tokens to leave room for agent reasoning
- Archive old cycles to `memories/archive/` when the relay grows unwieldy
- Use atomic writes (write to temp, rename) to prevent partial-write corruption
- Commit the relay to git after each cycle for full audit trail
- Define what "done" looks like in the relay — open-ended phases create drift

## Known Implementations

- [auto-co framework](https://github.com/NikitaDmitrieff/auto-co-meta) — open-source autonomous loop framework using a relay document across repeated cycles

## References

- [Anthropic Engineering: Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- [BabyAGI](https://github.com/yoheinakajima/babyagi) — early task-loop example with persistent task artifacts
- Related: [Filesystem-Based Agent State](filesystem-based-agent-state.md) — for checkpointing within a single cycle
- Related: [Proactive Agent State Externalization](proactive-agent-state-externalization.md) — for agents that self-initiate state writes
- Related: [Initializer-Maintainer Dual Agent Architecture](initializer-maintainer-dual-agent.md) — for session handoff artifacts across repeated work cycles
