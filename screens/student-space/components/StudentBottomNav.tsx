import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { StudentTab } from '../types';

type StudentBottomNavProps = {
  activeTab: StudentTab;
  bottomInset: number;
  onTabChange: (tab: StudentTab) => void;
};

export function StudentBottomNav({ activeTab, bottomInset, onTabChange }: StudentBottomNavProps) {
  const tabTextColor = (tab: StudentTab) => (activeTab === tab ? '#4762EA' : '#8B95A7');

  return (
    <View
      className="border-t border-[#E3E8F2] bg-white px-2"
      style={{ paddingBottom: Math.max(bottomInset, 12), paddingTop: 8 }}>
      <View className="flex-row">
        <Pressable className="flex-1 items-center py-2" onPress={() => onTabChange('radar')}>
          <Ionicons
            name={activeTab === 'radar' ? 'radio' : 'radio-outline'}
            size={23}
            color={tabTextColor('radar')}
          />
          <Text className="font-inter-semibold mt-1 text-[11px]" style={{ color: tabTextColor('radar') }}>
            Radar
          </Text>
        </Pressable>

        <Pressable className="flex-1 items-center py-2" onPress={() => onTabChange('progress')}>
          <Ionicons
            name={activeTab === 'progress' ? 'stats-chart' : 'stats-chart-outline'}
            size={23}
            color={tabTextColor('progress')}
          />
          <Text className="font-inter-semibold mt-1 text-[11px]" style={{ color: tabTextColor('progress') }}>
            Progress
          </Text>
        </Pressable>

        <Pressable className="flex-1 items-center py-2" onPress={() => onTabChange('alerts')}>
          <Ionicons
            name={activeTab === 'alerts' ? 'notifications' : 'notifications-outline'}
            size={23}
            color={tabTextColor('alerts')}
          />
          <Text className="font-inter-semibold mt-1 text-[11px]" style={{ color: tabTextColor('alerts') }}>
            Alerts
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
