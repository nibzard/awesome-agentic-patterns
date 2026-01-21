# Pattern Quality Rubric

Reference for the Pattern Quality Rubric used to score arXiv papers for pattern extraction potential.

## Overview

Papers are scored on a scale of 0-10 using five weighted criteria. Only papers scoring >= 5.0 qualify for pattern extraction.

## Scoring Criteria

| Criterion | Weight | Description | Levels |
|-----------|--------|-------------|--------|
| **Reusability** | 30% | How widely applicable is the pattern? | Domain-specific (1.0) → Multi-domain (2.0) → Universal (3.0) |
| **Novelty** | 25% | How new is the approach? | Existing (1.0) → Incremental (2.0) → Fundamentally new (3.0) |
| **Clarity** | 20% | How well is it described? | Vague (1.0) → Clear (2.0) → Crystal clear (3.0) |
| **Evidence** | 15% | Is there empirical validation? | No eval (1.0) → Some eval (2.0) → Strong empirical (3.0) |
| **Completeness** | 10% | How complete is the implementation? | Idea only (1.0) → Partial details (2.0) → Production-ready (3.0) |

## Detailed Scoring

### Reusability (30% weight)

| Score | Level | Indicators |
|-------|-------|------------|
| 1.0 | Domain-specific | "specific to", "in the field of", "domain-specific" |
| 2.0 | Multi-domain | "multi-domain", "cross-domain", "versatile", "adaptable" |
| 3.0 | Universal | "general", "universal", "framework", "generic", "wide range", "variety of" |

### Novelty (25% weight)

| Score | Level | Indicators |
|-------|-------|------------|
| 1.0 | Existing | No novelty indicators, describes existing approaches |
| 2.0 | Incremental | "improves", "extends", "builds on", "enhances", "optimizes", "refines" |
| 3.0 | Fundamentally new | "novel", "new architecture", "new framework", "first to", "pioneering", "groundbreaking" |

### Clarity (20% weight)

| Score | Level | Indicators |
|-------|-------|------------|
| 1.0 | Vague | "may", "might", "potentially", "could be", "some ways" |
| 2.0 | Clear | "we propose", "our approach", "the method", abstract 100-150 words |
| 3.0 | Crystal clear | Multiple clear indicators + abstract >150 words + concrete language |

### Evidence (15% weight)

| Score | Level | Indicators |
|-------|-------|------------|
| 1.0 | No eval | No evaluation or experiment mentioned |
| 2.0 | Some eval | "evaluation", "experiment", "benchmark", "results", "dataset" |
| 3.0 | Strong empirical | "significant improvement", "state-of-the-art", "outperforms", "empirical", "real-world" |

### Completeness (10% weight)

| Score | Level | Indicators |
|-------|-------|------------|
| 1.0 | Idea only | No implementation mentioned |
| 1.5 | Partial idea | "algorithm", "method", "approach" mentioned |
| 2.0 | Partial details | Implementation details or architecture described |
| 3.0 | Production-ready | "implementation", "open source", "code available", "github", "production", "deployed" |

## Score Calculation

The total score is calculated as a weighted sum:

```
Total = (Reusability × 0.30) + (Novelty × 0.25) + (Clarity × 0.20) + (Evidence × 0.15) + (Completeness × 0.10)
```

Maximum possible score: 10.0

## Threshold

- **Score >= 5.0**: Qualifies for pattern extraction
- **Score >= 7.0**: High-quality candidate, prioritize for extraction
- **Score >= 8.5**: Exceptional candidate, immediate extraction recommended

## Example Scoring

### Example 1: High-quality paper (8.5)

| Criterion | Score | Weighted |
|-----------|-------|----------|
| Reusability | 3.0 (Universal) | 0.90 |
| Novelty | 3.0 (Fundamentally new) | 0.75 |
| Clarity | 2.5 (Very clear) | 0.50 |
| Evidence | 2.0 (Some eval) | 0.30 |
| Completeness | 2.0 (Partial details) | 0.20 |
| **Total** | | **8.5/10** |

### Example 2: Marginal paper (5.2)

| Criterion | Score | Weighted |
|-----------|-------|----------|
| Reusability | 2.0 (Multi-domain) | 0.60 |
| Novelty | 2.0 (Incremental) | 0.50 |
| Clarity | 2.0 (Clear) | 0.40 |
| Evidence | 1.5 (Some eval) | 0.23 |
| Completeness | 1.0 (Idea only) | 0.10 |
| **Total** | | **5.2/10** |
