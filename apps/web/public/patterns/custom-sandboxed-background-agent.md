---
title: Custom Sandboxed Background Agent
status: emerging
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Ramp (Inspect Agent)", "Zach Bruggeman, Jason Quense, Rahul Sengottuvelu (Ramp)"]
category: Orchestration & Control
source: "https://engineering.ramp.com/post/why-we-built-our-background-agent"
tags: [background-agent, sandboxed, model-agnostic, real-time, websocket, custom-infra, iterative]
---

## Problem

Off-the-shelf coding agents (e.g., Devin, Claude Code, Cursor) are either:

- **Too generic** - Not deeply integrated with company-specific dev environments, tools, and workflows
- **Vendor-locked** - Tightly coupled to one model provider, limiting flexibility and creating dependency
- **Limited context** - Cannot access internal infrastructure, private repos, or company-specific tooling

Companies need coding agents that:

- Work within their specific development environment
- Can iterate with closed feedback loops (compiler, linter, tests)
- Provide real-time visibility into agent progress
- Are model-agnostic to switch providers as needed

## Solution

Build a **custom background agent** that runs in a sandboxed environment identical to developers, with:

**1. Sandboxed Execution Environment**
- Use infrastructure like Modal for ephemeral, sandboxed dev environments
- Agent runs with same context: codebase, dependencies, dev tools
- Isolated from production but mirroring development setup

**2. Real-Time Communication Layer**
- WebSocket connection streams stdout/stderr to client
- User sees agent progress in real-time (not polling)
- Two-way communication for prompts and status updates

**3. Closed Feedback Loop**
- Agent iterates autonomously with machine-readable feedback
- Compiler errors, linter warnings, test failures guide iterations
- Not 1-shot implementation - but iterative refinement

**4. Model-Agnostic Architecture**
- Support multiple frontier models via pluggable interface
- Switch between providers without rewriting infrastructure
- Leverage best model for specific task type

**5. Company-Specific Integration**
- Deep integration with internal tooling, scripts, and workflows
- Access to private repos, internal APIs, documentation
- Customized to team's specific development practices

## Example

```mermaid
flowchart TD
    subgraph Client["Developer's Machine"]
        UI[Web UI / CLI]
    end

    subgraph Infrastructure["Company Infrastructure"]
        Svc[Agent Service]
        Sandbox[Sandboxed Dev Environment<br/>Modal / OpenCode]
        VCS[Git / Version Control]
    end

    UI -->|"WebSocket: Send Prompt"| Svc
    UI <-->|"WebSocket: Real-time Stream<br/>stdout/stderr"| Svc
    Svc -->|"Spin up sandbox"| Sandbox
    Sandbox <-->|"Read/Write Files"| VCS

    loop Iterative Refinement
        Sandbox -->|"Compiler/Linter/Test Feedback"| Sandbox
    end

    Sandbox -->|"Final PR/Result"| Svc
    Svc -->|"Notification"| UI
```

## How to use it

**Architecture Components:**
- **Sandbox provider**: Modal, sprites.dev, or custom container orchestration
- **WebSocket server**: For real-time bidirectional communication
- **Model abstraction layer**: Interface supporting multiple LLM providers
- **Feedback loop integrations**: Parser for compiler/linter/test output

**Implementation Steps:**
1. Create a sandbox service that spins up isolated dev environments
2. Build WebSocket layer for prompt submission and progress streaming
3. Implement model-agnostic agent interface
4. Add feedback loop integrations (test parsing, error ingestion)
5. Connect to version control for branch/PR creation

**Why Custom vs. Off-the-Shelf:**
- Off-the-shelf agents (Devin, Cursor) work great for generic tasks
- But they can't deeply integrate with your company's specific infrastructure
- Building custom lets you optimize for your workflows, tools, and security requirements

## Trade-offs

* **Pros:**
  - **Deep integration** with company-specific tools and workflows
  - **Model flexibility** - not locked into one provider
  - **Real-time visibility** into agent progress and intermediate steps
  - **Same context as developers** - agent works in identical environment
  - **Custom feedback loops** tailored to your stack

* **Cons:**
  - **Engineering overhead** - requires building and maintaining infrastructure
  - **Security considerations** - agent needs access to repos, credentials
  - **Ongoing maintenance** - unlike SaaS solutions, you own the ops burden
  - **Requires devops expertise** - sandbox management, websocket scaling

## References

* [Why We Built Our Own Background Agent - Ramp Engineering](https://engineering.ramp.com/post/why-we-built-our-background-agent)
* [Hacker News Discussion](https://news.ycombinator.com/item?id=46589842)
