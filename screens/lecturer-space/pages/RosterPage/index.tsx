import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { rosterFilters } from '../../data';
import { RosterFilter, StudentRecord } from '../../types';

type RosterPageProps = {
  searchQuery: string;
  rosterFilter: RosterFilter;
  filteredRoster: StudentRecord[];
  onSearchQueryChange: (value: string) => void;
  onFilterChange: (value: RosterFilter) => void;
  onToggleManualAttendance: (id: string, nextValue: boolean) => void;
};

export function RosterPage({
  searchQuery,
  rosterFilter,
  filteredRoster,
  onSearchQueryChange,
  onFilterChange,
  onToggleManualAttendance,
}: RosterPageProps) {
  return (
    <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 22 }}>
      <Text className="font-inter-bold text-[26px] leading-[34px] text-[#101A39]">Class Roster</Text>
      <Text className="font-inter mt-2 text-[14px] leading-[22px] text-[#5E6A7A]">
        Manage attendance manually and review security flags.
      </Text>

      <View className="mt-5 flex-row items-center rounded-[16px] border border-[#D9DFEC] bg-white px-4 py-3">
        <Ionicons name="search" size={20} color="#8390A8" />
        <TextInput
          className="font-inter ml-2 flex-1 text-[14px] text-[#1A2B45]"
          placeholder="Search by name or student ID"
          placeholderTextColor="#95A1B5"
          value={searchQuery}
          onChangeText={onSearchQueryChange}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
        {rosterFilters.map((filter) => {
          const selected = rosterFilter === filter.key;
          return (
            <Pressable
              key={filter.key}
              className={`mr-3 rounded-full px-4 py-2 ${selected ? 'bg-[#3C5AE8]' : 'bg-[#E9EDF7]'}`}
              onPress={() => onFilterChange(filter.key)}>
              <Text
                className="font-inter-semibold text-[12px]"
                style={{ color: selected ? '#FFFFFF' : '#51617F' }}>
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View className="mt-5 gap-3">
        {filteredRoster.map((student) => (
          <View key={student.id} className="rounded-[16px] border border-[#E4E8F0] bg-white px-4 py-4">
            <View className="flex-row items-center">
              <View className="flex-1">
                <Text className="font-inter-semibold text-[14px] text-[#15264C]">{student.name}</Text>
                <Text className="font-inter mt-1 text-[12px] text-[#61708A]">{student.studentId}</Text>
              </View>
              <Switch
                value={student.present}
                onValueChange={(nextValue) => onToggleManualAttendance(student.id, nextValue)}
                trackColor={{ false: '#CAD2E2', true: '#8CA2FF' }}
                thumbColor={student.present ? '#3F5EEA' : '#FFFFFF'}
              />
            </View>

            {student.flagged && (
              <View className="mt-3 rounded-[12px] border border-[#FFD4D4] bg-[#FFF3F3] px-3 py-3">
                <View className="flex-row items-start">
                  <Ionicons name="warning" size={16} color="#CC3A3A" />
                  <Text className="font-inter ml-2 flex-1 text-[12px] leading-[18px] text-[#A33A3A]">
                    {student.flagged}
                  </Text>
                </View>
              </View>
            )}
          </View>
        ))}

        {filteredRoster.length === 0 && (
          <View className="rounded-[16px] border border-[#E2E8F4] bg-white px-4 py-5">
            <Text className="font-inter text-[13px] text-[#6B7892]">
              No students match this search/filter combination.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
