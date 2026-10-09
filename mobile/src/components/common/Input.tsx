import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Colors, Radius, Typography } from '../../constants/theme';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  containerStyle?: ViewStyle;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  prefix,
  suffix,
  style,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {/* Top uppercase micro-label */}
      <Text style={styles.label}>{label}</Text>

      {/* Tinted rounded container */}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          error ? styles.inputError : null,
        ]}
      >
        {prefix && <View style={styles.prefixContainer}>{prefix}</View>}

        <TextInput
          placeholderTextColor={Colors.structure.textMuted}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.input,
            { color: Colors.structure.textPrimary },
            style,
          ]}
          {...rest}
        />

        {suffix && <View style={styles.suffixContainer}>{suffix}</View>}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    ...Typography.sizes.label,
    color: Colors.structure.textSecondary,
    textTransform: 'uppercase',
    paddingLeft: 12,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface.subtle, // bg-slate-100
    borderRadius: Radius.input, // rounded-2xl (16px)
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
    minHeight: 52,
  },
  inputFocused: {
    backgroundColor: '#FFFFFF',
    borderColor: Colors.structure.borderFocus, // ring-blue-600
  },
  inputError: {
    borderColor: Colors.accent.error,
  },
  input: {
    flex: 1,
    ...Typography.sizes.body,
    fontWeight: '500',
    padding: 0,
  },
  prefixContainer: {
    marginRight: 8,
  },
  suffixContainer: {
    marginLeft: 8,
  },
  errorText: {
    ...Typography.sizes.caption,
    color: Colors.accent.error,
    paddingLeft: 12,
    marginTop: 4,
  },
});
