// ABOUTME: Validates pattern front matter and section structure for all files under patterns/.
// ABOUTME: With --check-content it also enforces evidence grades, referential integrity, status vs. evidence, and length guardrails.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoPatternsDir = path.join(repoRoot, 'patterns');
const contentPacksDir = path.join(repoRoot, 'apps', 'web', 'src', 'content', 'packs');
const contentGuidesDir = path.join(repoRoot, 'apps', 'web', 'src', 'content', 'guides');

const STATUS_VALUES = ['proposed', 'emerging', 'production', 'foundational'];
const EVIDENCE_GRADE_VALUES = ['high', 'medium', 'low', 'mixed', 'unknown'];
const EVIDENCE_GRADE_LINE = /\*\*Evidence Grade:\*\*\s*`?([a-zA-Z0-9_-]+)`?/i;
const MIN_PATTERN_LINES = 55;
const MAX_PATTERN_LINES = 220;
const MIN_INDEPENDENT_URLS = 3;
const SINGLE_SOURCE_DISCLOSURE = /contributor[- ]owned|launch[- ]stage/i;
const EXTERNAL_URL = /https?:\/\/[^\s<>()\[\]"']+/g;

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

function stripFencedCode(text: string): string {
  return text.replace(/```[\s\S]*?(?:```|$)/g, '');
}

function collectAllPatternSlugs(): Set<string> {
  const slugs = new Set<string>();
  if (!fs.existsSync(repoPatternsDir)) return slugs;

  fs.readdirSync(repoPatternsDir)
    .filter((file) => file.endsWith('.md') && file !== 'TEMPLATE.md')
    .forEach((file) => {
      slugs.add(path.basename(file, path.extname(file)));
      const { data } = matter(fs.readFileSync(path.join(repoPatternsDir, file), 'utf-8'));
      if (typeof data.slug === 'string') slugs.add(data.slug);
    });

  return slugs;
}

function parseBodyEvidenceGrade(body: string): string | undefined {
  const match = body.match(EVIDENCE_GRADE_LINE);
  return match ? match[1].toLowerCase() : undefined;
}

function countDistinctExternalUrls(...texts: Array<string | undefined>): number {
  const urls = new Set<string>();
  texts.forEach((text) => {
    if (!text) return;
    for (const match of text.matchAll(EXTERNAL_URL)) {
      urls.add(match[0].replace(/[.,;:!?)]+$/, ''));
    }
  });
  return urls.size;
}

function findBrokenRelativeMdLinks(filePath: string, body: string): string[] {
  const broken: string[] = [];

  for (const match of stripFencedCode(body).matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    const target = match[1];
    if (/^(https?:\/\/|mailto:|#|\/)/.test(target)) continue;

    const cleanTarget = target.split('#')[0].split('?')[0];
    if (!cleanTarget.endsWith('.md')) continue;

    if (!fs.existsSync(path.resolve(path.dirname(filePath), cleanTarget))) {
      broken.push(target);
    }
  }

  return broken;
}

function listContentFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => /\.mdx?$/.test(file))
    .map((file) => path.join(dir, file));
}

function findUnknownPatternLinks(filePath: string, body: string, allPatternSlugs: Set<string>): string[] {
  const unknown = new Set<string>();

  for (const match of stripFencedCode(body).matchAll(/\/patterns\/([a-z0-9-]+)/g)) {
    if (!allPatternSlugs.has(match[1])) unknown.add(match[1]);
  }

  return Array.from(unknown).map((slug) => `/patterns/${slug}`);
}

function validateContentReferences(allPatternSlugs: Set<string>): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  listContentFiles(contentPacksDir).forEach((filePath) => {
    const { data, content } = matter(fs.readFileSync(filePath, 'utf-8'));

    if (Array.isArray(data.patterns)) {
      data.patterns.forEach((slug) => {
        if (typeof slug === 'string' && !allPatternSlugs.has(slug)) {
          issues.push({
            file: filePath,
            level: 'error',
            field: 'patterns',
            message: `Pack lists pattern slug '${slug}', which has no patterns/*.md file.`,
          });
        }
      });
    }

    findUnknownPatternLinks(filePath, content, allPatternSlugs).forEach((link) => {
      issues.push({
        file: filePath,
        level: 'error',
        field: 'links',
        message: `Link '${link}' points to a pattern slug with no patterns/*.md file.`,
      });
    });
  });

  listContentFiles(contentGuidesDir).forEach((filePath) => {
    const { content } = matter(fs.readFileSync(filePath, 'utf-8'));

    findUnknownPatternLinks(filePath, content, allPatternSlugs).forEach((link) => {
      issues.push({
        file: filePath,
        level: 'error',
        field: 'links',
        message: `Link '${link}' points to a pattern slug with no patterns/*.md file.`,
      });
    });
  });

  return issues;
}

