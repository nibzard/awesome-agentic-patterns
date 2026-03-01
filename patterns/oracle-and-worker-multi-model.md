---
title: Oracle and Worker Multi-Model Approach
status: emerging
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Sourcegraph Team"]
category: Orchestration & Control
source: "https://youtu.be/hAEmt-FMyHA?si=6iKcGnTavdQlQKUZ"
tags: [multi-model, cost-optimization, strategic-reasoning, architecture]
---

## Problem

Relying on a single AI model creates a trade-off between capability and cost. High-performance models are expensive for routine tasks, while cost-effective models may lack the reasoning power for complex problems.

## Solution

Implement a two-tier system with specialized roles:

- **The Worker (Claude Sonnet 4):** Fast, capable, and cost-effective agent handling bulk tool use and code generation
- **The Oracle (OpenAI o3 / Gemini 2.5 Pro):** Powerful, expensive model reserved for high-level reasoning, architectural planning, and debugging complex issues

The Worker can explicitly request Oracle consultation when stuck or needing better strategy. The Oracle reviews the Worker's approach and suggests course corrections without polluting the main agent's context.

```mermaid
graph TD
    A[User Request] --> B[Worker Agent]
    B --> C{Need Oracle?}
    C -->|Yes| D[Oracle Consultation]
    C -->|No| E[Direct Execution]
    D --> F[Strategic Guidance]
    F --> G[Worker Implements]
    G --> H[Task Complete]
    E --> H
```

## Evidence

- **Evidence Grade:** `emerging`
- **Most Valuable Findings:** Validated in production at Sourcegraph (~90% cost reduction vs. all-frontier); academic foundation from model cascading research (FrugalGPT: up to 98% cost reduction with quality parity)
- **Unverified:** Optimal Oracle invocation thresholds remain application-specific

## How to use it

Development environments, complex coding tasks, architectural decisions, debugging sessions where initial approaches fail. Also known in literature as model cascading, weak-strong model routing, or hierarchical model systems.

## Trade-offs

* **Pros:** Cost-efficient use of frontier models; sophisticated problem-solving; specialized AI team approach
* **Cons:** Additional orchestration complexity; potential latency from model switching; requires careful Oracle invocation logic

## References

* Sourcegraph Team presentation on multi-model AI systems
* FrugalGPT (Stanford, 2023): https://arxiv.org/abs/2305.05176
* RouteLLM (ICLR 2024): https://arxiv.org/abs/2406.18665
* LiteLLM Router: https://github.com/BerriAI/litellm

- Primary source: https://youtu.be/hAEmt-FMyHA?si=6iKcGnTavdQlQKUZ
