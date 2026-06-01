import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { pastSessions, upcomingSessions } from '../../data';
import { HistoryTab } from '../../types';

type HistoryPageProps = {
  historyTab: HistoryTab;
  onHistoryTabChange: (value: HistoryTab) => void;
};

export function HistoryPage({ historyTab, onHistoryTabChange }: HistoryPageProps) {
  return (
    <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 22 }}>
      <Text className="font-inter-bold text-[26px] leading-[34px] text-[#101A39]">
        Schedule & History
      </Text>
      <Text className="font-inter mt-2 text-[14px] leading-[22px] text-[#5E6A7A]">
        Review completed sessions and plan upcoming lectures.
      </Text>

      <View className="mt-5 flex-row rounded-[14px] bg-[#E8EDF8] p-1">
        <Pressable
          className={`flex-1 rounded-[11px] py-2 ${historyTab === 'past' ? 'bg-white' : ''}`}
          onPress={() => onHistoryTabChange('past')}>
          <Text
            className="font-inter-semibold text-center text-[13px]"
            style={{ color: historyTab === 'past' ? '#2F4CC2' : '#667794' }}>
            Past Sessions
          </Text>
        </Pressable>
        <Pressable
          className={`flex-1 rounded-[11px] py-2 ${historyTab === 'upcoming' ? 'bg-white' : ''}`}
          onPress={() => onHistoryTabChange('upcoming')}>
          <Text
            className="font-inter-semibold text-center text-[13px]"
            style={{ color: historyTab === 'upcoming' ? '#2F4CC2' : '#667794' }}>
            Upcoming
          </Text>
        </Pressable>
      </View>

      {historyTab === 'past' && (
        <View className="mt-5 gap-3">
          {pastSessions.map((session) => (
            <View key={session.id} className="rounded-[16px] border border-[#E3E8F4] bg-white px-4 py-4">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="font-inter-semibold text-[14px] text-[#142750]">{session.date}</Text>
                  <Text className="font-inter mt-1 text-[12px] text-[#64748F]">
                    {session.time} - {session.room}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="font-inter-bold text-[16px] text-[#1A336E]">{session.completion}%</Text>
                  <Ionicons name="chevron-forward" size={18} color="#7A86A0" />
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {historyTab === 'upcoming' && (
        <View className="mt-5 gap-3">
          {upcomingSessions.map((session) => (
            <View key={session.id} className="rounded-[16px] border border-[#DDE6FF] bg-[#F3F6FF] px-4 py-4">
              <Text className="font-inter-semibold text-[14px] text-[#1F3770]">{session.title}</Text>
              <Text className="font-inter mt-2 text-[12px] text-[#5E6C88]">
                {session.date} - {session.time}
              </Text>
              <Text className="font-inter mt-1 text-[12px] text-[#5E6C88]">{session.room}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
