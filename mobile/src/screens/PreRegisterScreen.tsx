import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Typography } from '../constants/theme';
import { APP_CONFIG } from '../constants/config';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { ArrowLeftIcon, ShieldCheckIcon } from '../components/common/Icons';
import { ParcelService } from '../services/parcelService';

interface PreRegisterScreenProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const PreRegisterScreen: React.FC<PreRegisterScreenProps> = ({
  onBack,
  onSuccess,
}) => {
  const insets = useSafeAreaInsets();
  const [waybill, setWaybill] = useState('');
  const [carrier, setCarrier] = useState<string>(APP_CONFIG.SUPPORTED_COURIERS[0]);
  const [codAmount, setCodAmount] = useState('');
  const [isPrepaid, setIsPrepaid] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!waybill.trim()) {
      Alert.alert('Required Field', 'Please provide a valid courier tracking or waybill number.');
      return;
    }

    const amountNumber = isPrepaid ? 0 : parseFloat(codAmount) || 0;

    try {
      setLoading(true);
      await ParcelService.preRegister({
        waybill_number: waybill.trim(),
        carrier,
        cod_amount: amountNumber,
      });

      Alert.alert(
        'Parcel Staged Successfully',
        amountNumber > 0
          ? `Consignment is initialized as STAGED. Please visit the CTU Danao desk to deposit ${APP_CONFIG.CURRENCY_SYMBOL}${amountNumber.toFixed(2)} in your isolated envelope so staff can accept your delivery.`
          : 'Non-COD parcel staged. Please complete desk check-in at your convenience.',
        [{ text: 'Got It', onPress: onSuccess }]
      );
    } catch (e: any) {
      Alert.alert('Registration Error', e.message || 'Failed to register consignment.');
    } finally {
      setLoading(false);
    }
  };

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
        <Text style={styles.screenTitle}>Pre-Register Parcel</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
      >
        {/* Step Indicator Header */}
        <View style={styles.stageHeader}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>FSM STAGE 1</Text>
          </View>
          <Text style={styles.stageHeadline}>Declare Incoming Delivery</Text>
          <Text style={styles.stageSub}>
            Register your courier waybill in advance to prepare cash escrow and enable zero-friction counter acceptance.
          </Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          <Input
            label="Courier Waybill / Tracking Number"
            placeholder="e.g. SPXPH0492817263, JT99482103847"
            value={waybill}
            onChangeText={setWaybill}
            autoCapitalize="characters"
            style={{ fontFamily: Typography.fontFamily.mono }}
          />

          {/* Carrier Selection Chips */}
          <Text style={styles.fieldLabel}>Delivery Carrier</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carrierScroll}
          >
            {APP_CONFIG.SUPPORTED_COURIERS.map((item) => {
              const isSelected = carrier === item;
              return (
                <TouchableOpacity
                  key={item}
                  activeOpacity={0.7}
                  onPress={() => setCarrier(item)}
                  style={[
                    styles.carrierChip,
                    isSelected && styles.carrierChipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.carrierText,
                      isSelected && styles.carrierTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Payment Type Selection */}
          <Text style={styles.fieldLabel}>Payment Arrangement</Text>
          <View style={styles.paymentToggleRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsPrepaid(false)}
              style={[
                styles.toggleOption,
                !isPrepaid && styles.toggleOptionActive,
              ]}
            >
              <Text
                style={[
                  styles.toggleText,
                  !isPrepaid && styles.toggleTextActive,
                ]}
              >
                Cash on Delivery (COD)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsPrepaid(true)}
              style={[
                styles.toggleOption,
                isPrepaid && styles.toggleOptionActive,
              ]}
            >
              <Text
                style={[
                  styles.toggleText,
                  isPrepaid && styles.toggleTextActive,
                ]}
              >
                Prepaid (₱0.00)
              </Text>
            </TouchableOpacity>
          </View>

          {/* COD Amount Input */}
          {!isPrepaid && (
            <Input
              label="Declared COD Payable Amount (₱)"
              placeholder="0.00"
              value={codAmount}
              onChangeText={setCodAmount}
              keyboardType="decimal-pad"
              prefix={
                <Text style={styles.currencyPrefix}>{APP_CONFIG.CURRENCY_SYMBOL}</Text>
              }
            />
          )}

          {/* Solvency Invariant Education Callout */}
          <View style={styles.invariantBox}>
            <View style={styles.invariantIconBox}>
              <ShieldCheckIcon size={18} color="#92400E" strokeWidth={2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.invariantTitle}>Solvency Invariant</Text>
              <Text style={styles.invariantBody}>
                The hub operates under zero-credit escrow. Counter staff cannot disburse funds or accept parcel handover from couriers until physical cash is deposited into your isolated envelope.
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <Button
            label="Stage Consignment"
            onPress={handleSubmit}
            loading={loading}
            variant="primary"
          />
          <Button
            label="Cancel"
            onPress={onBack}
            variant="secondary"
            style={{ marginTop: 10 }}
          />
        </View>
      </ScrollView>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  stageHeader: {
    marginBottom: 24,
  },
  stepBadge: {
    backgroundColor: Colors.accent.brandSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  stepBadgeText: {
    ...Typography.sizes.caption,
    color: Colors.accent.brandPrimary,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  stageHeadline: {
    ...Typography.sizes.h1,
    color: Colors.structure.textPrimary,
    marginBottom: 6,
  },
  stageSub: {
    ...Typography.sizes.body,
    color: Colors.structure.textSecondary,
    lineHeight: 20,
  },
  formSection: {
    marginBottom: 24,
  },
  fieldLabel: {
    ...Typography.sizes.label,
    color: Colors.structure.textSecondary,
    textTransform: 'uppercase',
    paddingLeft: 12,
    marginBottom: 8,
  },
  carrierScroll: {
    gap: 8,
    marginBottom: 20,
  },
  carrierChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface.subtle,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  carrierChipSelected: {
    backgroundColor: Colors.accent.brandPrimary,
  },
  carrierText: {
    ...Typography.sizes.caption,
    fontWeight: '600',
    color: Colors.structure.textSecondary,
  },
  carrierTextSelected: {
    color: '#FFFFFF',
  },
  paymentToggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface.subtle,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  toggleOptionActive: {
    backgroundColor: '#FFFFFF',
    borderColor: Colors.accent.brandPrimary,
  },
  toggleText: {
    ...Typography.sizes.caption,
    fontWeight: '600',
    color: Colors.structure.textSecondary,
  },
  toggleTextActive: {
    color: Colors.accent.brandPrimary,
    fontWeight: '700',
  },
  currencyPrefix: {
    ...Typography.sizes.bodyBold,
    color: Colors.structure.textPrimary,
  },
  invariantBox: {
    backgroundColor: '#FEF3C7', // amber-100
    borderRadius: Radius.card,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  invariantIconBox: {
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    backgroundColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  invariantTitle: {
    ...Typography.sizes.caption,
    color: '#92400E',
    fontWeight: '700',
    marginBottom: 2,
  },
  invariantBody: {
    ...Typography.sizes.caption,
    color: '#78350F',
    lineHeight: 16,
  },
  actionContainer: {
    marginTop: 8,
  },
});
