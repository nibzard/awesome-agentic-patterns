---
title: Inversion of Control
status: validated-in-production
authors:
  - Nikola Balic (@nibzard)
based_on:
  - Quinn Slack
  - Thorsten Ball
category: Orchestration & Control
source: 'https://www.nibzard.com/ampcode'
tags:
  - orchestration
  - autonomy
  - control
slug: inversion-of-control
id: inversion-of-control
summary: "Gives the agent tools, a high-level objective, and guardrails, then lets it choose sequencing and recovery while humans set policy and review"
signals: ["Humans spend time scripting each step the agent takes", "Tasks have objective success criteria such as passing tests", "Guardrails and checkpoints can be enforced at risky boundaries"]
anti_signals: ["No guardrails or telemetry exist to detect drift or overreach", "Tasks have vague success criteria that need step-by-step human judgement", "Every step is high risk and needs explicit human approval"]
updated_at: '2026-10-13'
---

## Problem

Prompt-as-puppeteer workflows force humans to micromanage each step, turning agents into expensive autocomplete tools. This limits throughput, creates brittle instructions that break on small context changes, and prevents agents from using their own planning capability.

## Solution

Give the agent tools and a clear high-level objective, then let it own execution strategy inside explicit guardrails. Humans define intent, constraints, and review criteria; the agent decides sequencing, decomposition, and local recovery steps.

This implements a three-layer architecture: Policy Layer (human-defined objectives and constraints), Control Layer (automated guardrail enforcement), and Execution Layer (agent-owned task decomposition and tool selection).

This flips control from "human scripts every move" to "human sets policy, agent performs." The result is higher leverage while preserving oversight at critical checkpoints.

## Example (flow)

```mermaid
sequenceDiagram
  Dev->>Agent: "Refactor UploadService to async"
  Agent->>Repo: git grep "UploadService"
  Agent->>Tools: edit_file, run_tests
  Agent-->>Dev: PR with green CI
```

## Evidence

**Most Valuable Findings:**

- Academic validation from multiple 2025 papers (MI9 governance framework, Beurer-Kellner et al. security patterns) confirms external control layers are essential for agent safety
- The practice of letting the model decide which tools to run is now the common definition of an agent (see Willison's 2025 definitional post in References)

## How to use it

- Start with bounded tasks where success criteria are objective (tests pass, migration complete, docs generated).
- Give explicit constraints: allowed tools, time budget, and escalation conditions.
- Require checkpoints at risky boundaries (schema changes, deploy steps, external write actions).
- Measure autonomy win-rate (target >80%) and human intervention rate per task class.

## Trade-offs

* **Pros:** Higher developer leverage, faster execution loops, and better use of model planning ability.
* **Cons:** Requires strong guardrails and telemetry to prevent silent drift or overreach.

## References

* [Raising An Agent - Episode 1](https://ampcode.com/podcast/episode-1), "It's a big bird, it can catch its own food." (AMP, March 6, 2025)
* Simon Willison, [What is an agent?](https://simonwillison.net/2025/Sep/18/agents/) (September 18, 2025) — the model deciding which tools to run as the settled definition of an agent
* MI9: Runtime Governance Framework (arXiv:2508.03858v3, 2025)
* Beurer-Kellner et al., Design Patterns for Securing LLM Agents (arXiv:2506.08837, 2025)
* Related: [Spectrum of Control / Blended Initiative](spectrum-of-control-blended-initiative.md) — the calibrated-autonomy companion. Distinct from that pattern: it adjusts how much initiative the agent gets per task, while this one hands over orchestration wholesale inside guardrails.

[Source](https://www.nibzard.com/ampcode)
