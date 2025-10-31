# Deployment Guide

This document provides instructions for deploying the Awesome Agentic Patterns documentation site with automated git-based pattern labeling.

## Recommended Workflow: Automatic Deployment

**The simplest way to deploy is to push to main:**

```bash
git add .
git commit -m "Your changes"
git push
```

GitHub Actions will automatically:
- Detect NEW/UPDATED patterns from git history
- Regenerate README.md and mkdocs.yaml with badges
- Build the site with MkDocs
- Deploy to Cloudflare Workers

**That's it!** No manual build or deployment commands needed.

---

## Prerequisites

- Python 3.x installed (for local development)
- Node.js 20+ and npm installed (for local Wrangler testing)
- Git repository access
- **For automatic deployment**: `CLOUDFLARE_API_TOKEN` secret configured in GitHub repository settings

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

### Option 1: GitHub Actions (Recommended)

**Default workflow**: Just push to main branch:

```bash
git add .
git commit -m "Add new patterns"
git push
```

**What happens automatically:**
1. GitHub Actions workflow triggers on push to main
2. Sets up Python 3.12 and Node.js 20
3. Installs dependencies (MkDocs, Material theme, Wrangler)
4. Runs `python3 scripts/build_readme.py` for git-based pattern labeling
5. Builds site with `mkdocs build`
6. Deploys to Cloudflare Workers using `wrangler deploy`
7. Site live at: https://awesome-agentic-patterns.nikola-balic.workers.dev

**Setup requirements:**
- GitHub repository secret `CLOUDFLARE_API_TOKEN` must be configured
- Get token from: https://dash.cloudflare.com/profile/api-tokens
- Add at: https://github.com/nibzard/awesome-agentic-patterns/settings/secrets/actions

**View workflow status:**
```bash
gh run list --limit 5
gh run watch  # Watch latest run in real-time
```

### Option 2: Manual Local Deployment (Advanced)

For testing wrangler.toml changes or emergency hotfixes:

```bash
source venv/bin/activate
make build_with_labels
npx wrangler deploy
```

> ⚠️ **Note**: Manual deployment may encounter npm cache permission issues. GitHub Actions deployment is more reliable for routine updates.

### Option 3: GitHub Pages (Alternative)

Deploy to GitHub Pages instead of Cloudflare Workers:

```bash
# Activate virtual environment
source venv/bin/activate

# Build with git-based labels
python3 scripts/build_readme.py

# Deploy to GitHub Pages
make site_deploy
```

This pushes the built site to the `gh-pages` branch.

## Troubleshooting

### GitHub Actions Deployment Failures

**Error: Missing CLOUDFLARE_API_TOKEN**
If the workflow fails with "it's necessary to set a CLOUDFLARE_API_TOKEN environment variable":
1. Get API token from: https://dash.cloudflare.com/profile/api-tokens
2. Add secret at: https://github.com/nibzard/awesome-agentic-patterns/settings/secrets/actions
3. Re-run the failed workflow: `gh run rerun <run-id>`

**Error: Wrangler requires Node.js v20.0.0**
If you see "Wrangler requires at least Node.js v20.0.0":
- The workflow should already specify Node.js 20 in `.github/workflows/deploy.yml`
- If not, update: `node-version: '20'`

**Error: upload-artifact v3 deprecated**
If you see deprecation warning for `actions/upload-artifact@v3`:
- Update to v4: `uses: actions/upload-artifact@v4`

### Virtual Environment Issues
If you encounter "mkdocs: No such file or directory":
1. Make sure the virtual environment is activated
2. Reinstall dependencies: `pip install -r requirements.txt`

### CSS Not Loading (404 errors)
If `extra.css` returns 404 errors on deployed site:
1. Check `mkdocs.yaml` uses relative path: `css/extra.css` (not `/css/extra.css`)
2. MkDocs processes `extra_css` relative to `docs_dir`, not as absolute URL paths
3. Rebuild and redeploy after fixing

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

## Local Development

For local development and testing:
```bash
source venv/bin/activate
make site_preview  # Serves at http://localhost:8000
```

Changes are automatically reloaded. Press `Ctrl+C` to stop the server.

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