import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const STATUS_VALUES = [
  'proposed',
  'emerging',
  'established',
  'validated-in-production',
  'best-practice',
  'experimental-but-awesome',
  'rapidly-improving',
];

const CATEGORY_VALUES = [
  'Orchestration & Control',
  'Context & Memory',
  'Feedback Loops',
  'Learning & Adaptation',
  'Reliability & Eval',
  'Security & Safety',
  'Tool Use & Environment',
  'UX & Collaboration',
  'Uncategorized',
];

const MATURITY_VALUES = ['early', 'maturing', 'mature'];
const COMPLEXITY_VALUES = ['low', 'medium', 'high'];
const EFFORT_VALUES = ['hours', 'days', 'weeks'];
const IMPACT_VALUES = ['low', 'medium', 'high'];

const REQUIRED_HEADINGS = [
  'problem',
  'solution',
  'how to use it',
  'trade-offs',
  'references',
];

interface ValidationIssue {
  file: string;
  level: 'error' | 'warn';
  field: string;
  message: string;
}

interface HeadingEntry {
  text: string;
  normalized: string;
  line: number;
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function normalizeHeading(text: string): string {
  return text.toLowerCase().trim();
}

function extractHeadings(body: string): HeadingEntry[] {
  const headings: HeadingEntry[] = [];
  const lines = body.split('\n');

  lines.forEach((line, index) => {
    const match = line.match(/^##\s+(.+)$/);
    if (!match) return;
    const text = match[1].trim();
    headings.push({
      text,
      normalized: normalizeHeading(text),
      line: index + 1,
    });
  });

  return headings;
}

function validateHeadingStructure(filePath: string, body: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const headings = extractHeadings(body);
  const normalized = headings.map((heading) => heading.normalized);

  REQUIRED_HEADINGS.forEach((required) => {
    if (!normalized.includes(required)) {
      issues.push({
        file: filePath,
        level: 'error',
        field: 'headings',
        message: `Missing required section: ${required}`,
      });
    }
  });

  const indices = REQUIRED_HEADINGS.map((required) => normalized.indexOf(required)).filter(
    (index) => index >= 0
  );

  if (indices.length > 1) {
    for (let i = 1; i < indices.length; i += 1) {
      if (indices[i] < indices[i - 1]) {
        issues.push({
          file: filePath,
          level: 'warn',
          field: 'headings',
          message: 'Required headings are out of order.',
        });
        break;
      }
    }
  }

  const counts = new Map<string, number>();
  headings.forEach((heading) => {
    counts.set(heading.normalized, (counts.get(heading.normalized) || 0) + 1);
  });

  counts.forEach((count, heading) => {
    if (count > 1) {
      issues.push({
        file: filePath,
        level: 'warn',
        field: 'headings',
        message: `Duplicate section heading: ${heading}`,
      });
    }
  });

  return issues;
}

function validatePattern(filePath: string, checkContent: boolean): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);

  const requiredFields = ['title', 'status', 'authors', 'category', 'source', 'tags'];
  requiredFields.forEach((field) => {
    if (!(field in data)) {
      issues.push({
        file: filePath,
        level: 'error',
        field,
        message: 'Missing required front matter field.',
      });
    }
  });

  if (typeof data.title !== 'string' || data.title.trim().length === 0) {
    issues.push({
      file: filePath,
      level: 'error',
      field: 'title',
      message: 'Title must be a non-empty string.',
    });
  }

  if (typeof data.status !== 'string' || !STATUS_VALUES.includes(data.status)) {
    issues.push({
      file: filePath,
      level: 'error',
      field: 'status',
      message: `Status must be one of: ${STATUS_VALUES.join(', ')}`,
    });
  }

  if (!isStringArray(data.authors) || data.authors.length === 0) {
    issues.push({
      file: filePath,
      level: 'error',
      field: 'authors',
      message: 'Authors must be a non-empty array of strings.',
    });
  }

  if (typeof data.category !== 'string' || !CATEGORY_VALUES.includes(data.category)) {
    issues.push({
      file: filePath,
      level: 'error',
      field: 'category',
      message: `Category must be one of: ${CATEGORY_VALUES.join(', ')}`,
    });
  }

  if (typeof data.source !== 'string' || !isValidUrl(data.source)) {
    issues.push({
      file: filePath,
      level: 'error',
      field: 'source',
      message: 'Source must be a valid URL.',
    });
  }

  if (!isStringArray(data.tags) || data.tags.length === 0) {
    issues.push({
      file: filePath,
      level: 'error',
      field: 'tags',
      message: 'Tags must be a non-empty array of strings.',
    });
  }

