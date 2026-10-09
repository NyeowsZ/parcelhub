import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ParcelRow } from '../../types/database';
import { StatusBadge } from '../common/StatusBadge';
import { Colors, Radius, Typography, Shadows } from '../../constants/theme';
import { APP_CONFIG } from '../../constants/config';
import { PackageIcon, CheckIcon } from '../common/Icons';

interface ParcelCardProps {
  parcel: ParcelRow;
  onPress: () => void;
}

export const ParcelCard: React.FC<ParcelCardProps> = ({ parcel, onPress }) => {
  const isReady = parcel.current_status === 'RECEIVED_LOGGED';

  // Format date readable
  const formattedDate = new Date(parcel.updated_at || parcel.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.card,
        Shadows.level1,
        isReady && styles.readyBorder,
      ]}
    >
      <View style={styles.leftContainer}>
        {/* Minimalist SVG Icon Box */}
        <View style={[styles.iconBox, isReady && styles.iconBoxReady]}>
          {isReady ? (
            <CheckIcon size={20} color={Colors.accent.successText} strokeWidth={2.4} />
          ) : (
            <PackageIcon size={20} color={Colors.accent.brandPrimary} strokeWidth={1.8} />
          )}
        </View>

        {/* Content */}
        <View style={styles.metaContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {parcel.carrier || 'Consignment'}
          </Text>

          {/* Monospace tracking number */}
          <Text style={styles.waybillText}>
            {parcel.waybill_number}
          </Text>

          <View style={styles.footerRow}>
            <Text style={styles.dateText}>{formattedDate}</Text>
            <Text style={styles.dotSeparator}>·</Text>
            <Text style={styles.amountText}>
              {parcel.cod_amount > 0
                ? `${APP_CONFIG.CURRENCY_SYMBOL}${parcel.cod_amount.toFixed(2)} COD`
                : 'Prepaid'}
            </Text>
          </View>
        </View>
      </View>

      {/* Semantic Status Badge */}
      <View style={styles.badgeContainer}>
        <StatusBadge status={parcel.current_status} />
        {parcel.change_due > 0 && parcel.current_status !== 'CLAIMED' && (
          <Text style={styles.changeNotice}>
            +{APP_CONFIG.CURRENCY_SYMBOL}{parcel.change_due.toFixed(0)} change
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface.card, // #FFFFFF (60% surface)
    borderRadius: Radius.card, // rounded-2xl (20px)
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.structure.borderSubtle, // #E2E8F0 (30% structure)
    marginBottom: 12,
  },
  readyBorder: {
    borderColor: '#86EFAC', // subtle green highlight
    backgroundColor: '#FAFCFA',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
    marginRight: 8,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.input, // rounded-2xl (16px)
    backgroundColor: Colors.accent.brandSoft, // bg-blue-50 (10% accent)
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxReady: {
    backgroundColor: Colors.accent.successBg, // bg-emerald-100
  },
  metaContainer: {
    flex: 1,
  },
  title: {
    ...Typography.sizes.bodyBold,
    color: Colors.structure.textPrimary,
  },
  waybillText: {
    ...Typography.sizes.caption,
    fontFamily: Typography.fontFamily.mono,
    color: Colors.structure.textSecondary,
    marginTop: 1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  dateText: {
    ...Typography.sizes.caption,
    color: Colors.structure.textMuted,
  },
  dotSeparator: {
    color: Colors.structure.textMuted,
    fontSize: 10,
  },
  amountText: {
    ...Typography.sizes.caption,
    fontWeight: '600',
    color: Colors.structure.textSecondary,
  },
  badgeContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  changeNotice: {
    ...Typography.sizes.caption,
    color: Colors.accent.successText,
    fontWeight: '600',
  },
});
