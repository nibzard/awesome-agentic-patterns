# Contributing

Your contributions are always welcome!

## Quick steps

1. Create a new file in `patterns/` using kebab-case.
2. Copy the template from [`TEMPLATE.md`](https://github.com/nibzard/awesome-agentic-patterns/blob/main/TEMPLATE.md).
3. Open a PR titled `Add: pattern-name`.

## Pattern Schema

All patterns must follow the schema defined in [`SCHEMA.md`](SCHEMA.md). This includes:

- Required front matter fields
- Optional front matter fields
- Required body sections
- Optional body sections

### Required Front Matter

Every pattern MUST include these fields:

```yaml
---
title: "Pattern Title Here"
status: proposed  # proposed, emerging, production, foundational
authors: ["Contributor Name (@username)"]
category: "Feedback Loops"  # See SCHEMA.md for all categories
source: "https://example.com/reference"
tags: [tag1, tag2, tag3]
summary: "One sentence that says what the pattern does (the solution, not the problem)"
signals: ["When this pattern helps"]  # 2-4 items; shown as "Use when"
anti_signals: ["When it is a bad fit"]  # 2-3 items; shown as "Avoid when"
updated_at: "2026-11-23"  # Required: YYYY-MM-DD date of last substantive change
---
```

### Optional Front Matter

These fields MAY be added to provide additional context:

```yaml
---
based_on: ["Original Creator (Source)"]
slug: "pattern-slug"  # Auto-generated from title if omitted
evidence_grade: "medium"  # high, medium, low, mixed, unknown
evidence_snapshot: "1-2 high-signal findings + key uncertainty"
complexity: "medium"  # low, medium, high
effort: "days"  # hours, days, weeks
impact: "high"  # low, medium, high
prerequisites: ["Prereq 1", "Prereq 2"]
related: ["other-pattern-id"]
anti_patterns: ["opposing-pattern-id"]
tools: ["tool-type-1", "tool-type-2"]
domains: ["coding", "research", "ops"]
---
```

`maturity` is deprecated. The four-tier `status` supersedes it, so do not add it to a new pattern.

See [`SCHEMA.md`](SCHEMA.md) for complete field definitions and enum values.

### Status Tiers & Independent-Adoption Bar

`status` has four tiers. Each tier has an objective entry criterion, and reviewers audit the claim against public evidence.

| Status | Objective entry criterion |
|--------|---------------------------|
| `proposed` | 0-1 public implementations: the contributor's own repo, a single paper, or a launch-stage startup. |
| `emerging` | 2+ independent implementations or teams, or 1 detailed production write-up or major lab paper with active industry iteration. |
| `production` | Proven across multiple independent production systems, with documented failure modes and operational trade-offs. |
| `foundational` | Industry-default architectural baseline whenever its `signals` apply. |

Two rules follow from the table:

- **A submission backed solely by a contributor-owned repo or a single launch-stage product enters as `status: proposed`.** Reviewers downgrade an inflated status.
- **A pattern describes an agent-specific technical control loop:** how an agent senses, reasons, remembers, uses tools, or stays safe. Product strategy, startup philosophy, and team culture are not patterns. They belong in `principles/` if they are worth keeping.

`foundational` is a small, curated tier (about 12-18 patterns in total), so a new submission rarely qualifies for it.

## Rules

* One pattern per PR.
* Keep the pattern concise (max ~200 lines) and backed by a public reference.
* Fill in all required front matter fields, and justify `status` against the tier criteria above.
* Include all required body sections: Problem, Solution, How to use it, Trade-offs, References.
* State **"Closest existing pattern(s) & how this is distinct"** in the PR description. Name the 1-3 closest patterns and justify why the idea cannot live as a section inside one of them.
* Run `bun run validate:patterns:content` and confirm that it passes with 0 errors.
* Run `bun run build:data` and commit its output together with the pattern change.
* Do not edit README sections between the AUTO-GENERATED markers.
* `docs/index.md` is a compatibility symlink to `README.md`; do not maintain separate content there.
* Check spelling/grammar and remove trailing whitespace.
* Keep contributions community-first: no promotional, sales, affiliate, or backlink-seeding content.
* For external contributors, external links should generally be limited to `github.com`, `github.io`, or non-vendor neutral references (papers, standards, neutral technical write-ups).
* Vendor/product links are considered only in rare cases where the contribution is truly novel and adds clear value. Explain the novelty explicitly.
* Proposals must be materially novel and non-repetitive relative to existing patterns in this repository.

## Submission policy: pattern-first and non-promotional

This repository is for reusable patterns, not product marketing.

A PR is accepted only when it documents a reusable engineering or design pattern. Brand names are okay only as examples or references, not as the center of the PR.

### Hard constraints

* The submission must clearly define a generalized Problem, Solution, and Trade-offs.
* The PR must not read like a product announcement.
* Promotional language and calls to action (e.g. "try now", "sign up", "buy", "subscribe", "join our ...") are not acceptable.
* Known implementations can be listed in `Known Implementations`/references, but the write-up must explain *how the pattern works generally*.
* If the primary reference belongs to the contributor or an affiliated project:
  * state that relationship in front-matter (`authors` / `based_on`);
  * add non-self references when possible;
  * avoid promotional positioning of that project.

### Known Implementations & Reference Additions Policy

Cap `Known Implementations` and tool references at **3-5 representative entries per pattern**. Prefer widely adopted defaults, or implementations that demonstrate a materially distinct architectural variant.

A PR that only appends another vendor or tool link to an existing pattern's `## References` will be closed, unless the tool:

* replaces a deprecated implementation, or
* demonstrates a genuinely distinct mechanism that the existing entries do not cover.

### Maintainer decision rubric

* **Accept**: all hard constraints met and the pattern is clearly reusable.
* **Request changes**: mostly good pattern intent with clear fixes.
* **Close**: mostly self-promotion or no reusable pattern.

### Review checklist (copy into PR reviews)

* [ ] This is about a reusable pattern, not a launch post.
* [ ] The PR names the closest existing pattern(s) and explains how this one is distinct.
* [ ] `status` matches its tier criterion; a contributor-owned repo or launch-stage product is `proposed`.
* [ ] The pattern describes an agent-specific control loop, not product strategy or generic software architecture.
* [ ] Problem, Solution, and Trade-offs are present and specific.
* [ ] No marketing/CTA language in body or references section.
* [ ] Source links are public and verifiable.
* [ ] Any contributor-owned project references are disclosed and framed as examples only.
* [ ] `Known Implementations` and tool references stay within 3-5 entries.
* [ ] `bun run validate:patterns:content` passes with 0 errors and the `bun run build:data` output is committed.

## Local checks

Run these before you open a PR:

* `bun run validate:patterns:content` must exit with 0 errors. Fix the warnings too: section order, duplicate headings, broken references, and length.
* `bun run build:data` regenerates `README.md`, `llms.txt`, and `apps/web/public/`. Commit the output with your pattern change.
