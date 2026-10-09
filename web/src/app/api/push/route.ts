import { NextResponse } from 'next/server';
import { sendExpoPushNotification } from '@/lib/push';

export async function POST(req: Request) {
  try {
    const { to, title, body, data } = await req.json();

    if (!to || !title || !body) {
      return NextResponse.json(
        { error: 'Parameters "to", "title", and "body" are required.' },
        { status: 400 }
      );
    }

    const success = await sendExpoPushNotification({ to, title, body, data });
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
