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

## How to use it
Development environments, complex coding tasks, architectural decisions, debugging sessions where initial approaches fail.

## Trade-offs
* **Pros:** Cost-efficient use of frontier models; sophisticated problem-solving; specialized AI team approach
* **Cons:** Additional orchestration complexity; potential latency from model switching; requires careful Oracle invocation logic

## References
* Sourcegraph Team presentation on multi-model AI systems