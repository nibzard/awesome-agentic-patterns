---
title: Agent-Driven Research
status: established
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Danny Tarlow", "Connie Fan"]
category: Orchestration & Control
source: "https://eu.36kr.com/en/p/3352908436796289"
tags: [research, information retrieval, tool use, iterative process, autonomous search]
summary: "Agent plans its own search queries, runs them across sources, reflects on gaps, and iterates until it can write a sourced report"
signals: ["Open-ended research question needs multiple search rounds", "Answer needs synthesis across many sources"]
anti_signals: ["A single retrieval round answers the question", "Token cost or latency budget is tight"]
updated_at: "2026-10-13"
---

## Problem

Traditional research methods often lack the ability to adapt search strategies based on emerging results, limiting efficiency and potential discoveries. Complex research tasks require multi-round investigation, cross-source synthesis, and dynamic strategy adjustment that static retrieval systems cannot provide.

## Solution

Allow AI agents to independently conduct the entire research process. Given a research question, the agent:

- Creates its own search queries through dynamic planning.
- Executes the searches across multiple sources.
- Examines the data and evaluates quality/relevance.
- Reflects on whether sufficient information has been gathered.
- Adjusts its search strategy based on findings and gaps.
- Repeats until satisfaction criteria are met.
- Synthesizes findings into a comprehensive, well-sourced report.

The key mechanism is a self-reflective iteration loop: after each search cycle, the agent evaluates results against its research goals and autonomously determines the next exploration direction. Production implementations typically combine four subsystems: planning (task decomposition), memory (context + vector store), action (tool orchestration), and reflection (quality evaluation).

A common variant uses parallel multi-agent teams, where different agents simultaneously pursue different research angles and later synthesize findings.

**Relationship to AI Web Search Agent Loop:** [AI Web Search Agent Loop](ai-web-search-agent-loop.md) applies the same iterate-until-satisfied loop to real-time web question answering, with an emphasis on query translation, search operators, and inline citations. This pattern is the general form: an end-to-end research workflow over arbitrary sources (web, databases, documents) with explicit planning, memory, and reflection subsystems that ends in a written, sourced report.

## Example (flow)

```mermaid
flowchart TD
    A[Research Question] --> B[Formulate Search Query]
    B --> C[Execute Search]
    C --> D[Analyze Retrieved Information]
    D --> E{Sufficient Information?}
    E -->|No| F[Refine Search Strategy]
    F --> B
    E -->|Yes| G[Synthesize & Summarize Findings]
    G --> H[Present Results to User]
```

## How to use it

- Use for open-ended research requiring strategy adaptation and multi-source synthesis.
- Use when tasks need explicit control flow between planning, execution, and fallback.
- Define clear termination conditions (satisfaction-based or resource-limited).
- Design for multi-source integration (web, databases, documents).
- Combine with reflection loop for self-correction; with agentic RAG for document retrieval.

## Trade-offs

* **Pros:** Enables autonomous multi-round investigation; adapts strategy based on findings; produces comprehensive, well-sourced outputs; superior for complex analytical tasks.
* **Cons:** Higher token cost — operators commonly estimate 5-10x versus single-round retrieval, though this is an estimate rather than a benchmarked figure; increased latency from multiple LLM calls; planning stability challenges; orchestration complexity adds states to debug.

## References

- Primary source: [36kr interview with Connie Fan and Danny Tarlow (Gemini team) on agentic coding and search](https://eu.36kr.com/en/p/3352908436796289) — Tarlow on how developers work in a large codebase: "You would use code search, look at the file structure, click around, read some code" and "The agentic model mimics this approach." The interview describes a dual-track approach: longer context plus an agentic programming model that searches and reasons autonomously.

- ReAct (Reasoning + Acting): Foundational pattern establishing the Thought → Action → Observation loop; Yao et al., Princeton University & Google Research, ICLR 2023

- "The AI Scientist: Towards Fully Automated Open-Ended Scientific Discovery": Automated research lifecycle from idea generation to manuscript writing; Sakana AI + Oxford + UBC, arXiv:2408.06292, 2024

- "From AI for Science to Agentic Science: A Survey on Autonomous Scientific Discovery": Survey of autonomous research agents and scientific discovery systems; Shanghai AI Lab, arXiv:2508.14111, 2025

- Tongyi DeepResearch: Open-source agent-driven research system with 60% inference cost reduction; Alibaba Tongyi Lab, [arXiv:2510.24701](https://arxiv.org/abs/2510.24701), 2025; code at [Alibaba-NLP/DeepResearch](https://github.com/Alibaba-NLP/DeepResearch)

- [Building Effective Agents](https://www.anthropic.com/research/building-effective-agents) (Anthropic) — orchestrator and agent-loop patterns behind production research agents
