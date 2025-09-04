import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { validateAdminAuth, createAuthErrorResponse } from '@/lib/auth/admin';
import { CATEGORIES } from '@/lib/constants';

export const dynamic = 'force-dynamic';

interface SimpleCSVRow {
  type: 'person' | 'company';
  category: string;
  name: string;
  email: string;
  company?: string;
  country?: string;
  nominator_name: string;
  nominator_email: string;
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function parseSimpleCSV(csvText: string): SimpleCSVRow[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row');
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const requiredHeaders = ['type', 'category', 'name', 'email', 'nominator_name', 'nominator_email'];

  // Check for required headers
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
  if (missingHeaders.length > 0) {
    throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
  }

  const rows: SimpleCSVRow[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    const row: any = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    rows.push(row as SimpleCSVRow);
  }

  return rows;
}

function validateSimpleRow(row: SimpleCSVRow, rowNumber: number): string[] {
  const errors: string[] = [];

  // Required field validation
  if (!row.type) {
    errors.push(`Row ${rowNumber}: Type is required`);
  } else if (!['person', 'company'].includes(row.type)) {
    errors.push(`Row ${rowNumber}: Type must be "person" or "company"`);
  }

  if (!row.category) {
    errors.push(`Row ${rowNumber}: Category is required`);
  } else {
    const validCategory = CATEGORIES.find(c => c.id === row.category);
    if (!validCategory) {
      errors.push(`Row ${rowNumber}: Invalid category "${row.category}"`);
    }
  }

  if (!row.name) {
    errors.push(`Row ${rowNumber}: Name is required`);
  }

  if (!row.email) {
    errors.push(`Row ${rowNumber}: Email is required`);
  } else if (!validateEmail(row.email)) {
    errors.push(`Row ${rowNumber}: Invalid email format`);
  }

  if (!row.nominator_name) {
    errors.push(`Row ${rowNumber}: Nominator name is required`);
  }

  if (!row.nominator_email) {
    errors.push(`Row ${rowNumber}: Nominator email is required`);
  } else if (!validateEmail(row.nominator_email)) {
    errors.push(`Row ${rowNumber}: Invalid nominator email format`);
  }

  return errors;
}

async function createSimpleNomination(row: SimpleCSVRow): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Create or get nominator
    const { data: existingNominator } = await supabase
      .from('nominators')
      .select('id')
      .eq('email', row.nominator_email.toLowerCase())
      .single();

    let nominatorId;
    if (existingNominator) {
      nominatorId = existingNominator.id;
    } else {
      const nameParts = row.nominator_name.split(' ');
      const { data: newNominator, error: nominatorError } = await supabase
        .from('nominators')
        .insert({
          email: row.nominator_email.toLowerCase(),
          firstname: nameParts[0] || '',
          lastname: nameParts.slice(1).join(' ') || '',
          company: row.company || null,
          country: row.country || null
        })
        .select('id')
        .single();

      if (nominatorError) throw nominatorError;
      nominatorId = newNominator.id;
    }

    // 2. Create nominee
    const nomineeData: any = {
      type: row.type
    };

    if (row.type === 'person') {
      const nameParts = row.name.split(' ');
      nomineeData.firstname = nameParts[0] || '';
      nomineeData.lastname = nameParts.slice(1).join(' ') || '';
      nomineeData.person_email = row.email;
      nomineeData.person_company = row.company || null;
      nomineeData.person_country = row.country || null;
    } else {
      nomineeData.company_name = row.name;
      nomineeData.company_email = row.email;
      nomineeData.company_country = row.country || null;
    }

    const { data: nominee, error: nomineeError } = await supabase
      .from('nominees')
      .insert(nomineeData)
      .select('id')
      .single();

    if (nomineeError) throw nomineeError;

    // 3. Get category group for the category
    const categoryConfig = CATEGORIES.find(c => c.id === row.category);
    const categoryGroupId = categoryConfig?.group || 'unknown';

    // 4. Create nomination
    const { error: nominationError } = await supabase
      .from('nominations')
      .insert({
        nominator_id: nominatorId,
        nominee_id: nominee.id,
        category_group_id: categoryGroupId,
        subcategory_id: row.category,
        state: 'submitted', // Start as submitted for testing
        votes: 0
      });

    if (nominationError) throw nominationError;

    return { success: true };
  } catch (error) {
    console.error('Error creating simple nomination:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function POST(request: NextRequest) {
  // Validate admin authentication
  if (!validateAdminAuth(request)) {
    return createAuthErrorResponse();
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
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

    // Read and parse CSV
    const csvText = await file.text();
    let rows: SimpleCSVRow[];
    
    try {
      rows = parseSimpleCSV(csvText);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: error instanceof Error ? error.message : 'Invalid CSV format' },
        { status: 400 }
      );
    }

    // Validate all rows first
    const allErrors: string[] = [];
    for (let i = 0; i < rows.length; i++) {
      const rowErrors = validateSimpleRow(rows[i], i + 2); // +2 for 1-indexed + header
      allErrors.push(...rowErrors);
    }

    // If there are validation errors, return them
    if (allErrors.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        data: {
          total: rows.length,
          successful: 0,
          failed: rows.length,
          errors: allErrors
        }
      });
    }

    // Process each row
    let successful = 0;
    let failed = 0;
    const processingErrors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const result = await createSimpleNomination(row);
      
      if (result.success) {
        successful++;
      } else {
        failed++;
        processingErrors.push(`Row ${i + 2}: ${result.error}`);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        total: rows.length,
        successful,
        failed,
        errors: processingErrors
      }
    });

  } catch (error) {
    console.error('Simple bulk upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      },
      { status: 500 }
    );
  }
}