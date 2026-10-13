---
title: Versioned Constitution Governance
status: emerging
authors: ["Nikola Balic (@nibzard)"]
based_on: ["OpenAI (Model Spec versioning)", "Anthropic (Constitutional AI)"]
category: Reliability & Eval
source: "https://model-spec.openai.com/"
tags: [constitution, alignment, governance, signed-commits, policy, rlaif, critique-revise]
summary: "Stores the agent constitution in a signed Git repository where the agent can only propose changes and reviewers or CI gates merge them"
signals: ["Agents can propose changes to their own policy or constitution", "Team must prove who changed a safety rule and why", "Need rollback of bad policy changes"]
anti_signals: ["Policy is fixed and never changes", "Team needs fast policy iteration without review gates"]
updated_at: "2026-10-13"
---

## Problem

When agents can modify policy/constitution text, safety regressions can be introduced gradually and go unnoticed. Without versioning, signatures, and policy review gates, teams cannot prove who changed what, why it changed, or whether critical safeguards were weakened.

## Solution

Store the constitution in a **version-controlled, signed repository**:

- YAML/TOML rules live in Git for automated rule enforcement; natural language principles guide LLM-based evaluation.
- Each commit is signed (e.g., Sigstore); CI runs automated policy checks.
- Only commits signed by approved reviewers or automated tests are merged.
- The agent can *propose* changes, but a gatekeeper merges them.
- Use semantic versioning: MAJOR for core safety principle changes, MINOR for additions, PATCH for clarifications.

Combine policy-as-code with release discipline: every constitutional change is diffable, reviewable, and test-gated before activation. This gives governance history, rollback capability, and auditable control over alignment policy evolution.

## Evidence

- As of October 2026, no public writeup describes this full mechanism (signed constitution repository, CI policy gates, semver for constitutions). The pattern composes practices that are individually established.
- OpenAI publishes the Model Spec as dated, versioned releases with a public changelog — versioned publication of model-behavior policy in practice.
- Signed commits and merge-time signature enforcement are standard Git practice, documented in Pro Git.

## How to use it

- Require `git commit -S` or similar.  
- Run diff-based linting to flag deletions of critical rules.  
- Expose constitution `HEAD` as read-only context in every agent episode.

## Trade-offs

* **Pros:** Strong auditability, safer policy evolution, and fast rollback of bad constitutional changes.
* **Cons:** Slower policy iteration and extra operational burden for signing, review, and CI checks.

## References

- [OpenAI Model Spec](https://model-spec.openai.com/) — primary source for versioned behavior policy: dated public releases with a changelog maintained in the [openai/model_spec](https://github.com/openai/model_spec) repository. It covers publication and versioning of a behavior spec, not signed-commit repo governance of a runtime constitution.
- [Pro Git, "Signing Your Work"](https://git-scm.com/book/en/v2/Git-Tools-Signing-Your-Work) — the mechanism this pattern relies on: GPG-signed commits, signature verification in history, and merge-time enforcement with `git merge --verify-signatures`.
- Anthropic, *Constitutional AI: Harmlessness from AI Feedback* ([arXiv:2212.08073](https://arxiv.org/abs/2212.08073), 2022) — constitution-guided training; the "constitution" concept this pattern governs.
- [Hiveism, "A path towards solving AI alignment"](https://hiveism.substack.com/p/a-path-towards-solving-ai-alignment) — contrast, not basis: the article proposes an alignment loop in which agents deliberate and rewrite their own constitution, and argues a company "would have no way to influence the direction the AI takes." It contains no Git, signing, reviewer, or CI content. The earlier front-matter attribution to this essay was wrong and is removed.
