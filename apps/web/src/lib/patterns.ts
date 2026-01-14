import matter from 'gray-matter';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Root patterns directory (monorepo root)
// From apps/web/src/lib/patterns.ts, go up 4 levels to reach repo root
const patternsDir = join(__dirname, '../../../../patterns');

/**
 * Load all pattern files from the root patterns/ directory
 * This implements the "no symlink" approach by reading files
 * directly from the monorepo root using Node.js fs module.
 *
 * NOTE: This function uses Node.js fs module and works in SSR/build context.
 */
export async function getAllPatterns(): Promise<PatternEntry[]> {
  // Read all markdown files from the root patterns directory
  const files = fs
    .readdirSync(patternsDir)
    .filter((file: string) => file.endsWith('.md') && file !== 'TEMPLATE.md');

  const patterns: PatternEntry[] = [];

  for (const file of files) {
    const filePath = join(patternsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data, content: body } = matter(content);
    const slug = file.replace('.md', '');

    patterns.push({
      id: (data.id as string) || slug,
      slug: (data.slug as string) || slug,
      title: data.title as string,
      status: data.status as string,
      authors: Array.isArray(data.authors) ? (data.authors as string[]) : [],
      based_on: Array.isArray(data.based_on) ? (data.based_on as string[]) : undefined,
      category: data.category as string,
      source: data.source as string,
      tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
      summary: data.summary as string | undefined,
      maturity: data.maturity as string | undefined,
      complexity: data.complexity as string | undefined,
      effort: data.effort as string | undefined,
      impact: data.impact as string | undefined,
      signals: Array.isArray(data.signals) ? (data.signals as string[]) : undefined,
      anti_signals: Array.isArray(data.anti_signals) ? (data.anti_signals as string[]) : undefined,
      prerequisites: Array.isArray(data.prerequisites)
        ? (data.prerequisites as string[])
        : undefined,
      related: Array.isArray(data.related) ? (data.related as string[]) : undefined,
      anti_patterns: Array.isArray(data.anti_patterns)
        ? (data.anti_patterns as string[])
        : undefined,
      tools: Array.isArray(data.tools) ? (data.tools as string[]) : undefined,
      domains: Array.isArray(data.domains) ? (data.domains as string[]) : undefined,
      updated_at: data.updated_at as string | undefined,
      body,
    });
  }

  return patterns;
}

/**
 * Get a single pattern by slug
 */
export async function getPatternBySlug(slug: string): Promise<PatternEntry | undefined> {
  const patterns = await getAllPatterns();
  return patterns.find((p) => p.slug === slug);
}

/**
 * Get patterns by category
 */
export async function getPatternsByCategory(category: string): Promise<PatternEntry[]> {
  const patterns = await getAllPatterns();
  return patterns.filter((p) => p.category === category);
}

/**
 * Get patterns by status
 */
export async function getPatternsByStatus(status: string): Promise<PatternEntry[]> {
  const patterns = await getAllPatterns();
  return patterns.filter((p) => p.status === status);
}

/**
 * Get patterns by tag
 */
export async function getPatternsByTag(tag: string): Promise<PatternEntry[]> {
  const patterns = await getAllPatterns();
  return patterns.filter((p) => p.tags.includes(tag));
}

/**
 * Get related patterns
 */
export async function getRelatedPatterns(patternIds: string[]): Promise<PatternEntry[]> {
  const patterns = await getAllPatterns();
  return patterns.filter((p) => patternIds.includes(p.id));
}

/**
 * Get anti-patterns
 */
export async function getAntiPatterns(patternIds: string[]): Promise<PatternEntry[]> {
  const patterns = await getAllPatterns();
  return patterns.filter((p) => patternIds.includes(p.id));
}

/**
 * Get all unique categories
 */
export async function getCategories(): Promise<string[]> {
  const patterns = await getAllPatterns();
  const categories = new Set(patterns.map((p) => p.category));
  return Array.from(categories).sort();
}

/**
 * Get all unique tags
 */
export async function getTags(): Promise<string[]> {
  const patterns = await getAllPatterns();
  const tags = new Set(patterns.flatMap((p) => p.tags));
  return Array.from(tags).sort();
}

/**
 * Get all unique statuses
 */
export async function getStatuses(): Promise<string[]> {
  const patterns = await getAllPatterns();
  const statuses = new Set(patterns.map((p) => p.status));
  return Array.from(statuses).sort();
}

/**
 * Get all unique domains
 */
export async function getDomains(): Promise<string[]> {
  const patterns = await getAllPatterns();
  const domains = new Set(patterns.flatMap((p) => p.domains || []));
  return Array.from(domains).sort();
}

/**
 * Get all unique maturity levels
 */
