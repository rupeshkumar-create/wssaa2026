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

    // Try system_settings table first (used by admin panel)
    let { data: settings, error } = await supabase
      .from('system_settings')
      .select('setting_key, setting_value')
      .in('setting_key', ['voting_start_date', 'voting_end_date', 'nominations_enabled']);

    // If system_settings doesn't exist or is empty, try app_settings for backward compatibility
    if (error || !settings || settings.length === 0) {
      console.log('⚠️ Trying app_settings table for backward compatibility...');
      const { data: appSettings, error: appError } = await supabase
        .from('app_settings')
        .select('setting_key, setting_value, boolean_value')
        .in('setting_key', ['voting_start_date', 'voting_end_date', 'nominations_enabled']);

      if (appError) {
        console.error('❌ Database error:', appError);
        throw appError;
      }

      settings = appSettings?.map(setting => ({
        setting_key: setting.setting_key,
        setting_value: setting.boolean_value !== null ? String(setting.boolean_value) : setting.setting_value
      })) || [];
    }

    console.log('✅ Settings fetched:', settings);

    // Convert to key-value object
    const settingsObject = settings.reduce((acc, setting) => {
      acc[setting.setting_key] = setting.setting_value;
      return acc;
    }, {} as Record<string, any>);

    const votingStartDate = settingsObject.voting_start_date || '';
    const votingEndDate = settingsObject.voting_end_date || '';
    const nominationsEnabled = settingsObject.nominations_enabled === 'true';

    return NextResponse.json({
      success: true,
      settings: settingsObject,
      voting_start_date: votingStartDate,
      voting_end_date: votingEndDate,
      nominations_enabled: nominationsEnabled
    });

  } catch (error) {
    console.error('GET /api/settings error:', error);
    
    // Return default values if database is not available
    return NextResponse.json({
      success: false,
      settings: {
        voting_start_date: '',
        voting_end_date: '',
        nominations_enabled: true
      },
      voting_start_date: '',
      voting_end_date: '',
      nominations_enabled: true,
      error: 'Could not fetch settings from database'
    });
  }
}