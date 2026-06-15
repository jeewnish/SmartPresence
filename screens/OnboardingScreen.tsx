import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

type OnboardingScreenProps = {
  onGoBack: () => void;
  onGetStarted: () => void;
};

export function OnboardingScreen({ onGoBack, onGetStarted }: OnboardingScreenProps) {
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);

  return (
    <View className="flex-1 bg-[#F5F6F8]">
      <View className="h-[35%] items-center justify-end bg-[#EFF1F5] pb-14">
        <View className="h-40 w-40 items-center justify-center rounded-[30px] bg-white shadow-sm">
          <Ionicons name="phone-portrait-outline" size={62} color="#4562EA" />
          <View className="absolute -right-3 -bottom-3 h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-[#5BC161]">
            <Ionicons name="lock-closed-outline" size={28} color="#FFFFFF" />
          </View>
        </View>
      </View>

      <View className="flex-1 px-6 pt-5 pb-10">
        <Pressable className="mb-3 self-start rounded-full p-2" onPress={onGoBack}>
          <Ionicons name="arrow-back" size={30} color="#5F6776" />
        </Pressable>

        <Text className="font-inter-bold text-center text-[24px] leading-[32px] text-[#111A37]">
          Secure Your Device
        </Text>
        <Text className="font-inter mt-4 text-center text-[14px] leading-[22px] text-[#6A7385]">
          This device will be permanently linked to your student ID. You must use this device to
          check into classes via biometric verification.
        </Text>

        <View className="mt-8 rounded-[24px] border border-[#C9D8FA] bg-[#EEF3FF] px-5 py-6">
          <View className="flex-row items-center">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-[#DCE6FB]">
              <Text className="font-inter-bold text-[28px] text-[#4660EA]">1</Text>
            </View>
            <Text className="font-inter-semibold ml-4 flex-1 text-[15px] leading-[22px] text-[#273F91]">
              Link device to student account
            </Text>
            <Ionicons name="chevron-forward" size={30} color="#4660EA" />
          </View>
        </View>

        <Pressable
          className="mt-4 rounded-[24px] border border-[#E8EAEE] bg-[#F2F3F6] px-5 py-6"
          onPress={() => setShowBiometricPrompt(true)}>
          <View className="flex-row items-center">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-[#E4E7EE]">
              <Text className="font-inter-bold text-[28px] text-[#98A0AF]">2</Text>
            </View>
            <Text className="font-inter-semibold ml-4 flex-1 text-[15px] leading-[22px] text-[#7B8492]">
              Setup biometric verification
            </Text>
          </View>
        </Pressable>

        <View className="mt-auto">
          <Pressable className="rounded-[24px] bg-[#4762EA] py-6 shadow-sm" onPress={onGetStarted}>
            <Text className="font-inter-semibold text-center text-[17px] text-white">
              Start Registration
            </Text>
          </Pressable>
        </View>
      </View>

      <Modal transparent visible={showBiometricPrompt} animationType="fade">
        <Pressable
          className="flex-1 items-center justify-center bg-[rgba(15,24,46,0.55)] px-6"
          onPress={() => setShowBiometricPrompt(false)}>
          <Pressable className="w-full rounded-[24px] bg-white px-6 py-7" onPress={() => {}}>
            <Text className="font-inter-semibold text-center text-[22px] leading-[30px] text-[#101B3A]">
              Biometric Verification
            </Text>
            <Text className="font-inter mt-4 text-center text-[14px] leading-[22px] text-[#667084]">
              Verify your identity with biometrics to finish secure device setup.
            </Text>

            <Pressable
              className="mt-7 rounded-[18px] bg-[#4762EA] py-4"
              onPress={() => setShowBiometricPrompt(false)}>
              <Text className="font-inter-semibold text-center text-[16px] text-white">Verify</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
