#!/usr/bin/env bun
/**
 * validate-patterns
 *
 * Entry point for pattern validation. Validates pattern files against schema
 * and quality standards. Uses gray-matter for front-matter parsing and
 * markdown-it for markdown structure validation.
 */

import matter from "gray-matter";
import MarkdownIt from "markdown-it";

// Types for validation results
export type ValidationErrorLevel = "error" | "warning" | "info";

// Front matter schema types
export type Status =
  | "proposed"
  | "emerging"
  | "established"
  | "validated-in-production"
  | "best-practice"
  | "experimental-but-awesome"
  | "rapidly-improving";

export type Category =
  | "Orchestration & Control"
  | "Context & Memory"
  | "Feedback Loops"
  | "Learning & Adaptation"
  | "Reliability & Eval"
  | "Security & Safety"
  | "Tool Use & Environment"
  | "UX & Collaboration"
  | "Uncategorized";

export type Maturity = "early" | "maturing" | "mature";
export type Complexity = "low" | "medium" | "high";
export type Effort = "hours" | "days" | "weeks";
export type Impact = "low" | "medium" | "high";

export interface PatternFrontMatter {
  // Required fields
  title: string;
  id: string;
  slug: string;
  status: Status;
  authors: string[];
  category: Category;
  source: string;
  tags: string[];

  // Optional fields
  based_on?: string[];
  summary?: string;
  maturity?: Maturity;
  complexity?: Complexity;
  effort?: Effort;
  impact?: Impact;
  signals?: string[];
  anti_signals?: string[];
  prerequisites?: string[];
  related?: string[];
  anti_patterns?: string[];
  tools?: string[];
  domains?: string[];
  updated_at?: string;
}

export interface ParsedPattern {
  filePath: string;
  fileName: string;
  frontMatter: PatternFrontMatter;
  body: string;
  rawFrontMatter: Record<string, unknown>;
}

export interface ValidationError {
  level: ValidationErrorLevel;
  file: string;
  field?: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  info: ValidationError[];
}

export interface ValidatorOptions {
  strict?: boolean;
  checkContent?: boolean;
  checkLinks?: boolean;
}

// Schema constants
export const ALLOWED_CATEGORIES = [
  "Orchestration & Control",
  "Context & Memory",
  "Feedback Loops",
  "Learning & Adaptation",
  "Reliability & Eval",
  "Security & Safety",
  "Tool Use & Environment",
  "UX & Collaboration",
  "Uncategorized",
] as const;

export const ALLOWED_STATUSES = [
  "proposed",
  "emerging",
  "established",
  "validated-in-production",
  "best-practice",
  "experimental-but-awesome",
  "rapidly-improving",
] as const;

export const REQUIRED_FIELDS = ["title", "id", "slug", "status", "authors", "category", "source", "tags"] as const;
export const OPTIONAL_FIELDS = [
  "based_on",
  "summary",
  "maturity",
  "complexity",
  "effort",
  "impact",
  "signals",
  "anti_signals",
  "prerequisites",
  "related",
  "anti_patterns",
  "tools",
  "domains",
  "updated_at",
] as const;

// Markdown parser instance
const md = new MarkdownIt();

// Enum validators
const ALLOWED_MATURITY = ["early", "maturing", "mature"] as const;
const ALLOWED_COMPLEXITY = ["low", "medium", "high"] as const;
const ALLOWED_EFFORT = ["hours", "days", "weeks"] as const;
const ALLOWED_IMPACT = ["low", "medium", "high"] as const;

/**
 * Parse front matter from a pattern file
 * Extracts YAML front-matter and returns structured data
 */
export function parseFrontMatter(content: string, filePath: string): {
  data: Record<string, unknown>;
  body: string;
  errors: ValidationError[];
} {
  const errors: ValidationError[] = [];

  try {
    const { data, content: body } = matter(content);
    return { data, body, errors };
  } catch (err) {
    errors.push({
      level: "error",
      file: filePath,
      field: "front-matter",
      message: err instanceof Error ? err.message : String(err),
    });
    return { data: {}, body: "", errors };
  }
}

/**
 * Type guard to check if value is a string array
 */
function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

/**
 * Type guard to check if value is a string
 */
function isString(value: unknown): value is string {
  return typeof value === "string";
}

/**
 * Parse and validate a single pattern file
 */
