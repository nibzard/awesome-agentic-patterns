# URL Mapping: MkDocs → Astro

This document maps the old MkDocs URLs to the new Astro routes.

## Pattern URL Mapping

All pattern URLs remain **identical** - no redirects needed for individual patterns:
- Old: `/patterns/{pattern-name}/`
- New: `/patterns/{pattern-name}/`

The pattern slug generation is consistent between both systems.

## New Page Routes (No Legacy Equivalent)

These pages are new in the Astro site and have no MkDocs equivalent:
- `/decision` - Decision tree page
- `/graph` - Pattern graph visualization
- `/compare` - Pattern comparison tool
- `/packs/` - Prompt packs index
- `/packs/{slug}/` - Individual prompt pack pages
- `/guides/` - Guides index
- `/guides/{slug}/` - Individual guide pages

## Static Assets

Static assets remain at the same paths:
- `/llms.txt` - LLMs txt file
- `/llms-full.txt` - Full LLMs txt file
- `/patterns.json` - Pattern data JSON
- `/rss.xml` - RSS feed

## Notes

- **Homepage**: `/` → `/` (identical)
- **Pattern pages**: URL structure preserved, no redirects needed
- **404 handling**: Astro has a custom 404 page at `/404` (Astro handles automatically)

## Implementation

This mapping will be used to:
1. Generate Vercel redirects file (Task 267)
2. Configure `vercel.json` redirects/rewrites (Task 290)

## Category Pages

MkDocs had category-based navigation (e.g., "Context & Memory", "Feedback Loops"), but these were navigation groups, not separate pages. The new Astro site uses:
- `/patterns/` - All patterns index with filtering by category

No category page redirects needed as these were never standalone URLs.

---

## Wave 2 Catalog Consolidation Redirects (November 2026)

Configured as permanent (301) redirects in `vercel.json`.

### Merged Duplicate Patterns

| Retired URL | Canonical Destination |
|---|---|
| `/patterns/code-first-tool-interface-pattern` (+ `.md`) | `/patterns/code-over-api-pattern` |
| `/patterns/code-mode-mcp-tool-interface-improvement-pattern` | `/patterns/code-over-api-pattern` |
| `/patterns/tool-search-lazy-loading` (+ `.md`) | `/patterns/progressive-tool-discovery` |
| `/patterns/approval-bound-transactional-write` (+ `.md`) | `/patterns/exact-action-authorization-binding` |
| `/patterns/patch-steering-via-prompted-tool-selection` (+ `.md`) | `/patterns/tool-use-steering-via-prompting` |
| `/patterns/tool-selection-guide` (+ `.md`) | `/patterns/tool-use-steering-via-prompting` |
| `/patterns/cli-first-skill-design` (+ `.md`) | `/patterns/dual-use-tool-design` |
| `/patterns/spec-as-test-feedback-loop` (+ `.md`) | `/patterns/specification-driven-agent-development` |
| `/patterns/ai-web-search-agent-loop` (+ `.md`) | `/patterns/agent-driven-research` |
| `/patterns/cross-protocol-agent-discovery` (+ `.md`) | `/patterns/agent-first-tool-discovery` |
| `/patterns/disposable-scaffolding-over-durable-features` (+ `.md`) | `/patterns/progressive-autonomy-with-model-evolution` |

### Separated Principles (Moved to `principles/`)

Each retired `/patterns/<slug>` path redirects permanently to its file in `principles/<slug>.md` on GitHub:

- `burn-the-boats`
- `latent-demand-product-discovery`
- `frontier-focused-development`
- `shipping-as-research`
- `dogfooding-with-rapid-iteration-for-agent-improvement`
- `democratization-of-tooling-via-agents`
- `ai-accelerated-learning-and-skill-development`
- `dev-tooling-assumptions-reset`
- `no-token-limit-magic`
- `shared-core-native-shells`
