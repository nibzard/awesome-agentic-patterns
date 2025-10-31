# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a documentation website for "Awesome Agentic Patterns" - a curated catalogue of AI agent design patterns. It uses MkDocs with Material theme to generate a static documentation site that can be deployed to GitHub Pages or Cloudflare Workers.

## Key Commands

### Development Workflow
```bash
# Initial setup (run once)
python -m venv venv                    # Create virtual environment
source venv/bin/activate               # Activate virtual environment (Linux/Mac)
# venv\Scripts\activate                # Activate virtual environment (Windows)
make site_install                      # Install Python dependencies
npm install                            # Install Node.js dependencies

# Standard development cycle
source venv/bin/activate               # Always activate venv first
python scripts/build_readme.py        # Regenerate README.md and mkdocs.yaml from patterns
make site_preview                      # Serve docs locally at http://localhost:8000

# Building and deployment
make site_build                        # Build static site to site/ directory
make site_deploy                       # Deploy to GitHub Pages
npx wrangler deploy                    # Deploy to Cloudflare Workers (recommended)
```

### Virtual Environment
**CRITICAL**: Always activate the virtual environment before running any make commands:
```bash
source venv/bin/activate   # Required before any make command
```
If you see "mkdocs: No such file or directory", the virtual environment is not activated.

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

## Pattern Development Workflow

### Adding New Patterns
1. **Start with template**: Copy `patterns/TEMPLATE.md` to create new pattern files
2. **Required YAML front-matter**: Every pattern must include:
   ```yaml
   ---
   title: "Clear, Descriptive Title"
   status: "Proposed | Established | Best Practice | Deprecated"
   authors: ["Author Name (Affiliation)"]
   category: "Orchestration & Control | Context & Memory | Feedback Loops | Tool Use & Environment | UX & Collaboration | Reliability & Eval | Security & Safety"
   source_link: "URL to primary source"
   tags: [relevant, keywords, here]
   ---
   ```
3. **Required sections**: Problem, Solution, References
4. **Auto-generation**: Run `python scripts/build_readme.py` after adding/modifying patterns
   - Updates README.md between `<!-- AUTO-GENERATED PATTERNS START/END -->` markers
   - Updates mkdocs.yaml navigation structure
   - Groups patterns by category automatically
   - Manages "NEW" badges for recently added patterns

### Content Guidelines
- **Do not edit** the auto-generated sections in README.md manually
- Use Mermaid diagrams in patterns for architectural visualization
- Pattern files support full Markdown with front-matter
- **CRITICAL**: Always add blank lines after headers before starting bullet point lists
  - Incorrect: `**Header:**\n- Item 1` (renders inline)
  - Correct: `**Header:**\n\n- Item 1` (renders as proper list)
  - This is required for MkDocs to properly convert Markdown lists to HTML `<ul><li>` elements

### Asset Path Handling

**CRITICAL**: When adding images, CSS, or other assets that need to work on both localhost and deployed sites:

- **Use absolute paths starting with `/`** in all asset references
- **Image references**: Use `/image.jpeg` instead of `image.jpeg` in markdown files
- **CSS references**: Use `/css/extra.css` instead of `css/extra.css` in mkdocs.yaml
- **Rationale**: MkDocs generates relative paths by default, which work locally but fail on Cloudflare Workers due to different path resolution behavior
- **Example fix**: Change `![Image](image.jpeg)` to `![Image](/image.jpeg)`

This ensures assets load correctly on both local development (`localhost:8000`) and production deployment (`agentic-patterns.com`).

## Technical Architecture

### Build System Components
- **`scripts/build_readme.py`**: Core automation script that:
  - Parses YAML front-matter from all pattern files
  - Extracts metadata (title, category, tags, status)
  - Regenerates README.md auto-generated sections
  - Updates mkdocs.yaml navigation structure
  - Manages "NEW" pattern badges via `.new-patterns-tracker.txt`
- **`Makefile`**: Provides build targets that handle file linking and MkDocs operations
- **`mkdocs.yaml`**: Site configuration with Material theme and Mermaid support
- **`requirements.txt`**: Python dependencies (MkDocs, Material theme, Mermaid plugin)

### File Structure
```
patterns/              # Source of truth - all pattern .md files
├── TEMPLATE.md       # Template for new patterns
└── *.md             # Individual pattern files with YAML front-matter

docs/                 # Generated by make site_link (don't edit directly)
├── index.md         # Symlink to README.md
├── patterns/        # Copy of patterns/ directory
└── ...              # Other copied files

site/                 # Generated by mkdocs build (deployment artifact)
```

### Dependencies
- **Python**: MkDocs ecosystem (mkdocs, mkdocs-material, mkdocs-mermaid2-plugin)
- **Node.js**: Cloudflare Workers deployment via wrangler
- **Virtual Environment**: Required for Python dependency isolation

## Deployment

- Primary deployment: Cloudflare Workers (`npx wrangler deploy`)
- Alternative: GitHub Pages (`make site_deploy`)
- For detailed deployment instructions, see DEPLOYMENT.md