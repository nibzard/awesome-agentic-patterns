#!/usr/bin/env python3
"""
arxiv_scanner.py

Automated paper discovery for new agentic patterns from arXiv.

Queries arXiv API with targeted search terms, filters by date/citation count/keywords,
and scores papers using the Pattern Quality Rubric (0-10).

Usage:
    python scripts/arxiv_scanner.py --days=7 --min-citations=3
    python scripts/arxiv_scanner.py --query="multi-agent systems" --max-results=50
"""

import argparse
import configparser
import dataclasses
import datetime
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any, Dict, List, Optional, Set


# Configuration
DEFAULT_SEARCH_QUERY = '(cat:cs.AI OR cat:cs.CL OR cat:cs.LG OR cat:cs.CR) AND all:"agent" OR all:"agentic" OR all:"multi-agent"'
ARXIV_API_URL = "http://export.arxiv.org/api/query?"
USER_AGENT = "arxiv-scanner/0.1 (https://github.com/nibzard/awesome-agentic-patterns)"


# Valid status values for patterns
VALID_STATUSES = {
    "proposed",
    "emerging",
    "established",
    "validated-in-production",
    "best-practice",
    "experimental-but-awesome",
    "rapidly-improving",
}

# Valid category values
VALID_CATEGORIES = {
    "Orchestration & Control",
    "Context & Memory",
    "Feedback Loops",
    "Learning & Adaptation",
    "Reliability & Eval",
    "Security & Safety",
    "Tool Use & Environment",
    "UX & Collaboration",
    "Uncategorized",
}


@dataclasses.dataclass
class Paper:
    """Represents an arXiv paper with metadata."""

    arxiv_id: str
    title: str
    authors: List[str]
    abstract: str
    published: str
    updated: str
    categories: List[str]
    url: str
    citation_count: int = 0
    quality_score: float = 0.0


@dataclasses.dataclass
class PatternCandidate:
    """Represents a potential pattern extracted from a paper."""

    paper: Paper
    pattern_name: Optional[str] = None
    category: Optional[str] = None
    tags: List[str] = dataclasses.field(default_factory=list)
    score_breakdown: Dict[str, float] = dataclasses.field(default_factory=dict)
    total_score: float = 0.0


class ArxivAPIError(Exception):
    """Raised when arXiv API request fails."""

    pass


def fetch_arxiv_papers(
    query: str,
    max_results: int = 100,
    sort_by: str = "submittedDate",
    sort_order: str = "descending",
) -> List[Paper]:
    """
    Fetch papers from arXiv API.

    Args:
        query: Search query string
        max_results: Maximum number of results to return
        sort_by: Sort field (lastUpdatedDate, submittedDate)
        sort_order: ascending or descending

    Returns:
        List of Paper objects
    """
    encoded_query = urllib.parse.quote(query)
    url = f"{ARXIV_API_URL}search_query={encoded_query}&start=0&max_results={max_results}&sortBy={sort_by}&sortOrder={sort_order}"

    headers = {"User-Agent": USER_AGENT}

    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=30) as response:
            xml_data = response.read().decode("utf-8")
    except urllib.error.URLError as e:
        raise ArxivAPIError(f"Failed to fetch papers: {e}")

    return parse_arxiv_response(xml_data)


