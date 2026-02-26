---
title: LLM Map-Reduce Pattern
status: emerging
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Luca Beurer-Kellner et al. (2025)"]
category: Orchestration & Control
source: "https://arxiv.org/abs/2506.08837"
tags: [map-reduce, sub-agents, isolation, untrusted-data]
---

## Problem

When many untrusted documents are processed in a single reasoning context, one malicious item can influence global conclusions. This creates cross-document contamination where a single poisoned input affects unrelated items and final decisions.

## Solution

Adopt a **map-reduce workflow**:

- **Map:** Spawn lightweight, *sandboxed* LLMs—each ingests one untrusted chunk and emits a constrained output (boolean, JSON schema, etc.).  
- **Reduce:** Aggregate those safe summaries with either deterministic code or a privileged LLM that sees only sanitized fields.

Isolation is the core control: each map worker handles one item with constrained output contracts, so contamination cannot spread laterally. The reducer consumes validated summaries only, which preserves scalability and reduces injection blast radius.

```pseudo
results = []
for doc in docs:
    ok = SandboxLLM("Is this an invoice? (yes/no)", doc)
    results.append(ok)
final = reduce(results)  # no raw docs enter this step
```

## How to use it

File triage, product-review summarizers, resume filters—any N-to-1 decision where each item's influence should stay local.

## Trade-offs

* **Pros:** A malicious item can't taint others; scalable parallelism.
* **Cons:** Requires strict output validation; extra orchestration overhead.

## References

* Beurer-Kellner et al., §3.1 (3) LLM Map-Reduce.

- Primary source: https://arxiv.org/abs/2506.08837
