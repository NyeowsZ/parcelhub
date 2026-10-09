import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius, Shadows } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({ children, style }) => {
  return <View style={[styles.card, Shadows.level1, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface.card, // #FFFFFF
    borderRadius: Radius.card, // rounded-2xl (20px)
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.structure.borderSubtle,
  },
});