def parse_arxiv_response(xml_data: str) -> List[Paper]:
    """Parse arXiv API XML response into Paper objects."""
    papers = []

    # Extract entries using regex (simple approach, could use xml.etree)
    entry_pattern = re.compile(r"<entry>(.*?)</entry>", re.DOTALL)
    title_pattern = re.compile(r"<title>(.*?)</title>", re.DOTALL)
    author_pattern = re.compile(r"<name>(.*?)</name>")
    summary_pattern = re.compile(r"<summary>(.*?)</summary>", re.DOTALL)
    published_pattern = re.compile(r"<published>(.*?)</published>")
    updated_pattern = re.compile(r"<updated>(.*?)</updated>")
    category_pattern = re.compile(r'<term[^>]*>([^<]+)</term>')
    id_pattern = re.compile(r"<id>(.*?)</id>")
    arxiv_id_pattern = re.compile(r"arxiv.org/abs/(\d+\.\d+)")

    for entry_match in entry_pattern.finditer(xml_data):
        entry = entry_match.group(1)

        # Extract title
        title_match = title_pattern.search(entry)
        title = title_match.group(1).strip().replace("\n", " ") if title_match else "Unknown"

        # Extract authors
        authors = [a.strip() for a in author_pattern.findall(entry)]

        # Extract abstract
        summary_match = summary_pattern.search(entry)
        abstract = summary_match.group(1).strip().replace("\n", " ") if summary_match else ""

        # Extract dates
        published_match = published_pattern.search(entry)
        published = published_match.group(1) if published_match else ""

        updated_match = updated_pattern.search(entry)
        updated = updated_match.group(1) if updated_match else ""

        # Extract categories (primary and secondary)
        categories = list(set(category_pattern.findall(entry)))

        # Extract arXiv ID
        id_match = id_pattern.search(entry)
        arxiv_id = "unknown"
        if id_match:
            arxiv_id_match = arxiv_id_pattern.search(id_match.group(1))
            if arxiv_id_match:
                arxiv_id = arxiv_id_match.group(1)

        # Build URL
        url = f"https://arxiv.org/abs/{arxiv_id}"

        papers.append(
            Paper(
                arxiv_id=arxiv_id,
                title=title,
                authors=authors,
                abstract=abstract,
                published=published,
                updated=updated,
                categories=categories,
                url=url,
            )
        )

    return papers


def parse_date(date_string: str) -> datetime.datetime:
    """Parse arXiv date string to datetime object."""
    # arXiv dates are in format: 2025-01-15T12:34:56Z
    try:
        return datetime.datetime.fromisoformat(date_string.replace("Z", "+00:00"))
    except ValueError:
        # Fallback for other formats
        return datetime.datetime.min


def filter_papers_by_date(papers: List[Paper], days: int) -> List[Paper]:
    """Filter papers to those published/updated within the last N days."""
    cutoff = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=days)
    return [p for p in papers if parse_date(p.published) >= cutoff or parse_date(p.updated) >= cutoff]


def filter_papers_by_keywords(papers: List[Paper]) -> List[Paper]:
    """Filter papers to those containing architecture/pattern keywords in abstract."""
    architectural_terms = {
        "architecture",
        "pattern",
        "framework",
        "design",
        "orchestration",
        "coordination",
        "hierarchy",
        "protocol",
        "memory",
        "agent",
        "agentic",
        "multi-agent",
        "autonomous",
        "workflow",
        "control",
        "feedback",
        "adapter",
        "interface",
        "abstraction",
    }

    filtered = []
    for paper in papers:
        abstract_lower = paper.abstract.lower()
        title_lower = paper.title.lower()
        combined = title_lower + " " + abstract_lower

        if any(term in combined for term in architectural_terms):
            filtered.append(paper)

    return filtered


def score_reusability(paper: Paper) -> float:
    """
    Score paper on reusability (30% weight).

    Domain-specific (1.0) → Multi-domain (2.0) → Universal (3.0)
    """
    abstract_lower = paper.abstract.lower()
    title_lower = paper.title.lower()
    combined = title_lower + " " + abstract_lower

    # Check for universal language
    universal_indicators = ["general", "universal", "framework", "generic", "generic approach"]
    multi_domain_indicators = ["multi-domain", "cross-domain", "versatile", "adaptable"]
    domain_specific_indicators = ["specific to", "in the field of", "domain-specific"]

    universal_count = sum(1 for term in universal_indicators if term in combined)
    multi_domain_count = sum(1 for term in multi_domain_indicators if term in combined)
    domain_specific_count = sum(1 for term in domain_specific_indicators if term in combined)

    # Also check for broad application potential
    broad_terms = ["wide range", "variety of", "multiple use cases", "flexible"]
    broad_count = sum(1 for term in broad_terms if term in combined)

    if universal_count >= 1 or broad_count >= 1:
        return 3.0
    elif multi_domain_count >= 1:
        return 2.0
    elif domain_specific_count >= 1:
        return 1.0
    else:
        # Default to mid-range
        return 2.0


