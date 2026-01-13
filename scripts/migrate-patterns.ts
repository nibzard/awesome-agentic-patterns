#!/usr/bin/env bun
/**
 * migrate-patterns
 *
 * Migration script for updating pattern files with new front matter fields.
 * Reads pattern files, derives missing fields, and updates files in-place.
 *
 * Supports dry-run mode to preview changes without writing.
 */

import matter from "gray-matter";
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

// Pattern directory
const PATTERNS_DIR = "patterns";

// CLI arguments
const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run") || args.includes("-n");

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
  rawContent: string;
}

// Track changes
interface MigrationResult {
  file: string;
  changes: string[];
  updated: boolean;
}

/**
 * Parse a single pattern file
 */
function parsePattern(filePath: string): ParsedPattern | null {
  try {
    const rawContent = readFileSync(filePath, "utf-8");
    const { data, content: body } = matter(rawContent);

    return {
      filePath,
      fileName: filePath.split("/").pop() || "",
      frontMatter: data as PatternFrontMatter,
      body,
      rawContent,
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
 * Derive slug from filename
 */
function deriveSlugFromFileName(fileName: string): string {
  return fileName.replace(".md", "");
}

/**
 * Generate id from title (kebab-case)
 */
function generateIdFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
    .trim()
    .replace(/\s+/g, "-"); // Convert spaces to hyphens
}

/**
 * Generate summary placeholder from first paragraph
 */
function generateSummaryPlaceholder(body: string, title: string): string {
  // Try to extract first paragraph
  const firstParagraph = body.split("\n\n")[0].trim();

  if (firstParagraph && firstParagraph.length > 20 && firstParagraph.length < 300) {
    return firstParagraph;
  }

  // Fallback to generic placeholder
  return `TODO: Add a concise summary for "${title}" describing the pattern's purpose and key benefits.`;
}

/**
 * Get file modification time as YYYY-MM-DD
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
 * Migrate a single pattern file
 */
function migratePattern(pattern: ParsedPattern): MigrationResult {
  const result: MigrationResult = {
    file: pattern.fileName,
    changes: [],
    updated: false,
  };

  const updatedFrontMatter = { ...pattern.frontMatter };

  // Derive slug from filename if missing
  if (!updatedFrontMatter.slug) {
    const derivedSlug = deriveSlugFromFileName(pattern.fileName);
    updatedFrontMatter.slug = derivedSlug;
    result.changes.push(`slug: "${derivedSlug}"`);
    result.updated = true;
  }

  // Generate id from title if missing
  if (!updatedFrontMatter.id) {
    const derivedId = generateIdFromTitle(pattern.frontMatter.title);
    updatedFrontMatter.id = derivedId;
    result.changes.push(`id: "${derivedId}"`);
    result.updated = true;
  }

  // Generate summary placeholder if missing
  if (!updatedFrontMatter.summary) {
    const derivedSummary = generateSummaryPlaceholder(pattern.body, pattern.frontMatter.title);
    updatedFrontMatter.summary = derivedSummary;
    result.changes.push(`summary: "${derivedSummary.substring(0, 50)}..."`);
    result.updated = true;
  }

  // Add updated_at from file mod time if missing
  if (!updatedFrontMatter.updated_at) {
    const modDate = getFileModDate(pattern.filePath);
    updatedFrontMatter.updated_at = modDate;
    result.changes.push(`updated_at: "${modDate}"`);
    result.updated = true;
  }

  // Write back to file if updated and not in dry-run mode
  if (result.updated && !DRY_RUN) {
    const newContent = matter.stringify(pattern.body, updatedFrontMatter);
    writeFileSync(pattern.filePath, newContent);
  }

  return result;
}

/**
 * Main entry point
 */
function main(): void {
  console.log("=".repeat(60));
  console.log("Pattern Migration Script");
  console.log("=".repeat(60));

  if (DRY_RUN) {
    console.log("🔍 DRY RUN MODE - No files will be modified\n");
  } else {
    console.log("⚠️  WRITE MODE - Files will be modified in-place\n");
  }

  const patterns = parseAllPatterns();
  console.log(`📂 Found ${patterns.length} pattern files\n`);

  let updatedCount = 0;
  let skippedCount = 0;
  const results: MigrationResult[] = [];

  for (const pattern of patterns) {
    const result = migratePattern(pattern);
    results.push(result);

    if (result.updated) {
      updatedCount++;
      console.log(`✏️  ${result.file}`);
      for (const change of result.changes) {
        console.log(`   + ${change}`);
      }
      console.log("");
    } else {
      skippedCount++;
    }
  }

  console.log("=".repeat(60));
  console.log("Summary");
  console.log("=".repeat(60));
  console.log(`Total files:     ${patterns.length}`);
  console.log(`Files to update: ${updatedCount}`);
  console.log(`Files skipped:   ${skippedCount}`);

  if (DRY_RUN && updatedCount > 0) {
    console.log("\n💡 Run without --dry-run to apply these changes");
  } else if (updatedCount > 0) {
    console.log("\n✅ Migration complete!");
  } else {
    console.log("\n✅ All patterns up to date!");
  }
}

// Run if executed directly
main();

export default {
  parsePattern,
  parseAllPatterns,
  deriveSlugFromFileName,
  generateIdFromTitle,
  generateSummaryPlaceholder,
  getFileModDate,
  migratePattern,
};
