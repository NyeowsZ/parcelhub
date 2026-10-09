import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Typography, Shadows } from '../../constants/theme';
import {
  HomeIcon,
  PackageIcon,
  BellIcon,
  UserIcon,
} from '../common/Icons';

export type TabKey = 'Home' | 'Orders' | 'Alerts' | 'Profile';

interface FloatingTabBarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  alertCount?: number;
}

export const FloatingTabBar: React.FC<FloatingTabBarProps> = ({
  activeTab,
  onTabChange,
  alertCount = 0,
}) => {
  const insets = useSafeAreaInsets();
  // Dynamic bottom clearance so dock never collides with Android 3-button bar or iOS home pill
  const dynamicBottom = Math.max(insets.bottom, 12) + 6;

  const tabs: { key: TabKey; label: string; icon: (color: string) => React.ReactNode }[] = [
    {
      key: 'Home',
      label: 'Home',
      icon: (color) => <HomeIcon size={20} color={color} strokeWidth={2} />,
    },
    {
      key: 'Orders',
      label: 'Orders',
      icon: (color) => <PackageIcon size={20} color={color} strokeWidth={2} />,
    },
    {
      key: 'Alerts',
      label: 'Alerts',
      icon: (color) => <BellIcon size={20} color={color} strokeWidth={2} />,
    },
    {
      key: 'Profile',
      label: 'Account',
      icon: (color) => <UserIcon size={20} color={color} strokeWidth={2} />,
    },
  ];

  return (
    <View style={[styles.dockContainer, { bottom: dynamicBottom }]}>
      <View style={[styles.dock, Shadows.level3]}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const color = isActive
            ? Colors.accent.brandPrimary
            : Colors.structure.textMuted;

          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.7}
              onPress={() => onTabChange(tab.key)}
              style={styles.tabItem}
            >
              <View style={styles.iconContainer}>
                {tab.icon(color)}
                {tab.key === 'Alerts' && alertCount > 0 && (
                  <View style={styles.counterBadge}>
                    <Text style={styles.counterText}>
                      {alertCount > 9 ? '9+' : alertCount}
                    </Text>
                  </View>
                )}
              </View>

              <Text
                style={[
                  styles.tabLabel,
                  isActive ? styles.tabLabelActive : styles.tabLabelInactive,
                ]}
              >
                {tab.label}
              </Text>

              {isActive && <View style={styles.activePillIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dockContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 999,
  },
  dock: {
    width: '100%',
    height: 64, // h-16
    backgroundColor: '#FFFFFF', // surface-glass fallback / clean solid surface
    borderRadius: Radius.pill, // rounded-full (9999px)
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)', // border-slate-200
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 54,
    paddingVertical: 6,
    position: 'relative',
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  activePillIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.accent.brandPrimary,
  },
  tabLabel: {
    fontSize: 11,
    letterSpacing: 0.1,
  },
  tabLabelActive: {
    fontWeight: '700',
    color: Colors.accent.brandPrimary,
  },
  tabLabelInactive: {
    fontWeight: '500',
    color: Colors.structure.textMuted,
  },
  counterBadge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: Colors.accent.error, // bg-rose-500
    borderRadius: Radius.pill,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 15,
    height: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
});
