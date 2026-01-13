#!/usr/bin/env bun
/**
 * build-data
 *
 * Data pipeline for generating pattern data files.
 * Reads pattern files, parses front matter and content,
 * and generates JSON/text/XML outputs for the website.
 *
 * Outputs:
 * - patterns.json: All pattern metadata
 * - llms.txt: LLM-friendly pattern index
 * - llms-full.txt: Complete pattern content for LLMs
 * - sitemap.xml: Sitemap for search engines
 * - rss.xml: RSS feed for pattern updates
 */

import matter from "gray-matter";
import { readdirSync, readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { create } from "xmlbuilder2";

// Pattern directory and output directory
const PATTERNS_DIR = "patterns";
const OUTPUT_DIR = "apps/web/public";

// Interface for pattern front matter
interface PatternFrontMatter {
  title: string;
  id?: string;
  slug?: string;
  status: string;
  authors: string[];
  based_on?: string[];
  category: string;
  source: string;
  tags: string[];
  summary?: string;
  maturity?: string;
  complexity?: string;
  effort?: string;
  impact?: string;
  signals?: string[];
  anti_signals?: string[];
  prerequisites?: string[];
  related?: string[];
  anti_patterns?: string[];
  tools?: string[];
  domains?: string[];
  updated_at?: string;
}

// Interface for parsed pattern
interface ParsedPattern {
  filePath: string;
  fileName: string;
  frontMatter: PatternFrontMatter;
  body: string;
}

/**
 * Parse a single pattern file
 */
function parsePattern(filePath: string): ParsedPattern | null {
  try {
    const content = readFileSync(filePath, "utf-8");
    const { data, content: body } = matter(content);

    return {
      filePath,
      fileName: filePath.split("/").pop() || "",
      frontMatter: data as PatternFrontMatter,
      body,
    };
  } catch (err) {
    console.error(`Error parsing ${filePath}:`, err);
    return null;
  }
}

/**
 * Parse all pattern files from the patterns directory
 */
function parseAllPatterns(): ParsedPattern[] {
  const patterns: ParsedPattern[] = [];
  const entries = readdirSync(PATTERNS_DIR, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith(".md") && entry.name !== "TEMPLATE.md") {
      const filePath = join(PATTERNS_DIR, entry.name);
      const pattern = parsePattern(filePath);
      if (pattern) {
        patterns.push(pattern);
      }
    }
  }

  return patterns;
}

/**
 * Extract sections from markdown body (task 084)
 */
interface PatternSections {
  problem?: string;
  solution?: string;
  howToUseIt?: string;
  tradeoffs?: string;
  example?: string;
  references?: string;
  [key: string]: string | undefined;
}

function extractSections(body: string): PatternSections {
  const sections: PatternSections = {};
  const lines = body.split("\n");
  let currentSection = "";
  let currentContent: string[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^##\s+(.+)$/);
    if (headingMatch) {
      // Save previous section
      if (currentSection && currentContent.length > 0) {
        sections[currentSection] = currentContent.join("\n").trim();
      }
      // Start new section
      currentSection = headingMatch[1].trim().toLowerCase().replace(/\s+/g, "");
      currentContent = [];
    } else if (currentSection) {
      currentContent.push(line);
    }
  }

  // Save last section
  if (currentSection && currentContent.length > 0) {
    sections[currentSection] = currentContent.join("\n").trim();
  }

  return sections;
}

/**
 * Generate id from title (kebab-case) - task 088
 */
function generateIdFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
    .trim()
    .replace(/\s+/g, "-"); // Convert spaces to hyphens
}

/**
 * Get file modification time as YYYY-MM-DD - task 089
 */
function getFileModDate(filePath: string): string {
  try {
    const stats = statSync(filePath);
    const date = new Date(stats.mtime);
    return date.toISOString().split("T")[0]; // YYYY-MM-DD
  } catch {
    return "2024-01-01"; // Fallback default date
  }
}

/**
 * Generate patterns.json with all pattern metadata
 */
function generatePatternsJson(patterns: ParsedPattern[]): string {
  const data = patterns.map((p) => ({
    ...p.frontMatter,
    id: p.frontMatter.id || generateIdFromTitle(p.frontMatter.title),
    slug: p.frontMatter.slug || p.fileName.replace(".md", ""),
    updated_at: p.frontMatter.updated_at || getFileModDate(p.filePath),
    excerpt: p.body.split("\n\n")[0].substring(0, 200),
  }));

  return JSON.stringify(data, null, 2);
}

/**
 * Generate llms.txt with pattern index
 */
