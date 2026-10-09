import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ParcelRow } from '../../types/database';
import { StatusBadge } from '../common/StatusBadge';
import { Colors, Radius, Typography, Shadows } from '../../constants/theme';
import { APP_CONFIG } from '../../constants/config';
import { PackageIcon, CheckIcon, CheckCircleIcon } from '../common/Icons';

interface ParcelCardProps {
  parcel: ParcelRow;
  onPress: () => void;
  isSelectable?: boolean;
  isSelected?: boolean;
  onPayAtDesk?: () => void;
}

export const ParcelCard: React.FC<ParcelCardProps> = ({
  parcel,
  onPress,
  isSelectable = false,
  isSelected = false,
  onPayAtDesk,
}) => {
  const isReady = parcel.current_status === 'RECEIVED_LOGGED';
  const isStaged = parcel.current_status === 'STAGED';
  const isFundedOrBeyond = parcel.current_status === 'FUNDED' || parcel.current_status === 'RECEIVED_LOGGED' || parcel.current_status === 'CLAIMED';
  const isPingedPayment = Boolean(parcel.payment_pinged_at);

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
        isSelected && styles.selectedBorder,
      ]}
    >
      {/* Multi-Select Checkbox */}
      {isSelectable && (
        <View style={styles.checkboxContainer}>
          <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
            {isSelected && <CheckIcon size={14} color="#FFFFFF" strokeWidth={3} />}
          </View>
        </View>
      )}

      <View style={styles.mainContent}>
        <View style={styles.topRow}>
          <View style={styles.leftContainer}>
            <View style={[styles.iconBox, isReady && styles.iconBoxReady]}>
              {isReady ? (
                <CheckIcon size={20} color={Colors.accent.successText} strokeWidth={2.4} />
              ) : (
                <PackageIcon size={20} color={Colors.accent.brandPrimary} strokeWidth={1.8} />
              )}
            </View>

            <View style={styles.metaContainer}>
              <Text style={styles.title} numberOfLines={1}>
                {parcel.carrier || 'Consignment'}
              </Text>
              <Text style={styles.waybillText}>{parcel.waybill_number}</Text>

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

          {/* Status Badge */}
          <View style={styles.badgeContainer}>
            <StatusBadge status={parcel.current_status} />
            {parcel.change_due > 0 && parcel.current_status !== 'CLAIMED' && (
              <Text style={styles.changeNotice}>
                +{APP_CONFIG.CURRENCY_SYMBOL}{parcel.change_due.toFixed(0)} change
              </Text>
            )}
          </View>
        </View>

        {/* Staged State: Pay at Desk Ping Button / Status */}
        {isStaged && onPayAtDesk && (
          <View style={styles.paymentSection}>
            {isPingedPayment ? (
              <View style={styles.pingedNotice}>
                <View style={styles.activeDot} />
                <Text style={styles.pingedNoticeText}>
                  Payment Ping Active at Counter · Present cash to staff
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onPayAtDesk}
                style={styles.payAtDeskBtn}
              >
                <Text style={styles.payAtDeskText}>⚡ Pay at Counter Desk (Scan Hub QR or Type ID)</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Funded / Received Details: Posted Payment Attribution */}
        {isFundedOrBeyond && (parcel.payment_staff_id || parcel.cash_deposited > 0) && (
          <View style={styles.paymentDetailsBox}>
            <Text style={styles.paymentDetailsTitle}>POSTED PAYMENT DETAILS</Text>
            <View style={styles.paymentDetailsRow}>
              <Text style={styles.detailLabel}>Station: <Text style={styles.detailValue}>{parcel.payment_station_code || 'CTU-DANAO-MAIN-HUB'}</Text></Text>
              <Text style={styles.detailLabel}>Staff Paid: <Text style={styles.detailValue}>{parcel.payment_staff_id || 'STAFF-0488'}</Text></Text>
            </View>
            <View style={styles.paymentDetailsRow}>
              <Text style={styles.detailLabel}>Deposited: <Text style={styles.detailValueBold}>₱{parcel.cash_deposited.toFixed(2)}</Text></Text>
              <Text style={styles.detailLabel}>Change: <Text style={styles.detailValueBold}>₱{Math.max(0, parcel.change_due).toFixed(2)}</Text></Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface.card,
    borderRadius: Radius.card,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.structure.borderSubtle,
    marginBottom: 12,
  },
  readyBorder: {
    borderColor: '#86EFAC',
    backgroundColor: '#FAFCFA',
  },
  selectedBorder: {
    borderColor: Colors.accent.brandPrimary,
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
  },
  checkboxContainer: {
    position: 'absolute',
    top: 14,
    left: 14,
    zIndex: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: Colors.structure.borderSubtle,
    backgroundColor: Colors.surface.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.accent.brandPrimary,
    borderColor: Colors.accent.brandPrimary,
  },
  mainContent: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    borderRadius: Radius.input,
    backgroundColor: Colors.accent.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxReady: {
    backgroundColor: Colors.accent.successBg,
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
  paymentSection: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.structure.borderSubtle,
  },
  payAtDeskBtn: {
    backgroundColor: Colors.accent.subtleBlue,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Radius.full,
    alignItems: 'center',
  },
  payAtDeskText: {
    fontSize: Typography.fontSize.tiny,
    fontWeight: '700',
    color: Colors.accent.brandPrimary,
  },
  pingedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.accent.subtleGreen,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.full,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.accent.successText,
  },
  pingedNoticeText: {
    fontSize: Typography.fontSize.tiny,
    fontWeight: '700',
    color: Colors.accent.successText,
  },
  paymentDetailsBox: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.structure.borderSubtle,
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: Radius.md,
  },
  paymentDetailsTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.structure.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  paymentDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  detailLabel: {
    fontSize: 10,
    color: Colors.structure.textMuted,
  },
  detailValue: {
    color: Colors.structure.textSecondary,
    fontWeight: '600',
  },
  detailValueBold: {
    color: Colors.structure.textPrimary,
    fontWeight: '700',
    fontFamily: Typography.fontFamily.mono,
  },
});
