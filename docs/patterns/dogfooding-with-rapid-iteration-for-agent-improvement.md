---
title: Dogfooding with Rapid Iteration for Agent Improvement
status: best-practice
authors: ["Lukas Möller (Cursor)", "Aman Sanger (Cursor)"]
category: Feedback Loops
source_link: "https://www.youtube.com/watch?v=BGgsoIgbT_Y"
tags: [dogfooding, iterative-development, feedback-loop, agent-improvement, internal-testing, product-development]
---

## Problem
Developing effective AI agents requires understanding real-world usage and quickly identifying areas for improvement. External feedback loops can be slow, and simulated environments may not capture all nuances.

## Solution
The development team extensively uses their own AI agent product ("dogfooding") for their daily software development tasks. This provides:

1.  **Direct, Immediate Feedback:** Developers encounter the agent's strengths and weaknesses firsthand.
2.  **Real-World Problem Solving:** The agent is tested on actual, complex development problems faced by the team.
3.  **Internal Experimentation:** The team can quickly try out new agent features or modifications on themselves.
4.  **Rapid Iteration:** Shortcomings identified through dogfooding can be rapidly addressed and new features prototyped and validated internally before wider release.
5.  **Honest Assessment:** The team can be brutally honest about a feature's utility if they themselves don't find it useful, leading to quick pivots or discarding ineffective ideas.

This creates a tight, high-velocity feedback loop where the agent is continuously improved based on the practical needs and experiences of its own creators.

## How to use it

- Encourage all members of the agent development team to use the agent as their primary tool for relevant tasks.
- Establish channels for easily reporting issues or suggesting improvements based on internal use.
- Prioritize fixing pain points experienced by the internal team.

## Real-world examples

### Cursor

Cursor's development team uses their own AI coding assistant as the primary development tool, creating a tight feedback loop.

### Anthropic Claude Code

Anthropic practices intensive "ant fooding" (their internal term for dogfooding) with Claude Code:

- **70-80% adoption**: Most technical Anthropic employees use Claude Code daily
- **High-velocity feedback**: Internal feedback channel receives posts every 5 minutes
- **Experimental features**: New features pushed to internal users first for rapid validation
- **Quick pivots**: Team can be "brutally honest" about feature utility since they're the users
- **Bottom-up innovation**: Major features (to-do lists, sub-agents, hooks, plugins) originated from internal team members solving their own problems

**Quote from Cat Wu (Claude Code PM):**

> "Internally over 70 or 80 percent of ants—technical Anthropic employees—use Claude Code every day. Every time we are thinking about a new feature, we push it out to people internally and we get so much feedback. We have a feedback channel. I think we get a post every five minutes. And so you get a really quick signal on whether people like it, whether it's buggy, or whether it's not good and we should unship it."

This creates a development culture where features are validated through actual daily use before external release, dramatically reducing the risk of building unwanted functionality.

## References

- Lukas Möller (Cursor) at 0:04:25: "I think Cursor is very much driven by kind of solving our own problems and kind of figuring out where we struggle solving problems and making Cursor better...experimenting a lot."
- Aman Sanger (Cursor) at 0:04:55: "...that's how we're able to move really quickly and building new features and then throwing away things that clearly don't work because we we can be really honest to ourselves of whether we find it useful. And then not have to ship it out to users... it just speeds up the iteration loop for for building features."
- Cat Wu (Anthropic): "Internally over 70 or 80 percent of ants use Claude Code every day... we get a post every five minutes."
- [AI & I Podcast: How to Use Claude Code Like the People Who Built It](https://every.to/podcast/transcript-how-to-use-claude-code-like-the-people-who-built-it)