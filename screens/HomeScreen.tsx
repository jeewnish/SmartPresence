import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';

import { images } from '../constants/images';

type HomeScreenProps = {
  onOpenStudentSpace: () => void;
  onOpenLecturerSpace: () => void;
};

export function HomeScreen({ onOpenStudentSpace, onOpenLecturerSpace }: HomeScreenProps) {
  return (
    <View className="flex-1 bg-[#F3F4F6] px-6 pt-28">
      <View className="items-center">
        <Image className="h-32 w-32 rounded-[32px] shadow-sm" source={images.appIcon} />

        <Text className="font-inter-bold mt-12 text-center text-[24px] leading-[32px] text-[#0D193D]">
          SmartPresence
        </Text>
        <Text className="font-inter mt-4 text-center text-[14px] leading-[22px] text-[#5E6A7A]">
          Choose your workspace to get started
        </Text>
      </View>

      <View className="mt-16 gap-5">
        <Pressable
          className="rounded-[28px] border border-[#E8EAEE] bg-white px-7 py-8 shadow-sm"
          onPress={onOpenStudentSpace}>
          <View className="flex-row items-center">
            <View className="mr-7 h-[74px] w-[74px] items-center justify-center rounded-full bg-[#EEF2FA]">
              <Ionicons name="school-outline" size={33} color="#4660EA" />
            </View>

            <View className="flex-1">
              <Text className="font-inter-semibold text-[14px] leading-[20px] text-[#0D193D]">
                Student Space
              </Text>
              <Text className="font-inter mt-2 text-[12px] leading-[18px] text-[#5E6A7A]">
                Check in and view progress
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={32} color="#A3ABB8" />
          </View>
        </Pressable>

        <Pressable
          className="rounded-[28px] border border-[#E8EAEE] bg-white px-7 py-8 shadow-sm"
          onPress={onOpenLecturerSpace}>
          <View className="flex-row items-center">
            <View className="mr-7 h-[74px] w-[74px] items-center justify-center rounded-full bg-[#EEF2FA]">
              <Ionicons name="people-outline" size={33} color="#5254E8" />
            </View>

            <View className="flex-1">
              <Text className="font-inter-semibold text-[14px] leading-[20px] text-[#0D193D]">
                Lecturer Portal
              </Text>
              <Text className="font-inter mt-2 text-[12px] leading-[18px] text-[#5E6A7A]">
                Manage sessions & attendance
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={32} color="#A3ABB8" />
          </View>
        </Pressable>
      </View>
    </View>
  );
}
