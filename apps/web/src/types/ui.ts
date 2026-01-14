/**
 * Type definitions for UI components
 */

/**
 * View mode for pattern list
 */
export type ViewMode = 'grid' | 'list';

/**
 * Theme mode
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Filter option with count
 */
export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

/**
 * Filter group
 */
export interface FilterGroup {
  label: string;
  name: string;
  options: FilterOption[];
  multiSelect?: boolean;
}

/**
 * Filter state from URL
 */
export interface FilterState {
  categories?: string[];
  tags?: string[];
  statuses?: string[];
  maturities?: string[];
  complexities?: string[];
  domains?: string[];
  search?: string;
}

/**
 * Pagination info
 */
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/**
 * Sort option
 */
export type SortOption =
  | 'updated-desc'
  | 'updated-asc'
  | 'title-asc'
  | 'title-desc'
  | 'status-asc'
  | 'status-desc';

/**
 * Search result item
 */
export interface SearchResult {
  id: string;
  title: string;
  summary?: string;
  url: string;
  meta?: string;
}

/**
 * Decision tree question
 */
export interface DecisionQuestion {
  id: string;
  question: string;
  options: DecisionOption[];
}

/**
 * Decision tree answer option
 */
export interface DecisionOption {
  label: string;
  value: string;
  nextQuestion?: string;
  recommendations?: string[];
  rationale?: string;
}

/**
 * Decision tree data structure
 */
export interface DecisionData {
  questions: Record<string, DecisionQuestion>;
  startQuestion: string;
}
