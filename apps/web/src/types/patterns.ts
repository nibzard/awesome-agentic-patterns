/**
 * Shared type definitions for pattern data
 * These types align with the Zod schema in src/content/config.ts
 */

/**
 * Pattern status values
 */
export type PatternStatus =
  | 'proposed'
  | 'emerging'
  | 'established'
  | 'validated-in-production'
  | 'best-practice'
  | 'experimental-but-awesome'
  | 'rapidly-improving';

/**
 * Pattern category values
 */
export type PatternCategory =
  | 'Orchestration & Control'
  | 'Context & Memory'
  | 'Feedback Loops'
  | 'Learning & Adaptation'
  | 'Reliability & Eval'
  | 'Security & Safety'
  | 'Tool Use & Environment'
  | 'UX & Collaboration'
  | 'Uncategorized';

/**
 * Maturity values
 */
export type PatternMaturity = 'early' | 'maturing' | 'mature';

/**
 * Complexity values
 */
export type PatternComplexity = 'low' | 'medium' | 'high' | 'very-high';

/**
 * Effort values
 */
export type PatternEffort = 'low' | 'medium' | 'high' | 'very-high';

/**
 * Impact values
 */
export type PatternImpact = 'low' | 'medium' | 'high' | 'transformative';

/**
 * Pattern entry with all metadata
 */
export interface PatternEntry {
  id: string;
  slug: string;
  title: string;
  status: PatternStatus;
  authors: string[];
  based_on?: string[];
  category: PatternCategory;
  source: string;
  tags: string[];
  summary?: string;
  maturity?: PatternMaturity;
  complexity?: PatternComplexity;
  effort?: PatternEffort;
  impact?: PatternImpact;
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

/**
 * Pattern filters for querying
 */
export interface PatternFilters {
  categories?: PatternCategory[];
  tags?: string[];
  statuses?: PatternStatus[];
  maturities?: PatternMaturity[];
  complexities?: PatternComplexity[];
  domains?: string[];
  search?: string;
}

/**
 * Pattern statistics
 */
export interface PatternStats {
  total: number;
  categories: number;
  tags: number;
  statuses: number;
  byCategory: Record<PatternCategory, number>;
  byStatus: Record<PatternStatus, number>;
}

/**
 * Pattern section keys
 */
export type PatternSectionKey =
  | 'problem'
  | 'solution'
  | 'how-to-use-it'
  | 'trade-offs'
  | 'example'
  | 'see-also'
  | 'references';

/**
 * Pattern sections map
 */
export interface PatternSections {
  problem?: string;
  solution?: string;
  'how-to-use-it'?: string;
  'trade-offs'?: string;
  example?: string;
  'see-also'?: string;
  references?: string;
}

/**
 * Category count for filter UI
 */
export interface CategoryCount {
  category: PatternCategory;
  count: number;
}

/**
 * Status count for filter UI
 */
export interface StatusCount {
  status: PatternStatus;
  count: number;
}

/**
 * Maturity count for filter UI
 */
export interface MaturityCount {
  maturity: PatternMaturity;
  count: number;
}

/**
 * Complexity count for filter UI
 */
export interface ComplexityCount {
  complexity: PatternComplexity;
  count: number;
}

/**
 * Badge variant for UI
 */
export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

/**
 * Badge size for UI
 */
export type BadgeSize = 'sm' | 'md' | 'lg';

/**
 * Status badge mapping
 */
export const STATUS_BADGES: Record<PatternStatus, BadgeVariant> = {
  proposed: 'neutral',
  emerging: 'info',
  established: 'success',
  'validated-in-production': 'success',
  'best-practice': 'success',
  'experimental-but-awesome': 'warning',
  'rapidly-improving': 'info',
} as const;
