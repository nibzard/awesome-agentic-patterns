---
title: AI-Assisted Code Review / Verification
status: emerging
authors: ["Aman Sanger (Cursor)"]
category: Feedback Loops
source: "Video Transcript (Time: 0:08:45-0:09:41)"
tags: [code-review, verification, quality-assurance, human-ai-collaboration, trust, explainability, software-quality]
---

## Problem
As AI models generate increasing amounts of code, the bottleneck in software development shifts from code generation to code verification and review. Ensuring that AI-generated code is not only syntactically correct but also semantically correct, aligns with the intended functionality (especially if underspecified), and meets quality standards becomes crucial and time-consuming.

## Solution
Develop and employ AI-powered tools and processes specifically designed to assist humans in reviewing and verifying code, whether it's AI-generated or human-written. This can involve:

-   AI agents that analyze code changes and highlight potential issues, bugs, or deviations from best practices.
-   Tools that help summarize the intent or impact of code changes, making it easier for human reviewers to understand.
-   Interactive systems where reviewers can ask the AI to explain parts of the code or justify certain decisions made during generation.
-   Mechanisms to ensure the AI's output aligns with the user's "mind's eye" or high-level intent, even if the initial specification was ambiguous.

The goal is to make the code review process more efficient and reliable, building confidence in the (AI-assisted) codebase.

## How to use it

- Integrate AI verification tools into the PR review process.
- Prompt agents to explain their generated code or provide rationales for changes.
- Focus human review on verifying alignment with high-level intent and business logic.

## References

- Aman Sanger (Cursor) at 0:09:12: "So I think we're going to need to figure out how to make it easier for people to review code, how to to be confident that the agent's making the changes that are not just correct... was it actually what you had in your mind's eye? And so making the process of review much, much better, I think will be really, really important."