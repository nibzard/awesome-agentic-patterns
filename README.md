# Awesome Agentic Patterns

![Awesome Agentic Patterns](/agentic-patterns.jpeg)

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

<!-- AUTO-GENERATED TOC START -->
|  Category                                              |  What you'll find                                         |
| ------------------------------------------------------ | --------------------------------------------------------- |
| [**Context & Memory**](#context-memory)                | Sliding‑window curation, vector cache, episodic memory    |
| [**Feedback Loops**](#feedback-loops)                  | Compilers, CI, human review, self‑healing retries         |
| [**Learning & Adaptation**](#learning-adaptation)      | Agent RFT, skill libraries, variance‑based RL             |
| [**Orchestration & Control**](#orchestration-control)  | Task decomposition, sub‑agent spawning, tool routing      |
| [**Reliability & Eval**](#reliability-eval)            | Guardrails, eval harnesses, logging, reproducibility      |
| [**Security & Safety**](#security-safety)              | Isolated VMs, PII tokenization, security scanning         |
| [**Tool Use & Environment**](#tool-use-environment)    | Shell, browser, DB, Playwright, sandbox tricks            |
| [**UX & Collaboration**](#ux-collaboration)            | Prompt hand‑offs, staged commits, async background agents |
<!-- AUTO-GENERATED TOC END -->

*Categories are fluid — open a PR if you see a better slice!*
The tables below are auto‑generated from the `patterns/` folder.

---

<!-- …existing content above… -->

<!-- AUTO-GENERATED PATTERNS START -->

### <a name="context-memory"></a>Context & Memory

- [Agent-Powered Codebase Q&A / Onboarding](patterns/agent-powered-codebase-qa-onboarding.md) <span class='updated-badge'>UPDATED</span>
- [Context Window Anxiety Management](patterns/context-window-anxiety-management.md) <span class='updated-badge'>UPDATED</span>
- [Context-Minimization Pattern](patterns/context-minimization-pattern.md) <span class='updated-badge'>UPDATED</span>
- [Curated Code Context Window](patterns/curated-code-context-window.md) <span class='updated-badge'>UPDATED</span>
- [Curated File Context Window](patterns/curated-file-context-window.md) <span class='updated-badge'>UPDATED</span>
- [Dynamic Context Injection](patterns/dynamic-context-injection.md) <span class='updated-badge'>UPDATED</span>
- [Episodic Memory Retrieval & Injection](patterns/episodic-memory-retrieval-injection.md) <span class='updated-badge'>UPDATED</span>
- [Filesystem-Based Agent State](patterns/filesystem-based-agent-state.md) <span class='updated-badge'>UPDATED</span>
- [Layered Configuration Context](patterns/layered-configuration-context.md) <span class='updated-badge'>UPDATED</span>
- [Memory Synthesis from Execution Logs](patterns/memory-synthesis-from-execution-logs.md) <span class='updated-badge'>UPDATED</span>
- [Proactive Agent State Externalization](patterns/proactive-agent-state-externalization.md) <span class='updated-badge'>UPDATED</span>
- [Progressive Disclosure for Large Files](patterns/progressive-disclosure-large-files.md) <span class='new-badge'>NEW</span>
- [Semantic Context Filtering Pattern](patterns/semantic-context-filtering.md) <span class='new-badge'>NEW</span>

### <a name="feedback-loops"></a>Feedback Loops

- [AI-Assisted Code Review / Verification](patterns/ai-assisted-code-review-verification.md) <span class='updated-badge'>UPDATED</span>
- [Background Agent with CI Feedback](patterns/background-agent-ci.md) <span class='updated-badge'>UPDATED</span>
- [Coding Agent CI Feedback Loop](patterns/coding-agent-ci-feedback-loop.md) <span class='updated-badge'>UPDATED</span>
- [Dogfooding with Rapid Iteration for Agent Improvement](patterns/dogfooding-with-rapid-iteration-for-agent-improvement.md) <span class='updated-badge'>UPDATED</span>
- [Graph of Thoughts (GoT)](patterns/graph-of-thoughts.md) <span class='updated-badge'>UPDATED</span>
- [Inference-Healed Code Review Reward](patterns/inference-healed-code-review-reward.md) <span class='updated-badge'>UPDATED</span>
- [Iterative Prompt & Skill Refinement](patterns/iterative-prompt-skill-refinement.md) <span class='new-badge'>NEW</span>
- [Reflection Loop](patterns/reflection.md) <span class='updated-badge'>UPDATED</span>
- [Rich Feedback Loops > Perfect Prompts](patterns/rich-feedback-loops.md) <span class='updated-badge'>UPDATED</span>
- [Self-Critique Evaluator Loop](patterns/self-critique-evaluator-loop.md) <span class='updated-badge'>UPDATED</span>
- [Self-Discover: LLM Self-Composed Reasoning Structures](patterns/self-discover-reasoning-structures.md) <span class='updated-badge'>UPDATED</span>
- [Spec-As-Test Feedback Loop](patterns/spec-as-test-feedback-loop.md) <span class='updated-badge'>UPDATED</span>
- [Tool Use Incentivization via Reward Shaping](patterns/tool-use-incentivization-via-reward-shaping.md) <span class='updated-badge'>UPDATED</span>

### <a name="learning-adaptation"></a>Learning & Adaptation

- [Agent Reinforcement Fine-Tuning (Agent RFT)](patterns/agent-reinforcement-fine-tuning.md) <span class='updated-badge'>UPDATED</span>
- [Compounding Engineering Pattern](patterns/compounding-engineering-pattern.md) <span class='updated-badge'>UPDATED</span>
- [Memory Reinforcement Learning (MemRL)](patterns/memory-reinforcement-learning-memrl.md) <span class='new-badge'>NEW</span>
- [Skill Library Evolution](patterns/skill-library-evolution.md) <span class='updated-badge'>UPDATED</span>
- [Variance-Based RL Sample Selection](patterns/variance-based-rl-sample-selection.md) <span class='updated-badge'>UPDATED</span>

### <a name="orchestration-control"></a>Orchestration & Control

- [Action-Selector Pattern](patterns/action-selector-pattern.md) <span class='updated-badge'>UPDATED</span>
- [Agent-Driven Research](patterns/agent-driven-research.md) <span class='updated-badge'>UPDATED</span>
- [Autonomous Workflow Agent Architecture](patterns/autonomous-workflow-agent-architecture.md) <span class='updated-badge'>UPDATED</span>
- [Conditional Parallel Tool Execution](patterns/parallel-tool-execution.md) <span class='updated-badge'>UPDATED</span>
- [Continuous Autonomous Task Loop Pattern](patterns/continuous-autonomous-task-loop-pattern.md) <span class='updated-badge'>UPDATED</span>
- [Discrete Phase Separation](patterns/discrete-phase-separation.md) <span class='updated-badge'>UPDATED</span>
- [Disposable Scaffolding Over Durable Features](patterns/disposable-scaffolding-over-durable-features.md) <span class='updated-badge'>UPDATED</span>
- [Distributed Execution with Cloud Workers](patterns/distributed-execution-cloud-workers.md) <span class='updated-badge'>UPDATED</span>
- [Dual LLM Pattern](patterns/dual-llm-pattern.md) <span class='updated-badge'>UPDATED</span>
- [Explicit Posterior-Sampling Planner](patterns/explicit-posterior-sampling-planner.md) <span class='updated-badge'>UPDATED</span>
- [Feature List as Immutable Contract](patterns/feature-list-as-immutable-contract.md) <span class='updated-badge'>UPDATED</span>
- [Hybrid LLM/Code Workflow Coordinator](patterns/hybrid-llm-code-workflow-coordinator.md) <span class='new-badge'>NEW</span>
- [Inference-Time Scaling](patterns/inference-time-scaling.md) <span class='updated-badge'>UPDATED</span>
- [Initializer-Maintainer Dual Agent Architecture](patterns/initializer-maintainer-dual-agent.md) <span class='updated-badge'>UPDATED</span>
- [Inversion of Control](patterns/inversion-of-control.md) <span class='updated-badge'>UPDATED</span>
- [Iterative Multi-Agent Brainstorming](patterns/iterative-multi-agent-brainstorming.md) <span class='updated-badge'>UPDATED</span>
- [Language Agent Tree Search (LATS)](patterns/language-agent-tree-search-lats.md) <span class='updated-badge'>UPDATED</span>
- [LLM Map-Reduce Pattern](patterns/llm-map-reduce-pattern.md) <span class='updated-badge'>UPDATED</span>
- [Multi-Model Orchestration for Complex Edits](patterns/multi-model-orchestration-for-complex-edits.md) <span class='updated-badge'>UPDATED</span>
- [Opponent Processor / Multi-Agent Debate Pattern](patterns/opponent-processor-multi-agent-debate.md) <span class='updated-badge'>UPDATED</span>
- [Oracle and Worker Multi-Model Approach](patterns/oracle-and-worker-multi-model.md) <span class='updated-badge'>UPDATED</span>
- [Parallel Tool Call Learning](patterns/parallel-tool-call-learning.md) <span class='updated-badge'>UPDATED</span>
- [Plan-Then-Execute Pattern](patterns/plan-then-execute-pattern.md) <span class='updated-badge'>UPDATED</span>
- [Progressive Autonomy with Model Evolution](patterns/progressive-autonomy-with-model-evolution.md) <span class='updated-badge'>UPDATED</span>
- [Progressive Complexity Escalation](patterns/progressive-complexity-escalation.md) <span class='updated-badge'>UPDATED</span>
- [Self-Rewriting Meta-Prompt Loop](patterns/self-rewriting-meta-prompt-loop.md) <span class='updated-badge'>UPDATED</span>
- [Specification-Driven Agent Development](patterns/specification-driven-agent-development.md) <span class='updated-badge'>UPDATED</span>
- [Stop Hook Auto-Continue Pattern](patterns/stop-hook-auto-continue-pattern.md) <span class='updated-badge'>UPDATED</span>
- [Sub-Agent Spawning](patterns/sub-agent-spawning.md) <span class='updated-badge'>UPDATED</span>
- [Swarm Migration Pattern](patterns/swarm-migration-pattern.md) <span class='updated-badge'>UPDATED</span>
- [Three-Stage Perception Architecture](patterns/three-stage-perception-architecture.md) <span class='updated-badge'>UPDATED</span>
- [Tool Capability Compartmentalization](patterns/tool-capability-compartmentalization.md) <span class='updated-badge'>UPDATED</span>
- [Tree-of-Thought Reasoning](patterns/tree-of-thought-reasoning.md) <span class='updated-badge'>UPDATED</span>

### <a name="reliability-eval"></a>Reliability & Eval

- [Action Caching & Replay Pattern](patterns/action-caching-replay.md) <span class='new-badge'>NEW</span>
- [Anti-Reward-Hacking Grader Design](patterns/anti-reward-hacking-grader-design.md) <span class='updated-badge'>UPDATED</span>
- [Asynchronous Coding Agent Pipeline](patterns/asynchronous-coding-agent-pipeline.md) <span class='updated-badge'>UPDATED</span>
- [CriticGPT-Style Code Review](patterns/criticgpt-style-evaluation.md) <span class='updated-badge'>UPDATED</span>
- [Extended Coherence Work Sessions](patterns/extended-coherence-work-sessions.md) <span class='updated-badge'>UPDATED</span>
- [Lethal Trifecta Threat Model](patterns/lethal-trifecta-threat-model.md) <span class='updated-badge'>UPDATED</span>
- [LLM Observability](patterns/llm-observability.md) <span class='new-badge'>NEW</span>
- [Merged Code + Language Skill Model](patterns/merged-code-language-skill-model.md) <span class='updated-badge'>UPDATED</span>
- [No-Token-Limit Magic](patterns/no-token-limit-magic.md) <span class='updated-badge'>UPDATED</span>
- [RLAIF (Reinforcement Learning from AI Feedback)](patterns/rlaif-reinforcement-learning-from-ai-feedback.md) <span class='updated-badge'>UPDATED</span>
- [Schema Validation Retry with Cross-Step Learning](patterns/schema-validation-retry-cross-step-learning.md) <span class='new-badge'>NEW</span>
- [Structured Output Specification](patterns/structured-output-specification.md) <span class='updated-badge'>UPDATED</span>
- [Versioned Constitution Governance](patterns/versioned-constitution-governance.md) <span class='updated-badge'>UPDATED</span>
- [Workflow Evals with Mocked Tools](patterns/workflow-evals-with-mocked-tools.md) <span class='new-badge'>NEW</span>

### <a name="security-safety"></a>Security & Safety

- [Deterministic Security Scanning Build Loop](patterns/deterministic-security-scanning-build-loop.md) <span class='updated-badge'>UPDATED</span>
- [Isolated VM per RL Rollout](patterns/isolated-vm-per-rl-rollout.md) <span class='updated-badge'>UPDATED</span>
- [PII Tokenization](patterns/pii-tokenization.md) <span class='updated-badge'>UPDATED</span>

### <a name="tool-use-environment"></a>Tool Use & Environment

- [Agent SDK for Programmatic Control](patterns/agent-sdk-for-programmatic-control.md) <span class='updated-badge'>UPDATED</span>
- [Agent-First Tooling and Logging](patterns/agent-first-tooling-and-logging.md) <span class='updated-badge'>UPDATED</span>
- [Agentic Search Over Vector Embeddings](patterns/agentic-search-over-vector-embeddings.md) <span class='updated-badge'>UPDATED</span>
- [AI Web Search Agent Loop](patterns/ai-web-search-agent-loop.md) <span class='new-badge'>NEW</span>
- [CLI-First Skill Design](patterns/cli-first-skill-design.md) <span class='updated-badge'>UPDATED</span>
- [CLI-Native Agent Orchestration](patterns/cli-native-agent-orchestration.md) <span class='updated-badge'>UPDATED</span>
- [Code Mode MCP Tool Interface Improvement Pattern](patterns/code-first-tool-interface-pattern.md) <span class='updated-badge'>UPDATED</span>
- [Code-Over-API Pattern](patterns/code-over-api-pattern.md) <span class='updated-badge'>UPDATED</span>
- [Code-Then-Execute Pattern](patterns/code-then-execute-pattern.md) <span class='updated-badge'>UPDATED</span>
- [Dual-Use Tool Design](patterns/dual-use-tool-design.md) <span class='updated-badge'>UPDATED</span>
- [Dynamic Code Injection (On-Demand File Fetch)](patterns/dynamic-code-injection-on-demand-file-fetch.md) <span class='updated-badge'>UPDATED</span>
- [Egress Lockdown (No-Exfiltration Channel)](patterns/egress-lockdown-no-exfiltration-channel.md) <span class='updated-badge'>UPDATED</span>
- [LLM-Friendly API Design](patterns/llm-friendly-api-design.md) <span class='updated-badge'>UPDATED</span>
- [Multi-Platform Communication Aggregation](patterns/multi-platform-communication-aggregation.md) <span class='updated-badge'>UPDATED</span>
- [Multi-Platform Webhook Triggers](patterns/multi-platform-webhook-triggers.md) <span class='new-badge'>NEW</span>
- [Patch Steering via Prompted Tool Selection](patterns/patch-steering-via-prompted-tool-selection.md) <span class='updated-badge'>UPDATED</span>
- [Progressive Tool Discovery](patterns/progressive-tool-discovery.md) <span class='updated-badge'>UPDATED</span>
- [Shell Command Contextualization](patterns/shell-command-contextualization.md) <span class='updated-badge'>UPDATED</span>
- [Subagent Compilation Checker](patterns/subagent-compilation-checker.md) <span class='updated-badge'>UPDATED</span>
- [Tool Use Steering via Prompting](patterns/tool-use-steering-via-prompting.md) <span class='updated-badge'>UPDATED</span>
- [Virtual Machine Operator Agent](patterns/virtual-machine-operator-agent.md) <span class='updated-badge'>UPDATED</span>
- [Visual AI Multimodal Integration](patterns/visual-ai-multimodal-integration.md) <span class='updated-badge'>UPDATED</span>

### <a name="ux-collaboration"></a>UX & Collaboration

- [Abstracted Code Representation for Review](patterns/abstracted-code-representation-for-review.md) <span class='updated-badge'>UPDATED</span>
- [Agent-Assisted Scaffolding](patterns/agent-assisted-scaffolding.md) <span class='updated-badge'>UPDATED</span>
- [Agent-Friendly Workflow Design](patterns/agent-friendly-workflow-design.md) <span class='updated-badge'>UPDATED</span>
- [AI-Accelerated Learning and Skill Development](patterns/ai-accelerated-learning-and-skill-development.md) <span class='updated-badge'>UPDATED</span>
- [Chain-of-Thought Monitoring & Interruption](patterns/chain-of-thought-monitoring-interruption.md) <span class='updated-badge'>UPDATED</span>
- [Democratization of Tooling via Agents](patterns/democratization-of-tooling-via-agents.md) <span class='updated-badge'>UPDATED</span>
- [Human-in-the-Loop Approval Framework](patterns/human-in-loop-approval-framework.md) <span class='updated-badge'>UPDATED</span>
- [Latent Demand Product Discovery](patterns/latent-demand-product-discovery.md) <span class='updated-badge'>UPDATED</span>
- [Proactive Trigger Vocabulary](patterns/proactive-trigger-vocabulary.md) <span class='updated-badge'>UPDATED</span>
- [Seamless Background-to-Foreground Handoff](patterns/seamless-background-to-foreground-handoff.md) <span class='updated-badge'>UPDATED</span>
- [Spectrum of Control / Blended Initiative](patterns/spectrum-of-control-blended-initiative.md) <span class='updated-badge'>UPDATED</span>
- [Team-Shared Agent Configuration as Code](patterns/team-shared-agent-configuration.md) <span class='updated-badge'>UPDATED</span>
- [Verbose Reasoning Transparency](patterns/verbose-reasoning-transparency.md) <span class='updated-badge'>UPDATED</span>

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

---

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=nibzard/awesome-agentic-patterns&type=date&legend=top-left)](https://www.star-history.com/#nibzard/awesome-agentic-patterns&type=date&legend=top-left)
