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
import { Colors, Radius, Typography, Shadows } from '../constants/theme';
import { APP_CONFIG } from '../constants/config';
import { Button } from '../components/common/Button';
import {
  KeyIcon,
  BellIcon,
  ChevronRightIcon,
  ShieldCheckIcon,
  HubStationIcon,
} from '../components/common/Icons';

export const ProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [pushEnabled, setPushEnabled] = useState(true);

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Account & Security</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollList,
          { paddingBottom: insets.bottom + 96 },
        ]}
      >
        {/* Student Profile Identity Card */}
        <View style={[styles.profileCard, Shadows.level2]}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarInitials}>JV</Text>
          </View>

          <View style={styles.profileDetails}>
            <Text style={styles.studentName}>John Vince Keyed</Text>
            <Text style={styles.studentEmail}>johnvincekeyed@ctu.edu.ph</Text>

            <View style={styles.schoolIdBadge}>
              <Text style={styles.schoolIdText}>ID: CTU-2024-8841</Text>
            </View>
          </View>
        </View>

        {/* Security & MPIN Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>SECURITY PRIMITIVES</Text>

          <View style={styles.menuCard}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                Alert.alert(
                  '6-Digit MPIN Security',
                  'Your MPIN is strictly client-side decrypted and zero-knowledge to couriers. It signs dynamic claim handshake tokens for parcel release.'
                )
              }
              style={styles.menuRow}
            >
              <View style={styles.menuLeft}>
                <View style={styles.menuIconBox}>
                  <KeyIcon size={18} color={Colors.accent.brandPrimary} strokeWidth={2} />
                </View>
                <View>
                  <Text style={styles.menuTitle}>6-Digit User MPIN</Text>
                  <Text style={styles.menuSub}>Active · Required for Atomic Claim</Text>
                </View>
              </View>
              <ChevronRightIcon size={18} color={Colors.structure.textMuted} strokeWidth={2} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setPushEnabled(!pushEnabled)}
              style={styles.menuRow}
            >
              <View style={styles.menuLeft}>
                <View style={styles.menuIconBox}>
                  <BellIcon size={18} color={Colors.accent.brandPrimary} strokeWidth={2} />
                </View>
                <View>
                  <Text style={styles.menuTitle}>Instant Push Alerts</Text>
                  <Text style={styles.menuSub}>Notified on RECEIVED_LOGGED state</Text>
                </View>
              </View>
              <Text style={[styles.statusText, pushEnabled && styles.statusTextActive]}>
                {pushEnabled ? 'Enabled' : 'Disabled'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Campus Terminal Hub Node */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>CAMPUS LOGISTICS NODE</Text>
          <View style={styles.menuCard}>
            <View style={styles.stationRow}>
              <View style={styles.stationTitleRow}>
                <HubStationIcon size={18} color={Colors.accent.brandPrimary} strokeWidth={2} />
                <Text style={styles.stationCode}>{APP_CONFIG.DEFAULT_STATION_CODE}</Text>
              </View>
              <Text style={styles.stationName}>{APP_CONFIG.DEFAULT_STATION_NAME}</Text>
              <Text style={styles.stationHours}>Hours: Mon-Fri 07:30 - 18:00 PHT</Text>
            </View>
          </View>
        </View>

        {/* Core Invariants Transparency */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>ZERO-CREDIT ESCROW INVARIANTS</Text>

          <View style={styles.invariantItem}>
            <View style={styles.invariantTitleRow}>
              <ShieldCheckIcon size={16} color={Colors.accent.brandPrimary} strokeWidth={2} />
              <Text style={styles.invariantBullet}>1. Solvency Invariant:</Text>
            </View>
            <Text style={styles.invariantExpl}>{APP_CONFIG.INVARIANTS.solvency}</Text>
          </View>

          <View style={styles.invariantItem}>
            <View style={styles.invariantTitleRow}>
              <ShieldCheckIcon size={16} color={Colors.accent.brandPrimary} strokeWidth={2} />
              <Text style={styles.invariantBullet}>2. Monotonic State Flow:</Text>
            </View>
            <Text style={styles.invariantExpl}>{APP_CONFIG.INVARIANTS.fsm}</Text>
          </View>

          <View style={styles.invariantItem}>
            <View style={styles.invariantTitleRow}>
              <ShieldCheckIcon size={16} color={Colors.accent.brandPrimary} strokeWidth={2} />
              <Text style={styles.invariantBullet}>3. Atomic Handshake:</Text>
            </View>
            <Text style={styles.invariantExpl}>{APP_CONFIG.INVARIANTS.handshake}</Text>
          </View>
        </View>

        {/* Logout / Switch Session */}
        <Button
          label="Sign Out"
          onPress={() => Alert.alert('Session', 'Signed out from student profile.')}
          variant="secondary"
          style={{ marginTop: 8 }}
        />
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  title: {
    ...Typography.sizes.h1,
    color: Colors.structure.textPrimary,
  },
  scrollList: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  profileCard: {
    backgroundColor: '#0F172A', // slate-900 high contrast hero surface
    borderRadius: Radius.hero,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  avatarBox: {
    width: 58,
    height: 58,
    borderRadius: Radius.pill,
    backgroundColor: Colors.accent.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    ...Typography.sizes.h2,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  profileDetails: {
    flex: 1,
  },
  studentName: {
    ...Typography.sizes.h2,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  studentEmail: {
    ...Typography.sizes.caption,
    color: '#94A3B8',
    marginBottom: 6,
  },
  schoolIdBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
  },
  schoolIdText: {
    ...Typography.sizes.caption,
    fontFamily: Typography.fontFamily.mono,
    color: '#38BDF8',
    fontWeight: '700',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    ...Typography.sizes.label,
    color: Colors.structure.textSecondary,
    marginBottom: 8,
    paddingLeft: 4,
  },
  menuCard: {
    backgroundColor: Colors.surface.card,
    borderRadius: Radius.card,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.structure.borderSubtle,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: Radius.input,
    backgroundColor: Colors.surface.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: {
    ...Typography.sizes.bodyBold,
    color: Colors.structure.textPrimary,
  },
  menuSub: {
    ...Typography.sizes.caption,
    color: Colors.structure.textMuted,
  },
  statusText: {
    ...Typography.sizes.caption,
    fontWeight: '700',
    color: Colors.structure.textMuted,
  },
  statusTextActive: {
    color: Colors.accent.successText,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.structure.borderSubtle,
    marginVertical: 10,
  },
  stationRow: {
    gap: 4,
  },
  stationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stationCode: {
    ...Typography.sizes.bodyBold,
    fontFamily: Typography.fontFamily.mono,
    color: Colors.accent.brandPrimary,
  },
  stationName: {
    ...Typography.sizes.body,
    color: Colors.structure.textPrimary,
  },
  stationHours: {
    ...Typography.sizes.caption,
    color: Colors.structure.textMuted,
  },
  invariantItem: {
    backgroundColor: Colors.surface.card,
    padding: 14,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.structure.borderSubtle,
    marginBottom: 8,
  },
  invariantTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  invariantBullet: {
    ...Typography.sizes.caption,
    fontWeight: '700',
    color: Colors.structure.textPrimary,
  },
  invariantExpl: {
    ...Typography.sizes.caption,
    color: Colors.structure.textSecondary,
    lineHeight: 16,
  },
});
