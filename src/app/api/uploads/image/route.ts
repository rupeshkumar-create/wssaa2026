import { NextRequest, NextResponse } from "next/server";
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from "@/lib/constants";
import crypto from "crypto";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Helper function to get file extension from MIME type
function getFileExtension(mimeType: string): string {
  const extensions: { [key: string]: string } = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/svg+xml': 'svg'
  };
  return extensions[mimeType] || 'jpg';
}

// Local image upload function
async function uploadImageLocally(file: File, fileName: string): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Save file
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, buffer);
    
    // Return public URL
    const publicUrl = `/uploads/${fileName}`;
    
    return {
      success: true,
      url: publicUrl
    };
  } catch (error) {
    console.error('Local upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const nominationId = formData.get('nominationId') as string;
    const type = formData.get('type') as string;

    // Validation
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Please upload JPG, PNG, or SVG only' 
      }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 5MB' 
      }, { status: 400 });
    }

    // Generate unique filename
    const fileExtension = getFileExtension(file.type);
    const timestamp = Date.now();
    const randomId = crypto.randomBytes(8).toString('hex');
    const fileName = `${type || 'image'}-${nominationId || randomId}-${timestamp}.${fileExtension}`;

    // Upload file locally
    const uploadResult = await uploadImageLocally(file, fileName);

    if (!uploadResult.success) {
      return NextResponse.json({ 
        error: uploadResult.error || 'Upload failed' 
      }, { status: 500 });
    }

    // Update the local nominations.json file with the new image URL
    if (nominationId) {
      try {
        const fs = require('fs');
        const path = require('path');
        
        const dataPath = path.join(process.cwd(), 'data', 'nominations.json');
        if (fs.existsSync(dataPath)) {
          const rawData = fs.readFileSync(dataPath, 'utf8');
          const nominations = JSON.parse(rawData);
          
          // Find and update the nomination
          const nominationIndex = nominations.findIndex((nom: any) => nom.id === nominationId);
          if (nominationIndex !== -1) {
            nominations[nominationIndex].nominee.imageUrl = uploadResult.url;
            nominations[nominationIndex].updatedAt = new Date().toISOString();
            
            // Save updated data
            fs.writeFileSync(dataPath, JSON.stringify(nominations, null, 2));
          }
        }
      } catch (error) {
        console.error('Error updating nominations file:', error);
        // Don't fail the upload if we can't update the file
      }
    }

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      message: 'Image uploaded successfully'
    });

  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}