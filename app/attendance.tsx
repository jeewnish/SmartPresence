import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Icon from "../components/Icon";
import BottomNav from "../components/BottomNav";

// Page 8 — BLE Session Detection
// Reference: BLE Session Detection Screen 5.png

export default function AttendanceScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-navy">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pb-3 pt-14">
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

      {/* Main content */}
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-center text-[22px] font-bold leading-snug text-white">
          Lecturer session detected{"\n"}nearby
        </Text>

        {/* Radar animation rings */}
        <View className="my-10 h-56 w-56 items-center justify-center">
          <View className="absolute h-56 w-56 rounded-full border border-brand/15" />
          <View className="absolute h-44 w-44 rounded-full border border-brand/25" />
          <View className="absolute h-32 w-32 rounded-full border border-brand/35" />
          <View className="h-20 w-20 items-center justify-center rounded-full bg-brand-dark/70">
            <Icon name="location" size={24} color="#FFFFFF" />
          </View>
        </View>

        {/* Session details */}
        <View className="items-center gap-1.5">
          <Text className="text-[14px] text-[#8B8FA3]">Lec Hall No - Z9</Text>
          <Text className="text-[14px] text-[#8B8FA3]">Time Period - 1400h</Text>
          <Text className="text-[14px] text-[#8B8FA3]">Code - IS10201</Text>
          <Text className="text-[14px] text-[#8B8FA3]">Subject - Web Development</Text>
        </View>

        {/* Signal strength */}
        <View className="mt-8 w-full">
          <View className="flex-row items-center justify-between">
            <Text className="text-[11px] font-bold tracking-[2px] text-[#5B5F73]">SIGNAL STRENGTH</Text>
            <Text className="text-[16px] font-bold text-brand-light">85%</Text>
          </View>
          <View className="mt-2 h-2 overflow-hidden rounded-full bg-navy-card">
            <View className="h-full w-[85%] rounded-full bg-brand-dark" />
          </View>
          <View className="mt-2 flex-row items-center gap-1.5">
            <Ionicons name="radio-outline" size={12} color="#5B5F73" />
            <Text className="text-[11px] text-[#5B5F73]">Connected to Proximity Beacon</Text>
          </View>
        </View>
      </View>

      {/* CTA */}
      <View className="px-5 pb-8">
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
