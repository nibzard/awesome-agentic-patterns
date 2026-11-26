---
name: awesome-agentic-patterns-pr-review
description: Review pull requests for the awesome-agentic-patterns repository. Use when asked to validate a PR, assess whether a contribution fits the repo, inspect pattern submissions under patterns/, check merge readiness, repair a small submission issue on top of a contributor branch, draft a polite contributor comment, or apply the repository's pattern-first and non-promotional contribution policy to a GitHub pull request.
---

# Awesome Agentic Patterns PR Review

## Overview

Review PRs in this repository by applying the local contribution policy and checking the actual changed files. Treat `CONTRIBUTING.md` as the source of truth for acceptance criteria, `TEMPLATE.md` as the source of truth for expected pattern structure, and the validation scripts in `scripts/` as the source of truth for structural checks and generated-file expectations.

## Read First

- `CONTRIBUTING.md`
- `README.md`
- `SCHEMA.md` for the status tiers and field definitions
- `TEMPLATE.md` at the repository root
- `scripts/validate-patterns.ts`, the authoritative front-matter and section validator
- `scripts/build-data.ts` when the PR touches patterns, generated README sections, or generated site data

Do not restate repo policy from memory when those files are available. Quote or summarize the repository's own rules instead.

## Workflow

### 1. Inspect the PR

Use `gh` first:

- `gh pr view <number> --repo nibzard/awesome-agentic-patterns --json title,number,state,isDraft,author,baseRefName,headRefName,headRepository,headRepositoryOwner,maintainerCanModify,files,additions,deletions,mergeable,mergeStateStatus,reviewDecision,statusCheckRollup,labels,url,body`
- `gh pr diff <number> --repo nibzard/awesome-agentic-patterns --patch`
- `gh pr checks <number> --repo nibzard/awesome-agentic-patterns`

If you need the exact branch locally, fetch it with:

- `git fetch origin refs/pull/<number>/head:pr-<number>`

Capture these facts before deciding anything:

- Whether the PR is a new pattern submission, a pattern edit, or a broader repo/tooling change
- Whether the change correctly uses `patterns/<slug>.md` rather than editing generated docs directly
- Whether `README.md` or `apps/web/public/` generated outputs changed because the contributor regenerated outputs, or because they hand-edited generated files
- Whether `maintainerCanModify` is enabled and which fork/branch must be updated if you need to fix the PR
- Whether GitHub mergeability is trustworthy yet; `UNKNOWN` can be transient right after a push

### 2. Validate the submission contract

For pattern submissions, check the repository's exact contract before debating fit:

- One pattern per PR
- New patterns live in `patterns/` and use kebab-case filenames
- PR title should use `Add: pattern-name`
- The pattern should be concise, roughly capped at about 200 lines
- Do not edit README auto-generated sections manually
- `docs/index.md` is only a compatibility symlink to `README.md`
- Required front-matter fields (enforced by `scripts/validate-patterns.ts`):
  `title`
  `status`
  `authors`
  `category`
  `source`
  `tags`
  `summary`
  `signals`
  `anti_signals`
  `updated_at` in `YYYY-MM-DD` form
- `based_on` is optional, but a contributor-owned source must be disclosed in `authors` / `based_on`
- `source_link` is invalid here; use `source`
- Required content sections (enforced with `--check-content`):
  `## Problem`
  `## Solution`
  `## How to use it`
  `## Trade-offs`
  `## References`
- Status tier, one of `proposed`, `emerging`, `production`, `foundational`, judged against the independent-adoption bar:

  - A submission backed only by a contributor-owned repo, a personal experiment, or a launch-stage product must use `status: proposed`. Downgrade anything higher to `proposed`.
  - `emerging` needs 2+ independent implementations or teams, or 1 detailed production write-up or major lab paper with active industry iteration.
  - `production` needs proof across multiple independent production systems, with documented failure modes and operational trade-offs.
  - `foundational` is for an industry-default baseline whenever its `signals` apply, and the catalogue keeps the tier to roughly 12-18 patterns.

- Agent-centric technical scope: the pattern must describe a control loop in which an agent senses, reasons, remembers, uses tools, or stays safe. Product strategy, startup philosophy, career advice, and generic non-agent software architecture belong in `principles/`, not `patterns/`.
- Known Implementations cap: `Known Implementations` and tool references are limited to 3-5 entries per pattern. A PR that only appends another vendor or tool link is acceptable only when the tool replaces a deprecated reference or demonstrates a materially distinct architectural variant.
- Differentiation: the PR description must answer "Closest existing pattern(s) & how this is distinct" and justify why the idea cannot live as a section inside an existing pattern.

