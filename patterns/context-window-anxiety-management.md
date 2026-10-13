---
title: Context Window Anxiety Management
status: emerging
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Cognition AI (2025)"]
category: Context & Memory
source: "https://cognition.com/blog/devin-sonnet-4-5-lessons-and-challenges (September 2025)"
tags: [context-anxiety, token-management, premature-completion, model-behavior]
summary: "Enables a large context window but caps usage lower, and adds prompts that state the token budget so the model does not rush to finish"
signals: ["Model summarizes or wraps up early despite remaining context", "Long coding, research, or planning sessions where premature completion hurts quality"]
anti_signals: ["The model does not show context-anxiety behavior", "Extra prompt tokens and model-specific tuning are not acceptable"]
updated_at: "2026-10-13"
---

## Problem

Models like Claude Sonnet 4.5 exhibit "context anxiety"—they become aware of approaching context window limits and proactively summarize progress or make decisive moves to close tasks, even when sufficient context remains. The behavior is documented in Cognition's September 2025 engineering report on Devin with Sonnet 4.5; it has not been independently replicated, so treat it as a model-specific quirk to test for, not a property of every model. It leads to:

- Premature task completion and shortcuts
- Incomplete work despite having adequate context
- Underestimation of remaining token capacity (consistently incorrect estimates)
- Self-imposed pressure to "wrap up" rather than continue working

## Solution

Implement strategic context budget management and aggressive prompting techniques to override anxiety-driven behaviors:

**1. Context Buffer Strategy**
- Enable larger context windows (e.g., a 1M-token beta tier) but cap actual usage at 200k tokens
- Provides psychological "runway" that mitigates the model's anxiety about running out of space
- Note: the beta-tier framing ages poorly as large windows become standard; the durable part of the remedy is capping usage below the real limit, whatever the limit is

**2. Aggressive Counter-Prompting**
- Add explicit reminders at conversation start: "You have plenty of context remaining—do not rush to complete tasks"
- Include end-of-conversation reinforcement: "Take your time, context is not a constraint"
- Override summarization impulses with direct instructions

**3. Token Budget Transparency**
- Explicitly state available token budget in prompts
- Provide regular reassurance about remaining capacity
- Counter the model's tendency to underestimate available space

```pseudo
# Context anxiety mitigation approach
def setup_context_anxiety_management():
    context_buffer = enable_large_context(1M_tokens)
    actual_limit = cap_usage_at(200k_tokens)
    
    prompt_prefix = """
    CONTEXT GUIDANCE: You have abundant context space (200k+ tokens available).
    Do NOT rush to complete tasks or summarize prematurely.
    Work thoroughly and completely on each step.
    """
    
    prompt_suffix = """
    Remember: Context is NOT a constraint. Take your time and be thorough.
    """
    
    return enhanced_prompt(prefix + user_input + suffix)
```

## How to use it

Apply when using models that exhibit context awareness and anxiety behaviors:

- **Development Work**: Long coding sessions where premature completion hurts quality
- **Research Tasks**: Multi-step analysis requiring sustained attention
- **Complex Planning**: Tasks needing thorough exploration before conclusions

Monitor for signs of context anxiety: sudden summarization, rushed decisions, or explicit mentions of "running out of space."

Distinct from [No-Token-Limit Magic](no-token-limit-magic.md), which removes token limits during prototyping to learn what good behavior needs; this pattern keeps the cap in place and only changes how the model perceives the remaining budget. Compare also [Context Window Auto-Compaction](context-window-auto-compaction.md), which manages the same pressure by compacting context instead of reassuring the model.

## Trade-offs

* **Pros:** Prevents premature task abandonment; enables more thorough work; overcomes model-specific behavioral quirks
* **Cons:** Requires model-specific tuning; may increase actual token usage; aggressive prompting adds overhead

## References

* [Cognition AI: Devin & Claude Sonnet 4.5 - Lessons and Challenges](https://cognition.com/blog/devin-sonnet-4-5-lessons-and-challenges) (September 2025) — the sole first-hand report of this behavior; single-vendor evidence with no independent replication