def score_novelty(paper: Paper) -> float:
    """
    Score paper on novelty (25% weight).

    Existing (1.0) → Incremental (2.0) → Fundamentally new (3.0)
    """
    abstract_lower = paper.abstract.lower()
    title_lower = paper.title.lower()
    combined = title_lower + " " + abstract_lower

    # Check for novelty indicators
    novel_indicators = [
        "novel",
        "new",
        "first",
        "pioneering",
        "groundbreaking",
        "innovative",
        "unprecedented",
        "original",
        "unique approach",
    ]
    incremental_indicators = [
        "improves",
        "extends",
        "builds on",
        "enhances",
        "optimizes",
        "refines",
        "extension of",
    ]

    novel_count = sum(1 for term in novel_indicators if term in combined)
    incremental_count = sum(1 for term in incremental_indicators if term in combined)

    # Check for strong claims of new approaches
    strong_novel = ["new architecture", "new framework", "new paradigm", "first to"]
    strong_novel_count = sum(1 for term in strong_novel if term in combined)

    if strong_novel_count >= 1 or novel_count >= 2:
        return 3.0
    elif novel_count >= 1 and incremental_count == 0:
        return 2.5
    elif incremental_count >= 1:
        return 2.0
    else:
        return 1.5


def score_clarity(paper: Paper) -> float:
    """
    Score paper on clarity (20% weight).

    Vague (1.0) → Clear (2.0) → Crystal clear (3.0)
    """
    abstract_lower = paper.abstract.lower()
    title_lower = paper.title.lower()
    combined = title_lower + " " + abstract_lower

    # Clarity indicators
    clear_indicators = [
        "we propose",
        "we present",
        "our approach",
        "the method",
        "the algorithm",
        "specifically",
        "concretely",
    ]
    vague_indicators = [
        "some ways",
        "somewhat",
        "may",
        "might",
        "potentially",
        "could be",
    ]

    clear_count = sum(1 for term in clear_indicators if term in combined)
    vague_count = sum(1 for term in vague_indicators if term in combined)

    # Abstract length (too short might indicate lack of detail)
    abstract_words = len(paper.abstract.split())
    length_score = 0
    if abstract_words > 150:
        length_score = 1
    elif abstract_words > 100:
        length_score = 0.5

    base_score = 2.0
    if clear_count >= 3:
        base_score = 2.5
    if vague_count >= 3:
        base_score = max(1.0, base_score - 0.5)

    return min(3.0, base_score + length_score)


def score_evidence(paper: Paper) -> float:
    """
    Score paper on empirical evidence (15% weight).

    No eval (1.0) → Some eval (2.0) → Strong empirical (3.0)
    """
    abstract_lower = paper.abstract.lower()

    # Evidence indicators
    eval_indicators = [
        "evaluation",
        "experiment",
        "benchmark",
        "results",
        "performance",
        "compared",
        "comparison",
        "metric",
    ]
    strong_eval_indicators = [
        "significant improvement",
        "state-of-the-art",
        "sota",
        "outperforms",
        "empirical",
        "real-world",
        "deployment",
    ]

    eval_count = sum(1 for term in eval_indicators if term in abstract_lower)
    strong_eval_count = sum(1 for term in strong_eval_indicators if term in abstract_lower)

    # Check for datasets (indicates empirical work)
    dataset_indicators = ["dataset", "benchmark", "we evaluate on", "tested on"]
    dataset_count = sum(1 for term in dataset_indicators if term in abstract_lower)

    if strong_eval_count >= 1 or eval_count >= 3:
        return 3.0
    elif eval_count >= 1:
        return 2.0
    elif dataset_count >= 1:
        return 2.0
    else:
        return 1.0


def score_completeness(paper: Paper) -> float:
    """
    Score paper on implementation completeness (10% weight).

    Idea only (1.0) → Partial details (2.0) → Production-ready (3.0)
    """
    abstract_lower = paper.abstract.lower()

    # Completeness indicators
    implementation_indicators = [
        "implementation",
        "open source",
        "code",
        "available",
        "github",
        "released",
        "library",
    ]
    detail_indicators = [
        "algorithm",
        "architecture",
        "framework",
        "protocol",
        "method",
        "approach",
    ]

    implementation_count = sum(1 for term in implementation_indicators if term in abstract_lower)
    detail_count = sum(1 for term in detail_indicators if term in abstract_lower)

    # Check for production mentions
    production_indicators = ["production", "deployed", "real-world", "industry"]
    production_count = sum(1 for term in production_indicators if term in abstract_lower)

    if implementation_count >= 2 or production_count >= 1:
        return 3.0
    elif implementation_count >= 1 or detail_count >= 3:
        return 2.0
    elif detail_count >= 1:
        return 1.5
    else:
        return 1.0


