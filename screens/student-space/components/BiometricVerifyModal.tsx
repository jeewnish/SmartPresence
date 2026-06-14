import Ionicons from '@expo/vector-icons/Ionicons';
import * as LocalAuthentication from 'expo-local-authentication';
import React, { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native';

type BiometricVerifyModalProps = {
  visible: boolean;
  onVerify: () => void;
  onCancel: (errorMessage?: string) => void;
};

export function BiometricVerifyModal({ visible, onVerify, onCancel }: BiometricVerifyModalProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleVerifyPress = async () => {
    if (isAuthenticating) return;

    setErrorMessage('');
    setIsAuthenticating(true);

    try {
      // 1. Check hardware support
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        setErrorMessage('This device does not support biometric authentication.');
        setIsAuthenticating(false);
        return;
      }

      // 2. Check that biometrics are enrolled
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        setErrorMessage('No biometrics enrolled. Please set up fingerprint in device settings.');
        setIsAuthenticating(false);
        return;
      }

      // 3. Trigger the native OS fingerprint / face prompt
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verify your identity to check in',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false, // allow PIN fallback if fingerprint fails
        fallbackLabel: 'Use Passcode',
      });

      if (result.success) {
        // Biometric passed — hand off to parent to submit check-in
        onVerify();
      } else {
        // User cancelled or sensor failed
        const reason = result.error;
        if (reason === 'user_cancel' || reason === 'system_cancel') {
          setErrorMessage('Verification cancelled. Tap the button to try again.');
        } else if (reason === 'lockout') {
          setErrorMessage('Too many failed attempts. Use your device PIN to unlock first.');
        } else {
          setErrorMessage('Biometric verification failed. Please try again.');
        }
      }
    } catch {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleCancel = () => {
    setErrorMessage('');
    onCancel();
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View className="flex-1 items-center justify-center bg-[rgba(12,19,40,0.65)] px-6">
        <View className="w-full rounded-[22px] bg-white px-6 py-7">
          <Text className="font-inter-semibold text-center text-[21px] leading-[30px] text-[#101B3A]">
            Biometric Verification
          </Text>
          <Text className="font-inter mt-3 text-center text-[14px] leading-[22px] text-[#647085]">
            Verify your identity to complete attendance check-in.
          </Text>

          <View className="mt-5 items-center">
            {isAuthenticating ? (
              <ActivityIndicator size={48} color="#4762EA" />
            ) : (
              <Ionicons name="finger-print" size={48} color="#4762EA" />
            )}
          </View>

          {errorMessage.length > 0 && (
            <View className="mt-4 rounded-[10px] bg-[#FEF2F2] px-4 py-3">
              <Text className="font-inter text-center text-[13px] leading-[19px] text-[#DC2626]">
                {errorMessage}
              </Text>
            </View>
          )}

          <Pressable
            className="mt-7 rounded-[16px] bg-[#4762EA] py-4"
            onPress={() => void handleVerifyPress()}
            disabled={isAuthenticating}
            style={{ opacity: isAuthenticating ? 0.6 : 1 }}
          >
            <Text className="font-inter-semibold text-center text-[15px] text-white">
              {isAuthenticating ? 'Verifying…' : 'Verify with Biometrics'}
            </Text>
          </Pressable>

          <Pressable className="mt-3 py-2" onPress={handleCancel} disabled={isAuthenticating}>
            <Text className="font-inter-semibold text-center text-[14px] text-[#60708D]">Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

