import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { missedAlerts, upcomingAlerts } from '../../data';

export function AlertsPage() {
  return (
    <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 28 }}>
      <Text className="font-inter-bold text-[26px] leading-[34px] text-[#101A39]">Alerts</Text>
      <Text className="font-inter mt-2 text-[14px] leading-[22px] text-[#5E6A7A]">
        Stay on top of upcoming classes and missed sessions.
      </Text>

      <Text className="font-inter-semibold mt-6 text-[14px] text-[#384A70]">Upcoming</Text>
      <View className="mt-3 gap-3">
        {upcomingAlerts.map((alert) => (
          <View key={alert.id} className="rounded-[16px] border border-[#DDE6FF] bg-[#F3F7FF] px-4 py-4">
            <Text className="font-inter-semibold text-[14px] text-[#1E3770]">{alert.title}</Text>
            <Text className="font-inter mt-1 text-[12px] leading-[18px] text-[#5D6A84]">{alert.detail}</Text>
            <Text className="font-inter mt-2 text-[11px] text-[#7280A0]">{alert.time}</Text>
          </View>
        ))}
      </View>

      <Text className="font-inter-semibold mt-6 text-[14px] text-[#384A70]">Missed</Text>
      <View className="mt-3 gap-3">
        {missedAlerts.map((alert) => (
          <View key={alert.id} className="rounded-[16px] border border-[#FFD9D9] bg-[#FFF5F5] px-4 py-4">
            <Text className="font-inter-semibold text-[14px] text-[#8F2630]">{alert.title}</Text>
            <Text className="font-inter mt-1 text-[12px] leading-[18px] text-[#7A4E55]">{alert.detail}</Text>
            <Text className="font-inter mt-2 text-[11px] text-[#9A6B73]">{alert.time}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
