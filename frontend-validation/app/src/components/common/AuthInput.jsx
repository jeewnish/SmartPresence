import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import SvgIcon from './SvgIcon';
import { Colors, Typography, Spacing, Radii } from '../../theme';

/**
 * Labeled text input for auth forms — secondarySurface bg, gold-on-error border.
 *
 * @param {{
 *   label?: string,
 *   value: string,
 *   onChangeText: (text: string) => void,
 *   placeholder?: string,
 *   icon?: string,
 *   secureTextEntry?: boolean,
 *   keyboardType?: string,
 *   autoCapitalize?: string,
 *   error?: string,
 *   onSubmitEditing?: () => void,
 *   returnKeyType?: string,
 *   editable?: boolean,
 *   maxLength?: number,
 * }} props
 */
export default function AuthInput({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'none',
  error,
  onSubmitEditing,
  returnKeyType,
  editable = true,
  maxLength,
}) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputRow, !!error && styles.inputRowError]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.secondaryText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          editable={editable}
          maxLength={maxLength}
        />
        {icon ? <SvgIcon name={icon} size={18} color={Colors.secondaryText} /> : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.label,
    fontSize: 13,
    marginBottom: Spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondarySurface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.standard,
    paddingHorizontal: Spacing.sm,
    height: 48,
  },
  inputRowError: {
    borderColor: Colors.absent,
  },
  input: {
    flex: 1,
    ...Typography.bodyMedium,
    color: Colors.primaryText,
    paddingVertical: 0,
  },
  error: {
    ...Typography.caption,
    color: Colors.absent,
    marginTop: Spacing.xs,
  },
});
