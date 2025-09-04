import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';
import { getSubcategoriesByType } from '@/lib/categories';

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

// Get valid categories from the constants file
const PERSON_CATEGORIES = getSubcategoriesByType('person').map(cat => cat.id);
const COMPANY_CATEGORIES = getSubcategoriesByType('company').map(cat => cat.id);

function isEmptyOrWhitespace(value: string | undefined | null): boolean {
  return !value || value.trim() === '';
}

function validateEmail(email: string): boolean {
  if (isEmptyOrWhitespace(email)) return false;
  const trimmedEmail = email.trim();
  
  // Allow example emails for templates
  if (trimmedEmail.includes('@example.com') || trimmedEmail.includes('@client.com') || 
      trimmedEmail.includes('@startup.com') || trimmedEmail.includes('@enterprise.com') ||
      trimmedEmail.includes('@fintech.com') || trimmedEmail.includes('@media.com') ||
      trimmedEmail.includes('@consulting.com') || trimmedEmail.includes('@multinational.com') ||
      trimmedEmail.includes('@staffingfirm.com') || trimmedEmail.includes('@healthcare.com') ||
      trimmedEmail.includes('@global.com') || trimmedEmail.includes('@international.com')) {
    return true;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmedEmail);
}

function validateURL(url: string): boolean {
  if (isEmptyOrWhitespace(url)) return false;
  const trimmedUrl = url.trim();
  
  // Allow example URLs for templates
  if (trimmedUrl.startsWith('https://example.com/')) {
    return true;
  }
  
  try {
    new URL(trimmedUrl);
    return true;
  } catch {
    // Also accept URLs that start with http:// or https://
    return /^https?:\/\/.+\..+/.test(trimmedUrl);
  }
}

