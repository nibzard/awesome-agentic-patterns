# Awesome Agentic Patterns [![Awesome](https://awesome.re/badge.svg)](https://awesome.re)

![Awesome Agentic Patterns](/agentic-patterns.jpeg)

A curated catalogue of **agentic AI patterns** — real‑world tricks, workflows, and mini‑architectures that help autonomous or semi‑autonomous AI agents get useful work done in production.

*Testing automatic deployment...*

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

- [Context Window Anxiety Management](patterns/context-window-anxiety-management.md) <span class='new-badge'>NEW</span>
- [Context-Minimization Pattern](patterns/context-minimization-pattern.md) <span class='updated-badge'>UPDATED</span>
- [Curated Code Context Window](patterns/curated-code-context-window.md) <span class='updated-badge'>UPDATED</span>
- [Curated File Context Window](patterns/curated-file-context-window.md)
- [Dynamic Context Injection](patterns/dynamic-context-injection.md)
- [Episodic Memory Retrieval & Injection](patterns/episodic-memory-retrieval-injection.md)
- [Layered Configuration Context](patterns/layered-configuration-context.md)
- [Proactive Agent State Externalization](patterns/proactive-agent-state-externalization.md) <span class='new-badge'>NEW</span>

### <a name="-"></a>Feedback Loops

- [Background Agent with CI Feedback](patterns/background-agent-ci.md)
- [Coding Agent CI Feedback Loop](patterns/coding-agent-ci-feedback-loop.md)
- [Dogfooding with Rapid Iteration for Agent Improvement](patterns/dogfooding-with-rapid-iteration-for-agent-improvement.md)
- [Graph of Thoughts (GoT)](patterns/graph-of-thoughts.md)
- [Inference-Healed Code Review Reward](patterns/inference-healed-code-review-reward.md)
- [Reflection Loop](patterns/reflection.md)
- [Rich Feedback Loops > Perfect Prompts](patterns/rich-feedback-loops.md) <span class='updated-badge'>UPDATED</span>
- [Self-Critique Evaluator Loop](patterns/self-critique-evaluator-loop.md)
- [Self-Discover: LLM Self-Composed Reasoning Structures](patterns/self-discover-reasoning-structures.md)
- [Spec-As-Test Feedback Loop](patterns/spec-as-test-feedback-loop.md)
- [Tool Use Incentivization via Reward Shaping](patterns/tool-use-incentivization-via-reward-shaping.md)

### <a name="-"></a>Orchestration & Control

- [Action-Selector Pattern](patterns/action-selector-pattern.md)
- [Agent-Driven Research](patterns/agent-driven-research.md)
- [Autonomous Workflow Agent Architecture](patterns/autonomous-workflow-agent-architecture.md)
- [Conditional Parallel Tool Execution](patterns/parallel-tool-execution.md) <span class='updated-badge'>UPDATED</span>
- [Continuous Autonomous Task Loop Pattern](patterns/continuous-autonomous-task-loop-pattern.md) <span class='new-badge'>NEW</span>
- [Disposable Scaffolding Over Durable Features](patterns/disposable-scaffolding-over-durable-features.md) <span class='new-badge'>NEW</span>
- [Dual LLM Pattern](patterns/dual-llm-pattern.md)
- [Explicit Posterior-Sampling Planner](patterns/explicit-posterior-sampling-planner.md)
- [Inference-Time Scaling](patterns/inference-time-scaling.md)
- [Inversion of Control](patterns/inversion-of-control.md)
- [Iterative Multi-Agent Brainstorming](patterns/iterative-multi-agent-brainstorming.md)
- [Language Agent Tree Search (LATS)](patterns/language-agent-tree-search-lats.md)
- [LLM Map-Reduce Pattern](patterns/llm-map-reduce-pattern.md)
- [Multi-Model Orchestration for Complex Edits](patterns/multi-model-orchestration-for-complex-edits.md)
- [Oracle and Worker Multi-Model Approach](patterns/oracle-and-worker-multi-model.md)
- [Plan-Then-Execute Pattern](patterns/plan-then-execute-pattern.md)
- [Self-Rewriting Meta-Prompt Loop](patterns/self-rewriting-meta-prompt-loop.md)
- [Specification-Driven Agent Development](patterns/specification-driven-agent-development.md)
- [Sub-Agent Spawning](patterns/sub-agent-spawning.md) <span class='updated-badge'>UPDATED</span>
- [Three-Stage Perception Architecture](patterns/three-stage-perception-architecture.md)
- [Tool Capability Compartmentalization](patterns/tool-capability-compartmentalization.md)
- [Tree-of-Thought Reasoning](patterns/tree-of-thought-reasoning.md)

