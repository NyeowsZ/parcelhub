import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from './src/constants/theme';
import { FloatingTabBar, TabKey } from './src/components/navigation/FloatingTabBar';
import { HomeScreen } from './src/screens/HomeScreen';
import { OrdersScreen } from './src/screens/OrdersScreen';
import { AlertsScreen } from './src/screens/AlertsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { PreRegisterScreen } from './src/screens/PreRegisterScreen';
import { ClaimHandshakeScreen } from './src/screens/ClaimHandshakeScreen';
import { ParcelRow } from './src/types/database';
import { PushService } from './src/services/pushService';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('Home');
  const [currentFlow, setCurrentFlow] = useState<'TABS' | 'PRE_REGISTER' | 'CLAIM'>('TABS');
  const [selectedParcelForClaim, setSelectedParcelForClaim] = useState<ParcelRow | undefined>();

  // Initialize push notification listener on mount
  useEffect(() => {
    PushService.registerForPushNotificationsAsync();
  }, []);

  const handleOpenClaim = (parcel?: ParcelRow) => {
    setSelectedParcelForClaim(parcel);
    setCurrentFlow('CLAIM');
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={true}
        />

        {/* Main Flow Controller */}
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
            parcel={selectedParcelForClaim}
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
                onNavigateToClaim={handleOpenClaim}
                onNavigateToOrders={() => setActiveTab('Orders')}
                onNavigateToAlerts={() => setActiveTab('Alerts')}
              />
            )}

            {activeTab === 'Orders' && (
              <OrdersScreen
                onSelectParcelForClaim={handleOpenClaim}
                onNavigateToPreRegister={() => setCurrentFlow('PRE_REGISTER')}
              />
            )}

            {activeTab === 'Alerts' && <AlertsScreen />}

            {activeTab === 'Profile' && <ProfileScreen />}

            {/* Floating Island Navigation Dock */}
            <FloatingTabBar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              alertCount={1}
            />
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
});
