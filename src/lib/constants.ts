export type CategoryType = "person" | "company";

export type Category =
  | "top-recruiter"
  | "top-executive-leader"
  | "rising-star-under-30"
  | "top-staffing-influencer"
  | "best-sourcer"
  | "top-ai-driven-staffing-platform"
  | "top-digital-experience-for-clients"
  | "top-women-led-staffing-firm"
  | "fastest-growing-staffing-firm"
  | "best-staffing-process-at-scale"
  | "thought-leadership-and-influence"
  | "best-recruitment-agency"
  | "best-in-house-recruitment-team"
  | "top-staffing-company-usa"
  | "top-staffing-company-europe"
  | "top-global-recruiter"
  | "best-diversity-inclusion-initiative"
  | "best-candidate-experience"
  | "special-recognition";

export interface CategoryConfig {
  id: Category;
  label: string;
  group: string;
  type: CategoryType;
}

export const CATEGORIES: CategoryConfig[] = [
  // Role-Specific Excellence - Recognizing outstanding individual contributors
  { id: "top-recruiter", label: "Top Recruiters", group: "role-specific-excellence", type: "person" },
  { id: "top-executive-leader", label: "Top Executive Leaders", group: "role-specific-excellence", type: "person" },
  { id: "rising-star-under-30", label: "Rising Stars (Under 30)", group: "role-specific-excellence", type: "person" },
  { id: "top-staffing-influencer", label: "Top Staffing Influencers", group: "role-specific-excellence", type: "person" },
  { id: "best-sourcer", label: "Best Sourcers", group: "role-specific-excellence", type: "person" },
  
  // Innovation & Technology - Leading the future of staffing technology
  { id: "top-ai-driven-staffing-platform", label: "Top AI-Driven Staffing Platforms", group: "innovation-technology", type: "company" },
  { id: "top-digital-experience-for-clients", label: "Top Digital Experience for Clients", group: "innovation-technology", type: "company" },
  
  // Culture & Impact - Making a positive difference in the industry
  { id: "top-women-led-staffing-firm", label: "Top Women-Led Staffing Firms", group: "culture-impact", type: "company" },
  { id: "fastest-growing-staffing-firm", label: "Fastest Growing Staffing Firms", group: "culture-impact", type: "company" },
  { id: "best-diversity-inclusion-initiative", label: "Best Diversity & Inclusion Initiatives", group: "culture-impact", type: "company" },
  { id: "best-candidate-experience", label: "Best Candidate Experiences", group: "culture-impact", type: "company" },
  
  // Growth & Performance - Excellence in operations and thought leadership
  { id: "best-staffing-process-at-scale", label: "Best Staffing Processes at Scale", group: "growth-performance", type: "company" },
  { id: "thought-leadership-and-influence", label: "Thought Leadership & Influence", group: "growth-performance", type: "person" },
  { id: "best-recruitment-agency", label: "Best Recruitment Agencies", group: "growth-performance", type: "company" },
  { id: "best-in-house-recruitment-team", label: "Best In-House Recruitment Teams", group: "growth-performance", type: "company" },
  
  // Geographic Excellence - Regional and global recognition
  { id: "top-staffing-company-usa", label: "Top Staffing Companies - USA", group: "geographic-excellence", type: "company" },
  { id: "top-staffing-company-europe", label: "Top Staffing Companies - Europe", group: "geographic-excellence", type: "company" },
  { id: "top-global-recruiter", label: "Top Global Recruiters", group: "geographic-excellence", type: "person" },
  
  // Special Recognition - Unique contributions to the industry
  { id: "special-recognition", label: "Special Recognition", group: "special-recognition", type: "person" },
];

// Free email domains to block
export const FREE_EMAIL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "aol.com",
  "icloud.com",
  "protonmail.com",
  "proton.me",
  "gmx.com",
  "yandex.com",
  "zoho.com",
  "mail.com",
];

// Admin authentication is now handled via JWT sessions
// See /api/admin/login for authentication

// File upload limits
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/svg+xml"];