function generateLlmsTxt(patterns: ParsedPattern[]): string {
  const lines: string[] = [
    "# Awesome Agentic Patterns",
    "",
    "A curated catalogue of AI agent design patterns.",
    "",
    "## Patterns",
    "",
  ];

  for (const pattern of patterns) {
    const slug = pattern.frontMatter.slug || pattern.fileName.replace(".md", "");
    const summary = pattern.frontMatter.summary || "";
    lines.push(`### ${slug}`);
    lines.push(`${pattern.frontMatter.title}: ${summary}`);
    lines.push(`URL: https://agentic-patterns.com/patterns/${slug}`);
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Generate llms-full.txt with complete pattern content
 */
function generateLlmsFullTxt(patterns: ParsedPattern[]): string {
  const lines: string[] = ["# Awesome Agentic Patterns - Full Content", ""];

  for (const pattern of patterns) {
    lines.push(`## ${pattern.frontMatter.title}`);
    lines.push("");
    lines.push(`**Status:** ${pattern.frontMatter.status}`);
    lines.push(`**Category:** ${pattern.frontMatter.category}`);
    lines.push(`**Authors:** ${pattern.frontMatter.authors.join(", ")}`);
    lines.push(`**Source:** ${pattern.frontMatter.source}`);
    lines.push("");
    lines.push(pattern.body);
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Generate graph.json with pattern relationships (task 092)
 */
interface GraphNode {
  id: string;
  title: string;
  category: string;
  status: string;
  slug: string;
}

interface GraphEdge {
  source: string;
  target: string;
  type: "related" | "anti_pattern";
}

interface PatternGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

function generateGraphJson(patterns: ParsedPattern[]): string {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const slugToId = new Map<string, string>();

  // Build nodes and slug-to-id mapping
  for (const pattern of patterns) {
    const id = pattern.frontMatter.id || generateIdFromTitle(pattern.frontMatter.title);
    const slug = pattern.frontMatter.slug || pattern.fileName.replace(".md", "");

    nodes.push({
      id,
      title: pattern.frontMatter.title,
      category: pattern.frontMatter.category,
      status: pattern.frontMatter.status,
      slug,
    });

    slugToId.set(slug, id);
  }

  // Build edges from related and anti_patterns
  for (const pattern of patterns) {
    const sourceId = pattern.frontMatter.id || generateIdFromTitle(pattern.frontMatter.title);
    const slug = pattern.frontMatter.slug || pattern.fileName.replace(".md", "");

    // Related patterns
    if (pattern.frontMatter.related) {
      for (const relatedSlug of pattern.frontMatter.related) {
        const targetId = slugToId.get(relatedSlug);
        if (targetId) {
          edges.push({ source: sourceId, target: targetId, type: "related" });
        }
      }
    }

    // Anti-patterns
    if (pattern.frontMatter.anti_patterns) {
      for (const antiSlug of pattern.frontMatter.anti_patterns) {
        const targetId = slugToId.get(antiSlug);
        if (targetId) {
          edges.push({ source: sourceId, target: targetId, type: "anti_pattern" });
        }
      }
    }
  }

  const graph: PatternGraph = { nodes, edges };
  return JSON.stringify(graph, null, 2);
}

/**
 * Generate sitemap.xml (task 095)
 */
function generateSitemapXml(patterns: ParsedPattern[]): string {
  const root = create({ version: "1.0", encoding: "UTF-8" })
    .ele("urlset", { xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9" });

  // Add static pages
  const staticPages = [
    { loc: "https://agentic-patterns.com/", changefreq: "daily", priority: "1.0" },
    { loc: "https://agentic-patterns.com/compare", changefreq: "weekly", priority: "0.8" },
    { loc: "https://agentic-patterns.com/graph", changefreq: "weekly", priority: "0.8" },
  ];

  for (const page of staticPages) {
    root.ele("url")
      .ele("loc").txt(page.loc).up()
      .ele("changefreq").txt(page.changefreq).up()
      .ele("priority").txt(page.priority).up();
  }

  // Add pattern pages
  for (const pattern of patterns) {
    const slug = pattern.frontMatter.slug || pattern.fileName.replace(".md", "");
    const lastmod = pattern.frontMatter.updated_at || getFileModDate(pattern.filePath);

    root.ele("url")
      .ele("loc").txt(`https://agentic-patterns.com/patterns/${slug}`).up()
      .ele("lastmod").txt(lastmod).up()
      .ele("changefreq").txt("weekly").up()
      .ele("priority").txt("0.6").up();
  }

  return root.end({ prettyPrint: true });
}

/**
 * Generate RSS feed (task 096)
 */
function generateRssFeed(patterns: ParsedPattern[]): string {
  const RSS = require("rss");
  const feed = new RSS({
    title: "Awesome Agentic Patterns",
    description: "A curated catalogue of AI agent design patterns",
    feed_url: "https://agentic-patterns.com/rss.xml",
    site_url: "https://agentic-patterns.com",
    language: "en",
    pubDate: new Date(),
    ttl: 60,
  });

  // Sort patterns by updated_at date, newest first
  const sortedPatterns = [...patterns].sort((a, b) => {
    const aDate = a.frontMatter.updated_at || getFileModDate(a.filePath);
    const bDate = b.frontMatter.updated_at || getFileModDate(b.filePath);
    return bDate.localeCompare(aDate);
  });

  // Add last 20 patterns to feed
  for (const pattern of sortedPatterns.slice(0, 20)) {
    const slug = pattern.frontMatter.slug || pattern.fileName.replace(".md", "");
    const summary = pattern.frontMatter.summary || pattern.body.split("\n\n")[0].substring(0, 200);
    const updated = pattern.frontMatter.updated_at || getFileModDate(pattern.filePath);

    feed.item({
      title: pattern.frontMatter.title,
      description: summary,
      url: `https://agentic-patterns.com/patterns/${slug}`,
      date: updated,
      categories: [pattern.frontMatter.category, ...pattern.frontMatter.tags],
    });
  }

  return feed.xml({ indent: true });
}

/**
 * Write output files
 */
function writeOutputs(patterns: ParsedPattern[]): void {
  // Ensure output directory exists
  mkdirSync(OUTPUT_DIR, { recursive: true });

  // Generate and write consolidated outputs
  const patternsJson = generatePatternsJson(patterns);
  writeFileSync(join(OUTPUT_DIR, "patterns.json"), patternsJson);
  console.log(`Generated ${OUTPUT_DIR}/patterns.json`);

  const llmsTxt = generateLlmsTxt(patterns);
  writeFileSync(join(OUTPUT_DIR, "llms.txt"), llmsTxt);
  console.log(`Generated ${OUTPUT_DIR}/llms.txt`);

  const llmsFullTxt = generateLlmsFullTxt(patterns);
  writeFileSync(join(OUTPUT_DIR, "llms-full.txt"), llmsFullTxt);
  console.log(`Generated ${OUTPUT_DIR}/llms-full.txt`);

  // Write per-pattern JSON files (task 091)
  const patternsDir = join(OUTPUT_DIR, "patterns");
  mkdirSync(patternsDir, { recursive: true });

  for (const pattern of patterns) {
    const slug = pattern.frontMatter.slug || pattern.fileName.replace(".md", "");
    const patternJson = JSON.stringify({
      ...pattern.frontMatter,
      id: pattern.frontMatter.id || generateIdFromTitle(pattern.frontMatter.title),
      slug,
      updated_at: pattern.frontMatter.updated_at || getFileModDate(pattern.filePath),
      body: pattern.body,
    }, null, 2);

    writeFileSync(join(patternsDir, `${slug}.json`), patternJson);
  }
  console.log(`Generated ${patterns.length} per-pattern JSON files`);

  // Write graph.json (task 092)
  const graphJson = generateGraphJson(patterns);
  writeFileSync(join(OUTPUT_DIR, "graph.json"), graphJson);
  console.log(`Generated ${OUTPUT_DIR}/graph.json`);

  // Write sitemap.xml (task 095)
  const sitemapXml = generateSitemapXml(patterns);
  writeFileSync(join(OUTPUT_DIR, "sitemap.xml"), sitemapXml);
  console.log(`Generated ${OUTPUT_DIR}/sitemap.xml`);

  // Write RSS feed (task 096)
  const rssFeed = generateRssFeed(patterns);
  writeFileSync(join(OUTPUT_DIR, "rss.xml"), rssFeed);
  console.log(`Generated ${OUTPUT_DIR}/rss.xml`);
}

/**
 * Main entry point
 */
function main(): void {
  console.log("Building pattern data...");

  const patterns = parseAllPatterns();
  console.log(`Parsed ${patterns.length} pattern files`);

  writeOutputs(patterns);

  console.log("Data build complete.");
}

// Run if executed directly
main();

export default {
  parsePattern,
  parseAllPatterns,
  extractSections,
  generateIdFromTitle,
  getFileModDate,
  generatePatternsJson,
  generateGraphJson,
  generateSitemapXml,
  generateRssFeed,
  generateLlmsTxt,
  generateLlmsFullTxt,
};
