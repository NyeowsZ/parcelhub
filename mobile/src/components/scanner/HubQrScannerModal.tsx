import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Typography, Shadows } from '../../constants/theme';
import { APP_CONFIG } from '../../constants/config';
import { Button } from '../common/Button';
import { CloseIcon, QrCodeIcon } from '../common/Icons';

interface HubQrScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScanSuccess: (stationCode: string) => void;
}

export const HubQrScannerModal: React.FC<HubQrScannerModalProps> = ({
  visible,
  onClose,
  onScanSuccess,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 16), paddingBottom: Math.max(insets.bottom, 20) }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onClose}
            style={styles.closeBtn}
          >
            <CloseIcon size={16} color={Colors.structure.textPrimary} strokeWidth={2.4} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan Hub Station QR</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Instructions */}
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionTitle}>Physical Counter Handshake</Text>
          <Text style={styles.instructionBody}>
            Point your camera at the printable QR code displayed at the CTU Danao
            counter desk to initiate custody verification.
          </Text>
        </View>

        {/* Viewfinder Frame (Hero Radius 28px) */}
        <View style={styles.viewfinderWrapper}>
          <View style={[styles.viewfinderFrame, Shadows.level3]}>
            {/* Corner guides */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            {/* Scanning Line / Status */}
            <View style={styles.scannerCenterContent}>
              <QrCodeIcon size={44} color={Colors.accent.brandPrimary} strokeWidth={1.8} />
              <Text style={styles.scannerPrompt}>Align Station QR Code</Text>
              <Text style={styles.stationTargetHint}>
                Target: {APP_CONFIG.DEFAULT_STATION_CODE}
              </Text>
            </View>
          </View>
        </View>

        {/* Simulation / Station Selection Fallback for Dev & Testing */}
        <View style={styles.bottomActions}>
          <Text style={styles.devHint}>
            Testing on device / simulator? Tap below to authenticate station:
          </Text>
          <Button
            label={`Simulate Scan (${APP_CONFIG.DEFAULT_STATION_CODE})`}
            onPress={() => onScanSuccess(APP_CONFIG.DEFAULT_STATION_CODE)}
            variant="primary"
          />
        </View>
      </View>
    </Modal>
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
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...Typography.sizes.h2,
    color: Colors.structure.textPrimary,
  },
  instructionContainer: {
    paddingHorizontal: 24,
    marginVertical: 16,
    alignItems: 'center',
  },
  instructionTitle: {
    ...Typography.sizes.bodyBold,
    color: Colors.structure.textPrimary,
    marginBottom: 4,
  },
  instructionBody: {
    ...Typography.sizes.body,
    color: Colors.structure.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  viewfinderWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  viewfinderFrame: {
    width: 260,
    height: 260,
    borderRadius: Radius.hero, // rounded-3xl (28px)
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: Colors.accent.brandPrimary,
  },
  cornerTL: {
    top: 16,
    left: 16,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: 16,
    right: 16,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: 16,
    left: 16,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: 16,
    right: 16,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  scannerCenterContent: {
    alignItems: 'center',
    gap: 8,
  },
  scannerPrompt: {
    ...Typography.sizes.bodyBold,
    color: '#FFFFFF',
  },
  stationTargetHint: {
    ...Typography.sizes.caption,
    fontFamily: Typography.fontFamily.mono,
    color: '#94A3B8',
  },
  bottomActions: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  devHint: {
    ...Typography.sizes.caption,
    color: Colors.structure.textMuted,
    textAlign: 'center',
  },
});
