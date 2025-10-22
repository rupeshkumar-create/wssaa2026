export type CategoryType = "person" | "company";

export type Category =
  | "Best Staffing Process at Scale"
  | "Fastest Growing Staffing Firm"
  | "Rising Star (Under 30)"
  | "Special Recognition"
  | "Thought Leadership & Influence"
  | "Top AI-Driven Staffing Platform"
  | "Top AI-Driven Staffing Platform - Europe"
  | "Top AI-Driven Staffing Platform - USA"
  | "Top Digital Experience for Clients"
  | "Top Executive Leader"
  | "Top Global Recruiter"
  | "Top Global Staffing Leader"
  | "Top Recruiter"
  | "Top Recruiting Leader - Europe"
  | "Top Recruiting Leader - USA"
  | "Top Staffing Company - Europe"
  | "Top Staffing Company - USA"
  | "Top Staffing Influencer"
  | "Top Women-Led Staffing Firm";

export interface CategoryConfig {
  id: Category;
  label: string;
  group: string;
  type: CategoryType;
}

export const CATEGORIES: CategoryConfig[] = [
  // Person Categories
  { id: "Top Recruiter", label: "Top Recruiter", group: "individual", type: "person" },
  { id: "Top Executive Leader", label: "Top Executive Leader", group: "individual", type: "person" },
  { id: "Top Staffing Influencer", label: "Top Staffing Influencer", group: "individual", type: "person" },
  { id: "Rising Star (Under 30)", label: "Rising Star (Under 30)", group: "individual", type: "person" },
  { id: "Thought Leadership & Influence", label: "Thought Leadership & Influence", group: "individual", type: "person" },
  { id: "Top Recruiting Leader - USA", label: "Top Recruiting Leader - USA", group: "regional", type: "person" },
  { id: "Top Recruiting Leader - Europe", label: "Top Recruiting Leader - Europe", group: "regional", type: "person" },
  { id: "Top Global Recruiter", label: "Top Global Recruiter", group: "global", type: "person" },
  { id: "Top Global Staffing Leader", label: "Top Global Staffing Leader", group: "global", type: "person" },
  { id: "Special Recognition", label: "Special Recognition", group: "special", type: "person" },
  
  // Company Categories
  { id: "Top AI-Driven Staffing Platform", label: "Top AI-Driven Staffing Platform", group: "technology", type: "company" },
  { id: "Top Digital Experience for Clients", label: "Top Digital Experience for Clients", group: "technology", type: "company" },
  { id: "Top Women-Led Staffing Firm", label: "Top Women-Led Staffing Firm", group: "diversity", type: "company" },
  { id: "Fastest Growing Staffing Firm", label: "Fastest Growing Staffing Firm", group: "growth", type: "company" },
  { id: "Best Staffing Process at Scale", label: "Best Staffing Process at Scale", group: "operations", type: "company" },
  { id: "Top Staffing Company - USA", label: "Top Staffing Company - USA", group: "regional", type: "company" },
  { id: "Top Staffing Company - Europe", label: "Top Staffing Company - Europe", group: "regional", type: "company" },
  { id: "Top AI-Driven Staffing Platform - USA", label: "Top AI-Driven Staffing Platform - USA", group: "regional-tech", type: "company" },
  { id: "Top AI-Driven Staffing Platform - Europe", label: "Top AI-Driven Staffing Platform - Europe", group: "regional-tech", type: "company" },
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