import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('summit_banners')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Summit banners fetch error:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch summit banners' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: data || [] 
    });
  } catch (error) {
    console.error('Summit banners API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, image_url, link_url } = body;

    if (!title || !description || !image_url || !link_url) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Deactivate existing banners first (only one active at a time)
    await supabase
      .from('summit_banners')
      .update({ is_active: false })
      .eq('is_active', true);

    // Create new banner
    const { data, error } = await supabase
      .from('summit_banners')
      .insert({
        title,
        description,
        image_url,
        link_url,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Summit banner creation error:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create summit banner' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data 
    });
  } catch (error) {
    console.error('Summit banner POST error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, description, image_url, link_url, is_active } = body;

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Banner ID is required' 
      }, { status: 400 });
    }

    // If activating this banner, deactivate others first
    if (is_active === true) {
      await supabase
        .from('summit_banners')
        .update({ is_active: false })
        .neq('id', id);
    }

    const updateData: any = { updated_at: new Date().toISOString() };
    
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (link_url !== undefined) updateData.link_url = link_url;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data, error } = await supabase
      .from('summit_banners')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Summit banner update error:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to update summit banner' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data 
    });
  } catch (error) {
    console.error('Summit banner PUT error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Banner ID is required' 
      }, { status: 400 });
    }

    const { error } = await supabase
      .from('summit_banners')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Summit banner deletion error:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to delete summit banner' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true 
    });
  } catch (error) {
    console.error('Summit banner DELETE error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}