Before judging novelty, run `python3 scripts/pattern_similarity_checker.py <pattern-file.md>`, then search `patterns/` for duplicates and near-overlaps by title, tags, and Problem wording. Compare what you find with the contributor's differentiation answer. When the primary `source` or a reference belongs to the contributor or an affiliated project, confirm the relationship is disclosed and the write-up frames it as an example rather than the center of the PR.

For generated-file sync, check whether the PR also updated the outputs that CI compares against `patterns/*.md`:

- `README.md`
- `apps/web/public/data/patterns.json`
- other generated files under `apps/web/public/` when the pattern catalog changed
- `llms.txt` at the repository root, which `bun run build:data` keeps identical to `apps/web/public/llms.txt`

Call out structural violations explicitly. These are repository requirements, not style nits.

### 3. Apply local policy

Use `CONTRIBUTING.md` for the actual acceptance rubric. Evaluate:

- Whether the PR documents a reusable pattern rather than a product announcement
- Whether the pattern is materially novel and non-repetitive relative to existing patterns
- Whether the write-up clearly explains Problem, Solution, and Trade-offs or practical mechanics
- Whether references are public and verifiable
- Whether the contribution is community-first and non-promotional
- Whether external links are mostly `github.com`, `github.io`, or neutral technical references for outside contributors
- Whether any vendor or product links are justified by clear novelty rather than marketing
- Whether contributor-owned projects are disclosed and framed as examples rather than the center of the PR
- Whether the category is the best fit for existing repo taxonomy
- Whether the `status` tier matches its objective criterion; a contributor-owned repo or launch-stage product is `proposed`
- Whether the pattern is an agent-specific technical control loop rather than product strategy or generic software architecture
- Whether the PR description names the closest existing pattern(s) and justifies why the submission is not a section inside one of them
- Whether a reference-addition PR stays within the 3-5 entry cap and adds a tool that replaces a deprecated reference or shows a materially distinct variant

Separate policy fit from technical mergeability. A PR can be in scope but still need a maintainer fix before merge.

### 4. Run structural validation

When reviewing a local branch or checking CI behavior, run from the repository root:

- `bun run validate:patterns:content` for front matter, required sections, referential integrity, status vs. evidence, and length guardrails; this is the authoritative validator, and CI runs it
- `bun run validate:patterns` for front matter only (`scripts/validate-patterns.ts`)
- `python3 scripts/pattern_similarity_checker.py <pattern-file.md>` to surface near-duplicates before you judge novelty
- `bun run build:data` when checking generated README or site data changes; it also fails on a missing or malformed `updated_at`. CI syncs the root `llms.txt` alongside `README.md` and `apps/web/public/`.

Treat the scripts as structural checks, not the decision-maker. Human review still decides repository fit, novelty, promotion risk, and category choice.

### 5. Repair the branch when the PR is acceptable but stale

If the PR is acceptable and the user wants it fixed or merged, prefer the smallest possible maintainer correction:

- Fetch the PR branch locally
- Rebase or replay it onto `origin/main`
- Fix only the minimum structural issue
- Normalize front-matter keys or section headings to repo expectations
- Regenerate `README.md` and site data with `bun run build:data` only if the PR already requires generated-file sync
- Push back to the contributor's exact head branch, preferably with `--force-with-lease`
- Re-check `gh pr view` after the push because `mergeable` and `mergeStateStatus` may temporarily show `UNKNOWN`

Do not turn a small submission repair into a broader cleanup.

### 6. Produce the review

Use a code-review mindset:

- Present findings first, ordered by severity, with file references when applicable
- If there are no findings, say that explicitly
- After findings, give one clear decision: `Accept`, `Request changes`, or `Close`
- Include mergeability as a separate line: `clean`, `needs maintainer repair`, or `blocked`
- When the user wants to merge, include the exact next action: `comment`, `fix and push`, `merge`, or `close`

## Output Shape

Keep the final review compact and consistent. Use this exact structure:

`Summary`
- One short sentence on PR state or scope if useful

`Findings`
- Findings first, ordered by severity
- If there are no findings, say `No blocking findings.`

`Decision`
- `Policy fit: Accept | Request changes | Close`
- `Mergeability: clean | needs maintainer repair | blocked`
- `Recommended action: comment | fix and push | merge | close`

`Proposed comment to contributor`
- Draft a short, polite comment suitable for posting on the PR
- If the maintainer already fixed the PR, say what was adjusted and thank the contributor
- If requesting changes, state the minimum changes needed

`What next`
- End with a direct question to the user asking what they want next
- Example: `Do you want me to post the comment, push the small fix, or merge it?`
