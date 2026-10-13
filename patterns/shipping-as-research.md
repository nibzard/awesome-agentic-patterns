---
title: "Shipping as Research"
status: emerging
authors: ["Nikola Balic (@nibzard)"]
based_on: ["AMP (Thorsten Ball, Quinn Slack)"]
category: "Learning & Adaptation"
source: "https://www.youtube.com/watch?v=4rx36wc9ugw"
tags: [research, experimentation, rapid-iteration, learning, dogfooding, shipping, uncertainty]
summary: "Releases reversible, instrumented features to learn whether they work, then doubles down or removes them based on usage data and feedback"
signals: ["Product sits on a fast-changing frontier such as AI agents", "Users are early adopters who accept experimentation", "Features can be reversed through flags or gradual rollout"]
anti_signals: ["Safety-critical or regulated applications", "Established market or enterprise users that need stability", "Features with high switching costs"]
updated_at: "2026-10-13"
---

## Problem

In the rapidly evolving AI landscape, waiting for certainty before building means you're always behind. Traditional product development emphasizes validation and certainty before release, but when the market changes every 3-6 weeks, you can't afford to wait.

**Expert intuition is unreliable**: Controlled-experiment research across major technology companies shows that most product ideas fail to improve key metrics even when experts are confident they will work — roughly two-thirds in Kohavi et al.'s Microsoft survey (2007), with higher figures reported in later Kohavi talks and the 2020 book. Real-world experimentation beats theoretical analysis.

## Solution

**Treat shipping as research**: release features not because you're certain they'll work, but to learn whether they work. Ship to figure out what works and doesn't work. Let reality and customer feedback guide your evolution.

**The alternative—sitting out—doesn't work:**

> "A lot of big companies have this where they're like, well, we're going to sit this one out. This is too crazy for us. We're going to wait and see where the dice are going to fall and then we're going to build for this."

But if you wait for the dice to fall, you'll be too far away to catch up.

```mermaid
graph TD
    A[Observation/Insight] --> B{Ship to Learn?}
    B -->|No, Wait for Certainty| C[Market Moves On]
    C --> D[Obsolete Before Starting]

    B -->|Yes, Ship as Research| E[Get Real Feedback]
    E --> F{Works?}
    F -->|Yes| G[Double Down]
    F -->|No| H[Pivot or Kill]
    G --> I[Learned What Works]
    H --> I
    I --> J[Next Insight]

    style C fill:#ffcdd2,stroke:#c62828
    style D fill:#b71c1c,stroke:#b71c1c
    style E fill:#c8e6c9,stroke:#2e7d32
    style I fill:#c8e6c9,stroke:#2e7d32
```

**Key insight:** The frontier is moving so fast that you must ship to discover what works. Analysis and planning can't keep up with the rate of change.

**Research mindset vs. Product mindset:**

| Product Mindset | Research Mindset |
|-----------------|------------------|
| Ship when polished | Ship to learn |
| Validate before release | Release to validate |
| Features must last | Features may die in 3 months |
| Customer acquisition | Customer learning |
| Revenue optimization | Insight optimization |

**Real example from AMP:**

AMP has repeatedly ripped out features users liked (to-dos, forking, tabs, and more), and each removal was greeted positively:

> "People actually really like it when we remove stuff. They were like, 'This is good. Cut the stuff that we've all know doesn't work anymore.'"

The removal story, including what AMP cut and why, is the core example of [Burn the Boats](burn-the-boats.md), which cites the same episode; read that entry for the feature-killing side. Shipping as research means being willing to both add AND remove features rapidly based on what you learn.

## How to use it

**Principles for shipping as research:**

**Enabling infrastructure**: Feature flags and gradual rollout mechanisms (canary, ring-based) are essential enablers. They allow controlled exposure, instant rollback, and percentage-based traffic allocation without code deployment.

**1. Ship before you're certain:**

```yaml
shipping_criteria:
  required:
    - Doesn't break existing functionality
    - Team believes it's worth trying
    - Can be reversed if needed

  not_required:
    - Certainty it will work
    - Perfect polish
    - Business case proven
    - User research validation
```

**2. Design for reversibility:**

Build features so they can be easily removed:
- Minimal dependencies
- Clean interfaces
- No deep coupling
- Monitor usage from day one

**3. Communicate the experimental nature:**

Let users know they're part of the research:
> "We're trying this out. We don't know if it'll work. Help us learn."

**4. Measure everything:**

You can't learn without data:
- Usage metrics
- Success/failure rates
- User feedback patterns
- Performance characteristics

**5. Kill quickly:**

When something isn't working, remove it (see [Burn the Boats](burn-the-boats.md) for AMP's full removal story from this episode):

> "I was like oh people won't care about this... and yet another removal, but we did and people actually really like it when we remove stuff."

**The "art installation" mindset:**

AMP describes themselves as "more like an art installation than a software company":

> "What if AMP itself self-destructs? Like what if you know basically we saying like well AMP is gone here's the new AMP... the construction and destruction of AMP you know like we joked about this but the funny thing is our customers appreciate this."

This mindset embraces constant change and experimentation.

## Trade-offs

**Pros:**

- **Speed**: Learn faster than competitors who wait for certainty
- **Real-world validation**: Actual usage trumps theoretical analysis
- **User goodwill**: Frontier users appreciate being part of the journey
- **Agility**: Can pivot quickly when something doesn't work
- **Innovation**: Discover approaches that planning would miss

**Cons:**

- **Wasted effort**: Some features will be built and then killed
- **User confusion**: Constant change can disorient users
- **Churn**: Some users prefer stability over experimentation
- **Brand risk**: Public failures can damage reputation
- **Resource inefficiency**: Building throwaway features seems wasteful

**When shipping as research works best:**

- Your user base is early adopters who understand experimentation
- You're on a rapidly evolving frontier (like AI agents)
- You're small enough to pivot quickly
- Your users value being on the cutting edge
- The cost of being wrong is low (reversible features)

**When to be more cautious:**

- Safety-critical applications
- Established markets with slow change
- Large enterprises with stability requirements
- Features with high switching costs
- Regulatory or compliance concerns

**The danger of sitting out:**

> "You might be too far away from where the dice will fall."

If you wait to see what happens before acting, you'll miss the window. The frontier moves too fast.

> "You need to constantly look up and see where they're going and trying to follow them. And you need to ship and hit reality and get customer feedback from customers such as ours to figure out what's going on, what's working and isn't working."

## References

* [Raising an Agent - Episode 10 (February 2026)](https://www.youtube.com/watch?v=4rx36wc9ugw) - Amp, Inc.; also at [ampcode.com/podcast/episode-10](https://ampcode.com/podcast/episode-10)
* [Controlled Experiments on the Web: Survey and Practical Guide](https://doi.org/10.1007/s10618-007-0061-3) - Kohavi, Henne, Sommerfield (2007) - reports roughly two-thirds of ideas failing at Microsoft, not the 80-90% figure sometimes quoted from later Kohavi talks
* Distinct from [Burn the Boats](burn-the-boats.md) (removing working features on a deadline) and [Disposable Scaffolding Over Durable Features](disposable-scaffolding-over-durable-features.md) (treating surrounding code as temporary): this pattern is the ship-to-learn stance that motivates both.
* Related: [Dogfooding with Rapid Iteration for Agent Improvement](dogfooding-with-rapid-iteration-for-agent-improvement.md)