function validatePattern(
  filePath: string,
  checkContent: boolean,
  allPatternSlugs: Set<string>
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);

  const requiredFields = ['title', 'status', 'authors', 'category', 'source', 'tags', 'updated_at'];
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

  if (typeof data.summary !== 'string' || data.summary.trim().length === 0) {
    issues.push({
      file: filePath,
      level: 'error',
      field: 'summary',
      message: 'summary must be a non-empty string: one sentence that says what the pattern does.',
    });
  }

  (['signals', 'anti_signals'] as const).forEach((field) => {
    const value = data[field];
    if (!isStringArray(value) || value.length === 0) {
      issues.push({
        file: filePath,
        level: 'error',
        field,
        message: `${field} must be a non-empty array of strings (${field === 'signals' ? 'when to use' : 'when not to use'} the pattern).`,
      });
    }
  });

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

  if (
    data.evidence_grade !== undefined &&
    (typeof data.evidence_grade !== 'string' || !EVIDENCE_GRADE_VALUES.includes(data.evidence_grade))
  ) {
    issues.push({
      file: filePath,
      level: 'error',
      field: 'evidence_grade',
      message: `evidence_grade must be one of: ${EVIDENCE_GRADE_VALUES.join(', ')}`,
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

    const bodyEvidenceGrade = parseBodyEvidenceGrade(content);
    if (bodyEvidenceGrade && !EVIDENCE_GRADE_VALUES.includes(bodyEvidenceGrade)) {
      issues.push({
        file: filePath,
        level: 'error',
        field: 'evidence_grade',
        message: `**Evidence Grade:** '${bodyEvidenceGrade}' is not one of: ${EVIDENCE_GRADE_VALUES.join(', ')}. Status words are not evidence grades.`,
      });
    }

    if (isStringArray(data.related)) {
      data.related.forEach((slug) => {
        if (!allPatternSlugs.has(slug)) {
          issues.push({
            file: filePath,
            level: 'error',
            field: 'related',
            message: `related entry '${slug}' has no patterns/*.md file.`,
          });
        }
      });
    }

    findBrokenRelativeMdLinks(filePath, content).forEach((link) => {
      issues.push({
        file: filePath,
        level: 'error',
        field: 'links',
        message: `Relative link '${link}' does not resolve to an existing file.`,
      });
    });

    const evidenceGrade =
      typeof data.evidence_grade === 'string' ? data.evidence_grade.toLowerCase() : bodyEvidenceGrade;

    if (data.status === 'foundational' || data.status === 'production') {
      if (evidenceGrade === 'low') {
        issues.push({
          file: filePath,
          level: 'error',
          field: 'status',
          message: `Status '${data.status}' cannot have low evidence grade; downgrade to 'proposed' or 'emerging' or strengthen evidence.`,
        });
      }

      const basedOnText = Array.isArray(data.based_on) ? data.based_on.join(' ') : String(data.based_on || '');
      const disclosureText = `${basedOnText}\n${String(data.source || '')}\n${content}`;
      if (
        SINGLE_SOURCE_DISCLOSURE.test(disclosureText) &&
        countDistinctExternalUrls(basedOnText, String(data.source || ''), content) < MIN_INDEPENDENT_URLS
      ) {
        issues.push({
          file: filePath,
          level: 'warn',
          field: 'status',
          message: `Status '${data.status}' with a contributor-owned or launch-stage primary implementation and fewer than ${MIN_INDEPENDENT_URLS} distinct external URLs; possible single-source status inflation.`,
        });
      }
    }

    const lineCount = raw.split('\n').length;
    if (lineCount < MIN_PATTERN_LINES) {
      issues.push({
        file: filePath,
        level: 'warn',
        field: 'length',
        message: `Pattern has ${lineCount} lines (<${MIN_PATTERN_LINES}); check whether mechanics/gotchas are too thin.`,
      });
    } else if (lineCount > MAX_PATTERN_LINES) {
      issues.push({
        file: filePath,
        level: 'warn',
        field: 'length',
        message: `Pattern has ${lineCount} lines (>${MAX_PATTERN_LINES}); consider trimming to the 70-180 line target.`,
      });
    }
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

function isWholeCatalogRun(targets: string[]): boolean {
  if (targets.length === 0) return true;
  return targets.some((target) => {
    const resolved = path.resolve(target);
    return path.basename(resolved) === 'patterns' && fs.existsSync(resolved) && fs.statSync(resolved).isDirectory();
  });
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

  const allPatternSlugs = checkContent ? collectAllPatternSlugs() : new Set<string>();
  const issues = [
    ...files.flatMap((file) => validatePattern(file, checkContent, allPatternSlugs)),
    ...(checkContent && isWholeCatalogRun(targets) ? validateContentReferences(allPatternSlugs) : []),
  ];
  const errors = issues.filter((issue) => issue.level === 'error');
  const warnings = issues.filter((issue) => issue.level === 'warn');

  warnings.forEach((warning) => console.warn(formatIssue(warning)));
  errors.forEach((error) => console.error(formatIssue(error)));

  process.exit(errors.length > 0 ? 1 : 0);
}

main();
