# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a documentation website for "Awesome Agentic Patterns" - a curated catalogue of AI agent design patterns. It uses Astro (apps/web/) to generate a static documentation site that can be deployed to Vercel.

## Key Commands

### Development Workflow
```bash
# Initial setup (run once)
npm install                            # Install Node.js dependencies

# Standard development cycle
npm run dev                            # Serve docs locally at http://localhost:4321

# Building and deployment
npm run build                          # Build static site to apps/web/dist/
vercel deploy                          # Deploy to Vercel (primary)
```

## Architecture

The project has a unique architecture where pattern documentation drives the entire site:

1. **Pattern Files** (`patterns/*.md`): Source of truth for all patterns
   - Must include YAML front-matter with: title, status, authors, category, tags
   - Content sections: Problem, Solution, Example (with Mermaid diagrams), References

2. **Data Pipeline**: Pattern files are converted to JSON in `apps/web/public/patterns/`
   - Astro build reads JSON files to generate pages
   - Pattern metadata drives navigation and listings

3. **Build Process**:
   - Astro builds from apps/web/ to apps/web/dist/
   - Site can be served locally or deployed to Vercel

## Pattern Development Workflow

### Adding New Patterns
1. **Start with template**: Copy `patterns/TEMPLATE.md` to create new pattern files
2. **Required YAML front-matter**: Every pattern must include:
   ```yaml
   ---
   title: "Clear, Descriptive Title"
   status: "proposed | emerging | established | validated-in-production | best-practice | experimental-but-awesome | rapidly-improving"
   authors: ["Contributor Name (@username)"]
   based_on: ["Original Creator (Source)"]
   category: "Orchestration & Control | Context & Memory | Feedback Loops | Learning & Adaptation | Reliability & Eval | Security & Safety | Tool Use & Environment | UX & Collaboration | Uncategorized"
   source: "URL to primary source"
   tags: [relevant, keywords, here]
   ---
   ```
3. **Required sections**: Problem, Solution, References
4. **Data sync**: Pattern files must be converted to JSON for the Astro site
   - Run the data pipeline script to update JSON files
   - JSON files are stored in `apps/web/public/patterns/`

### Content Guidelines
- Use Mermaid diagrams in patterns for architectural visualization
- Pattern files support full Markdown with front-matter
- **CRITICAL**: Always add blank lines after headers before starting bullet point lists
  - Incorrect: `**Header:**\n- Item 1` (renders inline)
  - Correct: `**Header:**\n\n- Item 1` (renders as proper list)
  - This is required for Astro to properly convert Markdown lists to HTML `<ul><li>` elements

### Asset Path Handling

**CRITICAL**: When adding images or other assets that need to work on both localhost and deployed sites:

- **Use absolute paths starting with `/`** in all asset references
- **Image references**: Use `/image.jpeg` instead of `image.jpeg` in markdown files
- **Rationale**: Relative paths can work locally but fail on Vercel due to different path resolution behavior
- **Example fix**: Change `![Image](image.jpeg)` to `![Image](/image.jpeg)`

This ensures assets load correctly on both local development (`localhost:4321`) and production deployment (`agentic-patterns.com`).

## Technical Architecture

### Build System Components
- **Astro**: Modern static site generator in `apps/web/`
- **Pattern JSON files**: Generated data in `apps/web/public/patterns/`
- **Vercel config**: Build settings in `vercel.json`
- **TypeScript/Node.js**: Build toolchain

### File Structure
```
patterns/              # Source of truth - all pattern .md files
├── TEMPLATE.md       # Template for new patterns
└── *.md             # Individual pattern files with YAML front-matter

apps/web/             # Astro web application
├── public/
│   └── patterns/    # JSON pattern data for site generation
├── src/             # Astro components and pages
└── dist/            # Build output (deployment artifact)
```

### Dependencies
- **Node.js**: Astro framework and build toolchain
- **Vercel**: Primary deployment platform

## Deployment

- Primary deployment: Vercel (`vercel deploy`)
- For detailed deployment instructions, see DEPLOYMENT.md
