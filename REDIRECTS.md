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
