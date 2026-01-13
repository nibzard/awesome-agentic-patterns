# Modern Docs Redesign and Rearchitecture Specification

Status: In progress
Owner: TBD
Last updated: 2026-01-13

## Summary
This specification defines a modern, LLM-first redesign of the Awesome Agentic Patterns site. The new experience moves from a traditional docs layout to a structured knowledge product with discovery tooling, decision support, machine-readable outputs, and a bold visual identity. The rearchitecture keeps the `patterns/` folder as the source of truth but introduces a structured content model, a data pipeline, and a new static site frontend optimized for search, reuse, and AI ingestion.

## Decisions
- Specification approved for implementation.
- Stack selected: Astro + TypeScript.
- Deployment target: Vercel.
- Package manager: bun.
- Workspace layout: monorepo with `apps/web`.
- Launch milestone: 2026-01-27.
- MkDocs is removed; only patterns and curated content remain.
- Dark mode is in v1 scope.
- Guides will include: `HELP.md`, `LEARNINGS.md`, `PATTERN-LABELING.md`, `MIGRATION-TO-GIT-LABELS.md`.
- Decision Explorer: rules-based for v1 (ML-assisted deferred to v2).
- Backup deployment: No. Vercel-only for simplicity. Git history + local build = sufficient recovery.
- Graph library: D3.js (d3-force) for framework independence and smaller bundle.

## Goals
- Replace the current MkDocs UX with a modern, fast, discovery-driven site.
- Make every pattern machine-readable and reusable (MD, JSON, and LLM formats).
- Add decision support features (compare, decision explorer, graph map).
- Preserve contributor flow (simple Markdown in `patterns/`).
- Improve navigation, search, and content reuse for humans and LLMs.
- Keep deployment static and low-cost (Vercel).

## Non-goals
- Building an authenticated product or paid experience.
- Rewriting all existing pattern content in the first release.
- Replacing the Git-based contribution model with a CMS.
- Adding runtime backends that require persistent servers.
- Maintaining the MkDocs build pipeline.

## Target Users
- Builders: want quick, actionable patterns to ship product features.
- Researchers: want references, provenance, and cross-links.
- Operators: want reliability and safety guidance with checklists.
- Contributors: want a simple way to add or update patterns.

## Product Principles
- Content-first: patterns drive site structure and navigation.
- LLM-friendly by default: every page has clean, structured outputs.
- Fast and frictionless: minimal clicks to find or compare patterns.
- Opinionated design: distinct visual identity, not a generic docs look.
- Stable URLs: patterns are canonical and versioned by slug.

## Information Architecture
Primary navigation:
- Home (overview, featured, entry points)
- Patterns (filterable index)
- Decision Explorer (question-driven recommendations)
- Compare (side-by-side patterns)
- Graph (relationship map)
- Packs (curated bundles)
- Guides (long-form how-tos)
- Contribute (how to add patterns)

Routes (v1):
- / (home)
- /patterns (index)
- /patterns/{slug} (pattern page)
- /compare?ids=a,b,c (comparison view)
- /decision (decision explorer)
- /graph (interactive map)
- /packs (curated bundles)
- /packs/{slug}
- /guides
- /guides/{slug}
- /llms.txt (LLM entry)
- /llms-full.txt (full pattern content)
- /data/patterns.json (structured pattern index)
- /data/patterns/{slug}.json (single pattern JSON)

## Content Model
### Pattern front matter schema (proposed)
Required fields:
```
---
id: "pattern.slug"            # stable, lowercase, dot-separated
title: "Human-readable title"
summary: "One-sentence summary"
status: "proposed | emerging | established | validated-in-production | best-practice | experimental-but-awesome | rapidly-improving"
authors: ["Name (@handle)"]
category: "Orchestration & Control | Context & Memory | Feedback Loops | Learning & Adaptation | Reliability & Eval | Security & Safety | Tool Use & Environment | UX & Collaboration"
tags: [keywords, here]
source: "https://example.com/reference"
slug: "pattern-slug"
---
```

