---
title: Democratization of Tooling via Agents
status: established
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Jacob Jackson (Cursor)", "Alex Albert (Anthropic)"]
category: UX & Collaboration
source: "https://www.youtube.com/watch?v=BGgsoIgbT_Y"
tags: [no-code, low-code, citizen-developer, tool-creation, business-users, automation, custom-software]
summary: "Non-programmers describe a tool in natural language and iterate with an AI agent that generates and fixes the code for dashboards, scripts, or small apps"
signals: ["Domain experts need custom tools but cannot program", "Engineering is a bottleneck for small internal tools", "Destructive operations can go through an approval workflow"]
anti_signals: ["The tool goes to production where users cannot detect reliability or security issues", "No guardrails for quality and security are in place"]
updated_at: "2026-10-13"
---

## Problem

Many individuals in non-software engineering roles (e.g., sales, marketing, operations, communications) could benefit from custom software tools, scripts, or dashboards tailored to their specific workflows, but lack the traditional programming skills to build them.

## Solution

Empower a broader range of users, including those without deep coding expertise, to create or modify software solutions for their own needs using AI agents. With an AI agent as an assistant, these users can:
1.  Describe their desired tool or functionality in natural language.
2.  Have the agent generate the necessary code (e.g., for a dashboard, a script to automate a task, a simple web application).
3.  Iteratively refine the tool with the agent's help.
4.  Even perform simple bug fixes or modifications to existing tools or codebases.

This pattern lowers the barrier to software creation, allowing domain experts in various fields to build their own productivity tools, thereby "democratizing" software development to some extent.

By 2026 this practice is mainstream under the name "vibe coding": describing software in natural language and iterating with an agent until it works. Consumer products ship it directly, for example Google AI Studio's [vibe-code app](https://aistudio.google.com/vibe-code), and Simon Willison [traces how vibe coding and agentic engineering are converging](https://simonwillison.net/2026/May/6/vibe-coding-and-agentic-engineering/) as the tooling matures.

## Example

A sales team member uses an AI agent to create a custom dashboard that pulls data from multiple sources to track their specific KPIs, without needing to write complex SQL or frontend code themselves. Or a communications team member uses an agent to fix a small bug on a company webpage.

## How to use it

- Use when domain experts need custom tools but lack programming expertise.
- Design for iterative refinement: users must see results quickly and provide feedback.
- Hide technical complexity (context management, dependencies, error handling) while maintaining capability.
- Provide approval workflows for destructive operations to build trust with non-technical users.

## Trade-offs

* **Pros:** Enables domain experts to build their own tools; reduces engineering bottlenecks; creates learning feedback loops where users develop technical intuition through exposure.
* **Cons:** Generated code may have reliability issues that non-technical users cannot detect; production deployment remains challenging; quality and security require guardrails rather than training.

**Risks and guardrails:**

Reporting through 2026 documents a backlash against vibe-coded software. The [vibe coding article on Wikipedia](https://en.wikipedia.org/wiki/Vibe_coding) tracks criticism of reliability and security in AI-generated apps, and Willison's May 2026 post argues the practice needs agentic-engineering discipline as it converges with professional tool use. Treat agent-built internal tools as prototypes: keep approval workflows for destructive operations, and put someone accountable for review before anything reaches production.

## References

- Jacob Jackson (Cursor) at 0:27:52: "...you're going to see people building software, people in organizational functions building software who were not previously building software. You know, like people in sales who would not have built their own tools before will now be building, for example, dashboards to track what's important to them..."
- Alex Albert (Anthropic) at 0:28:10, referencing a comms team member: "...he's actually been like shipping bug fixes to claude.ai... he pops in with like a PR and he's like asking for a stamp."

- Primary source: https://www.youtube.com/watch?v=BGgsoIgbT_Y
- Vibe coding (Wikipedia): adoption history and criticism of AI-generated software — https://en.wikipedia.org/wiki/Vibe_coding
- Google AI Studio vibe-code app — https://aistudio.google.com/vibe-code
- Simon Willison, "Vibe coding and agentic engineering" (May 6, 2026) — https://simonwillison.net/2026/May/6/vibe-coding-and-agentic-engineering/
