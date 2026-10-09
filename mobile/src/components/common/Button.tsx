import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Animated,
} from 'react-native';
import { Colors, Radius, Typography, Shadows } from '../../constants/theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  size = 'lg',
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isOutline = variant === 'outline';

  const containerBg = isPrimary
    ? Colors.accent.brandPrimary
    : isSecondary
    ? Colors.accent.brandSoft
    : isOutline
    ? 'transparent'
    : 'transparent';

  const textColor = isPrimary
    ? '#FFFFFF'
    : isSecondary
    ? Colors.accent.brandSoftText
    : Colors.structure.textPrimary;

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[
          styles.base,
          size === 'lg' ? styles.sizeLg : styles.sizeMd,
          { backgroundColor: containerBg },
          isPrimary && Shadows.level2,
          isOutline && { borderWidth: 1.5, borderColor: Colors.structure.borderSubtle },
          disabled && styles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={textColor} size="small" />
        ) : (
          <>
            {icon && <>{icon}</>}
            <Text
              style={[
                styles.label,
                { color: textColor },
                size === 'lg' ? Typography.sizes.bodyBold : Typography.sizes.body,
                textStyle,
              ]}
            >
              {label}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.pill, // Design System: rounded-full
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  sizeLg: {
    height: 56, // Blueprint: h-14 (56px)
    paddingHorizontal: 24,
  },
  sizeMd: {
    height: 48, // Minimum 48px accessible touch target
    paddingHorizontal: 20,
  },
  label: {
    textAlign: 'center',
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
});