def calculate_quality_score(paper: Paper) -> tuple[float, Dict[str, float]]:
    """
    Calculate overall quality score using the Pattern Quality Rubric.

    Returns:
        Tuple of (total_score, score_breakdown)
    """
    # Weighted scoring
    reusability = score_reusability(paper)
    novelty = score_novelty(paper)
    clarity = score_clarity(paper)
    evidence = score_evidence(paper)
    completeness = score_completeness(paper)

    # Weights
    total_score = (
        reusability * 0.30 +
        novelty * 0.25 +
        clarity * 0.20 +
        evidence * 0.15 +
        completeness * 0.10
    )

    breakdown = {
        "reusability": reusability,
        "novelty": novelty,
        "clarity": clarity,
        "evidence": evidence,
        "completeness": completeness,
    }

    return total_score, breakdown


def categorize_paper(paper: Paper, existing_patterns: List[Dict]) -> Optional[str]:
    """
    Attempt to categorize a paper into one of the pattern categories.

    Returns the category name or None if uncertain.
    """
    abstract_lower = paper.abstract.lower()
    title_lower = paper.title.lower()
    combined = title_lower + " " + abstract_lower

    # Category-specific keywords
    category_keywords = {
        "Orchestration & Control": [
            "orchestration", "coordination", "control", "hierarchy", "planner",
            "workflow", "supervisor", "manager", "scheduler", "decomposition",
            "sub-agent", "spawning", "multi-agent coordination",
        ],
        "Context & Memory": [
            "memory", "context", "recall", "retrieval", "episodic",
            "vector", "embedding", "rag", "knowledge base", "state",
            "continuum", "temporal context",
        ],
        "Feedback Loops": [
            "feedback", "iteration", "refinement", "self-improve",
            "critique", "eval", "evaluation", "monitor", "adjust",
            "adaptive", "learning from feedback",
        ],
        "Learning & Adaptation": [
            "learning", "reinforcement", "rl", "fine-tuning", "adaptation",
            "skill", "evolution", "training", "optimizer",
        ],
        "Reliability & Eval": [
            "reliability", "safety", "guardrail", "error", "robust",
            "testing", "validation", "verification", "deterministic",
        ],
        "Security & Safety": [
            "security", "privacy", "attack", "malicious", "adversarial",
            "sandbox", "isolation", "monitoring", "threat model",
            "exfiltration", "laundering",
        ],
        "Tool Use & Environment": [
            "tool", "api", "function call", "environment", "execution",
            "browser", "shell", "filesystem", "external", "integration",
        ],
        "UX & Collaboration": [
            "user experience", "ux", "collaboration", "human-in-loop",
            "handoff", "notification", "interaction", "interface",
        ],
    }

    # Count keyword matches for each category
    category_scores = {}
    for category, keywords in category_keywords.items():
        score = sum(1 for kw in keywords if kw in combined)
        if score > 0:
            category_scores[category] = score

    # Return category with highest score (if any)
    if category_scores:
        return max(category_scores, key=category_scores.get)

    return None


def extract_tags(paper: Paper) -> List[str]:
    """
    Extract relevant tags from paper metadata.

    Returns a list of lowercase tags suitable for pattern files.
    """
    abstract_lower = paper.abstract.lower()
    title_lower = paper.title.lower()
    combined = title_lower + " " + abstract_lower

    # Common agentic pattern keywords
    tag_keywords = [
        "agent", "multi-agent", "orchestration", "coordination",
        "memory", "context", "rag", "retrieval",
        "feedback", "iteration", "self-improve",
        "tool", "api", "function-call",
        "planning", "planner", "decomposition",
        "parallel", "concurrent", "async",
        "hierarchy", "hierarchical", "layered",
        "security", "privacy", "sandbox",
        "evaluation", "benchmark", "testing",
        "autonomous", "automation",
        "workflow", "pipeline",
        "communication", "protocol",
    ]

    tags = []
    for keyword in tag_keywords:
        if keyword in combined:
            tags.append(keyword)

    return tags


