import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// In-memory fallback state when running without live Supabase
let inMemoryConfig = {
  ai_user_receipt_ocr: true,
  ai_staff_intake_precheck: true,
};

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(inMemoryConfig);
  }

  try {
    const { data, error } = await supabase
      .from('system_config')
      .select('config_key, config_value');

    if (error || !data) {
      return NextResponse.json(inMemoryConfig);
    }

    const config = { ...inMemoryConfig };
    data.forEach((row: any) => {
      if (row.config_key === 'ai_user_receipt_ocr') {
        config.ai_user_receipt_ocr = Boolean(row.config_value?.enabled);
      }
      if (row.config_key === 'ai_staff_intake_precheck') {
        config.ai_staff_intake_precheck = Boolean(row.config_value?.enabled);
      }
    });

    return NextResponse.json(config);
  } catch {
    return NextResponse.json(inMemoryConfig);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { key, enabled } = body;

    if (!key || typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Key and enabled boolean are required.' },
        { status: 400 }
      );
    }

    if (key === 'ai_user_receipt_ocr') {
      inMemoryConfig.ai_user_receipt_ocr = enabled;
    } else if (key === 'ai_staff_intake_precheck') {
      inMemoryConfig.ai_staff_intake_precheck = enabled;
    }

    if (isSupabaseConfigured()) {
      await supabase.from('system_config').upsert({
        config_key: key,
        config_value: { enabled },
        updated_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      config: inMemoryConfig,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to update config' },
      { status: 500 }
    );
  }
}
