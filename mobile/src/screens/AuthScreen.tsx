import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Typography, Shadows } from '../constants/theme';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { AuthService } from '../services/authService';
import { UserProfile } from '../types/auth';

interface AuthScreenProps {
  onAuthSuccess: (user: UserProfile) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login form state
  const [loginId, setLoginId] = useState('CTU-2024-8841');
  const [loginPassword, setLoginPassword] = useState('password123');

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regSchoolId, setRegSchoolId] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regMpin, setRegMpin] = useState('');

  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!loginId.trim() || !loginPassword.trim()) {
      Alert.alert('Required Fields', 'Please enter your School ID or Email and Password.');
      return;
    }

    try {
      setLoading(true);
      const user = await AuthService.login(loginId.trim(), loginPassword);
      onAuthSuccess(user);
    } catch (e: any) {
      Alert.alert('Sign In Failed', e.message || 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!regFullName.trim() || !regSchoolId.trim() || !regEmail.trim() || !regPassword || !regMpin) {
      Alert.alert('Incomplete Form', 'Please fill in all registration fields including your 6-digit MPIN.');
      return;
    }

    if (regMpin.length !== 6) {
      Alert.alert('Invalid MPIN', 'Account MPIN must be exactly 6 digits.');
      return;
    }

    try {
      setLoading(true);
      const user = await AuthService.register({
        fullName: regFullName,
        schoolId: regSchoolId,
        email: regEmail,
        password: regPassword,
        mpin: regMpin,
      });
      Alert.alert(
        'Account Registered',
        `Welcome to ParcelHub, ${user.full_name}! Please enter your 6-digit MPIN to unlock your dashboard.`,
        [{ text: 'Continue', onPress: () => onAuthSuccess(user) }]
      );
    } catch (e: any) {
      Alert.alert('Registration Failed', e.message || 'Unable to register account.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoFill = () => {
    setLoginId('CTU-2024-8841');
    setLoginPassword('password123');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { paddingTop: Math.max(insets.top, 20) }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
      >
        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <View style={[styles.logoIconBox, Shadows.level2]}>
            <Text style={styles.logoLetter}>P</Text>
          </View>
          <Text style={styles.brandTitle}>ParcelHub</Text>
          <Text style={styles.brandSubtitle}>CTU Danao Campus Logistics Node</Text>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setTab('LOGIN')}
            style={[styles.tabButton, tab === 'LOGIN' && styles.tabButtonActive]}
          >
            <Text style={[styles.tabText, tab === 'LOGIN' && styles.tabTextActive]}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setTab('REGISTER')}
            style={[styles.tabButton, tab === 'REGISTER' && styles.tabButtonActive]}
          >
            <Text style={[styles.tabText, tab === 'REGISTER' && styles.tabTextActive]}>Create Account</Text>
          </TouchableOpacity>
        </View>

        {/* Form Card */}
        <View style={[styles.formCard, Shadows.level1]}>
          {tab === 'LOGIN' ? (
            <View style={styles.formFields}>
              <Text style={styles.formTitle}>Student & Faculty Sign In</Text>
              <Text style={styles.formSub}>
                Access your campus parcel custody, cash escrow envelopes, and dynamic release tokens.
              </Text>

              <Input
                label="School ID or CTU Email"
                placeholder="e.g. CTU-2024-8841 or user@ctu.edu.ph"
                value={loginId}
                onChangeText={setLoginId}
                autoCapitalize="none"
              />

              <Input
                label="Password"
                placeholder="••••••••••••"
                value={loginPassword}
                onChangeText={setLoginPassword}
                secureTextEntry
              />

              <Button
                label="Sign In to Account"
                onPress={handleLogin}
                loading={loading}
                style={{ marginTop: 12 }}
              />

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleQuickDemoFill}
                style={styles.demoFillBtn}
              >
                <Text style={styles.demoFillText}>Quick Demo Credentials (CTU-2024-8841)</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.formFields}>
              <Text style={styles.formTitle}>New Student Registration</Text>
              <Text style={styles.formSub}>
                Register your university identity to pre-stage deliveries and authorize atomic handshakes.
              </Text>

              <Input
                label="Full Name"
                placeholder="e.g. John Vince Keyed"
                value={regFullName}
                onChangeText={setRegFullName}
              />

              <Input
                label="School ID Number"
                placeholder="e.g. CTU-2024-8841"
                value={regSchoolId}
                onChangeText={setRegSchoolId}
                autoCapitalize="characters"
              />

              <Input
                label="University Email"
                placeholder="e.g. student@ctu.edu.ph"
                value={regEmail}
                onChangeText={setRegEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Input
                label="Password"
                placeholder="Create a strong password"
                value={regPassword}
                onChangeText={setRegPassword}
                secureTextEntry
              />

              <Input
                label="6-Digit Account Security MPIN"
                placeholder="e.g. 123456"
                value={regMpin}
                onChangeText={setRegMpin}
                keyboardType="numeric"
                maxLength={6}
                secureTextEntry
              />

              <Button
                label="Register Account"
                onPress={handleRegister}
                loading={loading}
                style={{ marginTop: 12 }}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface.canvas,
  },
  scrollContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  brandHeader: {
    alignItems: 'center',
    marginVertical: 24,
  },
  logoIconBox: {
    width: 56,
    height: 56,
    borderRadius: Radius.xl,
    backgroundColor: Colors.accent.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoLetter: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
  },
  brandTitle: {
    fontSize: Typography.fontSize.title2,
    fontWeight: '800',
    color: Colors.structure.textPrimary,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: Typography.fontSize.subhead,
    color: Colors.structure.textMuted,
    marginTop: 4,
    fontWeight: '500',
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: Colors.surface.subtle,
    borderRadius: Radius.full,
    padding: 4,
    marginBottom: 20,
    width: '100%',
    maxWidth: 380,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: Radius.full,
  },
  tabButtonActive: {
    backgroundColor: Colors.surface.card,
    ...Shadows.level1,
  },
  tabText: {
    fontSize: Typography.fontSize.body,
    fontWeight: '600',
    color: Colors.structure.textMuted,
  },
  tabTextActive: {
    color: Colors.structure.textPrimary,
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: Colors.surface.card,
    borderRadius: Radius.xxl,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    borderWidth: 1,
    borderColor: Colors.surface.border,
  },
  formFields: {
    gap: 14,
  },
  formTitle: {
    fontSize: Typography.fontSize.headline,
    fontWeight: '700',
    color: Colors.structure.textPrimary,
  },
  formSub: {
    fontSize: Typography.fontSize.caption,
    color: Colors.structure.textMuted,
    lineHeight: 18,
    marginBottom: 4,
  },
  demoFillBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  demoFillText: {
    fontSize: Typography.fontSize.caption,
    fontWeight: '600',
    color: Colors.accent.brandPrimary,
  },
});
