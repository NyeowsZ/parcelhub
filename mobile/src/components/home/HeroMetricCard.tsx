import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Radius, Typography, Shadows } from '../../constants/theme';
import {
  PlusIcon,
  QrCodeIcon,
  BanknoteIcon,
  ClockIcon,
  HelpCircleIcon,
} from '../common/Icons';

interface HeroMetricCardProps {
  activeCount: number;
  readyCount: number;
  onCreatePress: () => void;
  onClaimPress: () => void;
  onCashInPress: () => void;
  onHistoryPress: () => void;
  onHelpPress: () => void;
}

export const HeroMetricCard: React.FC<HeroMetricCardProps> = ({
  activeCount,
  readyCount,
  onCreatePress,
  onClaimPress,
  onCashInPress,
  onHistoryPress,
  onHelpPress,
}) => {
  return (
    <View style={[styles.container, Shadows.level3]}>
      {/* Metric Header */}
      <View style={styles.metricRow}>
        <View style={styles.metricLeft}>
          <Text style={styles.countText}>{activeCount}</Text>
          <Text style={styles.countLabel}>Active Orders</Text>
        </View>

        {readyCount > 0 && (
          <View style={styles.readyIndicator}>
            <View style={styles.readyDot} />
            <Text style={styles.readyText}>{readyCount} Ready at Desk</Text>
          </View>
        )}
      </View>

      {/* 5-Column Quick Action Grid (Strict 60-30-10 distribution) */}
      <View style={styles.actionGrid}>
        {/* Create Order */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onCreatePress}
          style={styles.actionItem}
        >
          <View style={[styles.actionIconBox, styles.actionPrimaryBox]}>
            <PlusIcon size={18} color="#FFFFFF" strokeWidth={2.4} />
          </View>
          <Text style={styles.actionLabel}>Create</Text>
        </TouchableOpacity>

        {/* Claim / Scan Station */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onClaimPress}
          style={styles.actionItem}
        >
          <View
            style={[
              styles.actionIconBox,
              readyCount > 0 && styles.actionHighlightBox,
            ]}
          >
            <QrCodeIcon
              size={18}
              color={readyCount > 0 ? '#FFFFFF' : '#CBD5E1'}
              strokeWidth={2}
            />
          </View>
          <Text style={styles.actionLabel}>Claim</Text>
        </TouchableOpacity>

        {/* Cash-In / Fund Envelope */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onCashInPress}
          style={styles.actionItem}
        >
          <View style={styles.actionIconBox}>
            <BanknoteIcon size={18} color="#CBD5E1" strokeWidth={1.8} />
          </View>
          <Text style={styles.actionLabel}>Cash-In</Text>
        </TouchableOpacity>

        {/* History */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onHistoryPress}
          style={styles.actionItem}
        >
          <View style={styles.actionIconBox}>
            <ClockIcon size={18} color="#CBD5E1" strokeWidth={2} />
          </View>
          <Text style={styles.actionLabel}>History</Text>
        </TouchableOpacity>

        {/* Help */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onHelpPress}
          style={styles.actionItem}
        >
          <View style={styles.actionIconBox}>
            <HelpCircleIcon size={18} color="#CBD5E1" strokeWidth={2} />
          </View>
          <Text style={styles.actionLabel}>Help</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface.inverse, // #0F172A (Deep Slate)
    borderRadius: Radius.hero, // rounded-3xl (28px)
    padding: 24,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 20,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 24,
  },
  metricLeft: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  countText: {
    ...Typography.sizes.display,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  countLabel: {
    ...Typography.sizes.body,
    color: '#CBD5E1', // slate-300
    fontWeight: '500',
  },
  readyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(21, 128, 61, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    gap: 6,
  },
  readyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  readyText: {
    ...Typography.sizes.caption,
    color: '#A7F3D0',
    fontWeight: '700',
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#1E293B', // border-slate-800
    paddingTop: 16,
  },
  actionItem: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  actionIconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.input, // rounded-2xl
    backgroundColor: '#1E293B', // bg-slate-800
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPrimaryBox: {
    backgroundColor: Colors.accent.brandPrimary,
  },
  actionHighlightBox: {
    backgroundColor: '#15803D',
  },
  actionLabel: {
    ...Typography.sizes.caption,
    color: Colors.structure.textMuted,
    fontWeight: '500',
  },
});
