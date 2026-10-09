import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Typography, Shadows } from '../constants/theme';
import { APP_CONFIG } from '../constants/config';
import { MpinKeypad } from '../components/mpin/MpinKeypad';
import { UserProfile } from '../types/auth';
import { AuthService } from '../services/authService';
import { LockIcon } from '../components/common/Icons';

interface MpinLockScreenProps {
  user: UserProfile;
  onUnlockSuccess: () => void;
  onSwitchAccount: () => void;
}

export const MpinLockScreen: React.FC<MpinLockScreenProps> = ({
  user,
  onUnlockSuccess,
  onSwitchAccount,
}) => {
  const insets = useSafeAreaInsets();
  const [mpin, setMpin] = useState('');
  const [errorCount, setErrorCount] = useState(0);

  const handleDigitPress = async (digit: string) => {
    if (mpin.length < APP_CONFIG.MPIN_LENGTH) {
      const updated = mpin + digit;
      setMpin(updated);

      if (updated.length === APP_CONFIG.MPIN_LENGTH) {
        // Automatically verify upon completing 6 digits
        const isValid = await AuthService.verifyMpin(updated);
        if (isValid) {
          onUnlockSuccess();
        } else {
          setErrorCount((c) => c + 1);
          Alert.alert('Incorrect MPIN', 'The 6-digit MPIN you entered is incorrect. Default demo PIN: 123456');
          setMpin('');
        }
      }
    }
  };

  const handleDeletePress = () => {
    setMpin((prev) => prev.slice(0, -1));
  };

  const handleClearPress = () => {
    setMpin('');
  };

  const handleQuickUnlock = async () => {
    setMpin('123456');
    const isValid = await AuthService.verifyMpin('123456');
    if (isValid) {
      onUnlockSuccess();
    }
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 24), paddingBottom: Math.max(insets.bottom, 20) }]}>
      {/* Top Identity Header */}
      <View style={styles.header}>
        <View style={[styles.lockIconBox, Shadows.level1]}>
          <LockIcon size={24} color={Colors.accent.brandPrimary} strokeWidth={2.2} />
        </View>

        <Text style={styles.title}>Enter Account MPIN</Text>
        <Text style={styles.subtitle}>
          Session locked. Enter your 6-digit security PIN to access your campus parcel dashboard.
        </Text>

        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.full_name?.charAt(0) || 'U'}</Text>
          </View>
          <View>
            <Text style={styles.userName}>{user.full_name}</Text>
            <Text style={styles.userSchoolId}>{user.school_id} · {user.email}</Text>
          </View>
        </View>
      </View>

      {/* Keypad Container (includes built-in indicators) */}
      <View style={styles.keypadWrapper}>
        <MpinKeypad
          mpin={mpin}
          onDigitPress={handleDigitPress}
          onDeletePress={handleDeletePress}
          onClearPress={handleClearPress}
        />
      </View>

      {/* Bottom Switch / Demo Actions */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleQuickUnlock}
          style={styles.quickUnlockBtn}
        >
          <Text style={styles.quickUnlockText}>Quick Demo Unlock (123456)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onSwitchAccount}
          style={styles.switchBtn}
        >
          <Text style={styles.switchBtnText}>Sign In with Another Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface.canvas,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 12,
  },
  lockIconBox: {
    width: 52,
    height: 52,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surface.card,
    borderWidth: 1,
    borderColor: Colors.surface.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: Typography.fontSize.title2,
    fontWeight: '800',
    color: Colors.structure.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: Typography.fontSize.caption,
    color: Colors.structure.textMuted,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 16,
    lineHeight: 18,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 18,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface.card,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.surface.border,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: Colors.accent.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  userName: {
    fontSize: Typography.fontSize.body,
    fontWeight: '700',
    color: Colors.structure.textPrimary,
  },
  userSchoolId: {
    fontSize: Typography.fontSize.small,
    color: Colors.structure.textMuted,
    fontFamily: Typography.fontFamily.mono,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginVertical: 16,
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
  keypadWrapper: {
    alignItems: 'center',
  },
  bottomBar: {
    alignItems: 'center',
    gap: 8,
  },
  quickUnlockBtn: {
    paddingVertical: 6,
  },
  quickUnlockText: {
    fontSize: Typography.fontSize.caption,
    fontWeight: '700',
    color: Colors.accent.brandPrimary,
  },
  switchBtn: {
    paddingVertical: 6,
  },
  switchBtnText: {
    fontSize: Typography.fontSize.caption,
    fontWeight: '600',
    color: Colors.structure.textMuted,
  },
});
