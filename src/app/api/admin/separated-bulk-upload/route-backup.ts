import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

interface PersonCSVRow {
  first_name: string;
  last_name: string;
  job_title: string;
  company_name?: string;
  email: string;
  phone?: string;
  country: string;
  linkedin?: string;
  bio?: string;
  achievements?: string;
  why_vote_for_me: string;
  headshot_url?: string;
  category: string;
  nominator_name?: string;
  nominator_email?: string;
  nominator_company?: string;
  nominator_job_title?: string;
  nominator_phone?: string;
  nominator_country?: string;
}

interface CompanyCSVRow {
  company_name: string;
  website?: string;
  email: string;
  phone?: string;
  country: string;
  industry?: string;
  company_size?: string;
  bio?: string;
  achievements?: string;
  why_vote_for_me: string;
  logo_url?: string;
  category: string;
  nominator_name?: string;
  nominator_email?: string;
  nominator_company?: string;
  nominator_job_title?: string;
  nominator_phone?: string;
  nominator_country?: string;
}

interface ValidationError {
  field: string;
  message: string;
}

// Valid categories by type
const PERSON_CATEGORIES = [
  'top-recruiter',
  'top-executive-leader',
  'top-recruiting-leader-usa',
  'top-recruiter-usa',
  'top-recruiting-leader-europe',
  'top-recruiter-europe',
  'top-global-recruiter',
  'top-global-staffing-leader',
  'top-staffing-influencer',
  'top-thought-leader',
  'top-staffing-educator',
  'rising-star-under-30'
];

