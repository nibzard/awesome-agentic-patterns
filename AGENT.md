# AGENT.md

## Build/Test Commands
- `make site_install` - Install Python dependencies  
- `make site_preview` - Serve docs locally at http://localhost:8000
- `make site_build` - Build static site to site/ directory
- `make site_deploy` - Deploy to GitHub Pages
- `python scripts/build_readme.py` - Regenerate README.md and mkdocs.yaml from pattern files
- `npx wrangler deploy` - Deploy to Cloudflare Workers

## Code Style & Patterns
- Use YAML front-matter for all pattern files with: title, status, authors, category, tags
- Follow TEMPLATE.md structure: Problem → Solution → How to use it → Trade-offs → References  
- Use absolute paths for assets: `/image.jpeg` not `image.jpeg` (critical for deployment)
- Pattern categories: "Orchestration & Control", "Context & Memory", "Feedback Loops", "Tool Use & Environment", "UX & Collaboration", "Reliability & Eval"
- Python: Snake_case functions, proper YAML parsing, UTF-8 encoding
- Always run `python scripts/build_readme.py` after adding/modifying patterns
- Support Mermaid diagrams in pattern markdown files

## Important Notes
- README.md pattern section is auto-generated - don't edit between HTML comment markers
- Pattern files are source of truth - all navigation and docs generated from these
- Use `make site_link` to copy patterns to docs/ before building
