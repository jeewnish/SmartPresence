import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Icon from "../components/Icon";

export default function FingerprintSetupScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-navy">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pb-3 pt-14">
        <Pressable onPress={() => router.back()}>
          <Icon name="arrow-left" size={20} color="#FFFFFF" />
        </Pressable>
        <Text className="text-[16px] font-semibold text-white">
          Smart Presence
        </Text>
        <View className="w-6" />
      </View>

      <View className="flex-1 px-5">
        {/* Progress steps */}
        <View className="mt-4 rounded-2xl border border-navy-border bg-navy-card p-5 gap-4">
          {/* Step 1 */}
          <View className="flex-row items-center gap-3">
            <View className="h-8 w-8 items-center justify-center rounded-full bg-emerald-500">
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            </View>
            <View>
              <Text className="text-[14px] font-semibold text-white">
                Upload University ID
              </Text>
              <Text className="text-[11px] text-emerald-400">Completed</Text>
            </View>
          </View>

          {/* Divider */}
          <View className="ml-4 h-4 w-0.5 bg-emerald-500/40" />

          {/* Step 2 */}
          <View className="flex-row items-center gap-3">
            <View className="h-8 w-8 items-center justify-center rounded-full bg-emerald-500">
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            </View>
            <View>
              <Text className="text-[14px] font-semibold text-white">
                Waiting for Admin Approval
              </Text>
              <Text className="text-[11px] text-emerald-400">Approved</Text>
            </View>
          </View>

          {/* Divider */}
          <View className="ml-4 h-4 w-0.5 bg-brand/40" />

          {/* Step 3 - Active */}
          <View className="flex-row items-center gap-3">
            <View className="h-8 w-8 items-center justify-center rounded-full bg-brand">
              <Icon name="fingerprint" size={16} color="#FFFFFF" />
            </View>
            <View>
              <Text className="text-[14px] font-bold text-brand-light">
                Fingerprint Verification
              </Text>
              <Text className="text-[11px] text-[#8B8FA3]">In Progress</Text>
            </View>
          </View>
        </View>

        {/* Fingerprint scanner */}
        <View className="mt-8 items-center">
          <View className="h-48 w-48 items-center justify-center rounded-full bg-[#0D1035]">
            <View className="h-40 w-40 items-center justify-center rounded-full border border-brand/30 bg-[#111440]">
              <View className="h-32 w-32 items-center justify-center rounded-full bg-[#151850]">
                <Icon name="fingerprint" size={72} color="#4D5FC4" />
              </View>
            </View>
          </View>
          {/* Shield badge */}
          <View className="mt-2 -translate-y-4 self-end mr-10 h-8 w-8 items-center justify-center rounded-full border border-brand/40 bg-navy-card">
            <Ionicons name="shield-checkmark-outline" size={16} color="#8B7CF6" />
          </View>
        </View>

        {/* Text */}
        <Text className="text-center text-[22px] font-extrabold text-white">
          Complete Your Verification
        </Text>
        <Text className="mt-2 text-center text-[13px] leading-5 text-[#8B8FA3]">
          Place your finger on the sensor to activate biometric authentication
          for your university portal.
        </Text>

        {/* Security badges */}
        <View className="mt-5 flex-row justify-center gap-3">
          <View className="flex-row items-center gap-1.5 rounded-full border border-navy-border bg-navy-card px-3 py-1.5">
            <Icon name="lock" size={12} color="#8B8FA3" />
            <Text className="text-[11px] font-semibold text-[#8B8FA3]">
              SECURE DATA
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5 rounded-full border border-navy-border bg-navy-card px-3 py-1.5">
            <Ionicons name="shield-outline" size={12} color="#8B8FA3" />
            <Text className="text-[11px] font-semibold text-[#8B8FA3]">
              256-BIT ENCRYPTED
            </Text>
          </View>
        </View>
      </View>

      {/* Buttons */}
      <View className="px-5 pb-8 gap-3">
        <Pressable
          onPress={() => router.push("/home")}
          className="flex-row items-center justify-center gap-2 rounded-2xl bg-brand-dark py-5 active:opacity-80"
        >
          <Ionicons name="radio-outline" size={18} color="#FFFFFF" />
          <Text className="text-[16px] font-bold text-white">
            Scan Fingerprint
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.back()}
          className="items-center py-3 active:opacity-70"
        >
          <Text className="text-[14px] text-[#8B8FA3]">Cancel Verification</Text>
        </Pressable>
      </View>
    </View>
  );
}