Optional fields:
```
---
based_on: ["Source or team"]
maturity: "early | maturing | mature"
complexity: "low | medium | high"
effort: "hours | days | weeks"
impact: "low | medium | high"
signals: ["When this pattern helps"]
anti_signals: ["When it is a bad fit"]
prerequisites: ["Prereq 1", "Prereq 2"]
related: ["other.pattern.id"]
anti_patterns: ["anti.pattern.id"]
tools: ["vector-db", "sandbox", "ci"]
domains: ["coding", "research", "ops"]
updated_at: "YYYY-MM-DD"
---
```

### Pattern body structure (required sections)
- Problem
- Solution
- How to use it
- Trade-offs
- References

Optional sections:
- When to use
- When not to use
- Signals
- Implementation checklist
- Variations
- Pitfalls
- Benchmarks

### Additional content types
- Guides: longer multi-pattern workflows.
- Packs: curated lists of patterns by theme or use case.
- Glossary: standard definitions for cross-linking.

## Content Retention
- Keep `patterns/` as the canonical source of truth.
- Keep repo-level documentation that directly supports contributors and users.
- Retire MkDocs-specific artifacts and generated outputs after Astro parity.

Initial keep list (adjust after audit):
- `README.md`
- `CONTRIBUTING.md`
- `TEMPLATE.md`
- `HELP.md`
- `LEARNINGS.md`
- `PATTERN-LABELING.md`
- `MIGRATION-TO-GIT-LABELS.md`

Docs to surface as Guides:
- `HELP.md`
- `LEARNINGS.md`
- `PATTERN-LABELING.md`
- `MIGRATION-TO-GIT-LABELS.md`

## Feature Requirements
### Home
- A strong narrative hero (why this exists, who it is for).
- Featured patterns and packs.
- Entry points for Builders, Researchers, Operators.
- Latest updates and newly added patterns.

### Pattern Index
- Faceted filters (category, maturity, complexity, tags, domains).
- Search bar with autocomplete.
- Pattern cards showing summary, status, and tags.

### Pattern Page
- Clean, skimmable layout with section nav.
- Copy as Markdown button (raw page content).
- Copy as JSON button (structured front matter + normalized sections).
- Inline related patterns and anti-patterns.
- Visual metadata pills (status, maturity, complexity).

### Compare
- Select up to 4 patterns and compare key fields side-by-side.
- Show summary, signals, anti-signals, complexity, and trade-offs.

### Decision Explorer
- Question-driven flow that recommends patterns with rationale.
- Outputs include a quick "why this fits" and "what to avoid."
- Implementation: Rules-based decision tree for v1 (ML-assisted deferred to v2).
  - Rationale: Faster development, predictable behavior, easier debugging, clear rationale for recommendations.
  - Future v2: Could enhance with ML for dynamic recommendations based on usage patterns.

### Graph Explorer
- Interactive map of patterns and relationships.
- Filters by category, tag, maturity, and domain.
- Hover shows summary; click opens detail panel.

### Packs
- Curated bundles (e.g., "Coding Agent MVP", "Safety First Stack").
- Each pack includes context and recommended order.

## LLM-first Requirements
- /llms.txt with a concise index of canonical pattern URLs and metadata.
- /llms-full.txt with stable, minimal-noise pattern content.
- /data/patterns.json with structured metadata for ingestion.
- /data/patterns/{slug}.json for single-pattern retrieval.
- Provide "citation mode" anchors for pattern sections (stable IDs).

## UX and Visual Design
Design direction:
- Editorial, bold, modern, not a template docs look.
- High-contrast typography and generous spacing.
- Use a distinctive primary typeface and a serif body typeface.
- Subtle gradient or textured background, not flat color.
- Small, purposeful animations (page-load reveal, card hover lift).

