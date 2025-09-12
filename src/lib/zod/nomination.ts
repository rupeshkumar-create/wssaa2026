import { z } from 'zod';

// Helper function to normalize LinkedIn URLs
const normalizeLinkedIn = (url: string, type: 'person' | 'company') => {
  if (!url) return url;
  
  const cleanUrl = url.trim().toLowerCase();
  
  if (type === 'person') {
    // Person LinkedIn should be /in/username
    if (cleanUrl.includes('/in/')) {
      return cleanUrl;
    }
    // Try to extract username and format properly
    const match = cleanUrl.match(/linkedin\.com\/(?:in\/)?([^\/\?]+)/);
    if (match) {
      return `https://linkedin.com/in/${match[1]}`;
    }
  } else {
    // Company LinkedIn should be /company/name
    if (cleanUrl.includes('/company/')) {
      return cleanUrl;
    }
    // Try to extract company name and format properly
    const match = cleanUrl.match(/linkedin\.com\/(?:company\/)?([^\/\?]+)/);
    if (match) {
      return `https://linkedin.com/company/${match[1]}`;
    }
  }
  
  return url;
};

// Nominator schema - simplified to match actual form fields
export const NominatorSchema = z.object({
  email: z.string().email().transform(email => email.toLowerCase()),
  firstname: z.string().min(1),
  lastname: z.string().min(1),
  linkedin: z.string().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
  yearsInIndustry: z.string().optional(),
  relationshipToNominee: z.string().optional(),
  nominatedDisplayName: z.string().optional()
});

// Person nominee schema - simplified to match actual form fields
export const PersonNomineeSchema = z.object({
  firstname: z.string().min(1),
  lastname: z.string().min(1),
  jobtitle: z.string().min(1),
  email: z.string().email().optional().transform(email => email ? email.toLowerCase() : ''),
  linkedin: z.string().optional().transform(url => url ? normalizeLinkedIn(url, 'person') : ''),
  phone: z.string().optional(),
  company: z.string().optional(),
  country: z.string().optional(),
  headshotUrl: z.string().optional(), // Made optional for admin nominations
  whyMe: z.string().min(1),
  liveUrl: z.string().optional(),
  bio: z.string().optional(),
  achievements: z.string().optional(),
  yearsOfExperience: z.string().optional(),
  industrySpecialization: z.string().optional(),
  education: z.string().optional(),
  certifications: z.string().optional(),
  languages: z.string().optional()
});

// Company nominee schema - simplified to match actual form fields
export const CompanyNomineeSchema = z.object({
  name: z.string().min(1),
  domain: z.string().optional(),
  website: z.string().min(1, "Company website is required"),
  linkedin: z.string().optional().transform(url => url ? normalizeLinkedIn(url, 'company') : ''),
  phone: z.string().optional(),
  country: z.string().optional(),
  size: z.string().optional(),
  industry: z.string().optional(),
  logoUrl: z.string().optional(), // Made optional for admin nominations
  whyUs: z.string().min(1),
  liveUrl: z.string().optional(),
  bio: z.string().optional(),
  achievements: z.string().optional(),
  foundedYear: z.string().optional(),
  headquarters: z.string().optional(),
  keyServices: z.string().optional(),
  clientTypes: z.string().optional(),
  awards: z.string().optional(),
  contactEmail: z.string().optional().transform(email => email ? email.toLowerCase() : ''),
  contactPerson: z.string().optional()
});

// Nomination submit schema
export const NominationSubmitSchema = z.object({
  type: z.enum(['person', 'company']),
  categoryGroupId: z.string().min(1),
  subcategoryId: z.string().min(1),
  nominator: NominatorSchema,
  nominee: z.union([PersonNomineeSchema, CompanyNomineeSchema])
});

// Nomination approve schema
export const NominationApproveSchema = z.object({
  nominationId: z.string().uuid(),
  action: z.enum(['approve', 'reject']).optional(),
  adminNotes: z.string().optional(),
  rejectionReason: z.string().optional(),
  liveUrl: z.string().url().optional()
});

// Types
export type NominatorInput = z.infer<typeof NominatorSchema>;
export type PersonNomineeInput = z.infer<typeof PersonNomineeSchema>;
export type CompanyNomineeInput = z.infer<typeof CompanyNomineeSchema>;
export type NominationSubmitInput = z.infer<typeof NominationSubmitSchema>;
export type NominationApproveInput = z.infer<typeof NominationApproveSchema>;