export async function validatePattern(
  filePath: string,
  options: ValidatorOptions = {}
): Promise<ValidationResult> {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const info: ValidationError[] = [];

  try {
    const file = Bun.file(filePath);
    const content = await file.text();

    // Parse front-matter with gray-matter
    const { data, content: body } = matter(content);

    // Validate required fields (task 070)
    validateRequiredFields(data, filePath, errors, warnings);

    // Validate field values (task 071)
    validateFieldValues(data, filePath, errors, warnings);

    // Validate markdown structure if requested
    if (options.checkContent) {
      validateMarkdownStructure(body, filePath, errors, warnings, info);
    }

  } catch (err) {
    errors.push({
      level: "error",
      file: filePath,
      message: err instanceof Error ? err.message : String(err),
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    info,
  };
}

/**
 * Validate required front-matter fields (task 070)
 */
function validateRequiredFields(
  data: Record<string, unknown>,
  filePath: string,
  errors: ValidationError[],
  warnings: ValidationError[]
): void {
  const missing: string[] = [];

  for (const field of REQUIRED_FIELDS) {
    const value = data[field];
    if (value === undefined || value === null || value === "") {
      missing.push(field);
    }
  }

  if (missing.length > 0) {
    errors.push({
      level: "error",
      file: filePath,
      field: "front-matter",
      message: `Missing required fields: ${missing.join(", ")}`,
    });
  }

  // Check for empty arrays that should have content
  const authors = data.authors;
  if (authors !== undefined && Array.isArray(authors) && authors.length === 0) {
    errors.push({
      level: "error",
      file: filePath,
      field: "authors",
      message: "Authors array must not be empty",
    });
  }

  const tags = data.tags;
  if (tags !== undefined && Array.isArray(tags) && tags.length === 0) {
    warnings.push({
      level: "warning",
      file: filePath,
      field: "tags",
      message: "Tags array is empty - consider adding relevant tags",
    });
  }
}

/**
 * Validate field values (task 071)
 */
function validateFieldValues(
  data: Record<string, unknown>,
  filePath: string,
  errors: ValidationError[],
  warnings: ValidationError[]
): void {
  // Validate status
  const status = data.status as string;
  if (status && !ALLOWED_STATUSES.includes(status as any)) {
    errors.push({
      level: "error",
      file: filePath,
      field: "status",
      message: `Invalid status: "${status}". Must be one of: ${ALLOWED_STATUSES.join(", ")}`,
    });
  }

  // Validate category
  const category = data.category as string;
  if (category && !ALLOWED_CATEGORIES.includes(category as any)) {
    errors.push({
      level: "error",
      file: filePath,
      field: "category",
      message: `Invalid category: "${category}". Must be one of: ${ALLOWED_CATEGORIES.join(", ")}`,
    });
  }

  // Validate maturity
  const maturity = data.maturity as string;
  if (maturity && !ALLOWED_MATURITY.includes(maturity as any)) {
    errors.push({
      level: "error",
      file: filePath,
      field: "maturity",
      message: `Invalid maturity: "${maturity}". Must be one of: ${ALLOWED_MATURITY.join(", ")}`,
    });
  }

  // Validate complexity
  const complexity = data.complexity as string;
  if (complexity && !ALLOWED_COMPLEXITY.includes(complexity as any)) {
    errors.push({
      level: "error",
      file: filePath,
      field: "complexity",
      message: `Invalid complexity: "${complexity}". Must be one of: ${ALLOWED_COMPLEXITY.join(", ")}`,
    });
  }

  // Validate effort
  const effort = data.effort as string;
  if (effort && !ALLOWED_EFFORT.includes(effort as any)) {
    errors.push({
      level: "error",
      file: filePath,
      field: "effort",
      message: `Invalid effort: "${effort}". Must be one of: ${ALLOWED_EFFORT.join(", ")}`,
    });
  }

  // Validate impact
  const impact = data.impact as string;
  if (impact && !ALLOWED_IMPACT.includes(impact as any)) {
    errors.push({
      level: "error",
      file: filePath,
      field: "impact",
      message: `Invalid impact: "${impact}". Must be one of: ${ALLOWED_IMPACT.join(", ")}`,
    });
  }

  // Validate authors format
  const authors = data.authors;
  if (authors !== undefined && !isStringArray(authors)) {
    errors.push({
      level: "error",
      file: filePath,
      field: "authors",
      message: `Authors must be a string array, got: ${typeof authors}`,
    });
  }

  // Validate tags format
  const tags = data.tags;
  if (tags !== undefined && !isStringArray(tags)) {
    errors.push({
      level: "error",
      file: filePath,
      field: "tags",
      message: `Tags must be a string array, got: ${typeof tags}`,
    });
  }

  // Validate based_on format
  const basedOn = data.based_on;
  if (basedOn !== undefined && !isStringArray(basedOn)) {
    errors.push({
      level: "error",
      file: filePath,
      field: "based_on",
      message: `based_on must be a string array, got: ${typeof basedOn}`,
    });
  }

  // Validate summary format
  const summary = data.summary;
  if (summary !== undefined && !isString(summary)) {
    errors.push({
      level: "error",
      file: filePath,
      field: "summary",
      message: `summary must be a string, got: ${typeof summary}`,
    });
  } else if (isString(summary) && summary.length > 200) {
    warnings.push({
      level: "warning",
      file: filePath,
      field: "summary",
      message: `summary is ${summary.length} chars - recommended to keep under 200 chars`,
    });
  }

  // Validate source URL format
  const source = data.source;
  if (source !== undefined && isString(source)) {
    try {
      new URL(source);
    } catch {
      errors.push({
        level: "error",
        file: filePath,
        field: "source",
        message: `source must be a valid URL, got: ${source}`,
      });
    }
  }

  // Validate updated_at format (YYYY-MM-DD)
  const updatedAt = data.updated_at;
  if (updatedAt !== undefined && isString(updatedAt)) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(updatedAt)) {
      errors.push({
        level: "error",
        file: filePath,
        field: "updated_at",
        message: `updated_at must be in YYYY-MM-DD format, got: ${updatedAt}`,
      });
    }
  }

  // Validate related patterns format
  const related = data.related;
  if (related !== undefined && !isStringArray(related)) {
    errors.push({
      level: "error",
      file: filePath,
      field: "related",
      message: `related must be a string array of pattern IDs, got: ${typeof related}`,
    });
  }

  // Validate anti_patterns format
  const antiPatterns = data.anti_patterns;
  if (antiPatterns !== undefined && !isStringArray(antiPatterns)) {
    errors.push({
      level: "error",
      file: filePath,
      field: "anti_patterns",
      message: `anti_patterns must be a string array of pattern IDs, got: ${typeof antiPatterns}`,
    });
  }

  // Validate signals format
  const signals = data.signals;
  if (signals !== undefined && !isStringArray(signals)) {
    errors.push({
      level: "error",
      file: filePath,
      field: "signals",
      message: `signals must be a string array, got: ${typeof signals}`,
    });
  }

  // Validate anti_signals format
  const antiSignals = data.anti_signals;
  if (antiSignals !== undefined && !isStringArray(antiSignals)) {
    errors.push({
      level: "error",
      file: filePath,
      field: "anti_signals",
      message: `anti_signals must be a string array, got: ${typeof antiSignals}`,
    });
  }

  // Validate prerequisites format
  const prerequisites = data.prerequisites;
  if (prerequisites !== undefined && !isStringArray(prerequisites)) {
    errors.push({
      level: "error",
      file: filePath,
      field: "prerequisites",
      message: `prerequisites must be a string array, got: ${typeof prerequisites}`,
    });
  }

  // Validate tools format
  const tools = data.tools;
  if (tools !== undefined && !isStringArray(tools)) {
    errors.push({
      level: "error",
      file: filePath,
      field: "tools",
      message: `tools must be a string array, got: ${typeof tools}`,
    });
  }

  // Validate domains format
  const domains = data.domains;
  if (domains !== undefined && !isStringArray(domains)) {
    errors.push({
      level: "error",
      file: filePath,
      field: "domains",
      message: `domains must be a string array, got: ${typeof domains}`,
    });
  }
}

