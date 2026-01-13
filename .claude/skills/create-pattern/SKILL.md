---
name: create-pattern
description: Analyze sources (blog posts, PDFs, YouTube videos, codebases, pasted text) for agentic patterns, match against 105+ existing patterns, create new patterns or update existing with new sources and insights.
allowed-tools:
  - Read
  - Write
  - Glob
  - Grep
  - Bash
  - mcp__web_reader__webReader
  - mcp__4_5v_mcp__analyze_image
---

# Pattern Ingestion Skill

This skill intelligently analyzes sources for agentic AI patterns, matches them against existing patterns in the repository, and either creates new patterns or updates existing ones with additional sources and insights.

## Overview

**Input:** A source (URL, PDF file, YouTube link, codebase path, or pasted text)

**Process:**
1. Ingest and analyze the source
2. Extract pattern concepts
3. Match against existing 105+ patterns
4. Decide: create new OR update existing
5. Execute and build

**Output:** New pattern file OR updated existing pattern + build confirmation

---

## Phase 1: Ingest Source

Detect the input type and process accordingly:

### URL (blog post, documentation, article)
Use `mcp__web_reader__webReader` with the URL:
```json
{"url": "USER_PROVIDED_URL", "return_format": "markdown"}
```

### PDF File
Use `Read` tool with the PDF path.

### YouTube Video
Use `mcp__web_reader__webReader` with the YouTube URL (transcript extraction).

### Codebase/Repository
Use `Glob` to find key files, then `Read` to analyze:
- `**/*.md` - Documentation
- `**/*.py` - Python implementation
- `**/*.ts` - TypeScript implementation
- README files

### Pasted Text
Analyze directly (no tool needed).

---

## Phase 2: Analyze & Extract

From the source content, extract:

1. **Pattern Title** - What is this pattern called?
2. **Problem Statement** - What challenge does it solve?
3. **Solution** - What's the core approach/mechanism?
4. **Category** - Which of 8 categories fits best?
5. **Source URL** - The original source
6. **Author/Originator** - Who created/originated this?
7. **Tags** - 3+ relevant keywords
8. **Key Insights** - Any novel techniques, constraints, trade-offs

**Generate candidate metadata:**
- Title: descriptive, concise
- Category: select from allowed categories (see reference below)
- Tags: generate 5-10 relevant tags
- Status: default to "emerging" unless evidence suggests otherwise

---

## Phase 3: Match Against Existing Patterns

Search for similar patterns in `patterns/` directory:

### Step 3a: Read All Pattern Frontmatter
Use `Glob` to find all `.md` files in `patterns/`, then `Grep` with output_mode `content` to extract frontmatter from each:
```bash
grep -A 10 "^title:" patterns/*.md
```

Or read multiple pattern files in parallel to compare:
- Problem statements
- Solution approaches
- Categories
- Tags
- Sources

### Step 3b: Semantic Comparison

For each existing pattern, assess similarity using these signals:

**Primary Signals (weight: 30% each)**
1. **Problem Statement** - Same fundamental challenge?
2. **Solution Mechanism** - Same core approach/technique?
3. **Category** - Same category?

**Secondary Signals (weight: 10% each)**
4. **Tag Overlap** - Shared keywords?
5. **Source/Author** - Same contributor's follow-up work?
6. **Title** - Similar naming/description?

### Step 3c: Calculate Confidence Score

```
Score = Σ(matching_signals × weights)
```

- All 3 primary match → 90%+ confidence
- 2 primary + 1+ secondary → 70-90% confidence
- 1 primary + 2+ secondary → 50-70% confidence
- 0-1 primary only → <50% confidence

### Step 3d: Identify Top Matches

List top 3 matching patterns with:
- Pattern title and file path
- Confidence score
- Matching rationale (which signals matched)

---

## Phase 4: Decision

Based on confidence score:

### High Confidence (>80%) → Update Existing
Update the top-matching existing pattern with new source.

### Low Confidence (<50%) → Create New
Create a brand new pattern file.

### Medium Confidence (50-80%) → Ask User
Present the top match and ask:

```
This source seems related to:
- [Match Pattern] (X% confidence)
  - Similar problem: [problem summary]
  - Similar solution: [solution summary]

Should I:
1. Create a new pattern
2. Update the existing pattern with this new source
```

---

## Phase 5a: Create New Pattern

### Step 5a-1: Generate Metadata
```yaml
---
title: "Extracted Title"
status: emerging
authors: ["Your Name (@yourusername)"]
based_on: ["Originator Name (Source/Context)"]
category: "Selected Category"
source: "SOURCE_URL"
tags: [tag1, tag2, tag3, ...]
---
```

