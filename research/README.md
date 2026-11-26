# Research

This directory holds long-form research artifacts that support the pattern catalogue in [`patterns/`](../patterns/). The pattern files are the source of truth for pattern content. This directory is for the verified work behind them.

## What belongs here

Add a file to this directory only if it is one of these two types:

- **A verified catalogue audit.** A complete examination of `patterns/` that documents its method and gives a verdict for each pattern.
- **A synthesis of primary research.** A document that synthesizes primary sources (papers, engineering write-ups, postmortems) for one topic that spans many patterns.

A maintainer must examine and approve each file. Each citation must resolve to a real source. Each statistic must have a source that you can link.

Do not add these files here:

- Per-pattern reports that an AI agent generates without source verification.
- Raw verification output, such as API response dumps, run trackers, and logs.

`scripts/claude-research-loop.sh` writes its output to this directory. Do not commit that output unless a maintainer has verified it.

## Contents

- [`pattern-catalogue-audit-2026-10-report.md`](./pattern-catalogue-audit-2026-10-report.md) — the full catalogue audit of October 2026. It examined 203 patterns on 2026-10-12 and 2026-10-13.

## Why the earlier reports were deleted

In February and March 2026, an automated research loop generated approximately 230 per-pattern research files in this directory (`*-report.md`, `*-analysis.md`, `*-summary.md`, `*-relationships.md`, and related JSON verification files). We deleted these files in November 2026.

The October 2026 audit found these defects in the generated reports:

- Fabricated citations.
- Misattributed arXiv identifiers.
- Statistics with no source.

For example, `reflection-report.md` attributed *Self-Refine* to Shinn et al. 2023 (`arXiv:2303.11366`, which is the identifier of *Reflexion*) and reported a "100x" RLAIF cost reduction that no source supports.

The follow-up pull requests corrected the pattern entries in `patterns/`. The old reports did not change, so each report continued to contradict the audited catalogue and could supply incorrect data to readers and to tools that ingest the repository.

## How to read a deleted report

Git history before November 2026 contains each deleted report. To find the commit that removed them, run:

```bash
git log --diff-filter=D --summary -- research/
```

To read one report at the commit before that deletion, run `git show <commit>^:research/<file>`. Treat the content as unverified.
