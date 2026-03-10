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

- **Map:** Spawn lightweight, *sandboxed* LLMs—each ingests one untrusted chunk and emits a constrained output (boolean, JSON schema, enum).
- **Reduce:** Aggregate validated summaries via deterministic code (count, filter, majority-vote) or a privileged LLM that sees only sanitized fields.

Isolation is the core control: each map worker handles one item with constrained output contracts, so contamination cannot spread laterally. The reducer consumes validated summaries only, which preserves scalability and reduces injection blast radius.

```pseudo
results = []
for doc in docs:
    ok = SandboxLLM("Is this an invoice? (yes/no)", doc)
    results.append(ok)
final = reduce(results)  # no raw docs enter this step
```

## How to use it

File triage, document summarization, resume filters, code migration verification—any N-to-1 decision where each item's influence should stay local.

Best fit when: N ≥ 10 items, processing time > 30s/item, items are independent, and aggregation is needed.

## Trade-offs

* **Pros:** A malicious item can't taint others; scalable parallelism; smaller contexts reduce cost.
* **Cons:** Requires strict output validation; extra orchestration overhead; loses cross-item context.

## References

* Beurer-Kellner et al., §3.1 (3) LLM Map-Reduce.
* Dean & Ghemawat (2008). MapReduce: Simplified Data Processing on Large Clusters.

- Primary source: https://arxiv.org/abs/2506.08837
- Foundational MapReduce: https://doi.org/10.1145/1327452.1327492
