import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Icon from "../components/Icon";

export default function VerificationPendingScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-navy">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pb-3 pt-14">
        <Pressable onPress={() => router.back()}>
          <Icon name="arrow-left" size={20} color="#FFFFFF" />
        </Pressable>
        <Text className="text-[16px] font-semibold text-white">
          Verification Status
        </Text>
        <Icon name="bell" size={20} color="#FFFFFF" />
      </View>

      <View className="flex-1 px-5">
        {/* ID Card illustration */}
        <View className="mt-6 items-center justify-center rounded-3xl border border-navy-border bg-navy-card py-10">
          <View className="relative">
            <View className="h-24 w-36 items-center justify-center rounded-2xl border-2 border-brand/40 bg-[#1A1F4A]">
              <Ionicons name="id-card-outline" size={44} color="#6C5CE7" />
            </View>
            <View className="absolute -right-2 -top-2 h-8 w-8 items-center justify-center rounded-full bg-brand">
              <Icon name="clock-five" size={14} color="#FFFFFF" />
            </View>
          </View>
        </View>

        {/* Title */}
        <Text className="mt-8 text-center text-[26px] font-extrabold text-white">
          Verification Pending
        </Text>
        <Text className="mt-2 text-center text-[13px] leading-5 text-[#8B8FA3]">
          Your university ID is under verification by{"\n"}the university authority.
        </Text>

        {/* Timeline */}
        <View className="mt-10 gap-0">
          {/* Step 1 - Done */}
          <View className="flex-row gap-4">
            <View className="items-center">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-dark">
                <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              </View>
              <View className="w-0.5 flex-1 bg-brand-dark/40 my-1" />
            </View>
            <View className="pb-6">
              <Text className="text-[15px] font-bold text-white">ID Submitted</Text>
              <Text className="mt-0.5 text-[12px] text-[#5B5F73]">
                October 24, 2023 • 02:30 PM
              </Text>
            </View>
          </View>

          {/* Step 2 - In progress */}
          <View className="flex-row gap-4">
            <View className="items-center">
              <View className="h-10 w-10 items-center justify-center rounded-full border-2 border-brand bg-navy-card">
                <Ionicons name="sync" size={16} color="#6C5CE7" />
              </View>
              <View className="w-0.5 flex-1 bg-navy-border my-1" />
            </View>
            <View className="pb-6">
              <Text className="text-[15px] font-bold text-brand-light">
                Waiting for Approval
              </Text>
              <Text className="mt-0.5 text-[12px] text-[#5B5F73]">
                In progress by University Admin
              </Text>
            </View>
          </View>

          {/* Step 3 - Locked */}
          <View className="flex-row gap-4">
            <View className="items-center">
              <View className="h-10 w-10 items-center justify-center rounded-full border border-navy-border bg-navy-card">
                <Icon name="lock" size={16} color="#5B5F73" />
              </View>
            </View>
            <View>
              <Text className="text-[15px] font-semibold text-[#5B5F73]">
                Verification Complete
              </Text>
              <Text className="mt-0.5 text-[12px] text-[#3D4057]">
                Access to all features
              </Text>
            </View>
          </View>
        </View>

        {/* Info box */}
        <View className="mt-8 flex-row gap-3 rounded-2xl border border-navy-border bg-navy-card p-4">
          <Ionicons name="information-circle-outline" size={20} color="#8B7CF6" />
          <Text className="flex-1 text-[12px] leading-5 text-[#8B8FA3]">
            Typically, verification takes 2-3 business days. You will receive a
            notification once confirmed.
          </Text>
        </View>
      </View>
    </View>
  );
}