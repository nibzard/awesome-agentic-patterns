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

  // TODO: Task 084-087 will add sitemap.xml, rss.xml, graph.json
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
  generateLlmsTxt,
  generateLlmsFullTxt,
};
