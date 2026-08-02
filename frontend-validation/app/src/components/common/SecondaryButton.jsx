import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Colors, Typography, Radii, Spacing } from '../../theme';

/**
 * Secondary Button — transparent bg, gold border + gold text.
 *
 * @param {{ label: string, onPress: () => void, loading?: boolean, disabled?: boolean, style?: object }} props
 */
export default function SecondaryButton({ label, onPress, loading, disabled, style }) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[styles.btn, isDisabled && styles.disabled, style]}
    >
      {loading ? (
        <ActivityIndicator color={Colors.primaryAccent} size="small" />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: 'transparent',
    borderRadius: Radii.standard,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.primaryAccent,
  },
  disabled: {
    borderColor: Colors.border,
  },
  label: {
    ...Typography.buttonLabel,
    color: Colors.primaryAccent,
  },
});
