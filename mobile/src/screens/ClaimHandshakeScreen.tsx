import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Typography, Shadows } from '../constants/theme';
import { APP_CONFIG } from '../constants/config';
import { ParcelRow } from '../types/database';
import { MpinKeypad } from '../components/mpin/MpinKeypad';
import { HubQrScannerModal } from '../components/scanner/HubQrScannerModal';
import { Button } from '../components/common/Button';
import { ArrowLeftIcon, CheckIcon, CheckCircleIcon } from '../components/common/Icons';
import { ParcelService } from '../services/parcelService';

interface ClaimHandshakeScreenProps {
  parcel?: ParcelRow;
  onBack: () => void;
  onSuccess: () => void;
}

export const ClaimHandshakeScreen: React.FC<ClaimHandshakeScreenProps> = ({
  parcel,
  onBack,
  onSuccess,
}) => {
  const insets = useSafeAreaInsets();
  const [stationCode, setStationCode] = useState<string | null>(null);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [mpin, setMpin] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [handshakeComplete, setHandshakeComplete] = useState(false);
  const [changeDue, setChangeDue] = useState<number>(0);

  if (!parcel) {
    return (
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
        <View style={styles.topBar}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onBack}
            style={styles.backButton}
          >
            <ArrowLeftIcon size={18} color={Colors.structure.textPrimary} strokeWidth={2.2} />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Claim Parcel</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Ready Parcel Selected</Text>
          <Text style={styles.emptyBody}>
            Only consignments marked "Ready to Claim" (RECEIVED_LOGGED) by desk staff can initiate this physical handshake.
          </Text>
          <Button label="Back to Orders" onPress={onBack} variant="secondary" style={{ marginTop: 20 }} />
        </View>
      </View>
    );
  }

  const handleDigitPress = (digit: string) => {
    if (mpin.length < APP_CONFIG.MPIN_LENGTH) {
      setMpin((prev) => prev + digit);
    }
  };

  const handleDeletePress = () => {
    setMpin((prev) => prev.slice(0, -1));
  };

  const handleClearPress = () => {
    setMpin('');
  };

  const handleScanSuccess = (code: string) => {
    setStationCode(code);
    setScannerVisible(false);
  };

  const handleDispatchPing = async () => {
    if (!stationCode) {
      Alert.alert('Scan Required', 'Please scan the physical Hub Station QR code first.');
      return;
    }
    if (mpin.length !== APP_CONFIG.MPIN_LENGTH) {
      Alert.alert('Incomplete MPIN', `Please enter your full ${APP_CONFIG.MPIN_LENGTH}-digit security MPIN.`);
      return;
    }

    try {
      setSubmitting(true);
      const res = await ParcelService.dispatchClaimPing({
        parcelId: parcel.parcel_id,
        stationCode,
        mpin,
      });

      setChangeDue(res.changeDue || parcel.change_due || 0);
      setHandshakeComplete(true);
    } catch (e: any) {
      Alert.alert('Handshake Failed', e.message || 'Unable to dispatch claim ping.');
    } finally {
      setSubmitting(false);
    }
  };

  if (handshakeComplete) {
    return (
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 12), paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={styles.successWrapper}>
          <View style={[styles.successIconBox, Shadows.level2]}>
            <CheckIcon size={32} color={Colors.accent.successText} strokeWidth={2.5} />
          </View>

          <Text style={styles.successTitle}>Claim Ping Dispatched</Text>
          <Text style={styles.successSub}>
            Your dispatch signal surfaced on the CTU Danao staff counter terminal. Please approach the desk.
          </Text>

          {/* Envelope Summary Card */}
          <View style={[styles.envelopeCard, Shadows.level1]}>
            <Text style={styles.envelopeHeader}>PHYSICAL ENVELOPE SUMMARY</Text>

            <View style={styles.envelopeRow}>
              <Text style={styles.envelopeLabel}>Waybill Number</Text>
              <Text style={styles.envelopeValueMono}>{parcel.waybill_number}</Text>
            </View>

            <View style={styles.envelopeRow}>
              <Text style={styles.envelopeLabel}>Carrier</Text>
              <Text style={styles.envelopeValue}>{parcel.carrier}</Text>
            </View>

            <View style={styles.envelopeRow}>
              <Text style={styles.envelopeLabel}>Cash Deposited</Text>
              <Text style={styles.envelopeValue}>
                {APP_CONFIG.CURRENCY_SYMBOL}{parcel.cash_deposited.toFixed(2)}
              </Text>
            </View>

            <View style={styles.envelopeRow}>
              <Text style={styles.envelopeLabel}>Courier COD Paid</Text>
              <Text style={styles.envelopeValue}>
                {APP_CONFIG.CURRENCY_SYMBOL}{parcel.cod_amount.toFixed(2)}
              </Text>
            </View>

            <View style={[styles.envelopeRow, styles.changeHighlightRow]}>
              <Text style={styles.changeHighlightLabel}>Change to Collect</Text>
              <Text style={styles.changeHighlightValue}>
                {APP_CONFIG.CURRENCY_SYMBOL}{Math.max(0, changeDue).toFixed(2)}
              </Text>
            </View>
          </View>

          <Button
            label="Done & Return Home"
            onPress={onSuccess}
            variant="primary"
            style={{ width: '100%', marginTop: 24 }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onBack}
          style={styles.backButton}
        >
          <ArrowLeftIcon size={18} color={Colors.structure.textPrimary} strokeWidth={2.2} />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Inverted Claim Handshake</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
      >
        {/* Step 1: Waybill Metadata */}
        <View style={styles.parcelInfoCard}>
          <View style={styles.parcelInfoLeft}>
            <Text style={styles.parcelCarrier}>{parcel.carrier}</Text>
            <Text style={styles.parcelWaybill}>{parcel.waybill_number}</Text>
          </View>
          <View style={styles.parcelInfoRight}>
            <Text style={styles.parcelStatusTag}>READY AT DESK</Text>
          </View>
        </View>

        {/* Step 2: Hub Station QR Scan */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionIndex}>STEP 1: STATION AUDIT</Text>
          <Text style={styles.sectionHeader}>Scan Hub Stationary QR</Text>
          <Text style={styles.sectionDesc}>
            Verify you are physically present at the CTU Danao terminal counter.
          </Text>

          {stationCode ? (
            <View style={styles.stationVerifiedBox}>
              <CheckCircleIcon size={20} color={Colors.accent.successText} strokeWidth={2} />
              <View style={{ flex: 1 }}>
                <Text style={styles.stationVerifiedTitle}>Station Verified</Text>
                <Text style={styles.stationVerifiedCode}>{stationCode}</Text>
              </View>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setScannerVisible(true)}>
                <Text style={styles.rescanText}>Change</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Button
              label="Open Camera Scanner"
              onPress={() => setScannerVisible(true)}
              variant="secondary"
              size="md"
              style={{ marginTop: 8 }}
            />
          )}
        </View>

        {/* Step 3: MPIN Entry (Release Invariant) */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionIndex}>STEP 2: MPIN AUTHORIZATION</Text>
          <Text style={styles.sectionHeader}>Enter 6-Digit User MPIN</Text>
          <Text style={styles.sectionDesc}>
            Your private 6-digit MPIN generates the cryptographic claim token required for atomic handover.
          </Text>

          {/* Filled Modern Circular Keypad */}
          <MpinKeypad
            mpin={mpin}
            onDigitPress={handleDigitPress}
            onDeletePress={handleDeletePress}
            onClearPress={handleClearPress}
          />
        </View>

        {/* Dispatch Action */}
        <View style={styles.bottomDispatchArea}>
          <Button
            label="Authorize & Dispatch Claim Ping"
            onPress={handleDispatchPing}
            loading={submitting}
            disabled={!stationCode || mpin.length !== APP_CONFIG.MPIN_LENGTH}
            variant="primary"
          />
        </View>
      </ScrollView>

      {/* QR Scanner Modal */}
      <HubQrScannerModal
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onScanSuccess={handleScanSuccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface.canvas,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenTitle: {
    ...Typography.sizes.h2,
    color: Colors.structure.textPrimary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    ...Typography.sizes.h2,
    color: Colors.structure.textPrimary,
    marginBottom: 8,
  },
  emptyBody: {
    ...Typography.sizes.body,
    color: Colors.structure.textSecondary,
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  parcelInfoCard: {
    backgroundColor: Colors.surface.card,
    borderRadius: Radius.card,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.structure.borderSubtle,
    marginBottom: 20,
  },
  parcelInfoLeft: {
    gap: 2,
  },
  parcelCarrier: {
    ...Typography.sizes.bodyBold,
    color: Colors.structure.textPrimary,
  },
  parcelWaybill: {
    ...Typography.sizes.caption,
    fontFamily: Typography.fontFamily.mono,
    color: Colors.structure.textSecondary,
  },
  parcelInfoRight: {
    alignItems: 'flex-end',
  },
  parcelStatusTag: {
    ...Typography.sizes.caption,
    backgroundColor: Colors.accent.successBg,
    color: Colors.accent.successText,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  sectionBlock: {
    marginBottom: 24,
  },
  sectionIndex: {
    ...Typography.sizes.caption,
    color: Colors.accent.brandPrimary,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  sectionHeader: {
    ...Typography.sizes.h2,
    color: Colors.structure.textPrimary,
    marginBottom: 4,
  },
  sectionDesc: {
    ...Typography.sizes.body,
    color: Colors.structure.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  stationVerifiedBox: {
    backgroundColor: Colors.accent.successBg,
    borderRadius: Radius.card,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stationVerifiedTitle: {
    ...Typography.sizes.bodyBold,
    color: Colors.accent.successText,
  },
  stationVerifiedCode: {
    ...Typography.sizes.caption,
    fontFamily: Typography.fontFamily.mono,
    color: '#065F46',
    fontWeight: '600',
  },
  rescanText: {
    ...Typography.sizes.caption,
    color: Colors.accent.brandPrimary,
    fontWeight: '700',
  },
  bottomDispatchArea: {
    marginTop: 8,
  },
  successWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  successIconBox: {
    width: 72,
    height: 72,
    borderRadius: Radius.pill,
    backgroundColor: Colors.accent.successBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    ...Typography.sizes.h1,
    color: Colors.structure.textPrimary,
    marginBottom: 6,
  },
  successSub: {
    ...Typography.sizes.body,
    color: Colors.structure.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  envelopeCard: {
    width: '100%',
    backgroundColor: Colors.surface.card,
    borderRadius: Radius.card,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.structure.borderSubtle,
  },
  envelopeHeader: {
    ...Typography.sizes.caption,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: Colors.structure.textMuted,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.structure.borderSubtle,
    paddingBottom: 8,
  },
  envelopeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  envelopeLabel: {
    ...Typography.sizes.body,
    color: Colors.structure.textSecondary,
  },
  envelopeValue: {
    ...Typography.sizes.bodyBold,
    color: Colors.structure.textPrimary,
  },
  envelopeValueMono: {
    ...Typography.sizes.bodyBold,
    fontFamily: Typography.fontFamily.mono,
    color: Colors.structure.textPrimary,
  },
  changeHighlightRow: {
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.structure.borderSubtle,
  },
  changeHighlightLabel: {
    ...Typography.sizes.bodyBold,
    color: Colors.accent.successText,
  },
  changeHighlightValue: {
    ...Typography.sizes.h2,
    color: Colors.accent.successText,
    fontWeight: '800',
  },
});
