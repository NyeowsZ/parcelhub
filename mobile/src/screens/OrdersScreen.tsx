import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Typography } from '../constants/theme';
import { ParcelRow } from '../types/database';
import { ParcelService } from '../services/parcelService';
import { ParcelCard } from '../components/home/ParcelCard';
import { PlusIcon, PackageIcon } from '../components/common/Icons';

interface OrdersScreenProps {
  onSelectParcelForClaim: (parcel: ParcelRow) => void;
  onNavigateToPreRegister: () => void;
}

type FilterTab = 'ALL' | 'READY' | 'PENDING' | 'CLAIMED';

export const OrdersScreen: React.FC<OrdersScreenProps> = ({
  onSelectParcelForClaim,
  onNavigateToPreRegister,
}) => {
  const insets = useSafeAreaInsets();
  const [parcels, setParcels] = useState<ParcelRow[]>([]);
  const [filter, setFilter] = useState<FilterTab>('ALL');
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

  const filteredParcels = parcels.filter((p) => {
    if (filter === 'READY') return p.current_status === 'RECEIVED_LOGGED';
    if (filter === 'PENDING') return p.current_status === 'STAGED' || p.current_status === 'FUNDED';
    if (filter === 'CLAIMED') return p.current_status === 'CLAIMED';
    return true;
  });

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.title}>All Consignments</Text>
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

      {/* Parcel List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollList,
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
          filteredParcels.map((parcel) => (
            <ParcelCard
              key={parcel.parcel_id}
              parcel={parcel}
              onPress={() => {
                if (parcel.current_status === 'RECEIVED_LOGGED') {
                  onSelectParcelForClaim(parcel);
                }
              }}
            />
          ))
        )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  title: {
    ...Typography.sizes.h1,
    color: Colors.structure.textPrimary,
  },
  addBtn: {
    backgroundColor: Colors.accent.brandSoft,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addBtnText: {
    ...Typography.sizes.caption,
    color: Colors.accent.brandPrimary,
    fontWeight: '700',
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginVertical: 12,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface.subtle,
  },
  filterChipActive: {
    backgroundColor: Colors.accent.brandPrimary,
  },
  filterChipText: {
    ...Typography.sizes.caption,
    fontWeight: '600',
    color: Colors.structure.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    ...Typography.sizes.bodyBold,
    color: Colors.structure.textPrimary,
    marginBottom: 6,
  },
  emptySub: {
    ...Typography.sizes.body,
    color: Colors.structure.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
