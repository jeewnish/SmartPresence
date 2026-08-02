import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Colors, Typography, Radii, Spacing } from '../../theme';

/**
 * Primary Button — gold background, white text.
 *
 * @param {{ label: string, onPress: () => void, loading?: boolean, disabled?: boolean, style?: object }} props
 */
export default function PrimaryButton({ label, onPress, loading, disabled, style }) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.82}
      style={[styles.btn, isDisabled && styles.disabled, style]}
    >
      {loading ? (
        <ActivityIndicator color={Colors.primaryBackground} size="small" />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: Colors.primaryAccent,
    borderRadius: Radii.standard,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  disabled: {
    backgroundColor: Colors.border,
  },
  label: {
    ...Typography.buttonLabel,
    color: Colors.primaryBackground,
  },
});
