---
title: "Dev Tooling Assumptions Reset"
status: emerging
authors: ["Nikola Balic (@nibzard)"]
based_on: ["AMP (Thorsten Ball, Quinn Slack)"]
category: "UX & Collaboration"
source: "https://www.youtube.com/watch?v=2wjnV6F2arc"
tags: [dev-tools, assumptions, github, tickets, code-review, tooling, agent-workflows, paradigm-shift]
---

## Problem

Traditional development tools are built on assumptions that no longer hold: that humans write code with effort and expertise, that changes are scarce and valuable, that linear workflows make sense. When agents write 90% of code, these tools create bottlenecks and friction.

## Solution

**Re-examine dev tooling assumptions** from first principles. When agents write most code, the perceived value of changes drops dramatically, and workflows optimized for human effort become inefficient.

**Core insight:**

> "A lot of the dev tooling we have is not going to cut it because a lot of the tooling we have is based on the assumption that the human wrote code, that the human put a lot of effort and time and expertise into writing a given piece of code."

```mermaid
graph TD
    subgraph Old_Assumptions["Old Assumptions"]
        A1[Humans write code]
        A2[Code is scarce/valuable]
        A3[Developers are busy]
        A4[Changes are permanent]
    end

    subgraph New_Reality["New Reality"]
        B1[Agents write code]
        B2[Code is abundant/cheap]
        B3[Agents are unlimited]
        B4[Variations are trivial]
    end

    A1 --> C[Linear Tickets]
    A2 --> D[PR Reviews + Emoji Reactions]
    A3 --> E[Sprint Planning]
    A4 --> F[Branching Strategies]

    B1 --> G[Send Agent Immediately]
    B2 --> H[Generate 10 Variations]
    B3 --> I[Parallel Investigation]
    B4 --> J[Primordial Soup]

    style C fill:#ffcdd2,stroke:#c62828
    style D fill:#ffcdd2,stroke:#c62828
    style E fill:#ffcdd2,stroke:#c62828
    style F fill:#ffcdd2,stroke:#c62828
    style G fill:#c8e6c9,stroke:#2e7d32
    style H fill:#c8e6c9,stroke:#2e7d32
    style I fill:#c8e6c9,stroke:#2e7d32
    style J fill:#c8e6c9,stroke:#2e7d32
```

**The ticket example:**

**Old world (human writes code):**
1. Bug reported
2. Developer is busy, working on something else
3. Create ticket for next sprint
4. Assign ticket next week
5. Developer gets context, sets up dev environment
6. Developer fixes bug

**New world (agent writes code):**
1. Bug reported
2. Send agent immediately to investigate
3. Agent diagnoses and fixes in same time it would take to create a ticket

> "In a world where a human writes code and they have to get context and set up the dev environment and switch the branches and blah blah blah...you would create a linear ticket because the developer was busy. But if you now have unlimited entities being able to investigate your code, why shouldn't you send the agent off immediately before you create a ticket?"

**The code review example:**

GitHub features assume changes are valuable:
- Emoji reactions (❤️ 😃)
- Assigning reviewers
- Careful consideration before merging

But when agents write 90% of code:
> "The perceived value of a given change is completely different because you can actually say to the agent, 'You're completely wrong. Ask your agent friend to spin up another chain. Make 10 variations of this.'"

## How to use it

**Audit your tools for outdated assumptions:**

| Tool Feature | Old Assumption | New Reality | What Changes |
|--------------|----------------|-------------|--------------|
| **Linear tickets** | Developers busy, queue work | Unlimited agents | Send immediately, no ticket |
| **PR reviews** | Humans careful with changes | Changes cheap | Auto-merge with testing |
| **Emoji reactions** | Social bonding around code | Code is commodity | Remove or repurpose |
| **Branching** | Careful isolation | Parallel generation | Direct to main or feature flags |
| **Code ownership** | Humans maintain areas | Agents know everything | Dynamic ownership |
| **Sprint planning** | Humans have limited capacity | Agents scale infinitely | Continuous flow |

**New tooling principles:**

1. **Immediate action**: Don't queue work, spawn agents instantly
2. **Variation generation**: Generate 10 versions, pick best
3. **Automated verification**: Tests > reviews
4. **Direct integration**: Fewer handoffs, more automation
5. **Observable execution**: See what agents are doing, not approve each step

**The "primordial soup" metaphor:**

When agents generate code continuously, you don't have discrete changes—you have a bubbling, brewing ecosystem of code variants:

> "If you have in your words, Quinn, like the primordial soup of agents and code that's always bubbling and brewing and generating new code...I don't think the given tools are going to cut it."

This requires new mental models and new interfaces:
- Not linear tickets, but continuous streams
- Not PR reviews, but automated quality gates
- Not sprint planning, but real-time prioritization
- Not code ownership, but dynamic attribution

## Trade-offs

**Pros:**

- **Removes bottlenecks**: No waiting for human availability
- **Faster iteration**: Agents investigate immediately
- **Better exploration**: Generate multiple approaches in parallel
- **Reduced ceremony**: Less overhead around changes
- **Scalability**: Works better as agent usage grows

**Cons:**

- **Loss of visibility**: Harder to track what's happening
- **Integration challenges**: Existing tools don't fit new model
- **Team resistance**: Developers attached to familiar workflows
- **New risks**: More automation means blast radius increases
- **Transition pain**: Hybrid human/agent workflows are awkward

**When to reset assumptions:**

- Agents writing majority of code (50%+)
- Team comfortable with autonomous agents
- Codebase has good automated testing
- Can tolerate experimentation and failure
- Leadership committed to new ways of working

**What to keep from old tools:**

- Accountability (who requested what)
- Traceability (why was this changed)
- Quality standards (tests, linting)
- Security (access control, approvals for sensitive changes)
- Learning (post-mortems, documentation)

## References

* [Raising an Agent Episode 9: The Assistant is Dead, Long Live the Factory](https://www.youtube.com/watch?v=2wjnV6F2arc) - AMP (Thorsten Ball, Quinn Slack, 2025)
* Related: [Factory over Assistant](factory-over-assistant.md), [Codebase Optimization for Agents](codebase-optimization-for-agents.md)
