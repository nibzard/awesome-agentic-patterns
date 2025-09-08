# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a documentation website for "Awesome Agentic Patterns" - a curated catalogue of AI agent design patterns. It uses MkDocs with Material theme to generate a static documentation site that can be deployed to GitHub Pages or Cloudflare Workers.

## Key Commands

### Local Development
```bash
make site_preview    # Serve docs locally at http://localhost:8000
```

### Building Documentation
```bash
python scripts/build_readme.py    # Regenerate README.md and mkdocs.yaml from pattern files
make site_build                   # Build static site to site/ directory
```

### Deployment
```bash
make site_deploy        # Deploy to GitHub Pages
npx wrangler deploy     # Deploy to Cloudflare Workers
```

### Initial Setup
```bash
make site_install    # Install Python dependencies
npm install          # Install Node.js dependencies (wrangler)
```

## Architecture

The project has a unique architecture where pattern documentation drives the entire site:

1. **Pattern Files** (`patterns/*.md`): Source of truth for all patterns
   - Must include YAML front-matter with: title, status, authors, category, tags
   - Content sections: Problem, Solution, Example (with Mermaid diagrams), References

2. **Automated Generation**: The `scripts/build_readme.py` script:
   - Scans all pattern files and extracts metadata
   - Updates README.md between `<!-- PATTERN_LIST_START -->` and `<!-- PATTERN_LIST_END -->` markers
   - Updates mkdocs.yaml navigation structure
   - Groups patterns by category

3. **Build Process**: 
   - `make site_link` copies patterns to docs/ directory
   - MkDocs builds from docs/ to site/
   - Site can be served locally or deployed to GitHub Pages/Cloudflare

## Important Notes

- When adding new patterns, use TEMPLATE.md as a starting point
- Always run `python scripts/build_readme.py` after adding/modifying patterns
- The README.md patterns section is auto-generated - do not edit manually between the HTML comment markers
- Pattern files support Mermaid diagrams for visualizing architectural concepts

## Deployment

- For deployment instructions first read DEPLOYMENT.md