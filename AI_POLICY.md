# Awesome Agentic Patterns AI Contribution Policy

**Version:** 1.0
**Adopted:** 2026-03-11
**License:** Apache-2.0

---

## Overview

Awesome Agentic Patterns welcomes AI-assisted contributions when they improve the project without lowering review quality, maintainability, or legal clarity.

This policy applies to pattern submissions, documentation, issue reports, pull requests, commit messages, and community discussion in this repository.

This repository is community-first, pattern-first, and non-promotional. AI use does not relax those requirements.

---

## Our Stance

We allow AI-assisted contributions with transparency and human accountability.

AI tools are welcome for drafting, editing, summarizing, research assistance, schema compliance checks, and code help, provided the contributor has reviewed the result carefully and can defend it during review.

---

## Core Principles

### 1. Human Accountability

You are responsible for everything you submit.

- You must fully understand any code, prose, references, metadata, or examples you contribute.
- You must be able to explain why the change is correct and useful for this repository.
- "The model generated it" is never an acceptable review response.
- You remain responsible for fixing problems introduced by your contribution.

### 2. Disclosure Requirements

If AI tools contributed materially to a submission, disclose that in the pull request description or issue body.

Include:

- Which tool or model you used
- Which parts were AI-assisted
- How you verified the output

For commits that include substantial AI-generated content, add an `Assisted-by:` trailer, for example:

```text
Assisted-by: GitHub Copilot
Assisted-by: Claude Sonnet 4
```

Minor assistance such as spellcheck, grammar fixes, or inline autocomplete does not require detailed disclosure.

### 3. Quality Standards

All contributions must still meet the repository's normal standards.

- Pattern submissions must be reusable, generalized patterns, not product announcements.
- PRs must remain concise, scoped, and grounded in public, traceable references.
- Content must follow the repository schema and contribution rules.
- AI-generated text must be edited for accuracy, clarity, and redundancy.
- Low-effort, repetitive, or obviously unverified AI output will be rejected.

### 4. Copyright and Licensing

By contributing, you certify that:

1. You have the right to submit the contribution under Apache-2.0.
2. The contribution does not knowingly copy third-party material in a way that violates copyright or license terms.
3. AI-generated output has been reviewed for licensing and attribution risks.
4. Included references, quotations, examples, and assets are lawful to share in this repository.

If you cannot explain the provenance of a substantial AI-generated section, do not submit it.

---

## Permitted Uses

The following uses are generally acceptable when accompanied by human review:

- Drafting or polishing pattern descriptions
- Restructuring prose for clarity
- Generating or refining tests, scripts, or small tooling changes
- Summarizing source material before rewriting it in your own words
- Translating or copy-editing documentation
- Checking front matter, formatting, or schema compliance
- Comparing an in-progress submission against existing patterns for overlap

---

## Prohibited Uses

The following are not acceptable in this repository:

- Autonomous agents opening PRs or issues without direct human review and approval
- Submitting generated pattern entries you do not understand or cannot defend
- Hallucinated references, fabricated citations, or invented production claims
- Bulk AI-generated pattern submissions or shotgun refactors
- Using AI to generate promotional language, backlink-seeding text, or product pitches
- Using AI to respond to review feedback without understanding the underlying comments
- Pasting model output into PR descriptions or issue reports without checking correctness
- AI-generated images or media unless a maintainer explicitly asks for them

---

## Repository-Specific Guidance

### Pattern Submissions

This project accepts patterns, not marketing collateral. If AI helps draft a pattern:

- Rewrite generic model phrasing into specific, technical language.
- Verify that the pattern is materially novel relative to existing entries.
- Confirm that Problem, Solution, How to use it, Trade-offs, and References are concrete and not boilerplate.
- Check that brand or vendor references are examples, not the center of the submission.

### References and Claims

AI tools are especially prone to inventing references or overstating novelty. Before submitting:

- Open every cited link
- Confirm titles, URLs, and attributions
- Remove any claim you cannot verify publicly

### Review Communication

Review comments, issue discussions, and PR summaries should reflect your own judgment.

- You may use AI to help draft a response
- You must not use AI to outsource your reasoning to reviewers
- Final comments should be written and owned by you

### Learning-Oriented Work

If maintainers mark work as beginner-friendly or learning-oriented, do the work yourself rather than delegating the task wholesale to a model.

---

## Enforcement

Maintainers may close or request changes on contributions that do not comply with this policy.

Typical outcomes:

- Missing disclosure: request an update
- Unverified or low-value AI output: request changes or close
- Repeated policy violations: restrict further contributions
- Promotional or fabricated submissions: close without detailed review

This repository has limited review bandwidth. Contributions that create more review cost than project value may be closed quickly.

---

## Maintainer Use

Maintainers may use AI tools in triage, drafting, review support, and automation, but remain fully responsible for all decisions and merged content.

Automation and review bots do not replace maintainer judgment.

---

## Questions

If you have questions about this policy, open a GitHub issue in this repository or ask in the relevant pull request discussion.
