import { NextResponse } from 'next/server';
import { analyzeParcelImage } from '@/lib/gemini';
import { sendExpoPushNotification } from '@/lib/push';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { imageBase64, expectedWaybill, pushToken, parcelId } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Image base64 payload is required.' },
        { status: 400 }
      );
    }

    // Run Gemini 3.5 Flash-Lite multimodal OCR & parcel condition assessment
    const extraction = await analyzeParcelImage(imageBase64, expectedWaybill);

    // If an Expo push token is supplied, dispatch instant delivery notification
    if (pushToken) {
      await sendExpoPushNotification({
        to: pushToken,
        title: '📦 Parcel Ready for Collection!',
        body: `Your parcel (${expectedWaybill}) has arrived at the CTU Danao desk. Scan the counter QR code to claim.`,
        data: { parcelId, waybill: expectedWaybill },
      });
    }

    return NextResponse.json({
      success: true,
      extraction,
      verifiedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Intake verification API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
