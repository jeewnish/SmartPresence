import { Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Icon from "../components/Icon";
import BottomNav from "../components/BottomNav";

export default function AttendanceScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-navy">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-14 pb-3">
        <Pressable onPress={() => router.back()}>
          <Icon name="arrow-left" size={20} color="#FFFFFF" />
        </Pressable>
        <Text className="text-[16px] font-semibold text-white">Smart Presence</Text>
        <Icon name="bell" size={20} color="#FFFFFF" />
      </View>

      {/* Status badges */}
      <View className="flex-row justify-center gap-3 mt-2">
        <View className="flex-row items-center gap-1.5 rounded-full border border-navy-border bg-navy-card px-3 py-1.5">
          <Ionicons name="checkmark-circle" size={13} color="#34D399" />
          <Text className="text-[12px] text-white">Bluetooth Active</Text>
        </View>
        <View className="flex-row items-center gap-1.5 rounded-full border border-navy-border bg-navy-card px-3 py-1.5">
          <Ionicons name="shield-checkmark" size={13} color="#34D399" />
          <Text className="text-[12px] text-white">Device Bound</Text>
        </View>
      </View>

      {/* Title */}
      <Text className="mt-6 text-center text-[22px] font-bold leading-snug text-white px-6">
        Lecturer session detected{"\n"}nearby
      </Text>

      {/* Radar rings */}
      <View className="flex-1 items-center justify-center">
        <View className="h-56 w-56 items-center justify-center">
          <View className="absolute h-56 w-56 rounded-full border border-brand/15" />
          <View className="absolute h-44 w-44 rounded-full border border-brand/25" />
          <View className="absolute h-32 w-32 rounded-full border border-brand/35" />
          <View className="h-20 w-20 items-center justify-center rounded-full bg-brand-dark/70">
            <Icon name="location" size={24} color="#FFFFFF" />
          </View>
        </View>

        {/* Session details */}
        <View className="mt-8 items-center gap-1.5">
          <Text className="text-[14px] text-[#8B8FA3]">Lec Hall No - Z9</Text>
          <Text className="text-[14px] text-[#8B8FA3]">Time Period - 1400h</Text>
          <Text className="text-[14px] text-[#8B8FA3]">Code - IS10201</Text>
          <Text className="text-[14px] text-[#8B8FA3]">Subject - Web Development</Text>
        </View>
      </View>

      {/* CTA */}
      <View className="px-5 pb-4">
        <Pressable
          onPress={() => router.push("/biometric")}
          className="flex-row items-center justify-center gap-2 rounded-2xl bg-brand-dark py-5 active:opacity-80"
        >
          <Icon name="fingerprint" size={20} color="#FFFFFF" />
          <Text className="text-[16px] font-bold text-white">Proceed to Biometric Verification</Text>
        </Pressable>
      </View>

      <BottomNav active="home" />
    </View>
  );
}