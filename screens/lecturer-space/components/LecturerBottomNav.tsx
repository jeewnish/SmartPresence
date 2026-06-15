import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { LecturerTab } from '../types';

type LecturerBottomNavProps = {
  activeTab: LecturerTab;
  bottomInset: number;
  onTabChange: (tab: LecturerTab) => void;
};

export function LecturerBottomNav({ activeTab, bottomInset, onTabChange }: LecturerBottomNavProps) {
  const tabColor = (tab: LecturerTab) => (activeTab === tab ? '#3C5AE8' : '#8993A7');

  return (
    <View
      className="border-t border-[#E3E8F2] bg-white px-2"
      style={{ paddingBottom: Math.max(bottomInset, 12), paddingTop: 8 }}>
      <View className="flex-row">
        <Pressable className="flex-1 items-center py-2" onPress={() => onTabChange('broadcast')}>
          <Ionicons
            name={activeTab === 'broadcast' ? 'radio' : 'radio-outline'}
            size={22}
            color={tabColor('broadcast')}
          />
          <Text className="font-inter-semibold mt-1 text-[11px]" style={{ color: tabColor('broadcast') }}>
            Broadcast
          </Text>
        </Pressable>

        <Pressable className="flex-1 items-center py-2" onPress={() => onTabChange('roster')}>
          <Ionicons
            name={activeTab === 'roster' ? 'people' : 'people-outline'}
            size={22}
            color={tabColor('roster')}
          />
          <Text className="font-inter-semibold mt-1 text-[11px]" style={{ color: tabColor('roster') }}>
            Roster
          </Text>
        </Pressable>

        <Pressable className="flex-1 items-center py-2" onPress={() => onTabChange('history')}>
          <Ionicons
            name={activeTab === 'history' ? 'time' : 'time-outline'}
            size={22}
            color={tabColor('history')}
          />
          <Text className="font-inter-semibold mt-1 text-[11px]" style={{ color: tabColor('history') }}>
            History
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
