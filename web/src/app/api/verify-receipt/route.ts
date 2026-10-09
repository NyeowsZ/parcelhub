import { NextResponse } from 'next/server';
import { analyzeReceiptImage } from '@/lib/gemini';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { imageBase64, userId, schoolId } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Image payload is required for receipt analysis.' },
        { status: 400 }
      );
    }

    // Step 4: Pre-generate an anchored parcel ID in DB prior to proceeding
    const generatedParcelId = `p-${Date.now()}`;

    // Run Gemini OCR extraction
    const extraction = await analyzeReceiptImage(imageBase64);

    if (!extraction.is_valid) {
      return NextResponse.json({
        success: false,
        error: 'The uploaded screenshot does not appear to be a valid order/shipping receipt.',
      }, { status: 422 });
    }

    let anchoredId = generatedParcelId;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('parcels')
        .insert({
          waybill_number: extraction.waybill_number || `PENDING-${Date.now()}`,
          carrier: extraction.carrier || 'ShopeeXpress (SPX)',
          recipient_name: extraction.recipient_name || 'Student Recipient',
          recipient_school_id: schoolId || 'CTU-2024-8841',
          cod_amount: extraction.amount || 0,
          current_status: 'STAGED',
          receipt_image_uri: imageBase64.length > 500 ? 'uploaded_receipt_screenshot' : imageBase64,
        })
        .select('parcel_id')
        .single();

      if (!error && data?.parcel_id) {
        anchoredId = data.parcel_id;
      }
    }

    return NextResponse.json({
      success: true,
      parcelId: anchoredId,
      extraction,
      verifiedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Receipt verification API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
