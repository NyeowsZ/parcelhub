import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Typography, Shadows } from '../constants/theme';
import { APP_CONFIG } from '../constants/config';
import { HeroMetricCard } from '../components/home/HeroMetricCard';
import { ParcelCard } from '../components/home/ParcelCard';
import { Button } from '../components/common/Button';
import { BellIcon, PackageIcon } from '../components/common/Icons';
import { ParcelService } from '../services/parcelService';
import { ParcelRow } from '../types/database';

interface HomeScreenProps {
  onNavigateToPreRegister: () => void;
  onNavigateToClaim: (parcel?: ParcelRow) => void;
  onNavigateToOrders: () => void;
  onNavigateToAlerts: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToPreRegister,
  onNavigateToClaim,
  onNavigateToOrders,
  onNavigateToAlerts,
}) => {
  const insets = useSafeAreaInsets();
  const [parcels, setParcels] = useState<ParcelRow[]>([]);
  const [refreshing, setRefreshing] = useState(false);

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

  const activeParcels = parcels.filter((p) => p.current_status !== 'CLAIMED');
  const readyParcels = parcels.filter((p) => p.current_status === 'RECEIVED_LOGGED');
  const recentActivities = parcels.slice(0, 4);

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.campusPill}>
            <View style={styles.campusDot} />
            <Text style={styles.campusText}>{APP_CONFIG.CAMPUS_NAME}</Text>
          </View>
          <Text style={styles.greetingTitle}>Hello, John Vince</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onNavigateToAlerts}
          style={styles.bellButton}
        >
          <BellIcon size={20} color={Colors.structure.textPrimary} strokeWidth={2} />
          {readyParcels.length > 0 && <View style={styles.bellBadge} />}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 96 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.accent.brandPrimary}
          />
        }
      >
        {/* Hero Metric Card (Active Orders + 5-Col Grid) */}
        <HeroMetricCard
          activeCount={activeParcels.length}
          readyCount={readyParcels.length}
          onCreatePress={onNavigateToPreRegister}
          onClaimPress={() => onNavigateToClaim(readyParcels[0])}
          onCashInPress={onNavigateToOrders}
          onHistoryPress={onNavigateToOrders}
          onHelpPress={onNavigateToOrders}
        />

        {/* Ready to Claim Action Banner (if parcels waiting at desk) */}
        {readyParcels.length > 0 && (
          <View style={[styles.readyBanner, Shadows.level2]}>
            <View style={styles.readyBannerHeader}>
              <View style={styles.readyIconBox}>
                <PackageIcon size={22} color={Colors.accent.successText} strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.readyBannerTitle}>
                  {readyParcels.length === 1
                    ? '1 Parcel Ready at Counter'
                    : `${readyParcels.length} Parcels Ready at Counter`}
                </Text>
                <Text style={styles.readyBannerSub}>
                  Intake verified by Staff Desk. Scan station QR to release.
                </Text>
              </View>
            </View>

            <Button
              label="Initiate Pickup Handshake"
              onPress={() => onNavigateToClaim(readyParcels[0])}
              variant="primary"
              size="md"
              style={{ marginTop: 12 }}
            />
          </View>
        )}

        {/* Section: Recent Consignments */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Consignments</Text>
          <TouchableOpacity onPress={onNavigateToOrders}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* Parcel Cards */}
        {recentActivities.map((parcel) => (
          <ParcelCard
            key={parcel.parcel_id}
            parcel={parcel}
            onPress={() => {
              if (parcel.current_status === 'RECEIVED_LOGGED') {
                onNavigateToClaim(parcel);
              } else {
                onNavigateToOrders();
              }
            }}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface.canvas, // #F8FAFC (60% surface)
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  campusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  campusDot: {
    width: 6,
    height: 6,
    borderRadius: Radius.pill,
    backgroundColor: Colors.accent.brandPrimary,
  },
  campusText: {
    ...Typography.sizes.caption,
    color: Colors.structure.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  greetingTitle: {
    ...Typography.sizes.h1,
    color: Colors.structure.textPrimary,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent.error,
  },
  scrollContent: {
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  readyBanner: {
    backgroundColor: '#ECFDF5', // subtle emerald surface
    borderRadius: Radius.card,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
  },
  readyBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  readyIconBox: {
    width: 42,
    height: 42,
    borderRadius: Radius.input,
    backgroundColor: Colors.accent.successBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readyBannerTitle: {
    ...Typography.sizes.bodyBold,
    color: '#065F46',
  },
  readyBannerSub: {
    ...Typography.sizes.caption,
    color: '#047857',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    ...Typography.sizes.h2,
    color: Colors.structure.textPrimary,
  },
  viewAllText: {
    ...Typography.sizes.caption,
    color: Colors.accent.brandPrimary,
    fontWeight: '700',
  },
});
