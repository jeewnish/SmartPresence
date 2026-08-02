import React, { useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { Colors, Typography, Radii, Spacing } from '../../theme';

const CODE_LENGTH = 6;

/**
 * Six-box one-time-code entry field.
 *
 * A single invisible TextInput drives the real keyboard/clipboard/autofill
 * behavior (including iOS "from Messages" SMS/email autofill), while six
 * boxes render the current value for a polished look. Tapping anywhere
 * focuses the hidden input.
 *
 * @param {{
 *   value: string,
 *   onChangeText: (code: string) => void,
 *   onComplete?: (code: string) => void,
 *   error?: string,
 *   autoFocus?: boolean,
 * }} props
 */
export default function OtpCodeInput({ value, onChangeText, onComplete, error, autoFocus }) {
  const inputRef = useRef(null);
  const digits = value.split('').slice(0, CODE_LENGTH);
  const activeIndex = Math.min(value.length, CODE_LENGTH - 1);

  const handleChange = (text) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, CODE_LENGTH);
    onChangeText(cleaned);
    if (cleaned.length === CODE_LENGTH) {
      onComplete?.(cleaned);
    }
  };

  return (
    <View style={styles.wrap}>
      <Pressable style={styles.boxRow} onPress={() => inputRef.current?.focus()}>
        {Array.from({ length: CODE_LENGTH }).map((_, i) => {
          const filled = digits[i];
          const isActive = i === activeIndex;
          return (
            <View
              key={i}
              style={[
                styles.box,
                isActive && styles.boxActive,
                !!error && styles.boxError,
              ]}
            >
              <Text style={styles.boxText}>{filled ?? ''}</Text>
            </View>
          );
        })}
      </Pressable>

      {/* Hidden input — handles the actual keyboard, paste, and SMS/email autofill */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={CODE_LENGTH}
        autoFocus={autoFocus}
        style={styles.hiddenInput}
        caretHidden
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const BOX_SIZE = 44;

const styles = StyleSheet.create({
  wrap: {
    marginBottom: Spacing.sm,
  },
  boxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderRadius: Radii.standard,
    backgroundColor: Colors.secondarySurface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxActive: {
    borderColor: Colors.primaryAccent,
    backgroundColor: Colors.elevatedSurface,
  },
  boxError: {
    borderColor: Colors.absent,
  },
  boxText: {
    ...Typography.h3,
    fontSize: 20,
  },
  // Positioned over the boxes but fully transparent — captures all input
  // and keyboard/autofill behavior without showing its own caret/text.
  hiddenInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: BOX_SIZE,
    opacity: 0,
  },
  error: {
    ...Typography.caption,
    color: Colors.absent,
    marginTop: Spacing.xs,
  },
});
