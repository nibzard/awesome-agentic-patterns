---
title: "Iterative Prompt & Skill Refinement"
status: emerging
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Will Larson"]
category: "Feedback Loops"
source: "https://lethain.com/agents-iterative-refinement/"
tags: [refinement, iteration, prompts, skills, feedback, multi-mechanism, continuous-improvement, dashboards]
summary: "Combines a feedback channel, editable prompt documents, log-driven skill fixes, and usage dashboards to improve agent prompts and skills continuously"
signals: ["Agent workflows run in production for many internal users", "Prompts and skills fail in ways no single review catches", "Workflow runs, errors, and tool usage can be logged"]
anti_signals: ["Workflow is well understood and can be deterministic code", "No one has time to monitor feedback and dashboards"]
updated_at: "2026-10-13"
---

## Problem

Agent usage reveals gaps in prompts, skills, and tools—but how do you systematically improve them? When a workflow fails or behaves sub-optimally, you need multiple mechanisms to capture feedback and iterate. Single approaches aren't enough; you need a **multi-pronged refinement strategy**.

## Solution

Implement **multiple complementary refinement mechanisms** that work together. No single mechanism catches all issues—you need layered approaches. This approach is grounded in RLHF research showing that human feedback is irreplaceable for alignment, while RLAIF demonstrates AI-assisted feedback enables scale.

**Four key mechanisms:**

**1. Responsive Feedback (Primary)**
- Monitor a dedicated internal channel for agent issues
- Skim workflow interactions daily
- This is the most valuable ongoing source of improvement

**2. Owner-Led Refinement (Secondary)**
- Store prompts in editable documents (the source used Notion; any shared doc system works)
- Most prompts editable by anyone at the company
- Include prompt links in workflow outputs (chat messages, ticket comments)
- Prompts must be discoverable + editable

**3. Claude-Enhanced Refinement (Specialized)**
- Pull run logs into the skill repository through an observability integration (the source used Datadog via MCP)
- Skills are a "platform" used by many workflows
- Often maintained by central AI team, not individual owners

**4. Dashboard Tracking (Quantitative)**
- Track workflow run frequency and errors
- Track tool usage (how often each skill loads)
- Data-driven prioritization of improvements

```mermaid
graph TD
    A[Workflow Runs] --> B[Feedback Channel: #ai]
    A --> C[Owner Edits Prompts]
    A --> D[Datadog Logs → Claude]
    A --> E[Dashboards: Metrics]

    B --> F[Identify Issues]
    C --> F
    D --> F
    E --> F

    F --> G[Update Prompts/Skills]
    G --> A

    style B fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    style E fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
```

## How to use it

**Implementation checklist:**

- [ ] **Feedback channel**: Internal Slack/Discord for agent issues
- [ ] **Editable prompts**: Store in Notion/docs, not code
- [ ] **Prompt links**: Include in every workflow output
- [ ] **Log access**: Datadog/observability with MCP integration
- [ ] **Dashboards**: Track workflow runs, errors, tool usage

**Refinement workflow:**

```python
# After each workflow run, include link
workflow_result = {
    "output": "...",
    "prompt_link": "https://notion.so/prompt-abc123"
}
```

**Discovery strategy:**

- **Daily**: Skim feedback channel, review workflow interactions
- **Weekly**: Review dashboard metrics for error spikes
- **Ad-hoc**: Pull logs when specific issues reported
- **Quarterly**: Comprehensive prompt/skill audit

**Post-run evals (next step):**

Include subjective eval after each run:

- Was this workflow effective?
- What would have made it better?
- Human-in-the-loop to nudge evolution

## Trade-offs

**Pros:**

- **Multi-layered**: Catches issues different mechanisms miss
- **Continuous**: Always improving, not episodic
- **Accessible**: Anyone can contribute to improvement
- **Data-driven**: Dashboards prioritize what matters
- **Skill-sharing**: Central team can maintain platform-level skills

**Cons:**

- **No silver bullet**: Can't eliminate any mechanism
- **Maintenance overhead**: Multiple systems to manage
- **Permission complexity**: Need balanced edit access
- **Alert fatigue**: Too many signals can overwhelm

**Workflow archetypes:**

| Type | Refinement Strategy |
|------|---------------------|
| **Chatbots** | Post-run evals + human-in-the-loop |
| **Well-understood workflows** | Code-driven (deterministic) |
| **Not-yet-understood workflows** | The open question |

**Open challenge:** How to scalably identify and iterate on "not-yet-well-understood" workflows without product engineers implementing each individually?

## References

* [Building an internal agent: Iterative prompt and skill refinement](https://lethain.com/agents-iterative-refinement/) - Will Larson (January 2026; the article names no employer)
* [Best practices for Claude Code](https://code.claude.com/docs/en/best-practices) - independent, vendor-side guidance on iterating CLAUDE.md and skills over time and pruning what stops earning its place
* [Constitutional AI: Harmlessness from AI Feedback](https://arxiv.org/abs/2212.08073) - Bai et al. (arXiv, 2022)
* [Reflexion: Language Agents with Verbal Reinforcement Learning](https://arxiv.org/abs/2303.11366) - Shinn et al. (NeurIPS, 2023)

Distinct from [Dogfooding with Rapid Iteration for Agent Improvement](dogfooding-with-rapid-iteration-for-agent-improvement.md) (improving agents by building with them) and from [Rich Feedback Loops](rich-feedback-loops.md) (machine-readable tool feedback within one session): this pattern is the organizational loop around prompts and skills between runs.