  if (data.based_on && !isStringArray(data.based_on)) {
    issues.push({
      file: filePath,
      level: 'error',
      field: 'based_on',
      message: 'based_on must be an array of strings.',
    });
  }

  if (data.summary && typeof data.summary !== 'string') {
    issues.push({
      file: filePath,
      level: 'error',
      field: 'summary',
      message: 'summary must be a string.',
    });
  }

  if (data.slug && typeof data.slug !== 'string') {
    issues.push({
      file: filePath,
      level: 'error',
      field: 'slug',
      message: 'slug must be a string.',
    });
  }

  if (data.id && typeof data.id !== 'string') {
    issues.push({
      file: filePath,
      level: 'error',
      field: 'id',
      message: 'id must be a string.',
    });
  }

  if (data.maturity && (typeof data.maturity !== 'string' || !MATURITY_VALUES.includes(data.maturity))) {
    issues.push({
      file: filePath,
      level: 'error',
      field: 'maturity',
      message: `maturity must be one of: ${MATURITY_VALUES.join(', ')}`,
    });
  }

  if (data.complexity && (typeof data.complexity !== 'string' || !COMPLEXITY_VALUES.includes(data.complexity))) {
    issues.push({
      file: filePath,
      level: 'error',
      field: 'complexity',
      message: `complexity must be one of: ${COMPLEXITY_VALUES.join(', ')}`,
    });
  }

  if (data.effort && (typeof data.effort !== 'string' || !EFFORT_VALUES.includes(data.effort))) {
    issues.push({
      file: filePath,
      level: 'error',
      field: 'effort',
      message: `effort must be one of: ${EFFORT_VALUES.join(', ')}`,
    });
  }

  if (data.impact && (typeof data.impact !== 'string' || !IMPACT_VALUES.includes(data.impact))) {
    issues.push({
      file: filePath,
      level: 'error',
      field: 'impact',
      message: `impact must be one of: ${IMPACT_VALUES.join(', ')}`,
    });
  }

  const arrayFields = [
    'signals',
    'anti_signals',
    'prerequisites',
    'related',
    'anti_patterns',
    'tools',
    'domains',
  ];

  arrayFields.forEach((field) => {
    if (data[field] && !isStringArray(data[field])) {
      issues.push({
        file: filePath,
        level: 'error',
        field,
        message: `${field} must be an array of strings.`,
      });
    }
  });

  if (data.updated_at && typeof data.updated_at !== 'string') {
    issues.push({
      file: filePath,
      level: 'error',
      field: 'updated_at',
      message: 'updated_at must be a string in YYYY-MM-DD format.',
    });
  } else if (data.updated_at && !/^\d{4}-\d{2}-\d{2}$/.test(data.updated_at)) {
    issues.push({
      file: filePath,
      level: 'error',
      field: 'updated_at',
      message: 'updated_at must match YYYY-MM-DD format.',
    });
  }

  if (checkContent) {
    issues.push(...validateHeadingStructure(filePath, content));
  }

  return issues;
}

function collectPatternFiles(targets: string[]): string[] {
  const files: string[] = [];

  targets.forEach((target) => {
    const resolved = path.resolve(target);
    if (!fs.existsSync(resolved)) {
      return;
    }

    const stats = fs.statSync(resolved);
    if (stats.isDirectory()) {
      const entries = fs
        .readdirSync(resolved)
        .filter((file) => file.endsWith('.md') && file !== 'TEMPLATE.md')
        .map((file) => path.join(resolved, file));
      files.push(...entries);
      return;
    }

    if (stats.isFile() && resolved.endsWith('.md')) {
      files.push(resolved);
    }
  });

  return files;
}

function formatIssue(issue: ValidationIssue): string {
  const prefix = issue.level === 'error' ? 'ERROR' : 'WARN';
  return `${prefix} ${issue.file}:${issue.field}: ${issue.message}`;
}

function main(): void {
  const args = process.argv.slice(2);
  const checkContent = args.includes('--check-content');
  const targets = args.filter((arg) => !arg.startsWith('--'));
  const inputTargets = targets.length > 0 ? targets : ['patterns'];

  const files = collectPatternFiles(inputTargets);

  if (files.length === 0) {
    console.error('No pattern files found to validate.');
    process.exit(1);
  }

  const issues = files.flatMap((file) => validatePattern(file, checkContent));
  const errors = issues.filter((issue) => issue.level === 'error');
  const warnings = issues.filter((issue) => issue.level === 'warn');

  warnings.forEach((warning) => console.warn(formatIssue(warning)));
  errors.forEach((error) => console.error(formatIssue(error)));

  process.exit(errors.length > 0 ? 1 : 0);
}

main();
