/**
 * Date formatting utilities
 */

/**
 * Format a date as a localized string in "Month Day, Year" format
 * @param date - Date to format (defaults to current date)
 * @returns Formatted date string
 */
export function formatDate(date: Date = new Date()): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format a date string as a localized string
 * @param dateString - ISO date string to format
 * @returns Formatted date string
 */
export function formatDateFromString(dateString: string): string {
  return formatDate(new Date(dateString));
}
