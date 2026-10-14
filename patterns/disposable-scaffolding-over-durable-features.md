---
title: "Disposable Scaffolding Over Durable Features"
status: emerging
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Thorsten Ball (Sourcegraph/Amp, Latent Space interview)"]
category: "Orchestration & Control"
source: "https://www.youtube.com/watch?v=b4rOVZWLW6E"
tags: [bitter-lesson, temporary-tooling, model-centric, adaptability, future-proofing]
summary: "Treats code around the model as temporary scaffolding: build the simplest thing that works now, mark it disposable, and remove it when models improve"
signals: ["You plan tooling that compensates for a current model weakness", "The feature would likely fail a test of being useful in 6 months", "Fast reaction to new model releases matters more than long-term polish"]
anti_signals: ["The code is durable business value such as domain logic or unique integrations", "The team cannot track disposal triggers and would keep the debt forever", "The work compounds over time and does not depend on model limitations"]
updated_at: "2026-10-13"
---

## Problem

In a field where foundation models improve dramatically every few months, investing significant engineering effort into building complex, durable features *around* the model is extremely risky. A feature that takes three months to build, such as a sophisticated context compression or a custom tool-chain for code editing, could be rendered obsolete overnight by the next model generation that performs the task natively.

## Solution

Adopt a "scaffolding" mindset when building tooling and workflows for an agent. Treat most of the code written around the core model as temporary, lightweight, and disposable—like wooden scaffolding around a building under construction.

- **Embrace "The Bitter Lesson":** Acknowledge that a lot of complex scaffolding will eventually "fall into the model" as its capabilities grow.
- **Prioritize Speed:** Build the simplest possible solution that works *now*, with the assumption that it will be thrown away later. This maximizes the team's ability to react to new models.
- **Avoid Over-Engineering:** Resist the urge to build scalable, robust, long-term solutions for problems that a better model could solve inherently. Focus engineering efforts on the unique value proposition that isn't directly tied to compensating for a model's current weaknesses.
- **Apply the 6-Month Test:** Before building complex tooling, ask: *"Will this be useful in 6 months when models improve?"* If NO, build as disposable scaffolding with explicit disposal triggers.
- **Make Disposability Explicit:** Document the temporary nature of scaffolding through clear naming, documented removal criteria, and architectural separation from durable features.

This approach keeps the product nimble and ensures that development resources are focused on adapting to the frontier of AI capabilities, rather than maintaining features that are destined for obsolescence.

## Example

```mermaid
flowchart TD
    A[New Model Release] --> B{Evaluate Current Scaffolding}
    B -->|Obsolete| C[Discard Old Tools]
    B -->|Still Needed| D[Keep Minimal Scaffolding]
    C --> E[Rebuild Lightweight Solution]
    D --> F[Adapt to New Capabilities]
    E --> G[Focus on Core Value]
    F --> G
    G --> H[Wait for Next Model]
    H --> A
```

## How to use it

- Apply when considering investments in model-specific workarounds like context compression, custom toolchains, or complex orchestration frameworks.
- Use the 6-month test: categorize as disposable if it compensates for current model limitations that newer models may handle natively.
- Design scaffolding for easy removal with well-defined interfaces to durable components and clear disposal triggers.
- Separate durable business value (domain knowledge, unique integrations) from temporary model workarounds.

## Trade-offs

* **Pros:** Faster development speed, lower maintenance burden, high adaptability to new models, intentional and bounded technical debt.
* **Cons:** Accepts lower code quality for temporary components, requires discipline to identify disposal triggers, can conflict with compounding engineering investments.

## References

- [Amp: The Emperor Has No Clothes — Thorsten Ball on Latent Space (September 25, 2025)](https://www.youtube.com/watch?v=b4rOVZWLW6E) — the quote origin, verified against the episode transcript: "What you want is... a scaffolding. Like you want to build a scaffolding around the model, a wooden scaffolding that if the model gets better or you have to switch it out, the scaffolding falls away. You know, like the bitter lesson. Like embrace that a lot of stuff might fall into the model as soon as the model gets better." Ball explains Amp deliberately restricts features added around the model so the harness stays replaceable.

- [Extreme Harness Engineering for Token Billionaires — Latent Space (April 7, 2026)](https://www.latent.space/harness-eng) — 2026 evidence that the idea is current: reasoning models working without predefined scaffolds, with the harness reduced to a box the model orchestrates itself.

- Note: https://www.sourcegraph.com is a product homepage and describes none of this; the earlier citation pointed there in error.
