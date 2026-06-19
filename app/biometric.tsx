import { Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Icon from "../components/Icon";
import BottomNav from "../components/BottomNav";

export default function BiometricScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-navy">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-14 pb-3">
        <Pressable onPress={() => router.back()}>
          <Icon name="arrow-left" size={20} color="#FFFFFF" />
        </Pressable>
        <Text className="text-[16px] font-semibold text-white">Attendance</Text>
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
      <Text className="mt-6 text-center text-[24px] font-bold text-white">
        Biometric Verification
      </Text>
      <Text className="mt-2 text-center text-[13px] text-[#5B5F73] px-6">
        Verify your identity to mark attendance
      </Text>

      {/* Fingerprint ring */}
      <View className="flex-1 items-center justify-center">
        <View className="h-52 w-52 items-center justify-center">
          <View className="absolute h-52 w-52 rounded-full border-2 border-brand/30" />
          <View className="absolute h-44 w-44 rounded-full border-2 border-brand/50" />
          <View className="h-36 w-36 items-center justify-center rounded-full bg-[#1A1F4A]">
            <View className="h-28 w-28 items-center justify-center rounded-full bg-brand">
              <Icon name="fingerprint" size={56} color="#FFFFFF" />
            </View>
          </View>
        </View>
      </View>

      {/* Location info */}
      <View className="px-5 gap-3">
        <View className="flex-row items-center rounded-2xl border border-navy-border bg-[#1A1F4A] px-4 py-4">
          <Icon name="location" size={18} color="#8B8FA3" />
          <View className="flex-1 ml-3">
            <Text className="text-[10px] font-bold tracking-wider text-[#8B8FA3]">CURRENT LOCATION</Text>
            <Text className="mt-0.5 text-[14px] font-semibold text-white">Building 4, Lecture Hall B</Text>
          </View>
          <Ionicons name="bar-chart" size={18} color="#5B5F73" />
        </View>

        <View className="flex-row items-center rounded-2xl border border-navy-border bg-[#1A1F4A] px-4 py-4">
          <Icon name="graduation-cap" size={18} color="#8B8FA3" />
          <View className="flex-1 ml-3">
            <Text className="text-[10px] font-bold tracking-wider text-[#8B8FA3]">COURSE</Text>
            <Text className="mt-0.5 text-[14px] font-semibold text-white">CS301: Advanced Data Structures</Text>
          </View>
        </View>
      </View>

      {/* CTA */}
      <View className="px-5 py-5">
        <Pressable
          onPress={() => router.push("/attendance-success")}
          className="items-center justify-center rounded-2xl bg-brand-dark py-5 active:opacity-80"
        >
          <Text className="text-[16px] font-bold text-white">Scan Fingerprint</Text>
        </Pressable>
      </View>

      <BottomNav active="home" />
    </View>
  );
}