import React, { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const DIGIT_COUNT = 6;

type AuthVerificationModalProps = {
  visible: boolean;
  onClose: () => void;
  onVerified: () => void;
};

export function AuthVerificationModal({
  visible,
  onClose,
  onVerified,
}: AuthVerificationModalProps) {
  const [digits, setDigits] = useState<string[]>(Array(DIGIT_COUNT).fill(''));
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const isCompleting = useRef(false);

  useEffect(() => {
    if (!visible) {
      setDigits(Array(DIGIT_COUNT).fill(''));
      isCompleting.current = false;
      return;
    }

    const timer = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 140);

    return () => clearTimeout(timer);
  }, [visible]);

  const tryComplete = (nextDigits: string[]) => {
    if (isCompleting.current) {
      return;
    }

    if (nextDigits.every((digit) => digit.length === 1)) {
      isCompleting.current = true;
      Keyboard.dismiss();
      setTimeout(() => {
        onVerified();
      }, 180);
    }
  };

  const handleChange = (value: string, index: number) => {
    const onlyDigits = value.replace(/[^0-9]/g, '');
    if (!onlyDigits) {
      const nextDigits = [...digits];
      nextDigits[index] = '';
      setDigits(nextDigits);
      return;
    }

    const nextDigits = [...digits];
    const chars = onlyDigits.split('');

    chars.forEach((char, charIndex) => {
      const nextIndex = index + charIndex;
      if (nextIndex < DIGIT_COUNT) {
        nextDigits[nextIndex] = char;
      }
    });

    setDigits(nextDigits);

    const nextFocusIndex = Math.min(index + chars.length, DIGIT_COUNT - 1);
    if (nextFocusIndex < DIGIT_COUNT - 1 || !nextDigits[DIGIT_COUNT - 1]) {
      inputRefs.current[nextFocusIndex]?.focus();
    }

    tryComplete(nextDigits);
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key !== 'Backspace') {
      return;
    }

    if (digits[index]) {
      const nextDigits = [...digits];
      nextDigits[index] = '';
      setDigits(nextDigits);
      return;
    }

    if (index > 0) {
      const prevIndex = index - 1;
      const nextDigits = [...digits];
      nextDigits[prevIndex] = '';
      setDigits(nextDigits);
      inputRefs.current[prevIndex]?.focus();
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}>
        <View className="bg-background mx-6 rounded-3xl p-6 shadow-xl">
          <Text className="h3 text-center">Email Verification</Text>
          <Text className="body-md text-text-secondary mt-3 text-center">
            You received a verification email. Enter your 6-digit verification code.
          </Text>

          <View className="mt-6 flex-row justify-between">
            {digits.map((digit, index) => (
              <TextInput
                key={index}
                ref={(input) => {
                  inputRefs.current[index] = input;
                }}
                className="border-border bg-surface font-inter-semibold text-text-primary h-12 w-11 rounded-2xl border text-center text-xl"
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={(event) => handleKeyPress(event.nativeEvent.key, index)}
                keyboardType="number-pad"
                maxLength={1}
                autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
                textContentType="oneTimeCode"
                returnKeyType="done"
              />
            ))}
          </View>

          <Pressable className="mt-6 self-center px-4 py-2" onPress={onClose}>
            <Text className="h4 text-blue">Cancel</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 42, 74, 0.45)',
  },
});
