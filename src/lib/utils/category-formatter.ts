import { CATEGORIES } from "@/lib/constants";

/**
 * Formats a category ID to proper case display name
 * @param categoryId - The category ID (e.g., "rising-star-under-30")
 * @returns The formatted category name (e.g., "Rising Star (Under 30)")
 */
export function formatCategoryName(categoryId: string): string {
  const category = CATEGORIES.find(c => c.id === categoryId);
  return category?.label || categoryId;
}

/**
 * Formats any kebab-case string to proper case
 * @param str - The kebab-case string (e.g., "rising-star-under-30")
 * @returns The formatted string (e.g., "Rising Star Under 30")
 */
export function formatKebabCase(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}