const COMPANY_CATEGORIES = [
  'top-staffing-company-usa',
  'top-staffing-company-europe',
  'top-global-staffing-company',
  'top-ai-driven-staffing-platform',
  'top-ai-driven-platform-usa',
  'top-ai-driven-platform-europe',
  'top-women-led-staffing-firm',
  'fastest-growing-staffing-firm',
  'top-digital-experience-for-clients',
  'best-staffing-podcast-or-show'
];

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function validatePersonRow(row: PersonCSVRow, rowNumber: number): ValidationError[] {
  const errors: ValidationError[] = [];

  // Required fields for person
  if (!row.first_name?.trim()) {
    errors.push({ field: 'first_name', message: 'First name is required' });
  }

  if (!row.last_name?.trim()) {
    errors.push({ field: 'last_name', message: 'Last name is required' });
  }

  if (!row.job_title?.trim()) {
    errors.push({ field: 'job_title', message: 'Job title is required' });
  }

  if (!row.email?.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!validateEmail(row.email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  if (!row.country?.trim()) {
    errors.push({ field: 'country', message: 'Country is required' });
  }

  if (!row.why_vote_for_me?.trim()) {
    errors.push({ field: 'why_vote_for_me', message: 'Why vote for me is required' });
  }

  if (!row.category?.trim()) {
    errors.push({ field: 'category', message: 'Category is required' });
  } else if (!PERSON_CATEGORIES.includes(row.category)) {
    errors.push({ field: 'category', message: `Invalid person category. Must be one of: ${PERSON_CATEGORIES.join(', ')}` });
  }

  // Optional nominator validation (if provided)
  if (row.nominator_email && row.nominator_email.trim() && !validateEmail(row.nominator_email)) {
    errors.push({ field: 'nominator_email', message: 'Invalid nominator email format' });
  }

  // URL validation (only if not empty)
  if (row.linkedin && row.linkedin.trim() && !validateURL(row.linkedin)) {
    errors.push({ field: 'linkedin', message: 'Invalid LinkedIn URL format' });
  }

  if (row.headshot_url && row.headshot_url.trim() && !validateURL(row.headshot_url)) {
    errors.push({ field: 'headshot_url', message: 'Invalid headshot URL format' });
  }

  // Length validation
  if (row.why_vote_for_me && row.why_vote_for_me.length > 1000) {
    errors.push({ field: 'why_vote_for_me', message: 'Why vote for me must be less than 1000 characters' });
  }

  if (row.bio && row.bio.length > 2000) {
    errors.push({ field: 'bio', message: 'Bio must be less than 2000 characters' });
  }

  if (row.achievements && row.achievements.length > 2000) {
    errors.push({ field: 'achievements', message: 'Achievements must be less than 2000 characters' });
  }

  return errors;
}

function validateCompanyRow(row: CompanyCSVRow, rowNumber: number): ValidationError[] {
  const errors: ValidationError[] = [];

  // Required fields for company
  if (!row.company_name?.trim()) {
    errors.push({ field: 'company_name', message: 'Company name is required' });
  }

  if (!row.email?.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!validateEmail(row.email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  if (!row.country?.trim()) {
    errors.push({ field: 'country', message: 'Country is required' });
  }

  if (!row.why_vote_for_me?.trim()) {
    errors.push({ field: 'why_vote_for_me', message: 'Why vote for me is required' });
  }

  if (!row.category?.trim()) {
    errors.push({ field: 'category', message: 'Category is required' });
  } else if (!COMPANY_CATEGORIES.includes(row.category)) {
    errors.push({ field: 'category', message: `Invalid company category. Must be one of: ${COMPANY_CATEGORIES.join(', ')}` });
  }

  // Optional nominator validation (if provided)
  if (row.nominator_email && row.nominator_email.trim() && !validateEmail(row.nominator_email)) {
    errors.push({ field: 'nominator_email', message: 'Invalid nominator email format' });
  }

  // URL validation
  if (row.website && row.website.trim() && !validateURL(row.website)) {
    errors.push({ field: 'website', message: 'Invalid website URL format' });
  }

  if (row.logo_url && row.logo_url.trim() && !validateURL(row.logo_url)) {
    errors.push({ field: 'logo_url', message: 'Invalid logo URL format' });
  }

  // Length validation
  if (row.why_vote_for_me && row.why_vote_for_me.length > 1000) {
    errors.push({ field: 'why_vote_for_me', message: 'Why vote for me must be less than 1000 characters' });
  }

  if (row.bio && row.bio.length > 2000) {
    errors.push({ field: 'bio', message: 'Bio must be less than 2000 characters' });
  }

  if (row.achievements && row.achievements.length > 2000) {
    errors.push({ field: 'achievements', message: 'Achievements must be less than 2000 characters' });
  }

  return errors;
}

function parsePersonCSV(csvText: string): PersonCSVRow[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row');
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const expectedHeaders = [
    'first_name', 'last_name', 'job_title', 'company_name', 'email', 'phone', 
    'country', 'linkedin', 'bio', 'achievements', 'why_vote_for_me', 'headshot_url',
    'category', 'nominator_name', 'nominator_email', 'nominator_company', 
    'nominator_job_title', 'nominator_phone', 'nominator_country'
  ];

  // Validate headers
  const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
  if (missingHeaders.length > 0) {
    throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
  }

  const rows: PersonCSVRow[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    const row: any = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    rows.push(row as PersonCSVRow);
  }

  return rows;
}

function parseCompanyCSV(csvText: string): CompanyCSVRow[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row');
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const expectedHeaders = [
    'company_name', 'website', 'email', 'phone', 'country', 'industry', 
    'company_size', 'bio', 'achievements', 'why_vote_for_me', 'logo_url',
    'category', 'nominator_name', 'nominator_email', 'nominator_company', 
    'nominator_job_title', 'nominator_phone', 'nominator_country'
  ];

  // Validate headers
  const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
  if (missingHeaders.length > 0) {
    throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
  }

  const rows: CompanyCSVRow[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    const row: any = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    rows.push(row as CompanyCSVRow);
  }

  return rows;
}

async function createPersonNomination(
  row: PersonCSVRow, 
  batchId: string, 
  rowNumber: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const nominationId = uuidv4();
    
    // Prepare nominee data
    const nomineeData = {
      type: 'person',
      firstName: row.first_name,
      lastName: row.last_name,
      displayName: `${row.first_name} ${row.last_name}`,
      jobTitle: row.job_title,
      email: row.email,
      phone: row.phone || '',
      country: row.country,
      linkedin: row.linkedin || '',
      bio: row.bio || '',
      achievements: row.achievements || '',
      whyVoteForMe: row.why_vote_for_me,
      headshotUrl: row.headshot_url || ''
    };

    // Prepare company data (if provided)
    const companyData = row.company_name ? {
      name: row.company_name,
      companyName: row.company_name
    } : null;

    // Prepare nominator data (if provided)
    const nominatorData = (row.nominator_name || row.nominator_email) ? {
      name: row.nominator_name || '',
      email: row.nominator_email || '',
      company: row.nominator_company || '',
      jobTitle: row.nominator_job_title || '',
      phone: row.nominator_phone || '',
      country: row.nominator_country || ''
    } : null;

    // Generate unique key
    const uniqueKey = `${row.first_name}-${row.last_name}-${row.category}-${Date.now()}`.toLowerCase();

    // Insert nomination in draft status
    const { error } = await supabase
      .from('nominations')
      .insert({
        id: nominationId,
        category: row.category,
        type: 'person',
        nominee_data: nomineeData,
        company_data: companyData,
        nominator_data: nominatorData,
        why_nominated: `Bulk uploaded person nomination for ${row.first_name} ${row.last_name}`,
        why_vote_for_me: row.why_vote_for_me,
        unique_key: uniqueKey,
        state: 'draft', // Draft status for manual approval
        upload_source: 'separated_bulk_upload',
        bulk_upload_batch_id: batchId,
        bulk_upload_row_number: rowNumber,
        uploaded_by: 'admin',
        uploaded_at: new Date().toISOString(),
        image_url: row.headshot_url || null
      });

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error creating person nomination:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

async function createCompanyNomination(
  row: CompanyCSVRow, 
  batchId: string, 
  rowNumber: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const nominationId = uuidv4();
    
    // Prepare nominee data
    const nomineeData = {
      type: 'company',
      name: row.company_name,
      companyName: row.company_name,
      displayName: row.company_name,
      website: row.website || '',
      email: row.email,
      phone: row.phone || '',
      country: row.country,
      industry: row.industry || '',
      size: row.company_size || '',
      bio: row.bio || '',
      achievements: row.achievements || '',
      whyVoteForMe: row.why_vote_for_me,
      logoUrl: row.logo_url || ''
    };

    // Prepare nominator data (if provided)
    const nominatorData = (row.nominator_name || row.nominator_email) ? {
      name: row.nominator_name || '',
      email: row.nominator_email || '',
      company: row.nominator_company || '',
      jobTitle: row.nominator_job_title || '',
      phone: row.nominator_phone || '',
      country: row.nominator_country || ''
    } : null;

    // Generate unique key
    const uniqueKey = `${row.company_name}-${row.category}-${Date.now()}`.toLowerCase();

    // Insert nomination in draft status
    const { error } = await supabase
      .from('nominations')
      .insert({
        id: nominationId,
        category: row.category,
        type: 'company',
        nominee_data: nomineeData,
        company_data: null, // Company data is in nominee_data for company nominations
        nominator_data: nominatorData,
        why_nominated: `Bulk uploaded company nomination for ${row.company_name}`,
        why_vote_for_me: row.why_vote_for_me,
        unique_key: uniqueKey,
        state: 'draft', // Draft status for manual approval
        upload_source: 'separated_bulk_upload',
        bulk_upload_batch_id: batchId,
        bulk_upload_row_number: rowNumber,
        uploaded_by: 'admin',
        uploaded_at: new Date().toISOString(),
        image_url: row.logo_url || null
      });

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error creating company nomination:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as 'person' | 'company';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!type || !['person', 'company'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid type. Must be "person" or "company"' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return NextResponse.json(
        { success: false, error: 'File must be a CSV' },
        { status: 400 }
      );
    }

    // Read file content
    const csvText = await file.text();
    
    // Parse CSV based on type
    let rows: (PersonCSVRow | CompanyCSVRow)[];
    try {
      if (type === 'person') {
        rows = parsePersonCSV(csvText);
      } else {
        rows = parseCompanyCSV(csvText);
      }
    } catch (error) {
      return NextResponse.json(
        { success: false, error: error instanceof Error ? error.message : 'Invalid CSV format' },
        { status: 400 }
      );
    }

    // Create batch record
    const batchId = uuidv4();
    const { error: batchError } = await supabase
      .from('separated_bulk_upload_batches')
      .insert({
        id: batchId,
        filename: file.name,
        upload_type: type,
        total_rows: rows.length,
        uploaded_by: 'admin',
        status: 'processing'
      });

    if (batchError) {
      throw batchError;
    }

    // Process each row
    let successfulRows = 0;
    let failedRows = 0;
    let draftRows = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // +2 because CSV is 1-indexed and we skip header

      // Validate row based on type
      const validationErrors = type === 'person' 
        ? validatePersonRow(row as PersonCSVRow, rowNumber)
        : validateCompanyRow(row as CompanyCSVRow, rowNumber);
      
      if (validationErrors.length > 0) {
        failedRows++;
        
        // Store errors in database
        for (const validationError of validationErrors) {
          await supabase
            .from('separated_bulk_upload_errors')
            .insert({
              batch_id: batchId,
              row_number: rowNumber,
              field_name: validationError.field,
              error_message: validationError.message,
              raw_data: row
            });
        }

        continue;
      }

      // Create nomination based on type
      const result = type === 'person'
        ? await createPersonNomination(row as PersonCSVRow, batchId, rowNumber)
        : await createCompanyNomination(row as CompanyCSVRow, batchId, rowNumber);
      
      if (result.success) {
        successfulRows++;
        draftRows++; // All successful uploads go to draft
      } else {
        failedRows++;
        
        // Store error
        await supabase
          .from('separated_bulk_upload_errors')
          .insert({
            batch_id: batchId,
            row_number: rowNumber,
            error_message: result.error || 'Unknown error',
            raw_data: row
          });
      }
    }

    // Update batch status
    const batchStatus = failedRows === rows.length ? 'failed' : 'completed';
    await supabase
      .from('separated_bulk_upload_batches')
      .update({
        processed_rows: rows.length,
        successful_rows: successfulRows,
        failed_rows: failedRows,
        draft_rows: draftRows,
        approved_rows: 0,
        status: batchStatus,
        completed_at: new Date().toISOString(),
        error_summary: failedRows > 0 ? `${failedRows} rows failed validation` : null
      })
      .eq('id', batchId);

    return NextResponse.json({
      success: true,
      data: {
        batch_id: batchId,
        upload_type: type,
        total_rows: rows.length,
        successful_rows: successfulRows,
        failed_rows: failedRows,
        draft_rows: draftRows,
        status: batchStatus
      }
    });

  } catch (error) {
    console.error('Separated bulk upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      },
      { status: 500 }
    );
  }
}