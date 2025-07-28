# Deployment Guide

This document provides instructions for deploying the Awesome Agentic Patterns documentation site.

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

## Build Process

Before deploying, you need to build the static site:

```bash
# Activate virtual environment
source venv/bin/activate

# Build the documentation site
make site_build
```

This command:
- Links pattern files from `patterns/` to `docs/patterns/`
- Runs `python scripts/build_readme.py` to update README.md and navigation
- Builds the static site using MkDocs to the `site/` directory

## Deployment Options

You have two deployment options available:

### Option 1: Cloudflare Workers (Recommended)

Cloudflare Workers provides faster global distribution and more configuration options. This is the current deployment method.

```bash
# First, make sure the site is built
source venv/bin/activate
make site_build

# Deploy to Cloudflare Workers
npx wrangler deploy
```

This command:
- Uses the pre-built `site/` directory
- Deploys to Cloudflare Workers using the configuration in `wrangler.toml`
- Serves static files through the Worker script in `index.js`
- Site available at: https://awesome-agentic-patterns.nikola-balic.workers.dev

### Option 2: GitHub Pages

GitHub Pages is an alternative option and can be configured for custom domains.

```bash
# Activate virtual environment
source venv/bin/activate

# Deploy to GitHub Pages
make site_deploy
```

This command:
- Builds the site automatically
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

### Build Failures
If the build process fails:
1. Check that all pattern files have proper YAML front-matter
2. Run `python scripts/build_readme.py` manually to check for errors
3. Ensure all required dependencies are installed

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
- Run `python scripts/build_readme.py` after adding new patterns