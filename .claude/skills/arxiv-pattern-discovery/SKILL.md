---
name: arxiv-pattern-discovery
description: Search arXiv for academic papers describing agentic AI patterns. Use when user asks to find new patterns from academic literature, search arXiv, discover patterns from papers, or review academic sources for pattern extraction.
---

# arXiv Pattern Discovery

Search arXiv for academic papers describing agentic AI patterns and score them using the Pattern Quality Rubric.

## Quick Start

Invoke this skill when the user asks to:
- Search arXiv for new agent patterns
- Find academic papers about multi-agent orchestration
- Discover patterns from academic literature
- Review the latest papers for extractable patterns
- What new patterns are emerging from recent AI research?

## Workflow

This skill implements a 3-phase discovery workflow:

### Phase 1: Discovery
```bash
# Search for recent papers (last 30 days, max 50 results)
python scripts/arxiv_scanner.py --days=30 --max-results=50 --export-md results.md

# Search for specific topics
python scripts/arxiv_scanner.py --query="multi-agent systems" --max-results=100

# Search with minimum quality threshold
python scripts/arxiv_scanner.py --min-score=7.0 --export-md high-quality.md
```

### Phase 2: Review
- Read the exported Markdown report
- Identify high-quality papers (score >= 7.0)
- Check for potential duplicates flagged by the scanner
- Select candidates for pattern extraction

### Phase 3: Next Steps
- Use the `create-pattern` skill to extract patterns from selected papers
- Or manually create patterns using `patterns/TEMPLATE.md`
- Run the similarity checker before committing to avoid duplicates
- Run the validator to ensure pattern quality

## Script Reference

### arxiv_scanner.py

Main script for querying arXiv API and scoring papers.

**Usage:**
```bash
python scripts/arxiv_scanner.py [OPTIONS]
```

**Options:**
- `--query, -q`: arXiv search query (default: agent/agentic/multi-agent papers)
- `--max-results, -n`: Maximum results to fetch (default: 100)
- `--days, -d`: Only include papers from last N days (default: 365)
- `--min-score, -m`: Minimum quality score to include (default: 5.0)
- `--export-json`: Export results to JSON file
- `--export-md`: Export results to Markdown file
- `--patterns-dir`: Path to patterns directory (default: patterns)
- `--verbose, -v`: Print detailed output for each paper

**Examples:**
```bash
# Recent high-quality papers
python scripts/arxiv_scanner.py --days=7 --min-score=7.0

# Search specific topic
python scripts/arxiv_scanner.py --query="multi-agent orchestration" --max-results=50

# Full scan with export
python scripts/arxiv_scanner.py --days=30 --export-md arxiv_report.md --verbose
```

### pattern_similarity_checker.py

Detect potentially duplicate or very similar patterns.

**Usage:**
```bash
# Check a single pattern against existing patterns
python scripts/pattern_similarity_checker.py patterns/new-pattern.md

# Check all patterns against each other
python scripts/pattern_similarity_checker.py --all

# Custom threshold and export
python scripts/pattern_similarity_checker.py --all --threshold=0.7 --export report.md
```

**Options:**
- `--all, -a`: Check all patterns against each other
- `--patterns-dir, -d`: Path to patterns directory (default: patterns)
- `--threshold, -t`: Similarity threshold for reporting (default: 0.5)
- `--export, -e`: Export report to Markdown file

### pattern_validator.py

Validate pattern files for completeness and quality.

**Usage:**
```bash
# Validate a single pattern
python scripts/pattern_validator.py patterns/new-pattern.md

# Validate all patterns
python scripts/pattern_validator.py --all --verbose

# Export validation report
python scripts/pattern_validator.py --all --export validation_report.md
```

**Options:**
- `--all, -a`: Validate all pattern files
- `--patterns-dir, -d`: Path to patterns directory (default: patterns)
- `--verbose, -v`: Print detailed output for each issue
- `--strict, -s`: Treat warnings as errors
- `--export, -e`: Export report to Markdown file

## Next Steps After Discovery

After identifying candidate papers from arXiv:

1. **Extract the Pattern**: Use the `create-pattern` skill with the paper URL or PDF
2. **Validate**: Run `pattern_validator.py` on the new pattern file
3. **Check for Duplicates**: Run `pattern_similarity_checker.py` on the new pattern
4. **Review**: Ensure the pattern meets the quality threshold (score >= 5.0)
5. **Commit**: Add the pattern to the repository

## Quality Scoring

Papers are scored using the Pattern Quality Rubric (see RUBRIC.md for details):

- **Reusability (30%)**: Domain-specific → Multi-domain → Universal
- **Novelty (25%)**: Existing → Incremental → Fundamentally new
- **Clarity (20%)**: Vague → Clear → Crystal clear
- **Evidence (15%)**: No eval → Some eval → Strong empirical
- **Completeness (10%)**: Idea only → Partial details → Production-ready

**Threshold**: Score >= 5.0 qualifies for pattern extraction
