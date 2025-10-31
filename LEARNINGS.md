# Deployment Learnings

## CSS 404 Issue: Root Cause & Solution

### What Happened
Persistent CSS 404 errors on Cloudflare Workers deployment despite file existing and configuration appearing correct.

### Root Causes

1. **Wrangler Asset Manifest Corruption**
   - Wrangler caches asset manifests between deployments
   - When a deployment fails (e.g., broken Worker code), manifest can become corrupted
   - Subsequent deployments with "unchanged" assets skip re-upload, leaving stale/broken manifest
   - Result: Worker can't find assets that were supposedly uploaded

2. **Incremental Upload System**
   ```bash
   # What we saw in logs:
   "No updated asset files to upload. Proceeding with deployment..."
   # Translation: Wrangler detected no changes, skipped upload, used old manifest
   ```

3. **Configuration Confusion**
   - `[site]` config causes HTTP 500 errors (doesn't work with current Wrangler)
   - `[assets]` config with `__STATIC_CONTENT__` binding is correct
   - But even correct config can't fix corrupted asset manifest

### Wrong Approaches We Tried

1. ❌ Changing CSS paths (`css/extra.css` → `/css/extra.css` → back)
2. ❌ Switching between `[site]` and `[assets]` configs (made it worse)
3. ❌ Force re-uploading by modifying CSS file (Wrangler still skipped upload)
4. ❌ Multiple commits trying path variations

### The Fix: Inline CSS

Eliminated the problem entirely by inlining CSS in `overrides/main.html`:

```jinja
{% block styles %}
  {{ super() }}
  <style>
    /* All custom CSS here */
  </style>
{% endblock %}
```

**Why this works:**
- No external files to serve = no 404 errors
- No dependency on Wrangler asset system
- CSS guaranteed to load with page
- Simpler deployment (one less moving part)

## Key Takeaways

### 1. Cloudflare Workers Configuration

**Working config:**
```toml
# wrangler.toml
[assets]
directory = "./site"
binding = "__STATIC_CONTENT__"
```

```javascript
// index.js
export default {
  async fetch(request, env, ctx) {
    return await env.__STATIC_CONTENT__.fetch(request);
  }
};
```

**Broken config (DO NOT USE):**
```toml
[site]
bucket = "./site"  # Causes HTTP 500 errors
```

### 2. Wrangler Asset Manifest Issues

**Symptoms:**
- Assets exist locally in `site/` directory
- GitHub Actions shows successful upload
- Production returns 404 for specific assets
- Other assets work fine

**Diagnosis:**
```bash
# Check deployment logs for:
"No updated asset files to upload"  # Bad: skipped upload
"Uploaded X new assets"              # Good: actually uploaded
```

**Fix options:**
1. **Nuclear option:** Delete and recreate Cloudflare Worker
2. **Inline assets:** Embed CSS/JS directly in HTML
3. **Force re-upload:** Not reliable (Wrangler uses content hashing)

### 3. When to Inline vs. External Files

**Inline if:**
- File is small (<5KB)
- Deployment system is unreliable
- External file keeps causing 404s
- Asset is critical for page functionality

**Keep external if:**
- File is large (images, videos, large JS bundles)
- Needs separate caching strategy
- Shared across many pages

### 4. Debugging External Asset 404s

**Check in this order:**
1. Does file exist in built `site/` directory?
2. Does HTML reference correct path?
3. Do OTHER assets from same directory work?
   - If yes: asset manifest issue
   - If no: path/config issue
4. Check deployment logs for actual upload
5. Try Workers URL directly (bypass CDN cache)

### 5. MkDocs + Cloudflare Workers Gotchas

- MkDocs `extra_css` expects relative paths: `css/extra.css` (not `/css/extra.css`)
- Absolute paths with `/` don't work for `extra_css` config
- CSS lives in `docs/css/` and gets copied to `site/css/` during build
- Custom domain CDN caching can hide deployment issues

## Architecture Decision: Inline CSS

**Trade-offs accepted:**
- ❌ CSS can't be cached separately (~3KB added to each page)
- ✅ Zero external file dependencies
- ✅ Guaranteed to work
- ✅ Simpler deployment
- ✅ No more asset manifest issues

**Final verdict:** For this project (small custom CSS, persistent deployment issues), inlining was the right choice.

## Prevention

### For Future Deployments

1. **Monitor deployment logs carefully:**
   ```bash
   gh run view <run-id> --log | grep -E "(Uploaded|Skipped)"
   ```

2. **Verify assets after deployment:**
   ```bash
   curl -I https://your-site.com/css/extra.css
   curl -I https://your-worker.workers.dev/css/extra.css
   ```

3. **Keep custom assets minimal:**
   - Small CSS/JS → inline it
   - Large files → use CDN or object storage

4. **Document working configuration:**
   - Keep `wrangler.toml` and `index.js` in version control
   - Add comments explaining why config is structured that way
   - Note any known issues with alternatives

### Git Commit Message Lessons

When you see commit message like:
- "Fix CSS serving: Use [site] instead of [assets]"

**Don't assume it's still correct!** Check:
- Were there subsequent reverts?
- Did later commits change it back?
- What's the actual working config NOW?

In our case, commit 7c76140 claimed to "fix" by using `[site]`, but was immediately reverted because it broke the entire site.

## Summary

**Original problem:** CSS 404 errors
**Thought it was:** Path configuration issue
**Actually was:** Wrangler asset manifest corruption + incremental upload system
**Tried fixing:** Multiple config changes, path variations, forced re-uploads
**What worked:** Inlining CSS to eliminate external file dependency entirely

**Time spent debugging:** ~2 hours
**Lines of CSS:** 133
**Deployments attempted:** 8
**Lesson:** Sometimes the simplest solution (inline it) beats debugging complex systems.
