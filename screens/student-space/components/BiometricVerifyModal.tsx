import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

type BiometricVerifyModalProps = {
  visible: boolean;
  onVerify: () => void;
  onCancel: () => void;
};

export function BiometricVerifyModal({ visible, onVerify, onCancel }: BiometricVerifyModalProps) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View className="flex-1 items-center justify-center bg-[rgba(12,19,40,0.65)] px-6">
        <View className="w-full rounded-[22px] bg-white px-6 py-7">
          <Text className="font-inter-semibold text-center text-[21px] leading-[30px] text-[#101B3A]">
            Biometric Verification
          </Text>
          <Text className="font-inter mt-3 text-center text-[14px] leading-[22px] text-[#647085]">
            Verify identity to complete attendance check-in.
          </Text>
          <View className="mt-5 items-center">
            <Ionicons name="finger-print" size={48} color="#4762EA" />
          </View>

          <Pressable className="mt-7 rounded-[16px] bg-[#4762EA] py-4" onPress={onVerify}>
            <Text className="font-inter-semibold text-center text-[15px] text-white">
              Verify with Biometrics
            </Text>
          </Pressable>
          <Pressable className="mt-3 py-2" onPress={onCancel}>
            <Text className="font-inter-semibold text-center text-[14px] text-[#60708D]">Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
