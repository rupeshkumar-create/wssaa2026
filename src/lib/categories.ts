export type SubcatType = "person" | "company";
export type Region = "North America" | "Europe" | "Global";

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
    id: "role-specific-excellence",
    label: "Role-Specific Excellence",
    subcategories: [
      { id: "top-recruiter", label: "Top Recruiter", type: "person" },
      { id: "top-executive-leader", label: "Top Executive Leader", type: "person" },
      { id: "rising-star-under-30", label: "Rising Star (Under 30)", type: "person" },
      { id: "top-staffing-influencer", label: "Top Staffing Influencer", type: "person" },
      { id: "best-sourcer", label: "Best Sourcer", type: "person" },
    ],
  },
  {
    id: "innovation-technology",
    label: "Innovation & Technology",
    subcategories: [
      { id: "top-ai-driven-staffing-platform", label: "Top AI-Driven Staffing Platform", type: "company" },
      { id: "top-digital-experience-for-clients", label: "Top Digital Experience for Clients", type: "company" },
    ],
  },
  {
    id: "culture-impact",
    label: "Culture & Impact",
    subcategories: [
      { id: "top-women-led-staffing-firm", label: "Top Women-Led Staffing Firm", type: "company" },
      { id: "fastest-growing-staffing-firm", label: "Fastest Growing Staffing Firm", type: "company" },
      { id: "best-diversity-inclusion-initiative", label: "Best Diversity & Inclusion Initiative", type: "company" },
      { id: "best-candidate-experience", label: "Best Candidate Experience", type: "company" },
    ],
  },
  {
    id: "growth-performance",
    label: "Growth & Performance",
    subcategories: [
      { id: "best-staffing-process-at-scale", label: "Best Staffing Process at Scale", type: "company" },
      { id: "thought-leadership-and-influence", label: "Thought Leadership & Influence", type: "person" },
      { id: "best-recruitment-agency", label: "Best Recruitment Agency", type: "company" },
      { id: "best-in-house-recruitment-team", label: "Best In-House Recruitment Team", type: "company" },
    ],
  },
  {
    id: "geographic-excellence",
    label: "Geographic Excellence",
    subcategories: [
      { id: "top-staffing-company-usa", label: "Top Staffing Company - USA", type: "company", region: "North America" },
      { id: "top-staffing-company-europe", label: "Top Staffing Company - Europe", type: "company", region: "Europe" },
      { id: "top-global-recruiter", label: "Top Global Recruiter", type: "person", region: "Global" },
    ],
  },
  {
    id: "special-recognition",
    label: "Special Recognition",
    subcategories: [
      { id: "special-recognition", label: "Special Recognition", type: "person" },
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