/**
 * Central type exports
 */

export * from './patterns';
export * from './graph';
export * from './ui';

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

/**
 * Pagination params
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Sort params
 */
export interface SortParams {
  sortBy?: string;
  order?: 'asc' | 'desc';
}

/**
 * Common metadata
 */
export interface Metadata {
  title: string;
  description: string;
  image?: string;
  url?: string;
}

/**
 * SEO props
 */
export interface SEOProps extends Metadata {
  locale?: string;
  siteName?: string;
  twitterHandle?: string;
}
