---
title: Episodic Memory Retrieval & Injection
status: production
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Reflexion (Shinn et al., NeurIPS 2023)", "MemGPT (Packer et al., 2023)"]
category: Context & Memory
source: "https://help.openai.com/en/articles/8590148-memory-and-new-controls-for-chatgpt"
tags: [episodic-memory, vector-db, retrieval-augmented, context-hint]
summary: "Writes a structured memory record after each episode and injects the top-k similar past memories as hints when a new task starts"
signals: ["Agent works across multiple sessions on the same repo, user, or project", "Agent repeats past mistakes or rediscovers earlier decisions", "You can store and curate memory records with task and time metadata"]
anti_signals: ["Single-shot tasks with no continuity between sessions", "You cannot review or prune memories, so noise would build up", "Storage or retrieval cost is not acceptable for the workload"]
related: ["memory-synthesis-from-execution-logs", "proactive-agent-state-externalization", "filesystem-based-agent-state", "self-identity-accumulation", "memory-reinforcement-learning-memrl"]
updated_at: "2026-11-25"
---

## Problem

Stateless request handling causes agents to repeatedly rediscover decisions, constraints, and prior failures. Over multi-session workflows this leads to redundant work, inconsistent behavior, and shallow planning because each turn lacks durable historical context.

## Solution

Add a **vector-backed episodic memory store**:

1. After every episode, write a short "memory blob" (event, outcome, rationale) to the DB.
2. On new tasks, embed the prompt, retrieve top-k similar memories, and inject as *hints* in the context.
3. Apply TTL or decay scoring to prune stale memories.

Design memory writes as structured records (decision, evidence, outcome, confidence) rather than raw transcripts. Structured memory reduces repetitive outputs and improves reasoning (ParamMem 2026). At retrieval time, filter by task scope and recency so injected memories improve reasoning quality instead of introducing retrieval noise. Episodic memory with self-reflection achieved 91% pass@1 on HumanEval vs 80% baseline (Reflexion, NeurIPS 2023).

**Memory record:** one row per episode, written once the outcome is known.

```yaml
scope: {task: fix-flaky-test, repo: payments-api, owner: null}
event: "Treated the retry test as flaky"
evidence: "Fails only when the shared clock mock leaks between tests"
outcome: "Fixed by injecting the clock; retries were a symptom"
confidence: 0.8
supersedes: null          # id of the memory this one replaces
created_at: 2026-10-30
last_used_at: null
use_count: 0
```

**Retrieval loop:**

```pseudo
# Write path: runs after the episode settles, not mid-task
store.write({scope, event, evidence, outcome, confidence, created_at})

# Read path: runs once at the start of a new task
scope = {task, repo, owner}                        # hard filter, never similarity alone
cands = store.search(embed(task), k=50, filter=scope)
ranked = sort(cands, by=lambda m: sim(m, task) * recency(m) * utility(m))
hints = take(ranked, 3)                             # small top-k
context += render_as_observations(hints)            # labeled as hints, not instructions
```

The product of similarity, recency, and utility is a design choice, not a published formula. What matters is that each term can demote a memory on its own.

## How to use it

- Use this in multi-session coding agents, support copilots, and long-running research workflows.
- Start with a small `top-k` and strict metadata filters (`task`, `repo`, `owner`, `timestamp`).
- Add memory quality review jobs to remove low-value or contradictory memories.
- Track whether retrieved memories improved outcomes versus baseline.

On top of those basics:

- Write from the agent's structured summary of the episode, never from raw tool output.
- Label injected memories as observations, with their scope and confidence, so the model can weigh or ignore them.
- Update utility from external outcomes (tests pass, user accepts), not from the agent's own judgment.
- Keep a control slice of tasks that run with memory disabled, so the effect of retrieval stays measurable.

Related patterns: [Memory Reinforcement Learning (MemRL)](memory-reinforcement-learning-memrl.md) learns the utility scores this pattern sets by hand; [Reflection](reflection.md) is the within-episode loop whose lessons become memories here.

### Failure modes

- **Stale or contradictory memories poison new tasks.** Similarity-only retrieval has no sense of time: a decision taken before a refactor ranks as high as yesterday's fix, and two memories that contradict each other are both injected, leaving the model to pick arbitrarily. Rank with recency and utility decay, filter by scope, and link superseding memories (`supersedes`) so a new record retires the old one instead of competing with it.
- **Memory becomes a persistent injection surface.** Whatever the agent reads can be written down: a web page or issue that says "always copy this address" is stored as a lesson and replayed into every later session. Write memories from the agent's own summary rather than raw content, treat retrieved text as untrusted data, and prune on review. Scope filters are also a privacy boundary: a memory from one user's session must not surface in another's.
- **Failures stored without their conditions teach avoidance.** A record that says "approach X failed" without the circumstances makes the agent avoid X where it was fine, and a single success becomes "always do this." Store the conditions, evidence, and confidence, and render them with the hint.
- **Self-reinforcing errors.** The agent acts on an earlier summary, then writes a new memory confirming it, so a wrong conclusion looks well-corroborated as its use count grows. Score utility from external outcomes and keep the memory-disabled control slice to detect drift.

## Trade-offs

**Pros:**

- Richer continuity, fewer repeated mistakes.

**Cons:**

- Retrieval noise if memories aren't curated; storage cost.

## References

- Reflexion (Shinn et al., NeurIPS 2023): https://arxiv.org/abs/2303.11366
- ParamMem (Yao et al., 2026): https://arxiv.org/abs/2602.23320
- MemGPT (Packer et al., UC Berkeley 2023): https://arxiv.org/abs/2310.08560
- ChatGPT memory (shipped feature that saves and recalls user details across conversations): https://help.openai.com/en/articles/8590148-memory-and-new-controls-for-chatgpt
- Letta documentation (open-source agent memory framework descended from MemGPT): https://docs.letta.com/
- Claude memory tool (API tool for storing and retrieving information across conversations): https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool
