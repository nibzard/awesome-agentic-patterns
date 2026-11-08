---
title: "Frozen Evidence Registry"
status: "emerging"
authors: ["Jingbo Chai (@shuxiachai)"]
based_on: []
category: "Reliability & Eval"
source: "https://github.com/shuxiachai/academic-commercialization-agent/blob/4f687cf0cea1885754405be428e4dc47ae2ee66f/src/academic_agent/evidence.py#L901-L1040"
tags: [citations, provenance, source-registry, grounding, guardrails, research-agents, multi-agent]
summary: "Code retrieves, validates and freezes sources into an ID registry before any agent runs; agents cite only those IDs, and a guardrail attaches the real source records and rejects unknown IDs"
signals:
  - "Agents write reports or analyses whose claims must cite sources"
  - "A fabricated title, URL or DOI costs more than a missing one"
  - "Retrieval can run deterministically before the agents start reasoning"
anti_signals:
  - "The agent must discover new sources mid-reasoning, as in open-ended research"
  - "Evidence changes faster than a run lasts, so a frozen snapshot goes stale"
related: ["agent-driven-research", "output-verification-loop", "structured-output-specification", "schema-validation-retry-cross-step-learning", "deterministic-grader-in-the-loop"]
updated_at: "2026-11-08"
---

## Problem

When agents both find and cite their own evidence, citations become one more thing the model can invent. In multi-agent report pipelines three failures tend to appear together:

1. **Fabricated sources.** A finding cites a paper, patent or URL that was never retrieved. The title and DOI look plausible, so neither a reviewer agent nor a reader notices.
2. **One source under several IDs.** The same paper reached through two search engines gets two IDs, and "supported by three sources" really means one.
3. **Checks that trust the previous stage.** A reviewer or scorer agent checks the draft against the draft's own source list, so a fake that got into the draft passes every later stage.

Checking each citation after the fact needs network access and judgement at the point where the pipeline has neither.

## Solution

Take retrieval away from the agents, and make one frozen registry the only thing any stage may cite.

- **Retrieve and validate in code.** Source-native clients and web search run before any agent does. Code canonicalizes URLs, normalizes DOIs, deduplicates by URL and DOI, assigns provenance tiers, and drops sources that fail validation.
- **Freeze with typed IDs.** Each surviving source gets a stable ID whose prefix encodes its domain (`A1` academic, `P1` patent, `M1` market). The registry does not change for the rest of the run.
- **Agents return IDs, never records.** An analyst's output schema has findings with `source_ids` and no field for source records. The guardrail parses the output and attaches the real records from the registry, so no title, URL or DOI written by the model reaches the report.
- **Reject in code, retry with the valid IDs.** The guardrail fails the output when a finding cites an ID outside its domain's slice of the registry, cites nothing while sources exist, or repeats an ID, and when an estimate or inference states no limitation. The retry message lists the IDs the agent may use, and retries are bounded.
- **Check later stages against the registry.** The writer's citations, the reviewer's corrections and the scorer's cited IDs are checked against the registry records, not against the previous stage's own reference list. Aggregates such as a weighted total are computed in code.

```pseudo
registry = freeze(dedupe(validate(retrieve(topic))))      # code only, before any agent

for analyst in [academic, patent, market]:
    for attempt in 1..max_retries:
        out    = analyst.run(view(registry, analyst.prefix))  # findings cite IDs only
        report = attach(records(registry, analyst.prefix), parse(out))
        errors = check(report, allowed=ids(registry, analyst.prefix))
        if not errors: break
        analyst.retry_hint = errors + ids(registry, analyst.prefix)

draft  = writer.run(analyst_reports)        # cited IDs must be in the registry, else retry
review = reviewer.run(draft)                # corrections checked against the registry
score  = weighted_total(scorer.subscores)   # code, not the model
```

## Evidence

- **Evidence Grade:** `low`
- **Most Valuable Findings:**
  - In one open-source implementation, 30 of 30 runs on a frozen benchmark (10 topics, 3 repetitions each) completed with a correct code-computed weighted total. A screen for uncited numbers found no unsupported numeric lines in the 30 reports; that screen is a proxy and does not catch every hallucination.
  - A registered ID proves only that the source is in the registry. It does not prove that the source supports the claim, so claim support needs its own check.
- **Unverified / Unclear:** no head-to-head comparison with agent-led retrieval has been run, so the reduction in fabricated citations has not been measured.

## How to use it

- **Separate the two phases in code.** Retrieval, validation and deduplication run as plain functions before the agent framework starts. Save the registry with the run so a report can be audited later.
- **Encode the domain in the ID.** Typed prefixes let a check reject a patent finding that cites a paper, and let each analyst see only its own slice.
- **Keep records off the model's output schema.** If the schema has a `sources` field, the model will fill it. Attach the records in the guardrail instead.
- **Put the valid IDs in the retry message,** so the retry has something specific to fix.
- **Say what an empty slice means.** When a domain returns no sources, tell the agent so explicitly and let it report the absence; an empty slice that looks like missing context invites answers from memory.
- **Prerequisites:** deterministic retrieval clients, URL and DOI canonicalization, and validated structured outputs (see `structured-output-specification`).

## Trade-offs

- **Pros:**
  - A source the pipeline never retrieved cannot reach the report.
  - Citation checks are cheap set-membership tests that need no network access.
  - Reviewer and scorer outputs can be verified against the same registry as the draft.
  - A run is auditable: the registry is the complete list of what the agents could cite.
- **Cons:**
  - Agents cannot follow a lead in the middle of a run, so recall is bounded by the retrieval step.
  - The snapshot can go stale across long or repeated runs.
  - A valid ID is not a supported claim; claim-level screens such as `output-verification-loop` are still needed.
  - Canonicalization, deduplication and provenance rules take up-front engineering.

## References

- Reference implementation (MIT): the registry checks and the evidence guardrail are in [`evidence.py`](https://github.com/shuxiachai/academic-commercialization-agent/blob/4f687cf0cea1885754405be428e4dc47ae2ee66f/src/academic_agent/evidence.py#L901-L1040), and the scorer's check for cited IDs missing from the registry is in [`scoring_contract.py`](https://github.com/shuxiachai/academic-commercialization-agent/blob/4f687cf0cea1885754405be428e4dc47ae2ee66f/src/academic_agent/scoring_contract.py#L23-L59).
- Architecture and measured results of that implementation: <https://github.com/shuxiachai/academic-commercialization-agent#architecture>
- Contrast with `agent-driven-research` and `ai-web-search-agent-loop`, where the agent finds its own sources.
