import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { LiveCheckIn } from '../../types';

type BroadcastPageProps = {
  isBroadcasting: boolean;
  liveFeed: LiveCheckIn[];
  onStartBroadcast: () => void;
  onStopBroadcast: () => void;
};

export function BroadcastPage({
  isBroadcasting,
  liveFeed,
  onStartBroadcast,
  onStopBroadcast,
}: BroadcastPageProps) {
  const liveCount = liveFeed.length;

  return (
    <View className="flex-1 px-6 pb-4">
      <Text className="font-inter-bold text-[26px] leading-[34px] text-[#101A39]">Broadcast</Text>
      <Text className="font-inter mt-2 text-[14px] leading-[22px] text-[#5E6A7A]">
        Start BLE attendance broadcasting for the current lecture.
      </Text>

      <View className="mt-6 rounded-[20px] border border-[#DCE3F5] bg-[#ECF1FF] px-5 py-5">
        <Text className="font-inter-semibold text-[13px] text-[#314B8F]">Next Up</Text>
        <Text className="font-inter-bold mt-2 text-[20px] text-[#11204A]">IS 4110 Capstone</Text>
        <Text className="font-inter mt-2 text-[13px] text-[#5A6B8E]">9:00 AM - 10:30 AM</Text>
        <Text className="font-inter mt-1 text-[13px] text-[#5A6B8E]">Engineering A-03</Text>
        <Text className="font-inter mt-1 text-[13px] text-[#5A6B8E]">36 students enrolled</Text>
      </View>

      <View className="mt-10 items-center">
        <Pressable
          className={`h-52 w-52 items-center justify-center rounded-full ${isBroadcasting ? 'bg-[#E44141]' : 'bg-[#3F5EEA]'}`}
          onPress={isBroadcasting ? onStopBroadcast : onStartBroadcast}>
          <Ionicons name={isBroadcasting ? 'stop' : 'play'} size={56} color="#FFFFFF" />
          <Text className="font-inter-bold mt-2 text-[28px] text-white">
            {isBroadcasting ? 'STOP' : 'START'}
          </Text>
        </Pressable>
        <Text className="font-inter mt-4 text-[13px] text-[#5F6D86]">
          {isBroadcasting
            ? 'Broadcast active. Tap to finalize session attendance.'
            : 'Tap start to activate Bluetooth broadcasting.'}
        </Text>
      </View>

      {isBroadcasting && (
        <View className="mt-auto rounded-t-[24px] border border-[#DBE3F7] bg-white px-5 pt-5 pb-6">
          <View className="flex-row items-center justify-between">
            <Text className="font-inter-semibold text-[15px] text-[#1C2F63]">Live Monitor</Text>
            <View className="rounded-full bg-[#E8EEFF] px-3 py-1">
              <Text className="font-inter-semibold text-[12px] text-[#3250C5]">{liveCount} checked in</Text>
            </View>
          </View>

          <ScrollView className="mt-4" showsVerticalScrollIndicator={false}>
            {liveFeed.length === 0 && (
              <View className="rounded-[14px] border border-[#E6EBF7] bg-[#F9FAFE] px-4 py-4">
                <Text className="font-inter text-[12px] text-[#697A99]">
                  Waiting for students to verify attendance...
                </Text>
              </View>
            )}

            {liveFeed.map((entry) => (
              <View
                key={entry.id}
                className="mb-3 rounded-[14px] border border-[#E3E9F7] bg-[#F7F9FF] px-4 py-3">
                <View className="flex-row items-center justify-between">
                  <Text className="font-inter-semibold text-[13px] text-[#203662]">{entry.name}</Text>
                  <Text className="font-inter text-[11px] text-[#7280A0]">{entry.time}</Text>
                </View>
                <Text className="font-inter mt-1 text-[12px] text-[#596A8D]">{entry.verification}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
