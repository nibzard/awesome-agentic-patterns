# AGENT.md

## Build/Test Commands
- `npm install` - Install Node.js dependencies
- `npm run dev` - Serve docs locally at http://localhost:4321
- `npm run build` - Build static site to apps/web/dist/
- `vercel deploy` - Deploy to Vercel

## Code Style & Patterns
- Use YAML front-matter for all pattern files with: title, status, authors, based_on, category, source, tags
- Follow TEMPLATE.md structure: Problem → Solution → How to use it → Trade-offs → References
- Use absolute paths for assets: `/image.jpeg` not `image.jpeg` (critical for deployment)
- Pattern categories: "Orchestration & Control", "Context & Memory", "Feedback Loops", "Learning & Adaptation", "Reliability & Eval", "Security & Safety", "Tool Use & Environment", "UX & Collaboration"
- Support Mermaid diagrams in pattern markdown files

## Important Notes
- Pattern files are source of truth - all navigation and docs generated from these
- Pattern JSON files are generated in `apps/web/public/patterns/`
