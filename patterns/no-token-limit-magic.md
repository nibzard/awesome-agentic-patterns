---
title: No-Token-Limit Magic
status: experimental-but-awesome
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Thorsten Ball", "Quinn Slack"]
category: Reliability & Eval
source_link: "https://www.nibzard.com/ampcode"
tags: [performance, cost, experimentation]
---

## Problem
Aggressive prompt compression to save tokens stifles reasoning depth and self-correction.

## Solution
During prototyping, **remove hard token limits**. Allow lavish context and multiple reasoning passes. Yes, it's pricier—but dramatically better outputs surface valuable patterns before optimizing.

## Example (token budget approach)
```mermaid
flowchart TD
    A[Development Phase] --> B{Token Strategy}
    B -->|Prototype| C[No Token Limits]
    B -->|Production| D[Optimized Limits]

    C --> E[Lavish Context]
    C --> F[Multiple Reasoning Passes]
    C --> G[Rich Self-Correction]

    E --> H[Better Output Quality]
    F --> H
    G --> H

    H --> I[Identify Valuable Patterns]
    I --> J[Optimize for Production]
    J --> D
```

## References
- Raising An Agent - Episode 2 cost discussion—$1000 prototype spend justified by productivity.

[Source](https://www.nibzard.com/ampcode)