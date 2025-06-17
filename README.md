# Awesome Agentic Patterns [![Awesome](https://awesome.re/badge.svg)](https://awesome.re)

A curated catalogue of **agentic AI patterns** — real‑world tricks, workflows, and mini‑architectures that help autonomous or semi‑autonomous AI agents get useful work done in production.

> **Why?**
> Tutorials show toy demos. Real products hide the messy bits. This list surfaces the repeatable patterns that bridge the gap so we can all ship smarter, faster agents.

---

## What counts as a pattern?

* **Repeatable** – more than one team is using it.
* **Agent‑centric** – improves how an AI agent senses, reasons, or acts.
* **Traceable** – backed by a public reference: blog post, talk, repo, or paper.

If your link ticks those boxes, it belongs here.

---

## Quick Tour of Categories

|  Category                  |  What you'll find                                        |
| --------------------------- | --------------------------------------------------------- |
| [**Orchestration & Control**](#orchestration-control) | Task decomposition, sub‑agent spawning, tool routing      |
| [**Context & Memory**](#context-memory)        | Sliding‑window curation, vector cache, episodic memory    |
| [**Feedback Loops**](#feedback-loops)          | Compilers, CI, human review, self‑healing retries         |
| [**Tool Use & Environment**](#tool-use-environment)  | Shell, browser, DB, Playwright, sandbox tricks            |
| [**UX & Collaboration**](#ux-collaboration)      | Prompt hand‑offs, staged commits, async background agents |
| [**Reliability & Eval**](#reliability-eval)      | Guardrails, eval harnesses, logging, reproducibility      |

*Categories are fluid — open a PR if you see a better slice!*
The tables below are auto‑generated from the `patterns/` folder.

---

<!-- …existing content above… -->

<!-- AUTO-GENERATED PATTERNS START -->

### <a name=""></a>Context & Memory

- [Agent-Powered Codebase Q&A / Onboarding](patterns/agent-powered-codebase-qa-onboarding.md)
- [Curated Context Window](patterns/curated-context-window.md)
- [Dynamic Context Injection (@mention & /commands)](patterns/dynamic-context-injection.md)
- [Layered Configuration Context (CLAUDE.md Style)](patterns/layered-configuration-context.md)

### <a name="-"></a>Feedback Loops

- [AI-Assisted Code Review / Verification](patterns/ai-assisted-code-review-verification.md)
- [Background Agent with CI Feedback](patterns/background-agent-ci.md)
- [Dogfooding with Rapid Iteration for Agent Improvement](patterns/dogfooding-with-rapid-iteration-for-agent-improvement.md)
- [Rich Feedback Loops > Perfect Prompts](patterns/rich-feedback-loops.md)
- [Spec-As-Test Feedback Loop](patterns/spec-as-test-feedback-loop.md)

### <a name="-"></a>Orchestration & Control

- [Agent-Driven Research](patterns/agent-driven-research.md)
- [Conditional Parallel Tool Execution](patterns/parallel-tool-execution.md)
- [Inversion of Control](patterns/inversion-of-control.md)
- [Iterative Multi-Agent Brainstorming](patterns/iterative-multi-agent-brainstorming.md)
- [Multi-Model Orchestration for Complex Edits](patterns/multi-model-orchestration-for-complex-edits.md)
- [Specification-Driven Agent Development](patterns/specification-driven-agent-development.md)
- [Sub-Agent Spawning](patterns/sub-agent-spawning.md)

### <a name=""></a>Reliability & Eval

- [Extended Coherence Work Sessions](patterns/extended-coherence-work-sessions.md)
- [No-Token-Limit Magic](patterns/no-token-limit-magic.md)

### <a name="-"></a>Tool Use & Environment

- [Agent SDK for Programmatic Control](patterns/agent-sdk-for-programmatic-control.md)
- [CLI-Native Agent Orchestration (Claude CLI Mode)](patterns/cli-native-agent-orchestration.md)
- [LLM-Friendly API Design](patterns/llm-friendly-api-design.md)
- [Shell Command Contextualization (!)](patterns/shell-command-contextualization.md)
- [Tool Use Steering via Prompting](patterns/tool-use-steering-via-prompting.md)
- [Virtual Machine Operator Agent](patterns/virtual-machine-operator-agent.md)

### <a name=""></a>UX & Collaboration

- [Abstracted Code Representation for Review](patterns/abstracted-code-representation-for-review.md)
- [Agent-Assisted Scaffolding](patterns/agent-assisted-scaffolding.md)
- [Agent-Friendly Workflow Design](patterns/agent-friendly-workflow-design.md)
- [AI-Accelerated Learning and Skill Development](patterns/ai-accelerated-learning-and-skill-development.md)
- [Democratization of Tooling via Agents](patterns/democratization-of-tooling-via-agents.md)
- [Seamless Background-to-Foreground Handoff](patterns/seamless-background-to-foreground-handoff.md)
- [Spectrum of Control / Blended Initiative](patterns/spectrum-of-control-blended-initiative.md)
- [Verbose Reasoning Transparency (Ctrl+R Style)](patterns/verbose-reasoning-transparency.md)

<!-- AUTO-GENERATED PATTERNS END -->

<!-- …existing content below… -->

---

## Contributing in 3 steps

1. **Fork & branch** → `git checkout -b add-my-pattern`
2. **Add a pattern file** under `patterns/` using the template above.
3. **Open a PR** titled `Add: my-pattern-name` — the README & site will regenerate automatically.

See [`CONTRIBUTING.md`](https://github.com/nibzard/awesome-agentic-patterns/blob/main/CONTRIBUTING.md) for the fine print.

---

## Inspiration

This project started after the write‑up [**"What Sourcegraph learned building AI coding agents"**](https://www.nibzard.com/ampcode) (28 May 2025) and the ongoing *Raising an Agent* video diary. Many first patterns come straight from those lessons — thanks to everyone sharing their journey in the open!

---

## License

Apache‑2.0. See [`LICENSE`](https://github.com/nibzard/awesome-agentic-patterns/blob/main/LICENSE).
