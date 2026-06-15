import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Animated, Pressable, Text, TextInput, View } from 'react-native';
import { RadarPageProps } from '../../types';

export function RadarPage({
  radarState,
  signalFound,
  isCheckingIn,
  checkinMessage,
  bleTokenInput,
  onBleTokenChange,
  lookupMessage,
  pulseOpacity,
  pulseScale,
  signalCardOpacity,
  signalCardTranslateY,
  onOpenVerify,
  onResetDemo,
}: RadarPageProps) {
  if (radarState === 'success') {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <View className="h-24 w-24 items-center justify-center rounded-full bg-[#EAF9EF]">
          <Ionicons name="checkmark" size={58} color="#16A34A" />
        </View>
        <Text className="font-inter-bold mt-8 text-center text-[24px] leading-[32px] text-[#122046]">
          Check-In Complete
        </Text>
        <Text className="font-inter mt-3 text-center text-[14px] leading-[22px] text-[#5F6C84]">
          {checkinMessage || 'Attendance validated and synced.'}
        </Text>
        <Pressable className="mt-10 w-full rounded-[18px] bg-[#4762EA] py-4" onPress={onResetDemo}>
          <Text className="font-inter-semibold text-center text-[16px] text-white">Reset Demo</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 px-6 pt-6 pb-4">
      <Text className="font-inter-bold text-[26px] leading-[34px] text-[#101A39]">Live Radar</Text>
      <Text className="font-inter mt-2 text-[14px] leading-[22px] text-[#5E6A7A]">
        Scanning nearby BLE broadcasts for scheduled sessions.
      </Text>

      <View className="mt-12 items-center">
        <Animated.View
          className="absolute h-52 w-52 rounded-full bg-[#4C66EA]"
          style={{ opacity: pulseOpacity, transform: [{ scale: pulseScale }] }}
        />
        <View className="h-44 w-44 items-center justify-center rounded-full border border-[#D8DEEF] bg-[#EEF2FE]">
          <Ionicons name="radio" size={62} color="#4762EA" />
        </View>
        <Text className="font-inter-semibold mt-6 text-[15px] text-[#324C90]">Scanning...</Text>
      </View>

      <View className="mt-auto">
        {signalFound && (
          <Animated.View
            className="mb-4 rounded-[18px] border border-[#D7E1FF] bg-[#F3F6FF] px-4 py-4"
            style={{
              opacity: signalCardOpacity,
              transform: [{ translateY: signalCardTranslateY }],
            }}>
            <View className="flex-row items-start">
              <View className="mt-1 h-3 w-3 rounded-full bg-[#22C55E]" />
              <View className="ml-3 flex-1">
                <Text className="font-inter-semibold text-[14px] text-[#22356B]">Signal Found</Text>
                <Text className="font-inter mt-1 text-[12px] leading-[18px] text-[#556281]">
                  BLE token detected. Enter token to validate the active session.
                </Text>
              </View>
            </View>
            <TextInput
              className="font-inter mt-3 rounded-[12px] border border-[#CAD5F4] bg-white px-3 py-2 text-[13px] text-[#22356B]"
              value={bleTokenInput}
              onChangeText={onBleTokenChange}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Paste BLE token (example: 1a2b3c.XYZ...)"
              placeholderTextColor="#7F8DAD"
            />
            <Text className="font-inter mt-2 text-[11px] text-[#4E5F88]">{lookupMessage}</Text>
          </Animated.View>
        )}

        <Pressable
          className={`rounded-[18px] py-4 ${signalFound ? 'bg-[#4762EA]' : 'bg-[#B8C2E3]'}`}
          disabled={!signalFound || isCheckingIn}
          onPress={onOpenVerify}>
          <Text className="font-inter-semibold text-center text-[16px] text-white">
            {isCheckingIn ? 'Checking In...' : 'Check In Now'}
          </Text>
        </Pressable>
        {checkinMessage ? (
          <Text className="font-inter mt-3 text-center text-[12px] leading-[18px] text-[#556281]">
            {checkinMessage}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
