# arXiv Pattern Discovery Workflow

End-to-end workflow for discovering agentic patterns from academic literature on arXiv.

## Overview

This workflow guides you through the process of discovering new agentic patterns from academic papers:

1. **Discovery** - Search arXiv and score papers
2. **Review** - Identify high-quality candidates
3. **Extract** - Create patterns from selected papers (user-driven)

---

## Phase 1: Discovery

### Step 1.1: Run the arXiv Scanner

Search for recent papers with agentic patterns:

```bash
# Recent papers (last 30 days)
python scripts/arxiv_scanner.py --days=30 --max-results=50 --export-md arxiv_results.md

# All-time papers with higher quality threshold
python scripts/arxiv_scanner.py --max-results=100 --min-score=7.0 --export-md high_quality.md

# Specific topic search
python scripts/arxiv_scanner.py --query="multi-agent memory systems" --max-results=50 --export-md memory_patterns.md
```

### Step 1.2: Review the Output

The scanner produces:
- Console output with top 10 papers by quality score
- Optional Markdown report (with `--export-md`)
- Optional JSON export (with `--export-json`)

Each paper includes:
- **Title**, **arXiv ID**, **URL**
- **Quality Score** (0-10) with breakdown
- **Suggested Category** (based on keywords)
- **Extracted Tags**
- **Abstract**
- **Potential Duplicates** warning (if applicable)

### Step 1.3: Filter Candidates

Filter papers by:
- **Quality Score**: Focus on papers >= 7.0 for best results
- **Category**: Group by your area of interest
- **Duplicate Warnings**: Skip papers flagged as duplicates

---

## Phase 2: Review

### Step 2.1: Read the Markdown Report

Open the exported Markdown file and review candidates:

```bash
# View the report
cat arxiv_results.md
# or open in your editor
code arxiv_results.md
```

### Step 2.2: Visit Paper URLs

For each high-scoring paper:
1. Click the arXiv URL to read the full paper
2. Focus on the "architecture" or "method" section
3. Look for reusable patterns (not just single techniques)

### Step 2.3: Select Extraction Candidates

Prioritize papers with:
- Score >= 7.0 (high quality)
- Clear architectural description
- Novel approach not yet in the pattern catalog
- Universal or multi-domain applicability

---

## Phase 3: Extract (User-Driven)

After selecting candidate papers, you have two options:

### Option A: Use the create-pattern Skill

The `create-pattern` skill can extract patterns from:
- arXiv URLs
- PDF files
- Blog posts
- Code repositories

```
# Ask Claude to extract a pattern from a paper
"Use create-pattern to extract a pattern from https://arxiv.org/abs/2401.12345"
```

### Option B: Manual Pattern Creation

1. Copy the template:
   ```bash
   cp patterns/TEMPLATE.md patterns/my-new-pattern.md
   ```

2. Fill in the required fields:
   - `title`: Descriptive pattern name
   - `status`: Based on quality score and evidence
   - `authors`: Paper authors (@arxiv)
   - `based_on`: Paper title (arXiv link)
   - `category`: From the scanner's suggestion
   - `source`: arXiv URL
   - `tags`: From the scanner's extraction

3. Write the pattern sections:
   - **Problem**: What problem does this pattern solve?
   - **Solution**: How does the architecture work?
   - **Example**: Include a Mermaid diagram
   - **References**: Link to the paper

---

## Phase 4: Validate (Before Committing)

### Step 4.1: Check for Duplicates

```bash
python scripts/pattern_similarity_checker.py patterns/my-new-pattern.md
```

If similarity > 0.7, consider:
- Merging with existing pattern
- Finding a more specific angle
- Marking as variant of existing pattern

### Step 4.2: Validate Quality

```bash
python scripts/pattern_validator.py patterns/my-new-pattern.md
```

Fix any errors before committing.

---

## Example Session

```bash
# Step 1: Search arXiv
python scripts/arxiv_scanner.py --days=30 --min-score=7.0 --export-md candidates.md

# Output:
# Scanning arXiv...
# Fetched 100 papers
# Filtered to 15 papers within last 30 days
# Papers meeting threshold (7.0): 8

# Step 2: Review the markdown report
cat candidates.md

# Step 3: Extract a pattern (using create-pattern skill)
# "Extract a pattern from https://arxiv.org/abs/2401.12345"

# Step 4: Validate
python scripts/pattern_similarity_checker.py patterns/hierarchical-memory.md
python scripts/pattern_validator.py patterns/hierarchical-memory.md
```

---

## Tips for Success

1. **Quality Over Quantity**: Focus on papers scoring >= 7.0
2. **Avoid Duplicates**: Always run the similarity checker before committing
3. **Validate Early**: Run the validator to catch issues early
4. **Use the Rubric**: Understand why papers score the way they do (see RUBRIC.md)
5. **Be Selective**: Not every good paper deserves a pattern—focus on reusable architectures
