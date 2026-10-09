import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Typography, Shadows } from '../constants/theme';
import { PackageIcon, BanknoteIcon, InfoIcon } from '../components/common/Icons';

interface AlertItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'READY' | 'FUNDED' | 'SYSTEM';
  read: boolean;
}

const MOCK_ALERTS: AlertItem[] = [
  {
    id: 'a-1',
    title: 'Ready for Collection at Desk',
    message: 'ShopeeXpress parcel SPXPH0492817263 has been delivered. Gemini AI verified label OCR. ₱160.00 change prepared in your envelope.',
    time: '12m ago',
    type: 'READY',
    read: false,
  },
  {
    id: 'a-2',
    title: 'Cash Deposit Verified (Envelope Funded)',
    message: 'Staff verified ₱620.00 cash for J&T Express JT99482103847. Parcel status shifted to FUNDED.',
    time: '4h ago',
    type: 'FUNDED',
    read: true,
  },
  {
    id: 'a-3',
    title: 'Campus Terminal Notice',
    message: 'CTU Danao Main Gate Hub is open 07:30 - 18:00 on weekdays. Courier handovers run all day.',
    time: '1d ago',
    type: 'SYSTEM',
    read: true,
  },
];

export const AlertsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Notifications & Alerts</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.markReadText}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollList,
          { paddingBottom: insets.bottom + 96 },
        ]}
      >
        {MOCK_ALERTS.map((alert) => (
          <View
            key={alert.id}
            style={[
              styles.alertCard,
              Shadows.level1,
              !alert.read && styles.alertCardUnread,
            ]}
          >
            <View style={styles.iconColumn}>
              <View
                style={[
                  styles.iconBox,
                  alert.type === 'READY' && styles.iconBoxReady,
                  alert.type === 'FUNDED' && styles.iconBoxFunded,
                ]}
              >
                {alert.type === 'READY' ? (
                  <PackageIcon size={18} color={Colors.accent.successText} strokeWidth={2} />
                ) : alert.type === 'FUNDED' ? (
                  <BanknoteIcon size={18} color={Colors.accent.brandPrimary} strokeWidth={2} />
                ) : (
                  <InfoIcon size={18} color={Colors.structure.textSecondary} strokeWidth={2} />
                )}
              </View>
            </View>

            <View style={styles.contentColumn}>
              <View style={styles.rowTop}>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <Text style={styles.timeText}>{alert.time}</Text>
              </View>
              <Text style={styles.messageText}>{alert.message}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface.canvas, // #F8FAFC
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: {
    ...Typography.sizes.h1,
    color: Colors.structure.textPrimary,
  },
  markReadText: {
    ...Typography.sizes.caption,
    color: Colors.accent.brandPrimary,
    fontWeight: '700',
  },
  scrollList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  alertCard: {
    backgroundColor: Colors.surface.card,
    borderRadius: Radius.card,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.structure.borderSubtle,
    marginBottom: 12,
  },
  alertCardUnread: {
    backgroundColor: '#FAFCFA',
    borderColor: '#86EFAC',
  },
  iconColumn: {
    paddingTop: 2,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.input,
    backgroundColor: Colors.surface.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxReady: {
    backgroundColor: Colors.accent.successBg,
  },
  iconBoxFunded: {
    backgroundColor: Colors.accent.brandSoft,
  },
  contentColumn: {
    flex: 1,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  alertTitle: {
    ...Typography.sizes.bodyBold,
    color: Colors.structure.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    ...Typography.sizes.caption,
    color: Colors.structure.textMuted,
  },
  messageText: {
    ...Typography.sizes.body,
    color: Colors.structure.textSecondary,
    lineHeight: 18,
  },
});
