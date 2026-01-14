# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2025-01-14

### Added - 🎉 Complete Astro-Powered Redesign

**Major rewrite of the documentation site with modern tooling**

#### New Features
- **Full-text search** powered by Pagefind for instant pattern discovery
- **Interactive Graph Explorer** - Visual map of pattern relationships and connections
- **Pattern Comparison Tool** - Side-by-side comparison of multiple patterns
- **Decision Explorer** - Interactive guide to find the right pattern for your use case
- **Dark mode** with system preference detection and manual toggle
- **Mobile-responsive** design for on-the-go pattern browsing
- **Pattern Packs** - Curated collections of patterns for common agent architectures
- **Developer Guides** - In-depth documentation on pattern selection and usage

#### Technical Changes
- **Migrated from MkDocs to Astro** static site generator
  - Lightning-fast page loads and build times
  - Modern React-based components where needed
  - Better SEO and performance optimization
- **Switched from Python to TypeScript/Node.js** toolchain
  - bun package manager for lightning-fast installs
  - TypeScript for type safety
  - Modern development experience
- **Changed deployment from Cloudflare Pages to Vercel**
  - Global edge caching
  - Preview deployments for PRs
  - Improved build times
- **Removed dependencies**:
  - No more Python/MkDocs setup required
  - No more virtual environment management
  - Simplified contribution workflow

#### URL Compatibility
- All pattern URLs remain identical - no broken bookmarks
- Legacy routes automatically redirect to new pages

#### Developer Experience
- Single-command dev server: `bun run dev`
- Fast builds with bun: `bun run build`
- Live preview with `bun run preview`
- Simplified contribution process

#### Breaking Changes for Contributors
- Pattern files now use Astro-compatible Markdown (vs MkDocs)
- Build command changed from `mkdocs build` to `bun run build`
- Development server changed from `mkdocs serve` to `bun run dev`

See [CONTRIBUTING.md](CONTRIBUTING.md) for updated contribution guidelines.

---

## [Unreleased]

### Pattern Additions
- Hybrid LLM/Code Workflow Coordinator
- Iterative Prompt & Skill Refinement
- LLM Observability
- Memory Reinforcement Learning (MemRL)
- Multi-Platform Webhook Triggers
- Progressive Disclosure for Large Files
- Workflow Evals with Mocked Tools

