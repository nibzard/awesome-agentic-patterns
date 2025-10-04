# Deployment Guide

This document provides instructions for deploying the Awesome Agentic Patterns documentation site with automated git-based pattern labeling.

## Prerequisites

- Python 3.x installed
- Node.js and npm installed (for Cloudflare Workers deployment)
- Git repository access

## Initial Setup

1. **Create and activate virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Install Node.js dependencies (for Cloudflare Workers):**
   ```bash
   npm install
   ```

## Git-Based Pattern Labeling

This repository now uses an automated git-based pattern labeling system:
- **NEW badges** 🆕: Patterns added within the last 7 days
- **UPDATED badges** 🔄: Patterns created >7 days ago but modified within 14 days
- **Automatic detection**: Based on git commit history
- **Zero maintenance**: No manual tracking files needed

### Quick Commands

```bash
# View current pattern labels
make show_labels

# Debug specific pattern dates
make debug_pattern

# Full automated deployment with git-based labeling
make deploy_auto
```

## Build Process

### Automated Build (Recommended)

For complete automation with git-based labeling:

```bash
# Activate virtual environment
source venv/bin/activate

# Full automated deployment
make deploy_auto
```

This command:
- Analyzes git history to determine pattern labels
- Regenerates README.md and mkdocs.yaml with appropriate badges
- Links pattern files and builds the static site
- Commits changes and deploys to production

### Manual Build Process

For step-by-step control:

```bash
# Activate virtual environment
source venv/bin/activate

# Build with git-based labels
make build_with_labels
```

This command:
- Automatically detects NEW/UPDATED patterns from git history
- Updates README.md and navigation with appropriate badges
- Links pattern files from `patterns/` to `docs/patterns/`
- Builds the static site using MkDocs to the `site/` directory

## Deployment Options

You have two deployment options available:

### Option 1: Automated Deployment (Recommended)

Use the fully automated git-based deployment:

```bash
# Complete automation with git-based labeling
make deploy_auto
```

This handles everything:
- Git-based pattern label detection
- Documentation regeneration  
- Site building
- Committing changes
- Deployment to production

### Option 2: Cloudflare Workers (Manual)

For manual Cloudflare Workers deployment:

```bash
# First, build with git-based labels
source venv/bin/activate
make build_with_labels

# Deploy to Cloudflare Workers
npx wrangler deploy
```

This command:
- Uses the pre-built `site/` directory with git-based labels
- Deploys to Cloudflare Workers using the configuration in `wrangler.toml`
- Serves static files through the Worker script in `index.js`
- Site available at: https://awesome-agentic-patterns.nikola-balic.workers.dev

### Option 3: GitHub Pages

GitHub Pages alternative with git-based labeling:

```bash
# Activate virtual environment
source venv/bin/activate

# Build with git-based labels first
python3 scripts/build_readme.py

# Deploy to GitHub Pages
make site_deploy
```

This command:
- Uses git history to determine pattern labels
- Builds the site automatically with proper badges
- Pushes the built site to the `gh-pages` branch
- GitHub automatically serves the site at your configured domain

## Troubleshooting

### Virtual Environment Issues
If you encounter "mkdocs: No such file or directory":
1. Make sure the virtual environment is activated
2. Reinstall dependencies: `pip install -r requirements.txt`

### Cloudflare Workers Timeout
If Cloudflare deployment times out during initialization:
1. Ensure the site is built first: `make site_build`
2. Check that `site/` directory contains the built files
3. Verify `wrangler.toml` configuration is correct

### Git-Based Labeling Issues
If pattern labels aren't appearing correctly:
1. Check current labels: `make show_labels`
2. Debug specific pattern: `make debug_pattern`
3. Ensure patterns are committed to git (uncommitted changes won't show labels)
4. Verify git history exists: `git log --oneline -- patterns/`

### Build Failures
If the build process fails:
1. Check that all pattern files have proper YAML front-matter
2. Run `python3 scripts/build_readme.py` manually to check for errors
3. Ensure git repository has history (needed for date detection)
4. Ensure all required dependencies are installed

### Pattern Label Debugging
To understand why a pattern has or doesn't have a label:
```bash
# Debug specific pattern
python3 scripts/git_pattern_dates.py pattern-name

# View all current labels
python3 scripts/git_pattern_dates.py
```

## Automated Deployments

### GitHub Actions (Future Enhancement)
Consider setting up GitHub Actions for automatic deployments on push to main branch.

### Local Development
For local development and testing:
```bash
source venv/bin/activate
make site_preview  # Serves at http://localhost:8000
```

## Domain Configuration

The site is configured for the custom domain `agentic-patterns.com`:
- GitHub Pages: Domain configured in repository settings
- Cloudflare Workers: Configure custom domain in Cloudflare dashboard

## Notes

- Always activate the virtual environment before running any make commands
- The `site/` directory is generated and should not be manually edited
- Pattern files in `patterns/` are the source of truth for all content
- **Git-based labeling**: Pattern labels are automatically determined from git commit history
- **NEW patterns**: Show 🆕 badge for 7 days after being added to git
- **UPDATED patterns**: Show 🔄 badge for 14 days after being modified in git
- **No manual tracking**: Labels are completely automated based on git dates
- Use `make show_labels` to see current pattern labeling status

## Pattern Labeling Examples

After committing new or updated patterns, they will automatically receive appropriate labels:

```bash
# Example output from make show_labels
🆕 NEW patterns (2):
   - context-window-anxiety-management.md
   - proactive-agent-state-externalization.md

🔄 UPDATED patterns (4):
   - context-minimization-pattern.md
   - parallel-tool-execution.md
   - rich-feedback-loops.md
   - sub-agent-spawning.md
```

These labels will automatically appear in the README.md and website navigation without any manual intervention.