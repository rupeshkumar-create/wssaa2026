import { NextRequest, NextResponse } from "next/server";
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from "@/lib/constants";
import { uploadImage, generateStoragePath, getFileExtension } from "@/lib/supabase/storage";
import crypto from "crypto";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30; // 30 seconds timeout

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Parse form data with timeout
    const formData = await Promise.race([
      request.formData(),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Form data parsing timeout')), 10000)
      )
    ]);

    const file = formData.get('file') as File;
    const kind = (formData.get('kind') as string) || 'headshot';
    const slug = formData.get('slug') as string;
    const nomineeId = formData.get('nomineeId') as string;

    // Quick validation
    if (!file) {
      return NextResponse.json({ ok: false, error: 'No file provided' }, { status: 400 });
    }

    if (!['headshot', 'logo'].includes(kind)) {
      return NextResponse.json({ ok: false, error: 'Invalid kind. Must be headshot or logo' }, { status: 400 });
    }

    // Fast file validation
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Upload JPG, PNG, or SVG only' 
      }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Max 5MB' 
      }, { status: 400 });
    }

    // Generate storage path quickly
    const name = slug ?? nomineeId ?? crypto.randomUUID();
    const fileExtension = getFileExtension(file.type);
    const storagePath = generateStoragePath(kind as 'headshot' | 'logo', name, fileExtension);

    console.log(`Upload processing time: ${Date.now() - startTime}ms`);

    // Upload to Supabase Storage with timeout
    const uploadResult = await Promise.race([
      uploadImage({
        file,
        bucket: 'images',
        path: storagePath,
        upsert: true
      }),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Upload timeout')), 25000)
      )
    ]);

    if (!uploadResult.success) {
      return NextResponse.json({ 
        ok: false, 
        error: uploadResult.error || 'Upload failed' 
      }, { status: 500 });
    }

    console.log(`Total upload time: ${Date.now() - startTime}ms`);

    return NextResponse.json({
      ok: true,
      url: uploadResult.url,
      path: uploadResult.path
    });

  } catch (error) {
    console.error('Image upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    
    return NextResponse.json({ 
      ok: false, 
      error: errorMessage.includes('timeout') ? 'Upload timeout - please try again' : 'Upload failed'
    }, { status: 500 });
  }
}