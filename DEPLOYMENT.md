# Deployment Guide

This document provides instructions for deploying the Awesome Agentic Patterns documentation site.

## Recommended Workflow: Automatic Deployment

**The simplest way to deploy is to push to main:**

```bash
git add .
git commit -m "Your changes"
git push
```

Vercel will automatically build and deploy the site.

**That's it!** No manual build or deployment commands needed.

---

## Prerequisites

- Node.js 20+ and npm installed
- Git repository access
- **For automatic deployment**: Vercel account connected to your GitHub repository

## Initial Setup

1. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

## Build Process

### Local Development

For local development and testing:
```bash
npm run dev  # Serves at http://localhost:4321
```

Changes are automatically reloaded. Press `Ctrl+C` to stop the server.

### Production Build

To build the site locally:
```bash
npm run build  # Builds to apps/web/dist/
```

## Deployment Options

### Option 1: Vercel (Recommended)

**Default workflow**: Just push to main branch:

```bash
git add .
git commit -m "Add new patterns"
git push
```

**What happens automatically:**
1. Vercel webhook triggers on push to main
2. Installs Node.js dependencies
3. Runs `npm run build` in apps/web directory
4. Deploys the production build
5. Site live at: https://agentic-patterns.com

**Setup requirements:**
- Connect your GitHub repository to Vercel
- Configure build settings:
  - Root directory: `apps/web`
  - Build command: `npm run build`
  - Output directory: `dist`

### Option 2: Manual Vercel Deployment

For manual deployment:
```bash
cd apps/web
npm run build
vercel deploy --prod
```

## Troubleshooting

### Build Failures

If the build process fails:
1. Check that all pattern JSON files exist in `apps/web/public/patterns/`
2. Ensure all required dependencies are installed: `npm install`
3. Verify Astro configuration is correct in `apps/web/astro.config.mjs`

### Local Development Issues

If `npm run dev` fails:
1. Ensure dependencies are installed: `npm install`
2. Check that port 4321 is available
3. Try clearing the Astro cache: `rm -rf apps/web/.astro`

### Vercel Deployment Failures

If Vercel deployment fails:
1. Check the Vercel deployment logs for specific errors
2. Verify the build command and output directory settings
3. Ensure all environment variables are configured (if any)

## Domain Configuration

The site is configured for the custom domain `agentic-patterns.com`:
- Configure in Vercel project settings under Domains

## Notes

- Pattern files in `patterns/` are the source of truth for all content
- JSON files in `apps/web/public/patterns/` are generated from pattern files
- The `apps/web/dist/` directory is generated and should not be manually edited
- Use `npm run dev` for local development with hot reload
