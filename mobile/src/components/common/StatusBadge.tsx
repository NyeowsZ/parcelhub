import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { ParcelStatus } from '../../types/database';
import { PARCEL_STATUS_MAP } from '../../types/parcel';
import { Radius, Typography } from '../../constants/theme';

interface StatusBadgeProps {
  status: ParcelStatus;
  style?: ViewStyle;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, style }) => {
  const meta = PARCEL_STATUS_MAP[status] || PARCEL_STATUS_MAP.STAGED;

  return (
    <View style={[styles.badge, { backgroundColor: meta.badgeBg }, style]}>
      <Text style={[styles.text, { color: meta.badgeText }]}>
        {meta.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: Radius.badge, // rounded-full (9999px)
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  text: {
    ...Typography.sizes.caption,
    fontWeight: '700',
  },
});
