export type SubcatType = "person" | "company";
export type Region = "Global";

export interface Subcategory {
  id: string;
  label: string;
  type: SubcatType;
  region?: Region;
}

export interface CategoryGroup {
  id: string;
  label: string;
  subcategories: Subcategory[];
}

export const CATEGORY_TREE: CategoryGroup[] = [
  {
    id: "staffing",
    label: "WSS Top 100 Awards",
    subcategories: [
      { id: "best-staffing-leader", label: "Top 100 Staffing Leaders to Watch in 2026", type: "person", region: "Global" },
      { id: "best-staffing-firm", label: "Top 100 Staffing Companies to Work for in 2026", type: "company", region: "Global" },
      { id: "best-recruiter", label: "Top 100 Recruiters to work with in 2026", type: "person", region: "Global" },
    ],
  },
] as const;

// Helper functions for working with categories
export function getAllSubcategories(): Subcategory[] {
  return CATEGORY_TREE.flatMap(group => group.subcategories);
}

export function getSubcategoryById(id: string): Subcategory | undefined {
  return getAllSubcategories().find(sub => sub.id === id);
}

export function getSubcategoriesByType(type: SubcatType): Subcategory[] {
  return getAllSubcategories().filter(sub => sub.type === type);
}

export function getSubcategoriesByRegion(region: Region): Subcategory[] {
  return getAllSubcategories().filter(sub => sub.region === region);
}

export function getCategoryGroupById(id: string): CategoryGroup | undefined {
  return CATEGORY_TREE.find(group => group.id === id);
}