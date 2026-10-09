import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Radius } from '../../constants/theme';
import { APP_CONFIG } from '../../constants/config';
import { BackspaceIcon } from '../common/Icons';

interface MpinKeypadProps {
  mpin: string;
  onDigitPress: (digit: string) => void;
  onDeletePress: () => void;
  onClearPress?: () => void;
  maxLength?: number;
}

export const MpinKeypad: React.FC<MpinKeypadProps> = ({
  mpin,
  onDigitPress,
  onDeletePress,
  onClearPress,
  maxLength = APP_CONFIG.MPIN_LENGTH, // 6 digits
}) => {
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <View style={styles.container}>
      {/* MPIN Pin Dot Indicators */}
      <View style={styles.indicatorsRow}>
        {Array.from({ length: maxLength }).map((_, index) => {
          const isFilled = index < mpin.length;
          const isCurrent = index === mpin.length - 1;

          return (
            <View
              key={index}
              style={[
                styles.dot,
                isFilled ? styles.dotFilled : styles.dotEmpty,
                isCurrent && styles.dotActiveRing,
              ]}
            />
          );
        })}
      </View>

      {/* 3-Column Keypad Grid (Filled solid pill circles per DESIGN_CONTEXT.md) */}
      <View style={styles.keypadGrid}>
        {digits.map((digit) => (
          <TouchableOpacity
            key={digit}
            activeOpacity={0.65}
            onPress={() => onDigitPress(digit)}
            disabled={mpin.length >= maxLength}
            style={styles.keyButton}
          >
            <Text style={styles.keyText}>{digit}</Text>
          </TouchableOpacity>
        ))}

        {/* Bottom Row: Clear, 0, Backspace Icon */}
        <TouchableOpacity
          activeOpacity={0.65}
          onPress={onClearPress || onDeletePress}
          style={styles.keyButtonSubtle}
        >
          <Text style={styles.keyTextSubtle}>C</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.65}
          onPress={() => onDigitPress('0')}
          disabled={mpin.length >= maxLength}
          style={styles.keyButton}
        >
          <Text style={styles.keyText}>0</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.65}
          onPress={onDeletePress}
          style={styles.keyButtonSubtle}
        >
          <BackspaceIcon size={20} color={Colors.structure.textSecondary} strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  indicatorsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginVertical: 24,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: Radius.pill, // rounded-full
  },
  dotEmpty: {
    backgroundColor: Colors.structure.borderSubtle, // bg-slate-200
  },
  dotFilled: {
    backgroundColor: Colors.accent.brandPrimary, // bg-blue-600
  },
  dotActiveRing: {
    borderWidth: 3,
    borderColor: Colors.accent.brandSoft, // ring-blue-100
  },
  keypadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: 280, // max-w-[280px]
    rowGap: 16,
  },
  keyButton: {
    width: 64, // w-16
    height: 64, // h-16
    borderRadius: Radius.pill, // rounded-full
    backgroundColor: Colors.surface.subtle, // bg-slate-100 (Solid filled, NOT wireframe outline)
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyButtonSubtle: {
    width: 64,
    height: 64,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.structure.textPrimary, // text-slate-900
  },
  keyTextSubtle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.structure.textSecondary,
  },
});