### Step 5a-2: Generate Slug
Convert title to kebab-case:
- Lowercase
- Spaces → hyphens
- Remove special characters
- Example: "Tree of Thought Reasoning" → `tree-of-thought-reasoning`

### Step 5a-3: Write Pattern File
Create `patterns/{slug}.md` with structure:

```markdown
---
title: "Title"
status: emerging
authors: ["Your Name (@yourusername)"]
based_on: ["Originator (Source)"]
category: "Category"
source: "URL"
tags: [tag1, tag2, tag3]
---

## Problem
[Extracted problem statement]

## Solution
[Extracted solution description]

- Key components: [list]
- Mechanism: [describe]

```pseudo
[Optional: pseudocode if helpful]
```

## How to use it
[Extracted usage guidance]

## Trade-offs
[Extracted pros and cons]

* **Pros:** [benefits]
* **Cons:** [drawbacks]

## References
* [Original Source Title](URL)
```

---

## Phase 5b: Update Existing Pattern

### Step 5b-1: Read Existing Pattern
Read the matched pattern file at `patterns/{existing-slug}.md`

### Step 5b-2: Update Frontmatter

**Add to `based_on` array:**
```yaml
based_on:
  - "Existing Source (Existing Context)"
  - "New Originator (New Source/Context)"  # Add this
```

**Add new tags** (if not duplicates):
```yaml
tags:
  - existing-tag
  - new-tag-from-source  # Add unique new tags
```

### Step 5b-3: Add to References Section

Append to the `## References` section:
```markdown
## References
* [Existing Source](existing-url)
* [New Source Title](new-url)  # Add this
```

### Step 5b-4: Auto-Expand Content (If Applicable)

**IF** the new source adds substantial new insights (not just a citation):

**To Solution section:**
```markdown
## Solution
[existing content...]

**Additional insights from [New Source]:**
[Extracted new insights with attribution]
```

**To How to use it section:**
```markdown
## How to use it
[existing content...]

**According to [New Source]:**
[New usage guidance or implementation details]
```

**To Trade-offs section:**
```markdown
## Trade-offs
* **Pros:** [existing..., new pros from source]
* **Cons:** [existing..., new cons from source]
```

### Step 5b-5: Write Updated File
Write the updated content back to `patterns/{existing-slug}.md`

---

## Phase 6: Build

### Step 6-1: Run Build Script
```bash
python scripts/build_readme.py
```

### Step 6-2: Verify Success
Check for:
- "Updated README.md" in output
- "Updated mkdocs.yaml" in output
- No error messages

---

## Reference: Allowed Values

### Categories (8 options)
- Orchestration & Control
- Context & Memory
- Feedback Loops
- Learning & Adaptation
- Reliability & Eval
- Security & Safety
- Tool Use & Environment
- UX & Collaboration
- Uncategorized

### Status Values (7 options)
- proposed - Initial concept
- emerging - Early adoption
- established - Proven approach
- validated-in-production - Production-tested
- best-practice - Industry standard
- experimental-but-awesome - Novel but effective
- rapidly-improving - Fast-evolving

### Front-matter Template
```yaml
---
title: "Pattern Title"
status: emerging
authors: ["Contributor Name (@username)"]
based_on: ["Originator Name (Source Context)"]
category: "Category Name"
source: "https://example.com/source"
tags: [tag1, tag2, tag3]
---
```

---

## Output Summary

After completion, provide:

**For New Pattern:**
```
✅ Created new pattern: patterns/{slug}.md
- Title: [title]
- Category: [category]
- Tags: [tags]

Next steps:
1. Review and edit the pattern file for completeness
2. Run: make site_preview
3. Commit: git add patterns/{slug}.md README.md mkdocs.yaml
```

**For Updated Pattern:**
```
✅ Updated existing pattern: patterns/{slug}.md
- Added source to based_on: [source]
- Added [N] new tags
- [Expanded Solution/How-to sections]

Next steps:
1. Review the updated pattern file
2. Run: make site_preview
3. Commit: git add patterns/{slug}.md README.md
```

---

## Tips

- **When in doubt, ask the user** - Pattern matching can be nuanced
- **Preserve existing content** - When updating, don't remove or overwrite existing insights
- **Clear attribution** - Always cite sources when adding new content
- **Tag thoughtfully** - Tags help with future matching
- **Check for duplicates** - If `based_on` already includes the source, just inform the user
