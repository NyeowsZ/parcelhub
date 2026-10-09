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
  parcels?: ParcelRow[];
  onBack: () => void;
  onSuccess: () => void;
}

export const ClaimHandshakeScreen: React.FC<ClaimHandshakeScreenProps> = ({
  parcel,
  parcels: multiParcels,
  onBack,
  onSuccess,
}) => {
  const insets = useSafeAreaInsets();

  // Consolidate target parcels
  const targetList: ParcelRow[] = multiParcels && multiParcels.length > 0
    ? multiParcels
    : parcel
    ? [parcel]
    : [];

  const [stationCode, setStationCode] = useState<string | null>('CTU-DANAO-MAIN-HUB');
  const [scannerVisible, setScannerVisible] = useState(false);
  const [mpin, setMpin] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [handshakeComplete, setHandshakeComplete] = useState(false);
  const [totalDisbursedChange, setTotalDisbursedChange] = useState<number>(0);

  if (targetList.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
        <View style={styles.topBar}>
          <TouchableOpacity activeOpacity={0.7} onPress={onBack} style={styles.backButton}>
            <ArrowLeftIcon size={18} color={Colors.structure.textPrimary} strokeWidth={2.2} />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Claim Parcels</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Ready Parcels Selected</Text>
          <Text style={styles.emptyBody}>
            Only consignments in "Ready to Claim" (RECEIVED_LOGGED) state can initiate this counter release.
          </Text>
          <Button label="Back to Orders" onPress={onBack} variant="secondary" style={{ marginTop: 20 }} />
        </View>
      </View>
    );
  }

  const calculatedExpectedChange = targetList.reduce(
    (acc, curr) => acc + Math.max(0, curr.change_due),
    0
  );

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
      Alert.alert('Station Code Required', 'Please scan the Station QR or enter the Hub ID.');
      return;
    }
    if (mpin.length !== APP_CONFIG.MPIN_LENGTH) {
      Alert.alert('Incomplete MPIN', `Please enter your full ${APP_CONFIG.MPIN_LENGTH}-digit security MPIN.`);
      return;
    }

    try {
      setSubmitting(true);
      const parcelIds = targetList.map((p) => p.parcel_id);

      const res = await ParcelService.batchDispatchClaimPing({
        parcelIds,
        stationCode,
        mpin,
      });

      setTotalDisbursedChange(res.totalChange || calculatedExpectedChange);
      setHandshakeComplete(true);
    } catch (e: any) {
      Alert.alert('Claim Failed', e.message || 'Unable to dispatch claim ping.');
    } finally {
      setSubmitting(false);
    }
  };

  if (handshakeComplete) {
    return (
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 12), paddingBottom: Math.max(insets.bottom, 24) }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.successScroll}>
          <View style={[styles.successIconBox, Shadows.level2]}>
            <CheckIcon size={32} color={Colors.accent.successText} strokeWidth={2.5} />
          </View>

          <Text style={styles.successTitle}>Claim Signal Dispatched!</Text>
          <Text style={styles.successSub}>
            Your MPIN has verified {targetList.length} parcel(s) and pinged the CTU Danao counter terminal. The release button is now unlocked for the desk operator.
          </Text>

          {/* Envelope Summary Card */}
          <View style={[styles.envelopeCard, Shadows.level1]}>
            <Text style={styles.envelopeHeader}>BATCH PICKUP SUMMARY</Text>

            <View style={styles.envelopeRow}>
              <Text style={styles.envelopeLabel}>Station Target</Text>
              <Text style={styles.envelopeValueMono}>{stationCode}</Text>
            </View>

            <View style={styles.envelopeRow}>
              <Text style={styles.envelopeLabel}>Total Parcels</Text>
              <Text style={styles.envelopeValue}>{targetList.length} Package(s)</Text>
            </View>

            {targetList.map((p, idx) => (
              <View key={p.parcel_id} style={styles.miniParcelRow}>
                <Text style={styles.miniWaybill}>#{idx + 1} {p.waybill_number}</Text>
                <Text style={styles.miniChange}>Change: ₱{Math.max(0, p.change_due).toFixed(2)}</Text>
              </View>
            ))}

            <View style={[styles.envelopeRow, styles.changeRow]}>
              <Text style={styles.changeLabel}>Total Change in Envelopes</Text>
              <Text style={styles.changeValue}>
                {APP_CONFIG.CURRENCY_SYMBOL}{totalDisbursedChange.toFixed(2)}
              </Text>
            </View>
          </View>

          <View style={styles.actionButtonWrapper}>
            <Button label="Done & View Orders" onPress={onSuccess} variant="primary" />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12), paddingBottom: Math.max(insets.bottom, 16) }]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity activeOpacity={0.7} onPress={onBack} style={styles.backButton}>
          <ArrowLeftIcon size={18} color={Colors.structure.textPrimary} strokeWidth={2.2} />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>
          {targetList.length > 1 ? `Batch Pickup (${targetList.length})` : 'Claim Delivery'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Step Indicator Header */}
        <View style={styles.header}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>FSM STAGE 4 · ATOMIC RELEASE</Text>
          </View>
          <Text style={styles.headline}>Authorize Counter Handover</Text>
          <Text style={styles.subhead}>
            Enter your 6-digit MPIN to ping the staff desk and unlock handover of {targetList.length} parcel(s).
          </Text>
        </View>

        {/* Selected Consignments Overview */}
        <View style={[styles.parcelCard, Shadows.level1]}>
          <Text style={styles.parcelCardHeader}>CONSIGNMENTS TO CLAIM</Text>
          {targetList.map((p) => (
            <View key={p.parcel_id} style={styles.parcelRow}>
              <View>
                <Text style={styles.carrierText}>{p.carrier || 'Consignment'}</Text>
                <Text style={styles.waybillMono}>{p.waybill_number}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.changeNotice}>
                  Change: ₱{Math.max(0, p.change_due).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Hub Station Ping Station Indicator */}
        <View style={[styles.stationCard, Shadows.level1]}>
          <View style={styles.stationLeft}>
            <Text style={styles.stationLabel}>COUNTER STATION</Text>
            <Text style={styles.stationValue}>{stationCode}</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setScannerVisible(true)}
            style={styles.scanBtn}
          >
            <Text style={styles.scanBtnText}>Scan QR</Text>
          </TouchableOpacity>
        </View>

        {/* Keypad with built-in indicators */}
        <View style={styles.keypadBox}>
          <MpinKeypad
            mpin={mpin}
            onDigitPress={handleDigitPress}
            onDeletePress={handleDeletePress}
            onClearPress={handleClearPress}
          />
        </View>

        {/* Dispatch Action */}
        <View style={styles.dispatchSection}>
          <Button
            label={submitting ? 'Verifying MPIN & Pinging...' : `Ping Desk for Pickup (${targetList.length})`}
            onPress={handleDispatchPing}
            loading={submitting}
            disabled={mpin.length !== APP_CONFIG.MPIN_LENGTH || submitting}
          />
        </View>
      </ScrollView>

      {/* Hub QR Scanner Modal */}
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
    borderRadius: Radius.full,
    backgroundColor: Colors.surface.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.surface.border,
  },
  screenTitle: {
    fontSize: Typography.fontSize.body,
    fontWeight: '700',
    color: Colors.structure.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    marginVertical: 14,
  },
  stepBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.accent.subtleGreen,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    marginBottom: 8,
  },
  stepBadgeText: {
    fontSize: Typography.fontSize.tiny,
    fontWeight: '800',
    color: Colors.accent.successText,
    letterSpacing: 0.5,
  },
  headline: {
    fontSize: Typography.fontSize.title2,
    fontWeight: '800',
    color: Colors.structure.textPrimary,
    letterSpacing: -0.5,
  },
  subhead: {
    fontSize: Typography.fontSize.subhead,
    color: Colors.structure.textMuted,
    lineHeight: 20,
    marginTop: 4,
  },
  parcelCard: {
    backgroundColor: Colors.surface.card,
    borderRadius: Radius.xxl,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.surface.border,
    marginBottom: 14,
  },
  parcelCardHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.structure.textMuted,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  parcelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface.subtle,
  },
  carrierText: {
    fontSize: Typography.fontSize.body,
    fontWeight: '700',
    color: Colors.structure.textPrimary,
  },
  waybillMono: {
    fontSize: Typography.fontSize.caption,
    fontFamily: Typography.fontFamily.mono,
    color: Colors.structure.textSecondary,
    marginTop: 2,
  },
  changeNotice: {
    fontSize: Typography.fontSize.caption,
    fontWeight: '700',
    color: Colors.accent.successText,
  },
  stationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface.card,
    borderRadius: Radius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surface.border,
    marginBottom: 16,
  },
  stationLeft: {
    flex: 1,
  },
  stationLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.structure.textMuted,
    letterSpacing: 0.5,
  },
  stationValue: {
    fontSize: Typography.fontSize.body,
    fontWeight: '700',
    fontFamily: Typography.fontFamily.mono,
    color: Colors.accent.brandPrimary,
    marginTop: 2,
  },
  scanBtn: {
    backgroundColor: Colors.accent.subtleBlue,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  scanBtnText: {
    fontSize: Typography.fontSize.caption,
    fontWeight: '700',
    color: Colors.accent.brandPrimary,
  },
  mpinHeader: {
    alignItems: 'center',
    marginTop: 6,
  },
  mpinLabel: {
    fontSize: Typography.fontSize.caption,
    fontWeight: '800',
    color: Colors.structure.textMuted,
    letterSpacing: 1,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginVertical: 14,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: Radius.full,
    borderWidth: 2,
    borderColor: Colors.surface.border,
    backgroundColor: Colors.surface.subtle,
  },
  dotFilled: {
    borderColor: Colors.accent.brandPrimary,
    backgroundColor: Colors.accent.brandPrimary,
  },
  keypadBox: {
    alignItems: 'center',
  },
  dispatchSection: {
    marginTop: 18,
  },
  emptyContainer: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: Typography.fontSize.title3,
    fontWeight: '800',
    color: Colors.structure.textPrimary,
  },
  emptyBody: {
    fontSize: Typography.fontSize.body,
    color: Colors.structure.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
  successScroll: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  successIconBox: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    backgroundColor: Colors.accent.subtleGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  successTitle: {
    fontSize: Typography.fontSize.title2,
    fontWeight: '800',
    color: Colors.structure.textPrimary,
    textAlign: 'center',
  },
  successSub: {
    fontSize: Typography.fontSize.subhead,
    color: Colors.structure.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
    marginBottom: 20,
  },
  envelopeCard: {
    backgroundColor: Colors.surface.card,
    borderRadius: Radius.xxl,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.surface.border,
  },
  envelopeHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.structure.textMuted,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  envelopeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface.subtle,
  },
  envelopeLabel: {
    fontSize: Typography.fontSize.body,
    color: Colors.structure.textSecondary,
  },
  envelopeValue: {
    fontSize: Typography.fontSize.body,
    fontWeight: '700',
    color: Colors.structure.textPrimary,
  },
  envelopeValueMono: {
    fontSize: Typography.fontSize.body,
    fontWeight: '700',
    fontFamily: Typography.fontFamily.mono,
    color: Colors.accent.brandPrimary,
  },
  miniParcelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  miniWaybill: {
    fontSize: Typography.fontSize.caption,
    fontFamily: Typography.fontFamily.mono,
    color: Colors.structure.textPrimary,
  },
  miniChange: {
    fontSize: Typography.fontSize.caption,
    fontWeight: '700',
    color: Colors.accent.successText,
  },
  changeRow: {
    marginTop: 8,
    borderBottomWidth: 0,
    alignItems: 'baseline',
  },
  changeLabel: {
    fontSize: Typography.fontSize.headline,
    fontWeight: '800',
    color: Colors.accent.successText,
  },
  changeValue: {
    fontSize: Typography.fontSize.title2,
    fontWeight: '800',
    fontFamily: Typography.fontFamily.mono,
    color: Colors.accent.successText,
  },
  actionButtonWrapper: {
    width: '100%',
    marginTop: 24,
  },
});