export async function getMaturities(): Promise<string[]> {
  const patterns = await getAllPatterns();
  const maturities = new Set(patterns.map((p) => p.maturity).filter(Boolean) as string[]);
  return Array.from(maturities).sort();
}

/**
 * Get all unique complexity levels
 */
export async function getComplexities(): Promise<string[]> {
  const patterns = await getAllPatterns();
  const complexities = new Set(patterns.map((p) => p.complexity).filter(Boolean) as string[]);
  return Array.from(complexities).sort();
}

/**
 * Get recently updated patterns
 */
export async function getRecentlyUpdatedPatterns(limit = 10): Promise<PatternEntry[]> {
  const patterns = await getAllPatterns();
  return patterns
    .filter((p) => p.updated_at)
    .sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''))
    .slice(0, limit);
}

/**
 * Get new patterns (created in last 30 days)
 */
export async function getNewPatterns(days = 30): Promise<PatternEntry[]> {
  const patterns = await getAllPatterns();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return patterns.filter((p) => {
    if (!p.updated_at) return false;
    const updatedAt = new Date(p.updated_at);
    return updatedAt > cutoff;
  });
}

/**
 * Get updated patterns (updated in last 30 days)
 */
export async function getUpdatedPatterns(days = 30): Promise<PatternEntry[]> {
  const patterns = await getAllPatterns();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return patterns.filter((p) => {
    if (!p.updated_at) return false;
    const updatedAt = new Date(p.updated_at);
    return updatedAt > cutoff;
  });
}

/**
 * Get featured patterns (high impact, mature)
 */
export async function getFeaturedPatterns(): Promise<PatternEntry[]> {
  const patterns = await getAllPatterns();
  return patterns.filter((p) => {
    const isHighImpact = p.impact === 'high' || p.impact === 'transformative';
    const isMature = p.maturity === 'mature';
    return isHighImpact || isMature;
  });
}

/**
 * Search patterns by query string
 */
export async function searchPatterns(query: string): Promise<PatternEntry[]> {
  const patterns = await getAllPatterns();
  const lowerQuery = query.toLowerCase();

  return patterns.filter((p) => {
    return (
      p.title.toLowerCase().includes(lowerQuery) ||
      p.summary?.toLowerCase().includes(lowerQuery) ||
      p.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
      p.category.toLowerCase().includes(lowerQuery) ||
      p.domains?.some((domain) => domain.toLowerCase().includes(lowerQuery))
    );
  });
}

/**
 * Filter patterns by multiple criteria
 */
export async function filterPatterns(filters: PatternFilters): Promise<PatternEntry[]> {
  let patterns = await getAllPatterns();

  if (filters.categories && filters.categories.length > 0) {
    patterns = patterns.filter((p) => filters.categories!.includes(p.category));
  }

  if (filters.tags && filters.tags.length > 0) {
    patterns = patterns.filter((p) => p.tags.some((tag) => filters.tags!.includes(tag)));
  }

  if (filters.statuses && filters.statuses.length > 0) {
    patterns = patterns.filter((p) => filters.statuses!.includes(p.status));
  }

  if (filters.maturities && filters.maturities.length > 0) {
    patterns = patterns.filter((p) => p.maturity && filters.maturities!.includes(p.maturity));
  }

  if (filters.complexities && filters.complexities.length > 0) {
    patterns = patterns.filter((p) => p.complexity && filters.complexities!.includes(p.complexity));
  }

  if (filters.domains && filters.domains.length > 0) {
    patterns = patterns.filter((p) => p.domains?.some((d) => filters.domains!.includes(d)));
  }

  return patterns;
}

/**
 * Get pattern statistics
 */
export async function getPatternStats(): Promise<PatternStats> {
  const patterns = await getAllPatterns();
  const categories = await getCategories();
  const tags = await getTags();
  const statuses = await getStatuses();

  return {
    total: patterns.length,
    categories: categories.length,
    tags: tags.length,
    statuses: statuses.length,
    byCategory: Object.fromEntries(
      categories.map((cat) => [cat, patterns.filter((p) => p.category === cat).length])
    ),
    byStatus: Object.fromEntries(
      statuses.map((status) => [status, patterns.filter((p) => p.status === status).length])
    ),
  };
}

// Type definitions
export interface PatternEntry {
  id: string;
  slug: string;
  title: string;
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
  body: string;
}

export interface PatternFilters {
  categories?: string[];
  tags?: string[];
  statuses?: string[];
  maturities?: string[];
  complexities?: string[];
  domains?: string[];
  search?: string;
}

export interface PatternStats {
  total: number;
  categories: number;
  tags: number;
  statuses: number;
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
}