def print_paper_summary(paper: Paper, score: float, breakdown: Dict[str, float], category: Optional[str]):
    """Print a formatted summary of a paper with its scores."""
    print(f"\n{'='*70}")
    print(f"Title: {paper.title}")
    print(f"arXiv: {paper.arxiv_id} | Score: {score:.2f}/10.0")
    print(f"URL: {paper.url}")
    if category:
        print(f"Suggested Category: {category}")
    print(f"\nScore Breakdown:")
    print(f"  Reusability (30%):    {breakdown['reusability']:.1f}/3.0")
    print(f"  Novelty (25%):        {breakdown['novelty']:.1f}/3.0")
    print(f"  Clarity (20%):        {breakdown['clarity']:.1f}/3.0")
    print(f"  Evidence (15%):       {breakdown['evidence']:.1f}/3.0")
    print(f"  Completeness (10%):   {breakdown['completeness']:.1f}/3.0")
    print(f"\nAbstract: {paper.abstract[:300]}...")


def export_results(papers: List[Dict[str, Any]], output_file: str):
    """Export scan results to JSON file."""
    with open(output_file, "w") as f:
        json.dump(papers, f, indent=2)
    print(f"\nResults exported to: {output_file}")


def export_markdown_report(papers: List[Dict[str, Any]], output_file: str):
    """Export scan results as a Markdown report."""
    lines = [
        "# arXiv Pattern Discovery Report",
        f"Generated: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "",
        f"**Total papers scanned: {len(papers)}**",
        "",
        "---",
        "",
    ]

    for i, paper in enumerate(papers, 1):
        p = paper["paper"]
        lines.extend([
            f"## {i}. {p['title']}",
            "",
            f"**arXiv ID:** {p['arxiv_id']}  ",
            f"**Quality Score:** {paper['total_score']:.2f}/10.0  ",
            f"**Suggested Category:** {paper.get('category', 'Uncategorized')}  ",
            f"**URL:** {p['url']}  ",
            "",
            f"**Score Breakdown:**",
            f"- Reusability (30%): {paper['score_breakdown']['reusability']:.1f}/3.0",
            f"- Novelty (25%): {paper['score_breakdown']['novelty']:.1f}/3.0",
            f"- Clarity (20%): {paper['score_breakdown']['clarity']:.1f}/3.0",
            f"- Evidence (15%): {paper['score_breakdown']['evidence']:.1f}/3.0",
            f"- Completeness (10%): {paper['score_breakdown']['completeness']:.1f}/3.0",
            "",
            f"**Tags:** {', '.join(paper.get('tags', []))}",
            "",
            "**Abstract:**",
            p["abstract"],
            "",
            "---",
            "",
        ])

    with open(output_file, "w") as f:
        f.write("\n".join(lines))
    print(f"Markdown report exported to: {output_file}")


def load_existing_patterns(patterns_dir: Path) -> List[Dict]:
    """Load existing patterns to check for duplicates."""
    from build_readme import parse_front_matter

    patterns = []
    for file in patterns_dir.glob("*.md"):
        if file.name == "TEMPLATE.md":
            continue
        try:
            metadata = parse_front_matter(str(file))
            patterns.append({
                "file": file.name,
                "title": metadata.get("title", ""),
                "tags": metadata.get("tags", []),
                "category": metadata.get("category", ""),
            })
        except Exception:
            continue
    return patterns


def check_for_duplicates(paper: Paper, existing_patterns: List[Dict]) -> List[str]:
    """Check if paper might duplicate existing patterns."""
    title_lower = paper.title.lower()
    abstract_lower = paper.abstract.lower()

    potential_dupes = []
    for pattern in existing_patterns:
        pattern_title = pattern["title"].lower()
        pattern_tags = [t.lower() for t in pattern.get("tags", [])]

        # Check title similarity
        if any(word in title_lower for word in pattern_title.split() if len(word) > 4):
            potential_dupes.append(pattern["file"])

        # Check tag overlap
        paper_words = set(title_lower.split() + abstract_lower.split())
        tag_overlap = len(paper_words.intersection(pattern_tags)) / max(len(pattern_tags), 1)
        if tag_overlap > 0.3:
            potential_dupes.append(pattern["file"])

    return list(set(potential_dupes))


