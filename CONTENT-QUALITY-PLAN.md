# Content Quality & Editorial Intervention Plan

**Date:** 2026-11-23
**Scope:** Content quality, relevance, taxonomy, synthesis, and editorial governance across `patterns/`, `apps/web/src/content/`, `apps/web/src/data/`, `research/`, and repo documentation (excludes web app implementation).
**North Star:** Make *Awesome Agentic Patterns* the canonical, Gang-of-Four-caliber reference for agentic AI engineering—where **curation by subtraction and synthesis beats growth by volume**.

---

## 1. Baseline Snapshot (November 2026)

| Metric | Current State | Observation |
|---|---|---|
| Total patterns in `patterns/` | **207** (plus `patterns/TEMPLATE.md`) | Strong 2025–2026 technical core (~30–40%), diluted by non-patterns, overlaps, and single-repo proposals |
| October 2026 audit baseline | 14% good, 31% improve, 53% fix, 2% decommission | 7 follow-up PRs cleaned many `patterns/` issues; surrounding content was not cleaned |
| Source concentration | **70 / 207 (34%)** from just **14 single sources** | Heavy podcast/talk slicing (e.g., 11 from one YouTube panel, 11 from one `every.to` transcript) |
| Author concentration | `@nibzard` on **127 / 207 (61%)** | High founder consistency, but strong coding-agent/Anthropic skew |
| Ecosystem skew | Anthropic 37%, Claude Code 31%, MCP 22%, OpenAI 20%, Cursor 15% | Voice/realtime agents = 0 dedicated patterns; multi-tenant OAuth, durable execution, GUI grounding, memory decay thin |
| Schema population | `evidence_grade` missing in 201/207, `maturity` in 189/207, `domains` in 185/207, `complexity` in 179/207 | 7 overlapping `status` values + unused optional fields weaken filtering and trust |
| Synthesis layer | 2 Packs (1 with a major factual error), 1 reader Guide + 2 contributor docs, 5 generic Decision questions | Insufficient entry points for a 200+ item catalog |
| Stale research artifacts | ~230 Feb–Mar 2026 reports in `research/` | Still contain hallucinated citations/stats already removed from `patterns/` |

---

## 2. Core Editorial Thesis

1. **A pattern is a repeatable technical mechanism**, not a product philosophy, startup hot take, career tip, or industry trend essay.
2. **Evidence must govern status.** Single-author personal repos and launch-stage tools belong in `proposed` (clearly badged), never indistinguishable from battle-tested multi-team production patterns.
3. **Deduplication multiplies value.** Every near-duplicate forces readers—and LLMs consuming `llms.txt`—to reconcile conflicting advice. Consolidate and add URL redirects in `vercel.json` so zero external links break.
4. **Synthesis is the leverage point.** Comparative guides, failure-mode routing, and curated architecture packs do more for readers than adding pattern #208.
5. **Quality only sticks when enforced in CI and review policy.** Manual audits rot within months without deterministic checks.

---

## 3. Interventions

### P0 — Immediate Credibility & Hygiene Fixes *(Completed 2026-11-23)*

High-trust fixes for factual errors, contradictions, and leftover audit debris currently in `main`.

- [x] **Fix hallucinated Lethal Trifecta definition in Pattern Pack:** Updated `apps/web/src/content/packs/safety-first-stack.mdx` (lines 39–43) to accurately describe Simon Willison's Lethal Trifecta (private data access + untrusted content exposure + external communication).
- [x] **Quarantine or delete the ~230 stale `research/*-report.md` files:** Kept `research/pattern-catalogue-audit-2026-10-report.md`, deleted 231 stale Feb–Mar 2026 generated files/dumps/logs, and added `research/README.md`.
- [x] **Fix hallucinated citation in `SCHEMA.md`:** Corrected Reflexion (`arXiv:2303.11366`) vs. Self-Refine (`arXiv:2303.17651`) citations, fixed code-fence formatting and Validation section, and aligned required fields (`updated_at`).
- [x] **Unify templates:** Consolidated onto root `TEMPLATE.md`, deleted `patterns/TEMPLATE.md`, and updated references in `CLAUDE.md`, `SCHEMA.md`, `CONTRIBUTING.md`, `SPECIFICATION.md`, `apps/web/src/content/guides/help.mdx`, `apps/web/src/pages/contribute.astro`, and `skills/pr-review/SKILL.md`.
- [x] **Unify `llms.txt`:** Updated `scripts/build-data.ts` to write root `llms.txt` in sync with `apps/web/public/llms.txt` and prune orphaned pattern `.json` files.
- [x] **Fix `skills/pr-review/SKILL.md`:** Removed nonexistent `scripts/lint_front_matter.py` and aligned required fields, sections, and `bun run validate:patterns*` commands.
- [x] **Finish remaining Oct 2026 audit leftovers:**
  - Verified all 7 files mentioning `clawdbot` already point to `openclaw/openclaw` and retain `(formerly Clawdbot)` solely as historical provenance.
  - Fixed broken `related:` slugs (`output-verification-loop.md`, `tracker-as-desired-state-reconciliation.md`).
  - Normalized all 11 quoted `status:` strings to unquoted YAML values.

