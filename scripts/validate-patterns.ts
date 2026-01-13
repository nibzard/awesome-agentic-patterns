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

export const REQUIRED_FIELDS = ["title", "status", "authors", "category", "source", "tags"] as const;
export const RECOMMENDED_FIELDS = ["based_on", "summary"] as const;

// Markdown parser instance
const md = new MarkdownIt();

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
      validateMarkdownStructure(body, filePath, warnings, info);
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
 * Validate required front-matter fields (task 070 placeholder)
 */
function validateRequiredFields(
  data: Record<string, unknown>,
  filePath: string,
  errors: ValidationError[],
  warnings: ValidationError[]
): void {
  const missing: string[] = [];

  for (const field of REQUIRED_FIELDS) {
    if (!data[field]) {
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

  // Check for recommended fields
  for (const field of RECOMMENDED_FIELDS) {
    if (!data[field]) {
      warnings.push({
        level: "warning",
        file: filePath,
        field,
        message: `Missing recommended field: ${field}`,
      });
    }
  }
}

/**
 * Validate field values (task 071 placeholder)
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

  // Validate authors format
  const authors = data.authors as string[] | string;
  if (authors && !Array.isArray(authors)) {
    errors.push({
      level: "error",
      file: filePath,
      field: "authors",
      message: `Authors must be an array, got: ${typeof authors}`,
    });
  }

  // Validate tags format
  const tags = data.tags as string[] | string;
  if (tags && !Array.isArray(tags)) {
    errors.push({
      level: "error",
      file: filePath,
      field: "tags",
      message: `Tags must be an array, got: ${typeof tags}`,
    });
  }
}

/**
 * Validate markdown structure (placeholder for task 072)
 */
function validateMarkdownStructure(
  body: string,
  filePath: string,
  warnings: ValidationError[],
  info: ValidationError[]
): void {
  // Task 072 will implement full content validation
  // For now, basic check that content exists
  if (!body || body.trim().length === 0) {
    warnings.push({
      level: "warning",
      file: filePath,
      field: "content",
      message: "Pattern has no body content",
    });
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
  let targetDir = "patterns";
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
      targetDir = arg;
    }
  }

  const result = await validatePatterns(targetDir, options);

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
  ALLOWED_CATEGORIES,
  ALLOWED_STATUSES,
  REQUIRED_FIELDS,
};
