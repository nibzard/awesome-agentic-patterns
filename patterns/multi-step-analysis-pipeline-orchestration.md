---
title: Multi-Step Analysis Pipeline Orchestration
status: emerging
authors: ["@shmlkv"]
based_on: ["Anthropic Claude Code"]
category: "Orchestration & Control"
source: "https://github.com/shmlkv/dna-claude-analysis"
tags: [pipeline, multi-step, orchestration, report-generation, data-analysis, claude-code]
---

## Problem

Complex data analysis tasks often require running many sequential or parallel processing steps, each producing intermediate artifacts that feed into subsequent stages. Manually coordinating these steps — ensuring correct ordering, aggregating outputs, and producing a final unified result — is tedious and error-prone. Traditional scripting approaches hardcode the pipeline, making it inflexible when steps need to be added, reordered, or debugged.

## Solution

Use an LLM agent as the orchestration layer for a multi-step analysis pipeline. The agent:

1. **Manages a collection of independent analysis scripts** — each script handles one domain and produces a structured intermediate report (e.g., markdown).
2. **Coordinates execution order** — runs scripts sequentially or in parallel as appropriate, handling failures gracefully.
3. **Aggregates intermediate outputs** — reads all generated reports and synthesizes them into a unified artifact.
4. **Produces final visualization** — generates a single self-contained output (e.g., an HTML page) from the aggregated data.

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│ Raw Data     │────▶│ N Analysis   │────▶│ N Markdown   │
│ (input file) │     │ Scripts      │     │ Reports      │
└─────────────┘     └──────────────┘     └──────┬───────┘
                                                │
                                         ┌──────▼───────┐
                                         │ Agent merges  │
                                         │ + visualizes  │
                                         └──────┬───────┘
                                                │
                                         ┌──────▼───────┐
                                         │ Single HTML   │
                                         │ output        │
                                         └──────────────┘
```

The agent acts as both the scheduler (deciding what to run and when) and the integrator (combining outputs into a coherent whole). Because the agent understands the content of each report, it can apply domain-specific formatting, highlight anomalies, and produce richer output than a static template could.

## How to use it

**When to apply:**

- You have a collection of analysis scripts that each process the same input data from different angles
- Intermediate outputs are structured text (markdown, JSON, CSV) that an LLM can parse
- The final deliverable is a unified report or visualization

**Implementation approach:**

1. Structure each analysis step as an independent script with a consistent interface (same input path, predictable output location)
2. Use a configuration file (e.g., `CLAUDE.md`) to teach the agent about the pipeline: which scripts exist, execution order, output locations
3. Let the agent execute each script, monitor for errors, and collect outputs
4. Have the agent read all intermediate reports and generate the final artifact

**Example — Personal genome analysis (17-step pipeline):**

- 17 Python scripts each analyze a different aspect of raw DNA data (ancestry, health risks, nutrition, pharmacogenomics, etc.)
- Each script produces a markdown report in `reports/`
- The agent reads all reports and generates a single-page HTML dashboard with terminal-style visualization

## Trade-offs

**Pros:**

- **Flexible orchestration** — adding or removing pipeline steps requires no code changes to the coordinator
- **Content-aware aggregation** — the agent can summarize, highlight, and cross-reference findings across steps
- **Low setup cost** — no need for dedicated workflow engines like Airflow or Prefect for moderate-scale pipelines
- **Interactive debugging** — the agent can inspect failures, fix scripts, and re-run specific steps

**Cons:**

- **Cost scales with output volume** — the agent must read all intermediate reports, consuming tokens proportional to total output size
- **Reproducibility concerns** — LLM-generated final outputs may vary between runs unless carefully prompted
- **Not suited for massive scale** — works best with tens of steps, not thousands; dedicated workflow engines are better for large DAGs
- **Requires structured intermediates** — scripts must produce outputs the agent can parse reliably

## References

- [dna-claude-analysis](https://github.com/shmlkv/dna-claude-analysis) — 17-step personal genome analysis pipeline orchestrated by Claude Code
- [Building Effective Agents — Anthropic](https://www.anthropic.com/engineering/building-effective-agents) (2024)
