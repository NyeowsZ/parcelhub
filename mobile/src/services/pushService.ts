import { Platform } from 'react-native';
import { isRunningInExpoGo } from 'expo';
import type * as NotificationsType from 'expo-notifications';
import { supabase, isSupabaseConfigured } from './supabase';

/**
 * In Expo SDK 53+, remote push notification native modules (such as ExpoTopicSubscriptionModule)
 * were permanently removed from the pre-built Expo Go Android binary.
 *
 * To maintain architecture compliance with CONTEXT.md and ARCHITECTURE_CONTEXT.md without
 * crashing the runtime in Expo Go:
 * - When running in Expo Go on Android: PushService safely no-ops so the developer can
 *   work on UI, Pre-Registration, QR Claim Handshakes, and Camera workflows uninterrupted.
 * - In Development Builds (npx expo run:android / EAS Build) or iOS: expo-notifications is
 *   dynamically loaded and handles full remote notification push token sync to Supabase.
 */
const isUnsupportedInExpoGo = isRunningInExpoGo() && Platform.OS === 'android';

let Notifications: typeof NotificationsType | null = null;

if (!isUnsupportedInExpoGo) {
  try {
    Notifications = require('expo-notifications');
    Notifications?.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch (err) {
    console.warn('[PushService] Native notification module could not be loaded:', err);
  }
}

export const PushService = {
  /**
   * Register device for Expo Push Notifications and sync token to user profile
   */
  async registerForPushNotificationsAsync(): Promise<string | null> {
    if (isUnsupportedInExpoGo || !Notifications) {
      console.log(
        '[PushService] Push notifications are not supported in Expo Go on Android (requires a Development Build). Skipping token registration.'
      );
      return null;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('[PushService] Failed to get push token permission.');
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = tokenData.data;

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('parcelhub-status', {
          name: 'Parcel Updates',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#2563EB',
        });
      }

      // Sync push token to Supabase if logged in
      if (isSupabaseConfigured()) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('users')
            .update({ push_token: token })
            .eq('auth_id', user.id);
        }
      }

      return token;
    } catch (e) {
      console.warn('[PushService] Push notification registration error:', e);
      return null;
    }
  },

  /**
   * Add listener for notification responses (e.g. user taps "Parcel Ready for Pickup")
   */
  addNotificationResponseListener(callback: (response: NotificationsType.NotificationResponse) => void) {
    if (!Notifications) {
      return { remove: () => {} };
    }
    return Notifications.addNotificationResponseReceivedListener(callback);
  },
};