### <a name=""></a>Reliability & Eval

- [Asynchronous Coding Agent Pipeline](patterns/asynchronous-coding-agent-pipeline.md)
- [CriticGPT-Style Code Review](patterns/criticgpt-style-evaluation.md)
- [Extended Coherence Work Sessions](patterns/extended-coherence-work-sessions.md)
- [Lethal Trifecta Threat Model](patterns/lethal-trifecta-threat-model.md)
- [Merged Code + Language Skill Model](patterns/merged-code-language-skill-model.md)
- [No-Token-Limit Magic](patterns/no-token-limit-magic.md)
- [RLAIF (Reinforcement Learning from AI Feedback)](patterns/rlaif-reinforcement-learning-from-ai-feedback.md)
- [Versioned Constitution Governance](patterns/versioned-constitution-governance.md)

### <a name=""></a>Security & Safety

- [Deterministic Security Scanning Build Loop](patterns/deterministic-security-scanning-build-loop.md)

### <a name="-"></a>Tool Use & Environment

- [Agent SDK for Programmatic Control](patterns/agent-sdk-for-programmatic-control.md)
- [Agent-First Tooling and Logging](patterns/agent-first-tooling-and-logging.md) <span class='new-badge'>NEW</span>
- [CLI-Native Agent Orchestration](patterns/cli-native-agent-orchestration.md)
- [Code Mode MCP Tool Interface Improvement Pattern](patterns/code-first-tool-interface-pattern.md) <span class='new-badge'>NEW</span>
- [Code-Then-Execute Pattern](patterns/code-then-execute-pattern.md)
- [Dynamic Code Injection (On-Demand File Fetch)](patterns/dynamic-code-injection-on-demand-file-fetch.md)
- [Egress Lockdown (No-Exfiltration Channel)](patterns/egress-lockdown-no-exfiltration-channel.md)
- [LLM-Friendly API Design](patterns/llm-friendly-api-design.md)
- [Patch Steering via Prompted Tool Selection](patterns/patch-steering-via-prompted-tool-selection.md)
- [Shell Command Contextualization](patterns/shell-command-contextualization.md)
- [Subagent Compilation Checker](patterns/subagent-compilation-checker.md)
- [Tool Use Steering via Prompting](patterns/tool-use-steering-via-prompting.md)
- [Virtual Machine Operator Agent](patterns/virtual-machine-operator-agent.md)
- [Visual AI Multimodal Integration](patterns/visual-ai-multimodal-integration.md)

### <a name=""></a>UX & Collaboration

- [Abstracted Code Representation for Review](patterns/abstracted-code-representation-for-review.md)
- [Agent-Assisted Scaffolding](patterns/agent-assisted-scaffolding.md)
- [Agent-Friendly Workflow Design](patterns/agent-friendly-workflow-design.md)
- [Seamless Background-to-Foreground Handoff](patterns/seamless-background-to-foreground-handoff.md)
- [Spectrum of Control / Blended Initiative](patterns/spectrum-of-control-blended-initiative.md)
- [Verbose Reasoning Transparency](patterns/verbose-reasoning-transparency.md)

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
