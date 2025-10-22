import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth, createAuthErrorResponse } from '@/lib/auth/admin';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/update-local-nomination - Update local JSON file with nomination changes
 */
export async function POST(request: NextRequest) {
  // Validate admin authentication
  if (!validateAdminAuth(request)) {
    return createAuthErrorResponse();
  }

  try {
    const { nominationId, updates } = await request.json();

    if (!nominationId) {
      return NextResponse.json(
        { error: 'Missing nominationId' },
        { status: 400 }
      );
    }

    // Load and update the local nominations file
    const fs = require('fs');
    const path = require('path');
    
    const dataPath = path.join(process.cwd(), 'data', 'nominations.json');
    
    if (!fs.existsSync(dataPath)) {
      return NextResponse.json(
        { error: 'Nominations data file not found' },
        { status: 404 }
      );
    }

    // Read current data
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const nominations = JSON.parse(rawData);
    
    // Find the nomination to update
    const nominationIndex = nominations.findIndex((nom: any) => nom.id === nominationId);
    
    if (nominationIndex === -1) {
      return NextResponse.json(
        { error: 'Nomination not found' },
        { status: 404 }
      );
    }

    const nomination = nominations[nominationIndex];
    const now = new Date().toISOString();

    // Apply updates
    if (updates.linkedin !== undefined) {
      nomination.nominee.linkedin = updates.linkedin;
    }
    
    if (updates.whyMe !== undefined || updates.whyUs !== undefined) {
      nomination.whyVoteForMe = updates.whyMe || updates.whyUs;
    }
    
    if (updates.headshotUrl !== undefined) {
      nomination.nominee.imageUrl = updates.headshotUrl;
    }
    
    if (updates.logoUrl !== undefined) {
      nomination.nominee.imageUrl = updates.logoUrl;
    }
    
    if (updates.liveUrl !== undefined) {
      nomination.liveUrl = updates.liveUrl;
    }

    if (updates.adminNotes !== undefined) {
      nomination.adminNotes = updates.adminNotes;
    }

    if (updates.rejectionReason !== undefined) {
      nomination.rejectionReason = updates.rejectionReason;
    }

    // Update timestamp
    nomination.updatedAt = now;

    // Write back to file
    fs.writeFileSync(dataPath, JSON.stringify(nominations, null, 2));

    console.log(`✅ Updated local nomination ${nominationId} with changes:`, Object.keys(updates));

    return NextResponse.json({
      success: true,
      message: 'Local nomination data updated successfully',
      updatedFields: Object.keys(updates),
      timestamp: now
    });

  } catch (error) {
    console.error('POST /api/admin/update-local-nomination error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update local nomination' },
      { status: 500 }
    );
  }
}