function validatePersonRow(row: PersonCSVRow, rowNumber: number): ValidationError[] {
  const errors: ValidationError[] = [];

  // Required fields for person
  if (isEmptyOrWhitespace(row.first_name)) {
    errors.push({ field: 'first_name', message: 'First name is required' });
  }

  if (isEmptyOrWhitespace(row.last_name)) {
    errors.push({ field: 'last_name', message: 'Last name is required' });
  }

  if (isEmptyOrWhitespace(row.job_title)) {
    errors.push({ field: 'job_title', message: 'Job title is required' });
  }

  if (isEmptyOrWhitespace(row.email)) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!validateEmail(row.email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  if (isEmptyOrWhitespace(row.country)) {
    errors.push({ field: 'country', message: 'Country is required' });
  }

  if (isEmptyOrWhitespace(row.why_vote_for_me)) {
    errors.push({ field: 'why_vote_for_me', message: 'Why vote for me is required' });
  }

  if (isEmptyOrWhitespace(row.category)) {
    errors.push({ field: 'category', message: 'Category is required' });
  } else if (!PERSON_CATEGORIES.includes(row.category.trim())) {
    errors.push({ field: 'category', message: `Invalid person category. Must be one of: ${PERSON_CATEGORIES.join(', ')}` });
  }

  // Optional nominator validation (only if provided and not empty)
  if (!isEmptyOrWhitespace(row.nominator_email) && !validateEmail(row.nominator_email)) {
    errors.push({ field: 'nominator_email', message: 'Invalid nominator email format' });
  }

  // URL validation (only if provided and not empty)
  if (!isEmptyOrWhitespace(row.linkedin) && !validateURL(row.linkedin)) {
    errors.push({ field: 'linkedin', message: 'Invalid LinkedIn URL format' });
  }

  if (!isEmptyOrWhitespace(row.headshot_url) && !validateURL(row.headshot_url)) {
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
  if (isEmptyOrWhitespace(row.company_name)) {
    errors.push({ field: 'company_name', message: 'Company name is required' });
  }

  if (isEmptyOrWhitespace(row.email)) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!validateEmail(row.email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  if (isEmptyOrWhitespace(row.country)) {
    errors.push({ field: 'country', message: 'Country is required' });
  }

  if (isEmptyOrWhitespace(row.why_vote_for_me)) {
    errors.push({ field: 'why_vote_for_me', message: 'Why vote for me is required' });
  }

  if (isEmptyOrWhitespace(row.category)) {
    errors.push({ field: 'category', message: 'Category is required' });
  } else if (!COMPANY_CATEGORIES.includes(row.category.trim())) {
    errors.push({ field: 'category', message: `Invalid company category. Must be one of: ${COMPANY_CATEGORIES.join(', ')}` });
  }

  // Optional nominator validation (only if provided and not empty)
  if (!isEmptyOrWhitespace(row.nominator_email) && !validateEmail(row.nominator_email)) {
    errors.push({ field: 'nominator_email', message: 'Invalid nominator email format' });
  }

  // URL validation (only if provided and not empty)
  if (!isEmptyOrWhitespace(row.website) && !validateURL(row.website)) {
    errors.push({ field: 'website', message: 'Invalid website URL format' });
  }

  if (!isEmptyOrWhitespace(row.logo_url) && !validateURL(row.logo_url)) {
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

function parseCSV(csvText: string, expectedHeaders: string[]): any[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row');
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  
  // Validate headers
  const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
  if (missingHeaders.length > 0) {
    throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
  }

  const rows: any[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row: any = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    rows.push(row);
  }

  return rows;
}

function parsePersonCSV(csvText: string): PersonCSVRow[] {
  const expectedHeaders = [
    'first_name', 'last_name', 'job_title', 'company_name', 'email', 'phone', 
    'country', 'linkedin', 'bio', 'achievements', 'why_vote_for_me', 'headshot_url',
    'category', 'nominator_name', 'nominator_email', 'nominator_company', 
    'nominator_job_title', 'nominator_phone', 'nominator_country'
  ];

  return parseCSV(csvText, expectedHeaders) as PersonCSVRow[];
}

function parseCompanyCSV(csvText: string): CompanyCSVRow[] {
  const expectedHeaders = [
    'company_name', 'website', 'email', 'phone', 'country', 'industry', 
    'company_size', 'bio', 'achievements', 'why_vote_for_me', 'logo_url',
    'category', 'nominator_name', 'nominator_email', 'nominator_company', 
    'nominator_job_title', 'nominator_phone', 'nominator_country'
  ];

  return parseCSV(csvText, expectedHeaders) as CompanyCSVRow[];
}

async function createPersonNomination(
  row: PersonCSVRow, 
  batchId: string, 
  rowNumber: number
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Create or get nominator
    let nominator;
    if (!isEmptyOrWhitespace(row.nominator_email)) {
      const nominatorData = {
        email: row.nominator_email.trim().toLowerCase(),
        firstname: row.nominator_name?.trim() || 'Admin',
        lastname: 'User',
        linkedin: null,
        company: row.nominator_company?.trim() || null,
        job_title: row.nominator_job_title?.trim() || null,
        phone: row.nominator_phone?.trim() || null,
        country: row.nominator_country?.trim() || null
      };

      // Check if nominator exists
      const { data: existingNominator } = await supabase
        .from('nominators')
        .select('*')
        .eq('email', nominatorData.email)
        .single();

      if (existingNominator) {
        nominator = existingNominator;
      } else {
        // Create new nominator
        const { data: newNominator, error: nominatorError } = await supabase
          .from('nominators')
          .insert(nominatorData)
          .select()
          .single();

        if (nominatorError) throw nominatorError;
        nominator = newNominator;
      }
    } else {
      // Use default admin nominator
      const { data: adminNominator, error: adminError } = await supabase
        .from('nominators')
        .select('*')
        .eq('email', 'admin@worldstaffingawards.com')
        .single();

      if (adminError) {
        // Create admin nominator
        const { data: newAdmin, error: createAdminError } = await supabase
          .from('nominators')
          .insert({
            email: 'admin@worldstaffingawards.com',
            firstname: 'Admin',
            lastname: 'User',
            linkedin: null,
            company: 'World Staffing Awards',
            job_title: 'Administrator',
            phone: null,
            country: 'United States'
          })
          .select()
          .single();

        if (createAdminError) throw createAdminError;
        nominator = newAdmin;
      } else {
        nominator = adminNominator;
      }
    }

    // 2. Create nominee
    const nomineeData = {
      type: 'person',
      firstname: row.first_name?.trim() || '',
      lastname: row.last_name?.trim() || '',
      person_email: row.email?.trim() || '',
      person_linkedin: row.linkedin?.trim() || null,
      person_phone: row.phone?.trim() || null,
      jobtitle: row.job_title?.trim() || '',
      person_company: row.company_name?.trim() || null,
      person_country: row.country?.trim() || '',
      headshot_url: row.headshot_url?.trim() || null,
      why_me: row.why_vote_for_me?.trim() || '',
      bio: row.bio?.trim() || null,
      achievements: row.achievements?.trim() || null
    };

    const { data: nominee, error: nomineeError } = await supabase
      .from('nominees')
      .insert(nomineeData)
      .select()
      .single();

    if (nomineeError) throw nomineeError;

    // 3. Create nomination
    const nominationData = {
      nominator_id: nominator.id,
      nominee_id: nominee.id,
      category_group_id: 'role-specific', // Default category group
      subcategory_id: row.category?.trim() || '',
      state: 'submitted', // Use submitted instead of draft
      votes: 0
    };

    const { error: nominationError } = await supabase
      .from('nominations')
      .insert(nominationData);

    if (nominationError) throw nominationError;

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
    // 1. Create or get nominator
    let nominator;
    if (!isEmptyOrWhitespace(row.nominator_email)) {
      const nominatorData = {
        email: row.nominator_email.trim().toLowerCase(),
        firstname: row.nominator_name?.trim() || 'Admin',
        lastname: 'User',
        linkedin: null,
        company: row.nominator_company?.trim() || null,
        job_title: row.nominator_job_title?.trim() || null,
        phone: row.nominator_phone?.trim() || null,
        country: row.nominator_country?.trim() || null
      };

      // Check if nominator exists
      const { data: existingNominator } = await supabase
        .from('nominators')
        .select('*')
        .eq('email', nominatorData.email)
        .single();

      if (existingNominator) {
        nominator = existingNominator;
      } else {
        // Create new nominator
        const { data: newNominator, error: nominatorError } = await supabase
          .from('nominators')
          .insert(nominatorData)
          .select()
          .single();

        if (nominatorError) throw nominatorError;
        nominator = newNominator;
      }
    } else {
      // Use default admin nominator
      const { data: adminNominator, error: adminError } = await supabase
        .from('nominators')
        .select('*')
        .eq('email', 'admin@worldstaffingawards.com')
        .single();

      if (adminError) {
        // Create admin nominator
        const { data: newAdmin, error: createAdminError } = await supabase
          .from('nominators')
          .insert({
            email: 'admin@worldstaffingawards.com',
            firstname: 'Admin',
            lastname: 'User',
            linkedin: null,
            company: 'World Staffing Awards',
            job_title: 'Administrator',
            phone: null,
            country: 'United States'
          })
          .select()
          .single();

        if (createAdminError) throw createAdminError;
        nominator = newAdmin;
      } else {
        nominator = adminNominator;
      }
    }

    // 2. Create nominee
    const nomineeData = {
      type: 'company',
      company_name: row.company_name?.trim() || '',
      company_website: row.website?.trim() || null,
      company_phone: row.phone?.trim() || null,
      company_country: row.country?.trim() || '',
      company_size: row.company_size?.trim() || null,
      company_industry: row.industry?.trim() || null,
      logo_url: row.logo_url?.trim() || null,
      why_us: row.why_vote_for_me?.trim() || '',
      bio: row.bio?.trim() || null,
      achievements: row.achievements?.trim() || null
    };

    const { data: nominee, error: nomineeError } = await supabase
      .from('nominees')
      .insert(nomineeData)
      .select()
      .single();

    if (nomineeError) throw nomineeError;

    // 3. Create nomination
    const nominationData = {
      nominator_id: nominator.id,
      nominee_id: nominee.id,
      category_group_id: 'innovation-tech', // Default category group for companies
      subcategory_id: row.category?.trim() || '',
      state: 'submitted', // Use submitted instead of draft
      votes: 0
    };

    const { error: nominationError } = await supabase
      .from('nominations')
      .insert(nominationData);

    if (nominationError) throw nominationError;

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