Suggested typography (web-safe fallback acceptable):
- Headings: "Space Grotesk" or "Satoshi"
- Body: "Source Serif 4" or "Literata"
- Code: "JetBrains Mono" or "IBM Plex Mono"

Color system (example palette):
- Ink: #101214
- Paper: #f7f4ef
- Accent: #ff6a00
- Secondary: #0a7cff
- Muted: #8c8c8c
- Success: #12b76a
- Warning: #f79009

## Technical Architecture
### Stack (selected)
- Astro + TypeScript for static rendering.
- MDX for rich pattern content.
- Zod schema validation for front matter.
- Pagefind for search index.
- D3 or Visx for graph visualization.
- Deployment: Vercel (static output).
- Package manager: bun (monorepo).

### Repo layout (selected)
```
apps/web/
  astro.config.mjs
  package.json
  src/
    content/
      patterns/           # read from root patterns/ (symlink or custom loader)
      guides/
      packs/
    pages/
      index.astro
      patterns/[slug].astro
      compare.astro
      decision.astro
      graph.astro
      packs/[slug].astro
      guides/[slug].astro
    components/
    styles/
  public/
    data/
      patterns.json
      graph.json
    llms.txt
    llms-full.txt
```

### Build pipeline (proposed)
1. Parse `patterns/*.md` front matter and body.
2. Validate schema and required headings.
3. Generate structured JSON outputs.
4. Generate `llms.txt` and `llms-full.txt`.
5. Build static pages and search index.

## Migration Strategy
- Keep `patterns/` as source of truth.
- Add missing front matter fields incrementally.
- Introduce a new build pipeline and retire MkDocs.
- Ship the new site behind a preview deployment first.
- Switch the main domain only after parity is reached.
- Remove MkDocs config, build steps, and generated artifacts after Astro parity.

## Performance Targets
- LCP < 2.0s on mobile for the home page.
- 95+ Lighthouse performance and accessibility scores.
- No client-side blocking scripts on initial load.

## Accessibility
- WCAG 2.2 AA compliance.
- Keyboard navigation for all interactive components.
- Visible focus states and accessible color contrast.

## SEO and Metadata
- Canonical URLs for all patterns.
- JSON-LD structured data for patterns.
- Open Graph tags for social sharing.
- XML sitemap and RSS/Atom feeds for updates.

## Implementation Task List
### Phase 0 - Alignment
1. Review and approve this specification. (done)
2. Decide on the final stack (Astro vs alternatives). (done - Astro)
3. Confirm target launch milestone (date or milestone). (done - 2026-01-27)

### Phase 1 - Content Model and Schema
4. Define the final front matter schema (required and optional fields).
5. Add schema validation (Zod or Python) for `patterns/`.
6. Update `patterns/TEMPLATE.md` to include new fields.
7. Add a migration script to backfill missing fields (summary, slug, id).
8. Add lint checks for required sections and heading order.

### Phase 2 - Data Pipeline
9. Create a build script to parse pattern files.
10. Generate `public/data/patterns.json` (index) from patterns.
11. Generate `public/data/patterns/{slug}.json` per pattern.
12. Generate `public/llms.txt` with canonical URLs.
13. Generate `public/llms-full.txt` with normalized content.
14. Generate `public/data/graph.json` from relationships.
15. Add sitemap and RSS feed generation.

### Phase 3 - App Scaffold
16. Create `apps/web/` and initialize Astro + TypeScript.
17. Add global styles, typography, and color tokens.
18. Build a base layout with header, footer, and nav.
19. Implement a responsive grid and spacing system.

### Phase 4 - Core Pages
20. Build the Home page with hero, entry points, and featured content.
21. Build the Patterns index with filters and search.
22. Build the Pattern page template with section nav.
23. Add "Copy as Markdown" and "Copy as JSON" buttons.
24. Build the Compare page with a selection workflow.
25. Build the Decision Explorer flow (v1 rules-based).
26. Build the Graph Explorer (v1 with basic filters).

