import { CATEGORIES } from "@/lib/constants";
import { getAllSubcategories } from "@/lib/categories";

/**
 * Convert a category ID to its proper display label
 */
export function getCategoryLabel(categoryId: string): string {
  // First check the constants file
  const category = CATEGORIES.find(c => c.id === categoryId);
  if (category) {
    return category.label;
  }

  // Then check the categories tree
  const subcategory = getAllSubcategories().find(sub => sub.id === categoryId);
  if (subcategory) {
    return subcategory.label;
  }

  // Fallback: convert slug to proper case
  return categoryId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Get all available categories with their proper labels
 */
export function getAllCategoriesWithLabels() {
  return CATEGORIES.map(category => ({
    id: category.id,
    label: category.label,
    type: category.type,
    group: category.group
  }));
}

/**
 * Convert category slug to proper case for display
 */
export function formatCategoryName(categorySlug: string): string {
  return getCategoryLabel(categorySlug);
}