/**
 * Extract headings from markdown body (task 072)
 */
function extractHeadings(body: string): Set<string> {
  const headings = new Set<string>();
  const lines = body.split("\n");

  for (const line of lines) {
    const headingMatch = line.match(/^#{2,3}\s+(.+)$/);
    if (headingMatch) {
      const heading = headingMatch[1].trim().toLowerCase();
      headings.add(heading);
    }
  }

  return headings;
}

/**
 * Validate markdown structure (task 072)
 */
function validateMarkdownStructure(
  body: string,
  filePath: string,
  errors: ValidationError[],
  warnings: ValidationError[],
  info: ValidationError[]
): void {
  if (!body || body.trim().length === 0) {
    warnings.push({
      level: "warning",
      file: filePath,
      field: "content",
      message: "Pattern has no body content",
    });
    return;
  }

  const headings = extractHeadings(body);

  // Required headings per SCHEMA.md
  const requiredHeadings = ["problem", "solution", "references"];
  const missingRequired: string[] = [];

  for (const required of requiredHeadings) {
    if (!headings.has(required)) {
      missingRequired.push(required);
    }
  }

  if (missingRequired.length > 0) {
    errors.push({
      level: "error",
      file: filePath,
      field: "headings",
      message: `Missing required headings: ${missingRequired.join(", ")}`,
    });
  }

  // Check for recommended optional headings
  const optionalHeadings = ["how to use it", "trade-offs", "example", "see also"];
  const foundOptional = optionalHeadings.filter((h) => headings.has(h));

  if (foundOptional.length > 0) {
    info.push({
      level: "info",
      file: filePath,
      field: "headings",
      message: `Found optional headings: ${foundOptional.join(", ")}`,
    });
  }

  // Validate heading order (task 073)
  validateHeadingOrder(body, filePath, warnings);
}

/**
 * Validate heading order (task 073)
 * Headings should follow: Problem -> Solution -> [How to use it] -> [Trade-offs] -> [Example] -> References
 */
function validateHeadingOrder(
  body: string,
  filePath: string,
  warnings: ValidationError[]
): void {
  const lines = body.split("\n");
  const headings: string[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^#{2,3}\s+(.+)$/);
    if (headingMatch) {
      headings.push(headingMatch[1].trim().toLowerCase());
    }
  }

  // Define expected order per SCHEMA.md
  const expectedOrder = [
    "problem",
    "solution",
    "how to use it",
    "trade-offs",
    "example",
    "see also",
    "references",
  ];

  // Filter to only headings that are in our expected list
  const relevantHeadings = headings.filter((h) => expectedOrder.includes(h));

  // Check if headings are in correct order
  for (let i = 0; i < relevantHeadings.length - 1; i++) {
    const currentIdx = expectedOrder.indexOf(relevantHeadings[i]);
    const nextIdx = expectedOrder.indexOf(relevantHeadings[i + 1]);

    if (currentIdx > nextIdx) {
      warnings.push({
        level: "warning",
        file: filePath,
        field: "heading-order",
        message: `Heading "${relevantHeadings[i + 1]}" appears before "${relevantHeadings[i]}" - expected order: ${expectedOrder.filter((h) => relevantHeadings.includes(h)).join(" → ")}`,
      });
      break; // Only report first order violation
    }
  }
}

/**
 * Scan directory for pattern files and validate all
 */
export async function validatePatterns(
  patternDir: string,
  options: ValidatorOptions = {}
): Promise<ValidationResult> {
  const allErrors: ValidationError[] = [];
  const allWarnings: ValidationError[] = [];
  const allInfo: ValidationError[] = [];

  // Read all .md files from directory using fs.readdir
  const patternFiles: string[] = [];
  const fs = await import("node:fs");
  const path = await import("node:path");

  const entries = fs.readdirSync(patternDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith(".md") && entry.name !== "TEMPLATE.md") {
      patternFiles.push(path.join(patternDir, entry.name));
    }
  }

  for (const filePath of patternFiles) {
    const result = await validatePattern(filePath, options);
    allErrors.push(...result.errors);
    allWarnings.push(...result.warnings);
    allInfo.push(...result.info);
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    info: allInfo,
  };
}

