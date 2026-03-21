---
title: "Governed Agentic Delivery"
status: validated-in-production
authors: ["Frédéric Geens (@Fr-e-d)"]
category: "Orchestration & Control"
source: "https://github.com/Fr-e-d/GAAI-framework"
tags: [governance, delivery, backlog, memory, qa-gates, context-isolation, daemon]
summary: "Separate agent reasoning (Discovery) from execution (Delivery) with strict context isolation, backlog-as-authorization, and persistent decision memory."
maturity: "maturing"
complexity: "medium"
effort: "days"
impact: "high"
signals: ["AI agent drifts from scope", "Agent forgets prior decisions", "No traceability between request and delivery", "Need for autonomous batch delivery"]
anti_signals: ["One-off prompts", "No persistent project", "Team already has PM + Jira workflow"]
prerequisites: ["Git repository", "AI coding tool (Claude Code, Cursor, Codex CLI, etc.)"]
---

## Problem

AI coding agents are powerful but ungoverned. Without structure, they drift: touching code they shouldn't, forgetting decisions from prior sessions, shipping features no one can verify against criteria. The more autonomous the agent becomes (batch delivery, daemon mode), the worse the drift.

## Solution

Separate the SDLC into two isolated tracks with a backlog as the contract between them:

- **Discovery Agent** — reasons about what to build. Produces Stories with acceptance criteria. Never writes code.
- **Delivery Agent** — executes Stories. Plans, implements, runs QA. Never decides scope.
- **Context isolation** — Discovery and Delivery never share a context window, preventing cross-contamination between reasoning and execution.
- **Backlog-as-authorization** — nothing executes without a backlog entry. The backlog is the single source of truth.
- **Persistent memory** — decisions, patterns, and project context survive across sessions via structured markdown files with progressive disclosure.
- **QA gate** — every delivery passes validation against acceptance criteria before shipping.

Optional: an autonomous **delivery daemon** polls the backlog and delivers stories in parallel without human intervention, using isolated git worktrees per story.

## Trade-offs

- Adds governance overhead to every task (even trivial ones need a backlog entry)
- Relies on the AI agent following markdown instructions — no programmatic enforcement of most rules
- Requires git workflow familiarity (branches, worktrees, PRs)
- Context isolation means Discovery insights don't carry into Delivery — the backlog must be explicit enough to stand alone

## Known Uses

- [GAAI Framework](https://github.com/Fr-e-d/GAAI-framework) — reference implementation (v2.8.0). 47 skills, 3 agents, autonomous delivery daemon. Markdown + YAML + bash, zero dependencies. Works with Claude Code, Cursor, Codex CLI, Gemini CLI, Windsurf.

## Related Patterns

- Versioned Constitution Governance
- Human-in-the-Loop Approval Framework
- Dual-Track Agile (Discovery + Delivery)