def main():
    parser = argparse.ArgumentParser(
        description="Scan arXiv for papers describing agentic patterns",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s --days=7 --min-citations=3
  %(prog)s --query="multi-agent orchestration" --max-results=50
  %(prog)s --min-score=7.0 --export-json results.json
        """,
    )
    parser.add_argument(
        "--query",
        "-q",
        type=str,
        default=DEFAULT_SEARCH_QUERY,
        help="arXiv search query (default: agent/agentic/multi-agent papers)",
    )
    parser.add_argument(
        "--max-results",
        "-n",
        type=int,
        default=100,
        help="Maximum number of results to fetch (default: 100)",
    )
    parser.add_argument(
        "--days",
        "-d",
        type=int,
        default=365,
        help="Only include papers from last N days (default: 365)",
    )
    parser.add_argument(
        "--min-score",
        "-m",
        type=float,
        default=5.0,
        help="Minimum quality score to include (default: 5.0)",
    )
    parser.add_argument(
        "--export-json",
        type=str,
        help="Export results to JSON file",
    )
    parser.add_argument(
        "--export-md",
        type=str,
        help="Export results to Markdown file",
    )
    parser.add_argument(
        "--patterns-dir",
        type=str,
        default="patterns",
        help="Path to patterns directory (default: patterns)",
    )
    parser.add_argument(
        "--verbose",
        "-v",
        action="store_true",
        help="Print detailed output for each paper",
    )

    args = parser.parse_args()

    # Load existing patterns
    patterns_dir = Path(args.patterns_dir)
    if patterns_dir.exists():
        existing_patterns = load_existing_patterns(patterns_dir)
        print(f"Loaded {len(existing_patterns)} existing patterns for duplicate detection")
    else:
        existing_patterns = []
        print(f"Warning: Patterns directory not found at {patterns_dir}")

    print(f"\n🔍 Scanning arXiv with query: {args.query[:100]}...")
    print(f"   Max results: {args.max_results}, Time window: {args.days} days")

    try:
        papers = fetch_arxiv_papers(args.query, args.max_results)
        print(f"   Fetched {len(papers)} papers from arXiv")

        # Apply filters
        if args.days < 365:
            papers = filter_papers_by_date(papers, args.days)
            print(f"   Filtered to {len(papers)} papers within last {args.days} days")

        papers = filter_papers_by_keywords(papers)
        print(f"   Filtered to {len(papers)} papers with architectural keywords")

        if not papers:
            print("\n❌ No papers found matching criteria")
            return 0

    except ArxivAPIError as e:
        print(f"\n❌ Error fetching from arXiv: {e}")
        return 1

    # Score papers
    print(f"\n📊 Scoring {len(papers)} papers using Pattern Quality Rubric...")

    results = []
    high_quality_count = 0

    for paper in papers:
        score, breakdown = calculate_quality_score(paper)
        category = categorize_paper(paper, existing_patterns)
        tags = extract_tags(paper)
        duplicates = check_for_duplicates(paper, existing_patterns)

        result = {
            "paper": {
                "arxiv_id": paper.arxiv_id,
                "title": paper.title,
                "authors": paper.authors,
                "abstract": paper.abstract,
                "published": paper.published,
                "categories": paper.categories,
                "url": paper.url,
            },
            "pattern_name": None,
            "category": category,
            "tags": tags,
            "score_breakdown": breakdown,
            "total_score": score,
            "potential_duplicates": duplicates,
            "meets_threshold": score >= args.min_score,
        }
        results.append(result)

        if score >= args.min_score:
            high_quality_count += 1
            if args.verbose:
                print_paper_summary(paper, score, breakdown, category)
                if duplicates:
                    print(f"⚠️  Potential duplicates: {', '.join(duplicates)}")

    # Sort by score
    results.sort(key=lambda x: x["total_score"], reverse=True)

    # Print summary
    print(f"\n{'='*70}")
    print(f"📈 SCAN SUMMARY")
    print(f"{'='*70}")
    print(f"Total papers analyzed: {len(papers)}")
    print(f"Papers meeting threshold ({args.min_score}): {high_quality_count}")
    print(f"\n🏆 Top 10 papers by quality score:")
    print(f"{'-'*70}")

    for i, r in enumerate(results[:10], 1):
        p = r["paper"]
        dupes = f" [⚠️ duplicates: {len(r['potential_duplicates'])}]" if r["potential_duplicates"] else ""
        print(f"{i:2}. {r['total_score']:.2f} | {p['title'][:60]}...{dupes}")

    # Export results if requested
    if args.export_json:
        export_results(results, args.export_json)

    if args.export_md:
        export_markdown_report(results, args.export_md)

    return 0


if __name__ == "__main__":
    sys.exit(main())