/**
 * Format validation results for output
 */
export function formatResults(result: ValidationResult): string {
  const lines: string[] = [];

  for (const err of result.errors) {
    lines.push(`ERROR ${err.file}${err.field ? `:${err.field}` : ""}: ${err.message}`);
  }

  for (const warn of result.warnings) {
    lines.push(`WARN  ${warn.file}${warn.field ? `:${warn.field}` : ""}: ${warn.message}`);
  }

  for (const info of result.info) {
    lines.push(`INFO  ${info.file}${info.field ? `:${info.field}` : ""}: ${info.message}`);
  }

  if (result.errors.length > 0) {
    lines.push(`\nFound ${result.errors.length} error(s).`);
  }

  if (result.warnings.length > 0) {
    lines.push(`Found ${result.warnings.length} warning(s).`);
  }

  if (result.errors.length === 0 && result.warnings.length === 0) {
    lines.push("Pattern validation clean.");
  }

  return lines.join("\n");
}

/**
 * CLI entry point
 */
async function main() {
  const args = process.argv.slice(2);

  // Default to patterns directory
  let target = "patterns";
  const options: ValidatorOptions = {
    strict: false,
    checkContent: false,
  };

  // Parse CLI args (task 073 will add full arg parsing)
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--strict") {
      options.strict = true;
    } else if (arg === "--check-content") {
      options.checkContent = true;
    } else if (!arg.startsWith("-")) {
      target = arg;
    }
  }

  // Check if target is a file or directory
  const fs = await import("node:fs");
  const path = await import("node:path");
  const stat = fs.statSync(target);

  let result: ValidationResult;
  if (stat.isFile()) {
    // Validate single file
    result = await validatePattern(target, options);
  } else {
    // Validate directory
    result = await validatePatterns(target, options);
  }

  console.log(formatResults(result));

  // Exit codes (task 076 will implement full exit code logic)
  process.exit(result.valid ? 0 : 1);
}

// Run if executed directly
if (import.meta.main) {
  main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  });
}

// Export for testing and programmatic use
export default {
  validatePattern,
  validatePatterns,
  formatResults,
  parseFrontMatter,
  ALLOWED_CATEGORIES,
  ALLOWED_STATUSES,
  REQUIRED_FIELDS,
  OPTIONAL_FIELDS,
  ALLOWED_MATURITY,
  ALLOWED_COMPLEXITY,
  ALLOWED_EFFORT,
  ALLOWED_IMPACT,
};
