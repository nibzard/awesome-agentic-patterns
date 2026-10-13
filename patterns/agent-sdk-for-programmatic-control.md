---
title: Agent SDK for Programmatic Control
status: established
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Anthropic (Claude Agent SDK)"]
category: Tool Use & Environment
source: "https://github.com/anthropics/claude-agent-sdk-python"
tags: [sdk, automation, ci/cd, programmatic access, scripting, api, headless agent]
summary: "Exposes agent functions through an SDK and CLI so code can run the agent headless with set tools, permissions, and resource limits"
signals: ["Agent must run in CI/CD pipelines or scheduled jobs", "Batch processing across many files or projects", "Building custom apps or UIs on an agent backend"]
anti_signals: ["Microservices architecture that prefers REST or gRPC APIs", "High-frequency calls or real-time streaming", "Task needs conversational clarification"]
updated_at: "2026-10-13"
---

## Problem

Interactive terminal or chat interfaces are suitable for many agent tasks, but not for all. Integrating agent capabilities into automated workflows (e.g., CI/CD pipelines, scheduled jobs, batch processing) or building more complex applications on top of core agent functionalities requires a programmatic interface.

## Solution

Provide a Software Development Kit (SDK) that exposes the agent's core functionalities for programmatic access. This SDK allows developers to:

-   Invoke agent actions (e.g., process a prompt, use a tool, access memory) from code (e.g., Python, TypeScript).
-   Configure agent behavior and tool access in a non-interactive manner.
-   Integrate agent logic into larger software systems.
-   Automate repetitive tasks that involve the agent.
-   Build custom user interfaces or applications powered by the agent's backend.
-   Control resource limits (token budgets, execution time, cost caps).
-   Implement fine-grained permission management and authorization scopes.

The SDK typically includes libraries, command-line interfaces (CLIs) for scripting, and documentation for headless or embedded use of the agent.

As of 2026 this is mainstream vendor territory rather than a niche: Anthropic ships the Claude Agent SDK (renamed from "Claude Code SDK" in September 2025) with TypeScript and Python packages, and OpenAI (Agents SDK) and Google (Agent Development Kit) offer comparable programmatic agent control.

## Example (SDK integration)

```mermaid
flowchart TD
    A[Application/Script] --> B[Agent SDK]
    B --> C[Agent Core]

    B --> D[CLI Interface]
    B --> E[Python Library]
    B --> F[TypeScript Library]

    C --> G[Tool Access]
    C --> H[Memory Management]
    C --> I[Model Interface]

    G --> J[File System]
    G --> K[Web API]
    G --> L[Custom Tools]
```

## Example CLI Usage (Conceptual, from Claude Agent SDK info):

```bash
$ claude -p "what did i do this week?" \
  --allowedTools Bash(git log:*) \
  --output-format json
```

## How to use it

**When to use:**

- CI/CD pipeline integration and automated workflows
- Batch processing across multiple files or projects
- Building custom applications or UIs powered by agent backends
- High-performance requirements where caching and reduced overhead matter
- External developer integration and standardization needs

**When to avoid:**

- Microservices architecture (prefer REST/gRPC APIs)
- Language and framework independence is critical
- High-frequency calls (>100/sec) or real-time streaming

**Implementation guidance:**

- Start with a narrow tool surface and explicit parameter validation
- Add observability around tool latency, failures, and fallback paths
- Implement sandbox isolation for code execution

## Trade-offs

* **Pros:** Enables automation and CI/CD integration; provides fine-grained control over permissions, resources, and observability; supports batch processing and custom UIs.
* **Cons:** Introduces integration coupling and environment-specific upkeep; loses conversational interactivity and clarification; requires programmatic error handling with robust retry/fallback logic.

## References

-   [Claude Agent SDK (Python)](https://github.com/anthropics/claude-agent-sdk-python) and [Claude Agent SDK (TypeScript)](https://github.com/anthropics/claude-agent-sdk-typescript) - official SDK packages; the SDK was renamed from "Claude Code SDK" in September 2025
-   [Claude Code headless mode](https://code.claude.com/docs/en/headless) - official documentation for non-interactive CLI usage and output formats
-   OpenAI Agents SDK: https://github.com/openai/openai-agents-python
-   Google Agent Development Kit (ADK): https://github.com/google/adk-python
-   Distinct from [CLI-Native Agent Orchestration](cli-native-agent-orchestration.md): that pattern scripts an existing interactive CLI from the outside, while this pattern embeds the agent engine as a library inside your application
-   Supplementary practitioner overview (author's cheatsheet, May 2025): https://www.nibzard.com/claude-code