### Phase 5 - Search and Discovery
27. Integrate Pagefind and generate the search index.
28. Add tag and category filters with URL sync.
29. Implement related patterns and anti-pattern sections.

### Phase 6 - LLM Integration
30. Validate `llms.txt` and `llms-full.txt` formats.
31. Add a "Copy prompt pack" feature for selected patterns.
32. Add citation anchors and a copyable citation format.

### Phase 7 - Migration and Parity
33. Ensure all existing patterns render correctly in the new site.
34. Port any custom MkDocs styles to the new design system.
35. Create redirects from old MkDocs URLs to new routes.
36. Keep README auto-generation intact or replace it.

### Phase 8 - QA and Launch
37. Run Lighthouse and fix performance issues.
38. Run accessibility checks and fix violations.
39. Verify search index, JSON outputs, and LLM files.
40. Deploy preview build and collect feedback.
41. Switch production deployment to the new site.

## Decisions Record

### Decision 001: No Backup Deployment Infrastructure

**Date**: 2026-01-13

**Context**: Project migrating from MkDocs + Cloudflare Workers to Astro + Vercel. Question: whether to maintain Cloudflare/GitHub Pages as backup deployment.

**Decision**: No. Use Vercel as sole deployment target.

**Rationale**:
1. **Operational simplicity**: Single deployment pipeline reduces complexity and error surface
2. **Vercel reliability**: 99.99% uptime SLA; edge failures are exceptionally rare
3. **Migration velocity**: Removes "maintain MkDocs fallback" option, forces completion
4. **DNS switching is slow**: Real failover requires DNS propagation (minutes to hours)
5. **Git = backup**: Repository history + `bun run build` provides sufficient emergency recovery
6. **Preview deployments**: Vercel PR previews provide staging for testing
7. **Cost**: No savings; both platforms have generous free tiers

**Consequences**:
- Remove `wrangler.toml`, `wrangler` from package.json
- Update `.github/workflows/deploy.yml` for Vercel deployment
- Archive DEPLOYMENT.md (MkDocs-specific instructions) after migration
- Domain DNS points to Vercel only

**Revisit if**: Vercel has sustained outage >1 hour (has never occurred).

### Decision 002: D3.js for Graph Visualization

**Date**: 2026-01-13

**Context**: Graph Explorer feature requires interactive network visualization. Options evaluated: D3.js vs Visx vs Sigma.js vs Cytoscape.js.

**Decision**: Use D3.js (d3-force module).

**Rationale**:
1. **Framework independence**: Native Astro compatibility, no React runtime overhead
2. **Bundle size**: ~15-20KB vs ~60KB+ for Visx + React
3. **Native force simulation**: d3-force designed specifically for force-directed graphs
4. **Performance**: Smaller JS = easier LCP < 2.0s target, higher Lighthouse scores
5. **Accessibility patterns**: Documented keyboard nav and ARIA implementation guides
6. **Astro integration**: Works with `client:load` directive, no framework shim

**Alternatives considered**:
- **Visx**: React-specific, no force component (issue #429), adds React runtime
- **Sigma.js**: WebGL-based, handles 10K-100K nodes, overkill for ~50-100 patterns
- **Cytoscape.js**: ~200KB bundle, more complexity than needed

**Implementation**:
```bash
bun add d3-force d3-selection d3-zoom d3-drag
```

**Consequences**:
- Manual accessibility implementation required (keyboard nav, ARIA, focus management)
- Learning curve for D3's imperative API
- Full control over interactions (hover, click, drag, zoom)

**Revisit if**: Graph scales to >500 nodes or requires WebGL performance.

## Acceptance Criteria
- Every pattern has a stable URL and renders with full metadata.
- `llms.txt` and `llms-full.txt` exist and are up to date.
- Pattern pages support copy as Markdown and JSON.
- Search, filters, compare, and graph features work on desktop and mobile.
- New site passes accessibility and performance targets.

## Open Questions
- None.
