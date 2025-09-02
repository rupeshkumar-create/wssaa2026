import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/settings - Get public system settings
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching settings from database...');
    
    // Check if Supabase is configured
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('⚠️ Supabase not configured, returning defaults');
      throw new Error('Supabase not configured');
    }

    const { data: settings, error } = await supabase
      .from('app_settings')
      .select('setting_key, setting_value, boolean_value')
      .in('setting_key', ['nominations_enabled', 'nominations_open', 'nominations_close_message']);

    if (error) {
      console.error('❌ Database error:', error);
      throw error;
    }

    console.log('✅ Settings fetched:', settings);

    // Convert to key-value object
    const settingsObject = settings.reduce((acc, setting) => {
      acc[setting.setting_key] = setting.boolean_value !== null 
        ? setting.boolean_value 
        : setting.setting_value;
      return acc;
    }, {} as Record<string, any>);

    // Check both nominations_enabled and nominations_open for backward compatibility
    const nominationsEnabled = settingsObject.nominations_enabled === true || 
                              settingsObject.nominations_enabled === 'true' ||
                              settingsObject.nominations_open === true ||
                              settingsObject.nominations_open === 'true';

    return NextResponse.json({
      success: true,
      settings: settingsObject,
      nominations_enabled: nominationsEnabled,
      nominations_close_message: settingsObject.nominations_close_message || 'Nominations are currently closed.'
    });

  } catch (error) {
    console.error('GET /api/settings error:', error);
    
    // Return default values if database is not available
    // IMPORTANT: Default to nominations DISABLED for safety
    return NextResponse.json({
      success: false,
      settings: {
        nominations_enabled: false, // Default to DISABLED if can't check
        nominations_close_message: 'Thank you for your interest! Nominations are now closed. Please vote for your favorite nominees.'
      },
      nominations_enabled: false, // Default to DISABLED
      nominations_close_message: 'Thank you for your interest! Nominations are now closed. Please vote for your favorite nominees.',
      error: 'Could not fetch settings from database'
    });
  }
}