---
title: Extended Coherence Work Sessions
status: rapidly-improving
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Amjad Masad (observation)"]
category: Reliability & Eval
source: "https://www.nibzard.com/silent-revolution"
tags: [coherence, long-running tasks, agent capability, llm, complex projects]
summary: "Combines models with long coherence windows with context compaction, prompt caching, and persisted state so agents stay on task for hours"
signals: ["Tasks take hours, such as multi-hour coding or research sessions", "Agent output degrades with goal drift, contradictions, or loops in long sessions", "You can add context management and state persistence"]
anti_signals: ["Short tasks that finish in a few turns", "No prompt caching, so long sessions become too expensive", "No infrastructure for context compaction or state persistence"]
updated_at: "2026-10-13"
---

## Problem

Early AI agents and models often suffered from a short "coherence window," meaning they could only maintain focus and context for a few minutes before their performance degraded significantly (e.g., losing track of instructions, generating irrelevant output). This limited their utility for complex, multi-stage tasks that require sustained effort over hours.

## Solution

Utilize AI models and agent architectures that maintain coherence over extended periods (hours rather than minutes). This involves:

- **Model Selection**: METR measures the time horizon of autonomous task completion doubling roughly every 7 months since 2019 (arXiv:2503.14499); the Time Horizon 1.1 methodology (January 2026) and 2026 results refine that estimate, and some analyses now report faster growth.
- **Context Management**: Larger context windows alone don't guarantee coherence—combine with auto-compaction, prompt caching, and curated context to mitigate the "lost in the middle" effect where models struggle with information in middle positions (Liu et al., 2023).
- **Complementary Patterns**: Works synergistically with context auto-compaction, episodic memory, filesystem-based state, and planner-worker separation.

The goal is enabling agents to work on multi-hour tasks without degradation in output quality or relevance.

## Example (coherence over time)

```mermaid
gantt
    title Agent Coherence Capabilities Over Time
    dateFormat X
    axisFormat %s

    section Early Models
    Short coherence window (minutes) :done, early, 0, 300

    section Current Models
    Extended coherence (hours) :active, current, 300, 10800

    section Future Trend
    All-day coherence :future, 10800, 86400
```

## How to use it

- Use this for complex, multi-stage tasks requiring sustained attention (multi-hour coding sessions, long-running research, autonomous workflows).
- Implement supporting patterns first: context auto-compaction, prompt caching, and filesystem-based state.
- Monitor for coherence degradation indicators—contradictory statements, goal drift, or repetitive loops after 10-15 conversation turns.

## Trade-offs

* **Pros:** Enables agents to complete complex, multi-hour tasks previously infeasible; foundational capability for autonomous workflows and planner-worker architectures.
* **Cons:** Requires supporting infrastructure (context management, state persistence, memory systems); extended sessions without prompt caching become prohibitively expensive.

## References

- Primary source for the trend: METR, "Measuring AI Ability to Complete Long Tasks" (arXiv:2503.14499, NeurIPS 2025; revised July 2026) — task time horizons double roughly every 7 months. See also the [time-horizons results page](https://metr.org/time-horizons) (updated September 2026) and the [Time Horizon 1.1 methodology](https://metr.org/blog/2026-1-29-time-horizon-1-1) (January 2026).
- Secondary color, quoted in a largely AI-generated blog post: "Every seven months, we're actually doubling the number of minutes that the AI can work and stay coherent... The latest models can maintain coherence for hours." Described as a "qualitative shift." [Source](https://www.nibzard.com/silent-revolution)
- Liu et al. (2023). "Lost in the Middle: How Language Models Use Long Contexts." arXiv:2307.03172—Establishes a U-shaped performance curve: information at the beginning and end of context is used more reliably than information in the middle.
- Packer et al. (2023). "MemGPT: Towards LLMs as Operating Systems." arXiv:2310.08560—Hierarchical memory architecture (primary context, secondary memory, archival) for extended sessions.
