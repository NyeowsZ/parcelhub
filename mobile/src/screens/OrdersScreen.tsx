import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Typography, Shadows } from '../constants/theme';
import { ParcelRow } from '../types/database';
import { ParcelService } from '../services/parcelService';
import { ParcelCard } from '../components/home/ParcelCard';
import { PlusIcon, PackageIcon, CheckCircleIcon } from '../components/common/Icons';
import { HubQrScannerModal } from '../components/scanner/HubQrScannerModal';

interface OrdersScreenProps {
  onSelectParcelForClaim: (parcel: ParcelRow) => void;
  onSelectParcelsForClaim: (parcels: ParcelRow[]) => void;
  onNavigateToPreRegister: () => void;
}

type FilterTab = 'ALL' | 'READY' | 'PENDING' | 'CLAIMED';

export const OrdersScreen: React.FC<OrdersScreenProps> = ({
  onSelectParcelForClaim,
  onSelectParcelsForClaim,
  onNavigateToPreRegister,
}) => {
  const insets = useSafeAreaInsets();
  const [parcels, setParcels] = useState<ParcelRow[]>([]);
  const [filter, setFilter] = useState<FilterTab>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  // Multi-Selection state for RECEIVED_LOGGED parcels
  const [selectedClaimIds, setSelectedClaimIds] = useState<string[]>([]);

  // Payment Ping Modal state
  const [paymentPingTarget, setPaymentPingTarget] = useState<ParcelRow | null>(null);
  const [stationCodeInput, setStationCodeInput] = useState('CTU-DANAO-MAIN-HUB');
  const [scannerVisible, setScannerVisible] = useState(false);
  const [pingingPayment, setPingingPayment] = useState(false);

  const loadParcels = async () => {
    try {
      const data = await ParcelService.getMyParcels();
      setParcels(data);
    } catch (e) {
      console.warn('Error loading parcels:', e);
    }
  };

  useEffect(() => {
    loadParcels();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadParcels();
    setRefreshing(false);
  };

  const filteredParcels = parcels.filter((p) => {
    if (filter === 'READY') return p.current_status === 'RECEIVED_LOGGED';
    if (filter === 'PENDING') return p.current_status === 'STAGED' || p.current_status === 'FUNDED';
    if (filter === 'CLAIMED') return p.current_status === 'CLAIMED';
    return true;
  });

  // Toggle selection for batch pickup
  const handleToggleSelectParcel = (parcel: ParcelRow) => {
    if (parcel.current_status !== 'RECEIVED_LOGGED') {
      return;
    }

    setSelectedClaimIds((prev) => {
      if (prev.includes(parcel.parcel_id)) {
        return prev.filter((id) => id !== parcel.parcel_id);
      } else {
        return [...prev, parcel.parcel_id];
      }
    });
  };

  const handleLaunchBatchClaim = () => {
    const targets = parcels.filter((p) => selectedClaimIds.includes(p.parcel_id));
    if (targets.length === 0) return;
    onSelectParcelsForClaim(targets);
  };

  // Submit payment ping
  const handleConfirmPaymentPing = async () => {
    if (!paymentPingTarget) return;

    try {
      setPingingPayment(true);
      await ParcelService.dispatchPaymentPing(
        paymentPingTarget.parcel_id,
        stationCodeInput.trim() || 'CTU-DANAO-MAIN-HUB'
      );
      Alert.alert(
        'Desk Ping Active',
        `Payment ping sent to ${stationCodeInput}. Please present your cash to the counter operator so they can fund your envelope.`
      );
      setPaymentPingTarget(null);
      await loadParcels();
    } catch (e: any) {
      Alert.alert('Ping Error', e.message || 'Unable to ping counter desk.');
    } finally {
      setPingingPayment(false);
    }
  };

  // Calculation for floating claim drawer
  const selectedParcels = parcels.filter((p) => selectedClaimIds.includes(p.parcel_id));
  const totalSelectedChange = selectedParcels.reduce(
    (acc, curr) => acc + Math.max(0, curr.change_due),
    0
  );

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>All Consignments</Text>
          <Text style={styles.subtitle}>CTU Danao Campus Logistics Node</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onNavigateToPreRegister}
          style={styles.addBtn}
        >
          <PlusIcon size={14} color={Colors.accent.brandPrimary} strokeWidth={2.5} />
          <Text style={styles.addBtnText}>Stage New</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterBar}>
        {(['ALL', 'READY', 'PENDING', 'CLAIMED'] as FilterTab[]).map((tab) => {
          const isActive = filter === tab;
          const label =
            tab === 'ALL'
              ? 'All'
              : tab === 'READY'
              ? 'Ready (Desk)'
              : tab === 'PENDING'
              ? 'In Escrow'
              : 'Claimed';

          return (
            <TouchableOpacity
              key={tab}
              activeOpacity={0.7}
              onPress={() => setFilter(tab)}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  isActive && styles.filterChipTextActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Multi-Claim Instructions if any ready parcel */}
      {parcels.some((p) => p.current_status === 'RECEIVED_LOGGED') && (
        <View style={styles.instructionBanner}>
          <Text style={styles.instructionText}>
            Tip: Tap on any "Ready" parcel to select multiple consignments for batch pickup!
          </Text>
        </View>
      )}

      {/* Parcel List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollList,
          { paddingBottom: insets.bottom + (selectedClaimIds.length > 0 ? 140 : 96) },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.accent.brandPrimary}
          />
        }
      >
        {filteredParcels.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBox}>
              <PackageIcon size={32} color={Colors.structure.textMuted} strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>No parcels in this category</Text>
            <Text style={styles.emptySub}>
              Pre-register an incoming package tracking number to initiate escrow.
            </Text>
          </View>
        ) : (
          filteredParcels.map((parcel) => {
            const isReady = parcel.current_status === 'RECEIVED_LOGGED';
            const isSelected = selectedClaimIds.includes(parcel.parcel_id);

            return (
              <ParcelCard
                key={parcel.parcel_id}
                parcel={parcel}
                isSelectable={isReady}
                isSelected={isSelected}
                onPayAtDesk={() => setPaymentPingTarget(parcel)}
                onPress={() => {
                  if (isReady) {
                    handleToggleSelectParcel(parcel);
                  }
                }}
              />
            );
          })
        )}
      </ScrollView>

      {/* Floating Bottom Drawer for Multi-Parcel Claim */}
      {selectedClaimIds.length > 0 && (
        <View style={[styles.floatingBar, Shadows.level2, { bottom: insets.bottom + 80 }]}>
          <View style={styles.floatingInfo}>
            <Text style={styles.floatingTitle}>
              {selectedClaimIds.length} Parcel(s) Selected
            </Text>
            <Text style={styles.floatingSub}>
              Total Change: <Text style={styles.boldGreen}>₱{totalSelectedChange.toFixed(2)}</Text>
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleLaunchBatchClaim}
            style={styles.claimBatchBtn}
          >
            <Text style={styles.claimBatchBtnText}>Prompt Claim →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Payment Ping Modal (for Staged Parcels) */}
      <Modal
        visible={Boolean(paymentPingTarget)}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPaymentPingTarget(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, Shadows.level2]}>
            <Text style={styles.modalTitle}>Check In at Counter Desk</Text>
            <Text style={styles.modalSub}>
              Scan the physical Station QR or enter Hub ID to ping the desk operator and unlock cash acceptance.
            </Text>

            {paymentPingTarget && (
              <View style={styles.modalSummaryBox}>
                <Text style={styles.modalSummaryLabel}>Target Consignment</Text>
                <Text style={styles.modalSummaryValue}>{paymentPingTarget.waybill_number}</Text>
                <Text style={styles.modalSummaryCod}>
                  Required COD: ₱{paymentPingTarget.cod_amount.toFixed(2)}
                </Text>
              </View>
            )}

            <View style={styles.modalInputSection}>
              <Text style={styles.inputLabel}>Station ID</Text>
              <TextInput
                value={stationCodeInput}
                onChangeText={setStationCodeInput}
                placeholder="CTU-DANAO-MAIN-HUB"
                style={styles.modalInput}
              />

              <TouchableOpacity
                onPress={() => setScannerVisible(true)}
                style={styles.modalScanBtn}
              >
                <Text style={styles.modalScanBtnText}>Open QR Scanner</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                onPress={() => setPaymentPingTarget(null)}
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirmPaymentPing}
                disabled={pingingPayment}
                style={styles.modalSubmitBtn}
              >
                <Text style={styles.modalSubmitText}>
                  {pingingPayment ? 'Pinging Desk...' : 'Transmit Payment Ping'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* QR Scanner */}
      <HubQrScannerModal
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onScanSuccess={(code) => {
          setStationCodeInput(code);
          setScannerVisible(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface.canvas,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: {
    fontSize: Typography.fontSize.title2,
    fontWeight: '800',
    color: Colors.structure.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: Typography.fontSize.small,
    color: Colors.structure.textMuted,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: Colors.accent.subtleBlue,
    borderRadius: Radius.full,
  },
  addBtnText: {
    fontSize: Typography.fontSize.caption,
    fontWeight: '700',
    color: Colors.accent.brandPrimary,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginVertical: 10,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface.card,
    borderWidth: 1,
    borderColor: Colors.surface.border,
  },
  filterChipActive: {
    backgroundColor: Colors.accent.brandPrimary,
    borderColor: Colors.accent.brandPrimary,
  },
  filterChipText: {
    fontSize: Typography.fontSize.caption,
    fontWeight: '600',
    color: Colors.structure.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  instructionBanner: {
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 10,
    backgroundColor: Colors.accent.subtleGreen,
    borderRadius: Radius.lg,
  },
  instructionText: {
    fontSize: Typography.fontSize.tiny,
    color: Colors.accent.successText,
    fontWeight: '700',
  },
  scrollList: {
    paddingHorizontal: 20,
    paddingTop: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.body,
    fontWeight: '700',
    color: Colors.structure.textPrimary,
  },
  emptySub: {
    fontSize: Typography.fontSize.caption,
    color: Colors.structure.textMuted,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 240,
  },
  floatingBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: Colors.structure.textPrimary,
    borderRadius: Radius.full,
    paddingVertical: 12,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  floatingInfo: {
    flex: 1,
  },
  floatingTitle: {
    fontSize: Typography.fontSize.body,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  floatingSub: {
    fontSize: Typography.fontSize.caption,
    color: Colors.structure.borderSubtle,
    marginTop: 2,
  },
  boldGreen: {
    color: Colors.accent.successText,
    fontWeight: '800',
  },
  claimBatchBtn: {
    backgroundColor: Colors.accent.brandPrimary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.full,
  },
  claimBatchBtnText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.caption,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: Colors.surface.card,
    borderRadius: Radius.xxl,
    padding: 24,
  },
  modalTitle: {
    fontSize: Typography.fontSize.title3,
    fontWeight: '800',
    color: Colors.structure.textPrimary,
  },
  modalSub: {
    fontSize: Typography.fontSize.caption,
    color: Colors.structure.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  modalSummaryBox: {
    marginTop: 14,
    padding: 12,
    backgroundColor: Colors.surface.subtle,
    borderRadius: Radius.lg,
  },
  modalSummaryLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.structure.textMuted,
  },
  modalSummaryValue: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: '800',
    color: Colors.structure.textPrimary,
    marginTop: 2,
  },
  modalSummaryCod: {
    fontSize: Typography.fontSize.caption,
    fontWeight: '700',
    color: Colors.accent.brandPrimary,
    marginTop: 4,
  },
  modalInputSection: {
    marginTop: 14,
  },
  inputLabel: {
    fontSize: Typography.fontSize.tiny,
    fontWeight: '800',
    color: Colors.structure.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  modalInput: {
    height: 44,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.surface.border,
    paddingHorizontal: 14,
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.mono,
    color: Colors.structure.textPrimary,
  },
  modalScanBtn: {
    marginTop: 8,
    alignItems: 'center',
  },
  modalScanBtnText: {
    fontSize: Typography.fontSize.caption,
    fontWeight: '700',
    color: Colors.accent.brandPrimary,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  modalCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface.subtle,
  },
  modalCancelText: {
    fontSize: Typography.fontSize.caption,
    fontWeight: '700',
    color: Colors.structure.textMuted,
  },
  modalSubmitBtn: {
    flex: 2,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent.brandPrimary,
  },
  modalSubmitText: {
    fontSize: Typography.fontSize.caption,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
