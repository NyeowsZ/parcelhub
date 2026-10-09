import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Typography, Shadows } from '../constants/theme';
import { APP_CONFIG } from '../constants/config';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { ArrowLeftIcon, ShieldCheckIcon, CheckCircleIcon } from '../components/common/Icons';
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

  // Screen flow steps: 1 = Receipt Upload (if AI enabled), 2 = Confirmation / Manual Entry
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [aiEnabledOnServer, setAiEnabledOnServer] = useState(true);
  const [checkingConfig, setCheckingConfig] = useState(true);

  // Step 1 State: Receipt Screenshot
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [anchoredParcelId, setAnchoredParcelId] = useState<string | null>(null);

  // Step 2 State: Autofilled / Editable Confirmation Fields
  const [waybill, setWaybill] = useState('');
  const [recipientName, setRecipientName] = useState('John Vince Keyed');
  const [carrier, setCarrier] = useState<string>(APP_CONFIG.SUPPORTED_COURIERS[0]);
  const [codAmount, setCodAmount] = useState('');
  const [isPrepaid, setIsPrepaid] = useState(false);
  const [committing, setCommitting] = useState(false);

  // Check server configuration on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await ParcelService.getServerConfig();
        setAiEnabledOnServer(config.ai_user_receipt_ocr);
        if (!config.ai_user_receipt_ocr) {
          // Rule 3.5: If admin disabled AI in server, skip straight to manual typing!
          setCurrentStep(2);
        }
      } catch {
        setAiEnabledOnServer(true);
      } finally {
        setCheckingConfig(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSelectSampleReceipt = () => {
    setReceiptImage('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80');
  };

  // Rule 4: Run AI Receipt Verification & Anchor ID in DB prior to proceeding
  const handleRunAiReceiptOcr = async () => {
    if (!receiptImage) {
      Alert.alert('Screenshot Required', 'Please select or upload a receipt screenshot containing waybill, receiver name, and amount.');
      return;
    }

    try {
      setScanning(true);
      const res = await ParcelService.verifyReceiptScreenshot(receiptImage);

      if (!res.is_valid) {
        Alert.alert('Invalid Receipt', 'The uploaded screenshot did not contain valid waybill or receiver details.');
        return;
      }

      // Lock anchored parcel ID
      setAnchoredParcelId(res.parcelId);
      setWaybill(res.waybill_number || '');
      setRecipientName(res.recipient_name || 'John Vince Keyed');
      setCarrier(res.carrier || APP_CONFIG.SUPPORTED_COURIERS[0]);
      setCodAmount(res.amount ? res.amount.toString() : '0');
      setIsPrepaid(res.amount === 0);

      // Rule 5: Proceeds to autofilled editable confirmation page
      setCurrentStep(2);
    } catch (e: any) {
      Alert.alert('Scan Failed', e.message || 'Unable to analyze receipt screenshot.');
    } finally {
      setScanning(false);
    }
  };

  // Commit order creation
  const handleFinalSubmit = async () => {
    if (!waybill.trim()) {
      Alert.alert('Required Field', 'Please provide a valid courier tracking or waybill number.');
      return;
    }

    const amountNumber = isPrepaid ? 0 : parseFloat(codAmount) || 0;

    try {
      setCommitting(true);
      await ParcelService.preRegister({
        waybill_number: waybill.trim(),
        carrier,
        cod_amount: amountNumber,
        anchoredParcelId: anchoredParcelId || undefined,
        receiptImageUri: receiptImage || undefined,
        recipientName: recipientName.trim(),
      });

      Alert.alert(
        'Parcel Staged Successfully',
        amountNumber > 0
          ? `Consignment is initialized as STAGED. When you are at the CTU Danao desk, tap "Pay at Desk" and scan the station QR to ping the staff and hand your cash.`
          : 'Non-COD parcel staged. Approach the desk when convenient to complete check-in.',
        [{ text: 'Got It', onPress: onSuccess }]
      );
    } catch (e: any) {
      Alert.alert('Registration Error', e.message || 'Failed to register consignment.');
    } finally {
      setCommitting(false);
    }
  };

  if (checkingConfig) {
    return (
      <View style={[styles.container, styles.loadingCenter]}>
        <ActivityIndicator size="large" color={Colors.accent.brandPrimary} />
        <Text style={styles.loadingText}>Connecting to campus logistics node...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={currentStep === 2 && aiEnabledOnServer ? () => setCurrentStep(1) : onBack}
          style={styles.backButton}
        >
          <ArrowLeftIcon size={18} color={Colors.structure.textPrimary} strokeWidth={2.2} />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>
          {currentStep === 1 ? 'Upload Receipt Screenshot' : 'Confirm Order Details'}
        </Text>
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
            <Text style={styles.stepBadgeText}>
              {currentStep === 1 ? 'STEP 1 OF 2 · AI OCR RECEIPT' : 'STEP 2 OF 2 · CONFIRMATION'}
            </Text>
          </View>
          <Text style={styles.stageHeadline}>
            {currentStep === 1 ? 'Scan Order Receipt' : 'Review & Stage Delivery'}
          </Text>
          <Text style={styles.stageSub}>
            {currentStep === 1
              ? 'Send a screenshot of the receipt containing the tracking number, receiver’s name, and amount to auto-populate fields.'
              : 'Verify the extracted delivery information. All fields are editable prior to staging.'}
          </Text>
        </View>

        {/* STEP 1: Screenshot Upload & AI Check */}
        {currentStep === 1 && (
          <View style={[styles.card, Shadows.level1]}>
            <Text style={styles.fieldLabel}>Receipt Screenshot</Text>
            <Text style={styles.helperText}>
              Must show: Waybill Tracking ID, Recipient Name, and Amount Due.
            </Text>

            {receiptImage ? (
              <View style={styles.previewBox}>
                <Image source={{ uri: receiptImage }} style={styles.previewImage} resizeMode="cover" />
                <TouchableOpacity
                  onPress={() => setReceiptImage(null)}
                  style={styles.removeImageBtn}
                >
                  <Text style={styles.removeImageText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.uploadBox}>
                <Text style={styles.uploadTitle}>No screenshot selected</Text>
                <Text style={styles.uploadSub}>Choose an order confirmation receipt from Shopee, Lazada, TikTok, etc.</Text>

                <View style={styles.uploadBtnRow}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleSelectSampleReceipt}
                    style={styles.sampleBtn}
                  >
                    <Text style={styles.sampleBtnText}>Use Sample Shopee Receipt</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <Button
              label={scanning ? 'Analyzing Receipt via Gemini AI...' : 'Scan & Anchor Receipt'}
              onPress={handleRunAiReceiptOcr}
              loading={scanning}
              disabled={!receiptImage || scanning}
              style={{ marginTop: 16 }}
            />

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setCurrentStep(2)}
              style={styles.skipBtn}
            >
              <Text style={styles.skipBtnText}>Skip and enter manually instead →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 2: Autofilled & Editable Form */}
        {currentStep === 2 && (
          <View style={styles.formSection}>
            {anchoredParcelId && (
              <View style={styles.anchorNotice}>
                <CheckCircleIcon size={16} color={Colors.accent.successText} strokeWidth={2.5} />
                <Text style={styles.anchorNoticeText}>
                  Receipt OCR validated! Record ID anchored: <Text style={styles.monoText}>{anchoredParcelId}</Text>
                </Text>
              </View>
            )}

            <Input
              label="Recipient Full Name"
              placeholder="e.g. John Vince Keyed"
              value={recipientName}
              onChangeText={setRecipientName}
            />

            <Input
              label="Courier Waybill / Tracking Number"
              placeholder="e.g. SPXPH0492817263, JT99482103847"
              value={waybill}
              onChangeText={setWaybill}
              autoCapitalize="characters"
              style={{ fontFamily: Typography.fontFamily.mono }}
            />

            {/* Carrier Selection */}
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
            <Text style={styles.fieldLabel}>Payment Type</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsPrepaid(false)}
                style={[styles.toggleBtn, !isPrepaid && styles.toggleBtnActive]}
              >
                <Text style={[styles.toggleText, !isPrepaid && styles.toggleTextActive]}>
                  Cash on Delivery (COD)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setIsPrepaid(true);
                  setCodAmount('0');
                }}
                style={[styles.toggleBtn, isPrepaid && styles.toggleBtnActive]}
              >
                <Text style={[styles.toggleText, isPrepaid && styles.toggleTextActive]}>
                  Prepaid (No Cash)
                </Text>
              </TouchableOpacity>
            </View>

            {/* COD Amount Input */}
            {!isPrepaid && (
              <Input
                label="Declared Courier COD Amount (PHP)"
                placeholder="e.g. 340.00"
                value={codAmount}
                onChangeText={setCodAmount}
                keyboardType="decimal-pad"
                style={{ fontFamily: Typography.fontFamily.mono }}
              />
            )}

            {/* Zero-Credit Escrow Notice */}
            <View style={styles.solvencyNotice}>
              <ShieldCheckIcon size={18} color={Colors.accent.brandPrimary} strokeWidth={2.2} />
              <View style={{ flex: 1 }}>
                <Text style={styles.solvencyTitle}>Physical Counter Handshake Invariant</Text>
                <Text style={styles.solvencyBody}>
                  ParcelHub holds zero credit. You must scan the Station QR or enter Hub ID at the desk to ping staff and fund your envelope before delivery arrival.
                </Text>
              </View>
            </View>

            <Button
              label={committing ? 'Committing Order...' : 'Confirm & Stage Order'}
              onPress={handleFinalSubmit}
              loading={committing}
              style={{ marginTop: 8 }}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface.canvas,
  },
  loadingCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: Typography.fontSize.caption,
    color: Colors.structure.textMuted,
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
  },
  stageHeader: {
    marginVertical: 16,
  },
  stepBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.accent.subtleBlue,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    marginBottom: 8,
  },
  stepBadgeText: {
    fontSize: Typography.fontSize.tiny,
    fontWeight: '800',
    color: Colors.accent.brandPrimary,
    letterSpacing: 0.5,
  },
  stageHeadline: {
    fontSize: Typography.fontSize.title2,
    fontWeight: '800',
    color: Colors.structure.textPrimary,
    letterSpacing: -0.5,
  },
  stageSub: {
    fontSize: Typography.fontSize.subhead,
    color: Colors.structure.textMuted,
    lineHeight: 20,
    marginTop: 4,
  },
  card: {
    backgroundColor: Colors.surface.card,
    borderRadius: Radius.xxl,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.surface.border,
  },
  fieldLabel: {
    fontSize: Typography.fontSize.caption,
    fontWeight: '700',
    color: Colors.structure.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  helperText: {
    fontSize: Typography.fontSize.small,
    color: Colors.structure.textMuted,
    marginBottom: 12,
  },
  uploadBox: {
    padding: 24,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surface.subtle,
    borderWidth: 2,
    borderColor: Colors.surface.border,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  uploadTitle: {
    fontSize: Typography.fontSize.body,
    fontWeight: '700',
    color: Colors.structure.textPrimary,
  },
  uploadSub: {
    fontSize: Typography.fontSize.small,
    color: Colors.structure.textMuted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  uploadBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sampleBtn: {
    backgroundColor: Colors.surface.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.accent.brandPrimary,
  },
  sampleBtnText: {
    fontSize: Typography.fontSize.caption,
    fontWeight: '700',
    color: Colors.accent.brandPrimary,
  },
  previewBox: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    position: 'relative',
    height: 180,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  removeImageText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.tiny,
    fontWeight: '700',
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipBtnText: {
    fontSize: Typography.fontSize.caption,
    color: Colors.structure.textMuted,
    fontWeight: '600',
  },
  formSection: {
    gap: 16,
  },
  anchorNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.accent.subtleGreen,
    padding: 12,
    borderRadius: Radius.xl,
  },
  anchorNoticeText: {
    fontSize: Typography.fontSize.caption,
    color: Colors.accent.successText,
    fontWeight: '600',
  },
  monoText: {
    fontFamily: Typography.fontFamily.mono,
    fontWeight: '800',
  },
  carrierScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  carrierChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface.card,
    borderWidth: 1,
    borderColor: Colors.surface.border,
  },
  carrierChipSelected: {
    backgroundColor: Colors.accent.brandPrimary,
    borderColor: Colors.accent.brandPrimary,
  },
  carrierText: {
    fontSize: Typography.fontSize.caption,
    fontWeight: '600',
    color: Colors.structure.textSecondary,
  },
  carrierTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface.subtle,
    borderRadius: Radius.full,
    padding: 4,
    gap: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: Radius.full,
  },
  toggleBtnActive: {
    backgroundColor: Colors.surface.card,
    ...Shadows.level1,
  },
  toggleText: {
    fontSize: Typography.fontSize.caption,
    fontWeight: '600',
    color: Colors.structure.textMuted,
  },
  toggleTextActive: {
    color: Colors.structure.textPrimary,
    fontWeight: '700',
  },
  solvencyNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    backgroundColor: Colors.accent.subtleBlue,
    borderRadius: Radius.xl,
    marginTop: 4,
  },
  solvencyTitle: {
    fontSize: Typography.fontSize.caption,
    fontWeight: '700',
    color: Colors.accent.brandPrimary,
  },
  solvencyBody: {
    fontSize: Typography.fontSize.small,
    color: Colors.structure.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },
});