---

### P1 — Editorial Pruning, Separation & Deduplication *(Completed 2026-11-23)*

Raises catalog signal-to-noise ratio immediately. Preserved URL stability with permanent 301 redirects in `vercel.json` (documented in `REDIRECTS.md`).

#### P1.1 — Separate Non-Patterns from Technical Patterns

Moved 10 product/org strategy, career advice, and trend essays into `principles/` (with `principles/README.md`, linked from `README.md`, and 301 redirects in `vercel.json`):

- [x] `principles/burn-the-boats.md`
- [x] `principles/latent-demand-product-discovery.md`
- [x] `principles/frontier-focused-development.md`
- [x] `principles/shipping-as-research.md`
- [x] `principles/dogfooding-with-rapid-iteration-for-agent-improvement.md`
- [x] `principles/democratization-of-tooling-via-agents.md`
- [x] `principles/ai-accelerated-learning-and-skill-development.md`
- [x] `principles/dev-tooling-assumptions-reset.md`
- [x] `principles/no-token-limit-magic.md`
- [x] `principles/shared-core-native-shells.md`

#### P1.2 — Merge Overlapping Pattern Clusters *(All 9 clusters merged + 301 redirects in `vercel.json`)*

| # | Cluster | Retired File(s) | Canonical File |
|---|---|---|---|
| 1 | **Code-mode tool calling** | `code-first-tool-interface-pattern.md` | ✅ `code-over-api-pattern.md` (`code-then-execute-pattern.md` moved to **Security & Safety**) |
| 2 | **Lazy tool discovery** | `tool-search-lazy-loading.md` | ✅ `progressive-tool-discovery.md` |
| 3 | **Approval-bound execution** | `approval-bound-transactional-write.md` | ✅ `exact-action-authorization-binding.md` |
| 4 | **Prompted tool steering** | `patch-steering-via-prompted-tool-selection.md`, `tool-selection-guide.md` | ✅ `tool-use-steering-via-prompting.md` |
| 5 | **Dual-use CLI & agent tooling** | `cli-first-skill-design.md` | ✅ `dual-use-tool-design.md` (boundary sharpened with `agent-first-tooling-and-logging.md`) |
| 6 | **Spec-driven development** | `spec-as-test-feedback-loop.md` | ✅ `specification-driven-agent-development.md` |
| 7 | **Iterative web research** | `ai-web-search-agent-loop.md` | ✅ `agent-driven-research.md` |
| 8 | **Registry discovery** | `cross-protocol-agent-discovery.md` | ✅ `agent-first-tool-discovery.md` |
| 9 | **Model-evolution scaffolding** | `disposable-scaffolding-over-durable-features.md` | ✅ `progressive-autonomy-with-model-evolution.md` |

#### P1.3 — Fix Clear Miscategorizations

- [x] Moved `egress-lockdown-no-exfiltration-channel.md` from *Tool Use & Environment* -> **Security & Safety**.
- [x] Moved `isolated-vm-per-rl-rollout.md` from *Security & Safety* -> **Learning & Adaptation**.
- [x] Moved `code-then-execute-pattern.md` from *Tool Use & Environment* -> **Security & Safety**.
- [x] Moved `external-credential-sync.md` from *Security & Safety* -> **Tool Use & Environment** and added a blast-radius warning contrasting against `local-first-credential-broker.md` and `credential-free-outbox.md`.

---

### P2 — Taxonomy Reset, Objective Maturity & Pattern Depth

#### P2.1 — Collapse 7 Squishy Statuses + Unused `maturity` into 4 Objective Tiers *(Completed 2026-11-25)*

