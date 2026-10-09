import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from './src/constants/theme';
import { FloatingTabBar, TabKey } from './src/components/navigation/FloatingTabBar';
import { HomeScreen } from './src/screens/HomeScreen';
import { OrdersScreen } from './src/screens/OrdersScreen';
import { AlertsScreen } from './src/screens/AlertsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { PreRegisterScreen } from './src/screens/PreRegisterScreen';
import { ClaimHandshakeScreen } from './src/screens/ClaimHandshakeScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { MpinLockScreen } from './src/screens/MpinLockScreen';
import { ParcelRow } from './src/types/database';
import { UserProfile } from './src/types/auth';
import { PushService } from './src/services/pushService';
import { AuthService } from './src/services/authService';

type AuthStage = 'AUTH_CREDENTIALS' | 'MPIN_LOCK' | 'UNLOCKED';

export default function App() {
  // Session Authentication Stage
  const [authStage, setAuthStage] = useState<AuthStage>('MPIN_LOCK');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [initializing, setInitializing] = useState(true);

  // Dashboard Sub-Flow Controller
  const [activeTab, setActiveTab] = useState<TabKey>('Home');
  const [currentFlow, setCurrentFlow] = useState<'TABS' | 'PRE_REGISTER' | 'CLAIM'>('TABS');
  const [selectedParcelsForClaim, setSelectedParcelsForClaim] = useState<ParcelRow[]>([]);

  // Initialize push notification listener & auth session on mount
  useEffect(() => {
    const initApp = async () => {
      try {
        PushService.registerForPushNotificationsAsync();
        const user = await AuthService.getCurrentUser();
        if (user) {
          setCurrentUser(user);
          // Invariant 1: On every app logon/session start, require 6-digit MPIN before dashboard access
          setAuthStage('MPIN_LOCK');
        } else {
          setAuthStage('AUTH_CREDENTIALS');
        }
      } catch {
        setAuthStage('AUTH_CREDENTIALS');
      } finally {
        setInitializing(false);
      }
    };
    initApp();
  }, []);

  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    // After login or registration, enter account MPIN to enter dashboard
    setAuthStage('MPIN_LOCK');
  };

  const handleUnlockSuccess = () => {
    setAuthStage('UNLOCKED');
    setCurrentFlow('TABS');
  };

  const handleSignOut = async () => {
    await AuthService.logout();
    setCurrentUser(null);
    setAuthStage('AUTH_CREDENTIALS');
  };

  const handleLockSession = () => {
    setAuthStage('MPIN_LOCK');
  };

  const handleOpenClaimSingle = (parcel?: ParcelRow) => {
    setSelectedParcelsForClaim(parcel ? [parcel] : []);
    setCurrentFlow('CLAIM');
  };

  const handleOpenClaimBatch = (parcels: ParcelRow[]) => {
    setSelectedParcelsForClaim(parcels);
    setCurrentFlow('CLAIM');
  };

  if (initializing) {
    return (
      <SafeAreaProvider>
        <View style={[styles.container, styles.loadingCenter]}>
          <ActivityIndicator size="large" color={Colors.accent.brandPrimary} />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={true}
        />

        {/* 1. Account Credentials Gate (Login / Register) */}
        {authStage === 'AUTH_CREDENTIALS' && (
          <AuthScreen onAuthSuccess={handleAuthSuccess} />
        )}

        {/* 2. Session MPIN Gate (Required on every app logon) */}
        {authStage === 'MPIN_LOCK' && currentUser && (
          <MpinLockScreen
            user={currentUser}
            onUnlockSuccess={handleUnlockSuccess}
            onSwitchAccount={handleSignOut}
          />
        )}

        {/* 3. Unlocked Application Workspace */}
        {authStage === 'UNLOCKED' && (
          <>
            {currentFlow === 'PRE_REGISTER' ? (
              <PreRegisterScreen
                onBack={() => setCurrentFlow('TABS')}
                onSuccess={() => {
                  setCurrentFlow('TABS');
                  setActiveTab('Orders');
                }}
              />
            ) : currentFlow === 'CLAIM' ? (
              <ClaimHandshakeScreen
                parcels={selectedParcelsForClaim}
                onBack={() => setCurrentFlow('TABS')}
                onSuccess={() => {
                  setCurrentFlow('TABS');
                  setActiveTab('Orders');
                }}
              />
            ) : (
              <>
                {activeTab === 'Home' && (
                  <HomeScreen
                    onNavigateToPreRegister={() => setCurrentFlow('PRE_REGISTER')}
                    onNavigateToClaim={handleOpenClaimSingle}
                    onNavigateToOrders={() => setActiveTab('Orders')}
                    onNavigateToAlerts={() => setActiveTab('Alerts')}
                  />
                )}

                {activeTab === 'Orders' && (
                  <OrdersScreen
                    onSelectParcelForClaim={handleOpenClaimSingle}
                    onSelectParcelsForClaim={handleOpenClaimBatch}
                    onNavigateToPreRegister={() => setCurrentFlow('PRE_REGISTER')}
                  />
                )}

                {activeTab === 'Alerts' && <AlertsScreen />}

                {activeTab === 'Profile' && (
                  <ProfileScreen
                    user={currentUser}
                    onSignOut={handleSignOut}
                    onLockSession={handleLockSession}
                  />
                )}

                {/* Floating Island Navigation Dock */}
                <FloatingTabBar
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  alertCount={1}
                />
              </>
            )}
          </>
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface.canvas,
  },
  loadingCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
