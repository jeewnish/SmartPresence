import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { moduleCards, statusColorMap, statusLabelMap } from '../../data';

type ProgressPageProps = {
  expandedModuleId: string | null;
  onExpandedModuleChange: (value: string | null) => void;
};

export function ProgressPage({ expandedModuleId, onExpandedModuleChange }: ProgressPageProps) {
  return (
    <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 28 }}>
      <Text className="font-inter-bold text-[26px] leading-[34px] text-[#101A39]">
        Student Progress
      </Text>
      <Text className="font-inter mt-2 text-[14px] leading-[22px] text-[#5E6A7A]">
        Monitor attendance standing across all modules.
      </Text>

      <View className="mt-6 gap-4">
        {moduleCards.map((moduleCard) => {
          const statusColor = statusColorMap[moduleCard.status];
          const isExpanded = expandedModuleId === moduleCard.id;

          return (
            <View key={moduleCard.id} className="rounded-[18px] border border-[#E4E8F0] bg-white px-4 py-4">
              <Pressable
                className="flex-row items-center"
                onPress={() => onExpandedModuleChange(isExpanded ? null : moduleCard.id)}>
                <View className="flex-1">
                  <Text className="font-inter-semibold text-[15px] text-[#17254B]">
                    {moduleCard.title}
                  </Text>
                  <Text className="font-inter mt-1 text-[12px]" style={{ color: statusColor }}>
                    {statusLabelMap[moduleCard.status]}
                  </Text>
                </View>
                <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={22} color="#7A869F" />
              </Pressable>

              <View className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#E9EDF5]">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${moduleCard.attendanceRate}%`,
                    backgroundColor: statusColor,
                  }}
                />
              </View>
              <Text className="font-inter mt-2 text-[12px] text-[#5F6D86]">
                {moduleCard.attendanceRate}% attendance
              </Text>

              {isExpanded && (
                <View className="mt-4 border-t border-[#EDF1F6] pt-3">
                  {moduleCard.recentCheckIns.map((entry) => (
                    <Text key={entry} className="font-inter mb-2 text-[12px] leading-[18px] text-[#5F6D86]">
                      {entry}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