Replaced the 7 overlapping values (`proposed`, `emerging`, `established`, `validated-in-production`, `best-practice`, `experimental-but-awesome`, `rapidly-improving`) and deprecated the redundant `maturity` field in favor of **4 auditable tiers** across all 187 patterns, Web UI, `SCHEMA.md`, `TEMPLATE.md`, `CONTRIBUTING.md`, `CLAUDE.md`, `skills/pr-review/SKILL.md`, and validators:

| New Status | Count (187) | Objective Entry Criterion | Default UI / Catalog Role |
|---|---|---|---|
| `proposed` | 51 | 0–1 public implementations (contributor's own repo, single paper, or launch-stage startup). | Badged **Incubator / Single-Source** (dashed neutral pill). |
| `emerging` | 86 | 2+ independent implementations/teams, or 1 detailed production write-up with active industry iteration. | Standard catalog entry. |
| `production` | 34 | Proven across multiple independent production systems with documented failure modes and trade-offs. | Eligible for Pattern Packs & primary Decision Explorer recommendations. |
| `foundational` | 16 | Industry-default architectural baseline whenever its `signals` apply (replaces `best-practice`, acknowledging every pattern has `anti_signals`). | Core starting building blocks. |

- [x] Migrated all 187 patterns onto the 4-tier scale, downgraded inflated single-repo/launch-stage entries to `proposed`, promoted 16 foundational primitives, fixed all 4 bogus `evidence_grade` values, and resolved all 13 pre-existing heading-order/duplicate-heading warnings.
- [x] Deprecated `maturity` in `SCHEMA.md` and formalized optional `evidence_grade` (`high | medium | low | mixed | unknown`) in `SCHEMA.md`, `scripts/validate-patterns.ts`, `scripts/build-data.ts`, and `apps/web/src/types/patterns.ts`. (Optional `domains`/`complexity` backfill remains open for Wave 4 if desired.)

#### P2.2 — Upgrade Pattern Depth & Enforce Length Discipline *(Completed 2026-11-25)*

- [x] **Added `### Failure modes` / `**Failure modes / gotchas:**` guidance** to `TEMPLATE.md` and `SCHEMA.md` (plus documented the 70–180 line length target), and added concrete failure modes to all fleshed-out stubs and trimmed foundational/production files.
- [x] **Trimmed all 18 bloated files (>220 lines) to 133–194 lines** (zero `>220` warnings remaining, preserving every verified URL, arXiv ID, DOI, and technical mechanic):
  - `action-caching-replay.md` (256→192), `agent-reinforcement-fine-tuning.md` (249→172), `anti-reward-hacking-grader-design.md` (309→154), `criticgpt-style-evaluation.md` (281→133), `graph-of-thoughts.md` (231→157), `inference-time-scaling.md` (240→158), `intelligent-bash-tool-execution.md` (259→193), `isolated-vm-per-rl-rollout.md` (396→193), `parallel-tool-call-learning.md` (392→193), `progressive-complexity-escalation.md` (258→193), `prompt-caching-via-exact-prefix-preservation.md` (227→180), `sandboxed-tool-authorization.md` (225→168), `schema-validation-retry-cross-step-learning.md` (318→193), `semantic-context-filtering.md` (400→192), `skill-library-evolution.md` (291→194), `sub-agent-spawning.md` (221→183), `variance-based-rl-sample-selection.md` (346→193), `workflow-evals-with-mocked-tools.md` (262→184).
- [x] **Fleshed out all 7 thin stubs (<55 lines) to 80–120 lines** with concrete mechanics, minimal pseudocode/diagrams, and Failure modes (zero `<55` warnings remaining): `dual-llm-pattern.md`, `episodic-memory-retrieval-injection.md`, `explicit-posterior-sampling-planner.md`, `llm-map-reduce-pattern.md`, `milestone-escrow-agent-funding.md`, `reflection.md`, `versioned-constitution-governance.md`.

---

### P3 — Elevate the Synthesis Layer (Highest Reader Leverage) *(Completed 2026-11-25)*

Turn the catalog from a flat list into an actionable engineering handbook.

#### P3.1 — Rebuild the Decision Explorer Around Failure Modes *(Completed 2026-11-25)*
- [x] Rebuilt `apps/web/src/data/decision-questions.json` and `apps/web/src/pages/decision.astro` around 4 failure-mode-first questions (*failure mode*, *trust boundary*, *execution shape*, *domain*) with build-time slug validation, 7–8 grouped clickable `/patterns/<slug>` cards with status pills and 1-line rationales, and verified across all 216 answer combinations.

#### P3.2 — Expand Pattern Packs from 2 -> 7 Flagship Stacks *(Completed 2026-11-25)*
Curated, fact-checked stacks in `apps/web/src/content/packs/`:
- [x] **Coding Agent MVP** *(existing — verified)*
- [x] **Safety-First Stack** *(existing — Lethal Trifecta fixed)*
- [x] **Untrusted-Input Enterprise Agent** (`untrusted-input-enterprise-agent.mdx`)
- [x] **Long-Running Autonomous Worker** (`long-running-autonomous-worker.mdx`)
- [x] **Cost-Controlled Multi-Agent Fleet** (`cost-controlled-multi-agent-fleet.mdx`)
- [x] **Production Eval & Release Pipeline** (`production-eval-release-pipeline.mdx`)
- [x] **Deep Research & Retrieval Agent** (`deep-research-retrieval-agent.mdx`)

#### P3.3 — Upgrade `/guides/` into Comparative Playbooks *(Completed 2026-11-25)*
- [x] Reordered internal contributor/dev docs (`help.mdx` -> `order: 10`, `migration-to-git-labels.mdx` -> `order: 11`) below reader-facing guides while preserving their URLs, added the 4 comparative guides to `DocsSidebar.astro`, and added responsive table styles in `apps/web/src/pages/guides/[slug].astro`.
- [x] Authored 4 grounded **comparative guides** in `apps/web/src/content/guides/`:
  - `multi-agent-topologies-compared.mdx` (`order: 2`)
  - `prompt-injection-defense-in-depth.mdx` (`order: 3`)
  - `context-engineering-playbook.mdx` (`order: 4`)
  - `designing-reliable-agent-evals.mdx` (`order: 5`)

#### P3.4 — Curate Pattern Graph Edges *(Completed 2026-11-25)*
- [x] Added 227 curated `related:` edges across all 47 previously unlinked `foundational` and `production` patterns (plus curated `related:` edges on all 10 new P4 patterns), and fixed `id`-vs-`slug` edge resolution across `scripts/build-data.ts`, `apps/web/src/pages/graph.astro`, and `apps/web/src/lib/patterns.ts` so every explicit link renders in `/graph`, `graph.json`, and related-pattern cards. Also fixed the bare `.md` auto-linkify bug (`CLAUDE.md`, `SKILL.md`) in `apps/web/src/lib/markdown.ts` with unit tests.

---

### P4 — Close Strategic 2026 Domain Gaps (Broaden Beyond Coding Agents) *(Completed 2026-11-25)*

Curated **10 high-signal, multi-team patterns** from non-coding production domains, grounded in primary IETF/USENIX/arXiv/engineering docs with verbatim quote verification, non-obvious failure modes, and explicit `Unverified / Unclear` caveats:

- [x] **Durable Execution & Step Checkpointing** (`patterns/durable-execution-step-checkpointing.md`, `production`, *Orchestration & Control*)
- [x] **Delegated User Authorization (OAuth Token Exchange)** (`patterns/delegated-user-auth-token-exchange.md`, `production`, *Security & Safety*)
- [x] **Multi-Tenant Agent & Memory Isolation** (`patterns/multi-tenant-agent-isolation.md`, `production`, *Security & Safety*)
- [x] **Voice Agent Turn-Taking & Barge-In Handling** (`patterns/voice-agent-turn-taking-barge-in.md`, `production`, *UX & Collaboration*)
- [x] **Dual-Speed Realtime Architecture (Talker-Reasoner)** (`patterns/dual-speed-talker-reasoner-architecture.md`, `emerging`, *Orchestration & Control*)
- [x] **Hybrid GUI & Visual Grounding** (`patterns/hybrid-gui-visual-grounding.md`, `emerging`, *Tool Use & Environment*)
- [x] **Memory Consolidation, Decay & Contradiction Resolution** (`patterns/memory-consolidation-decay-contradiction.md`, `emerging`, *Context & Memory*)
- [x] **Debiased LLM-as-a-Judge Evaluation** (`patterns/debiased-llm-as-a-judge-evaluation.md`, `production`, *Reliability & Eval*)
- [x] **Trajectory & State-Invariant Evaluation** (`patterns/trajectory-and-state-invariant-evaluation.md`, `production`, *Reliability & Eval*)
- [x] **Anchored Structured Context Compaction** (`patterns/anchored-structured-context-compaction.md`, `production`, *Context & Memory*)

---

### P5 — Institutionalize Editorial & Automated Quality Gates *(Completed 2026-11-25)*

Prevent future drift and hallucination regressions structurally.

#### P5.1 — Tighten Submission & Reference-Addition Policy (`CONTRIBUTING.md` & `skills/pr-review/SKILL.md`)
- [x] **Enforce the independent-adoption bar:** Any PR backed solely by a contributor-owned repo or single launch-stage product enters strictly as `status: proposed` (and requires a clear, agent-specific control loop—not generic software architecture).
- [x] **Cap `Known Implementations` per pattern (3–5 entries):** Limit "add my tool to References" PRs to widely adopted canonical tools or implementations demonstrating a materially distinct architecture, preventing popular patterns (e.g., `human-in-loop-approval-framework.md`) from becoming backlink directories.
- [x] **Require a "How is this distinct from X?" line in the PR template:** Added Differentiation & Status Justification section to `.github/pull_request_template.md`, updated `.github/ISSUE_TEMPLATE/new_pattern_proposal.md`, and aligned `.github/workflows/pattern-reviewer.yml`.

#### P5.2 — Upgrade Automated CI Checks (`scripts/validate-patterns.ts` + GitHub Actions)
- [x] **Referential integrity check:** `scripts/validate-patterns.ts --check-content` now fails CI if any slug in `related:`, relative `.md` links in `patterns/`, pack `patterns:` arrays, or `/patterns/<slug>` links in packs/guides fails to resolve.
- [x] **Status vs. evidence guard:** Fails CI if `production`/`foundational` has `low` evidence grade and warns on contributor-owned/launch-stage single-source inflation.
- [x] **Length guardrails:** Warns in CI when a pattern is `<55` lines (stub) or `>220` lines (bloat).
- [x] **Automated PR similarity check:** Added `pr-similarity` job in `.github/workflows/ci.yml` running `scripts/pattern_similarity_checker.py` on PRs touching `patterns/*.md`, plus wired `validate:patterns`, `validate:patterns:content`, and root `llms.txt` sync into CI.
- [x] **Monthly Citation & Link Audit Action:** Created `scripts/audit-citations.ts` (`bun run audit:citations`) and `.github/workflows/citation-audit.yml` (monthly + manual trigger) verifying arXiv IDs/titles, Crossref DOIs, and source URL liveness — and fixed all 18 real arXiv/DOI/source errors it immediately uncovered on its first live run!

---

## 4. Recommended Execution Waves

| Wave | Scope | Deliverable / PR Shape | Impact |
|---|---|---|---|
| **Wave 1** | All of **P0** | 1 focused cleanup PR | Eliminates factual errors (`safety-first-stack.mdx`, `SCHEMA.md`), removes hallucinated `research/` corpus, fixes broken links & doc contradictions |
| **Wave 2** | **P1.1**, **P1.2**, **P1.3** + `vercel.json` redirects | 2–3 PRs (split/prune non-patterns; merge duplicate clusters; fix categories) | Sharpens catalog from ~207 uneven entries to ~175–180 crisp, distinct patterns |
| **Wave 3** | **P2.1** + **P5** | 2 PRs (4-tier status migration + CI/PR quality gates + arXiv/link verifier) | Makes status trustworthy and stops quality drift permanently |
| **Wave 4** | **P2.2** + **P3** | Iterative PRs (trim >220-line files, add Failure Modes, rebuild Decision Explorer, add 5 Packs + 3–4 Comparative Guides) | Transforms the site into a genuine architectural playbook |
| **Wave 5** | **P4** | 10 curated pattern PRs (non-coding domains) | Broadens relevance from coding agents to the full 2026 agentic engineering landscape |

---

## 5. Open Editorial Decisions to Lock In First

Before executing Waves 2–3, confirm three maintainer preferences:

1. **Non-patterns (~10 files in P1.1):** Move to a separate `principles/` collection, or retire/delete from the repo?
2. **Single-author `proposed` patterns:** Show them in the main catalog with an explicit *Incubator / Proposed* badge, or hide `proposed` by default in Browse unless toggled on?
3. **Optional metadata (`domains`, `complexity`, `evidence_grade`):** Backfill across all patterns so multi-faceted filtering works cleanly, or prune unused fields from `SCHEMA.md` to keep front-matter lean?
