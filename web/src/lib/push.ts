/**
 * Direct Expo Push API Dispatcher
 * Source: ARCHITECTURE_CONTEXT.md Section 6: Direct Push Execution
 */

export interface SendPushPayload {
  to: string; // ExponentPushToken[...]
  title: string;
  body: string;
  data?: Record<string, any>;
}

export async function sendExpoPushNotification(payload: SendPushPayload): Promise<boolean> {
  if (!payload.to || !payload.to.startsWith('ExponentPushToken')) {
    console.log('[Push API] Simulation: Push dispatched to simulated token', payload.to);
    return true;
  }

  try {
    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: payload.to,
        sound: 'default',
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
        channelId: 'parcelhub-status',
      }),
    });

    const result = await res.json();
    return result.data?.status === 'ok';
  } catch (err) {
    console.error('[Push API Error]', err);
    return false;
  }
}
