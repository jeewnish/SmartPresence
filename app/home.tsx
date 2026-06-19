import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Icon from "../components/Icon";
import BottomNav from "../components/BottomNav";

// Page 4 — Home Dashboard
// Reference: Home.png
// Dark navy screen with current session card, verification signals, quick access list

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-navy">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pb-3 pt-14">
        <View className="flex-row items-center gap-3">
          <Image
            source={require("../assets/images/avatar-placeholder.png")}
            className="h-10 w-10 rounded-full border border-brand/40"
            resizeMode="cover"
          />
          <View>
            <Text className="text-[12px] text-[#8B8FA3]">Welcome back,</Text>
            <Text className="text-[15px] font-bold text-white">Kaveesha Lakshan</Text>
          </View>
        </View>
        <Pressable onPress={() => router.push("/alerts")} className="relative">
          <Icon name="bell" size={22} color="#FFFFFF" />
          <View className="absolute -right-1 -top-1 h-4 w-4 items-center justify-center rounded-full bg-brand">
            <Text className="text-[9px] font-bold text-white">2</Text>
          </View>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {/* Current Session Card */}
        <View className="mx-5 rounded-3xl bg-[#1A1F4A] p-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-[12px] font-semibold text-[#8B7CF6]">Current Session</Text>
            <View className="flex-row items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-1">
              <View className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <Text className="text-[10px] font-bold text-emerald-400">UPCOMING</Text>
            </View>
          </View>
          <Text className="mt-2 text-[22px] font-bold leading-tight text-white">
            Data Structures &{"\n"}Algorithms
          </Text>
          <View className="mt-3 gap-1.5">
            <View className="flex-row items-center gap-2">
              <Icon name="clock-five" size={13} color="#8B8FA3" />
              <Text className="text-[12px] text-[#8B8FA3]">10:00 AM - 12:00 PM</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Icon name="location" size={13} color="#8B8FA3" />
              <Text className="text-[12px] text-[#8B8FA3]">Lecture Hall 4B</Text>
            </View>
          </View>

          <Pressable
            onPress={() => router.push("/attendance")}
            className="mt-5 flex-row items-center justify-center gap-2 rounded-2xl bg-brand-dark py-4 active:opacity-80"
          >
            <Ionicons name="person-add-outline" size={18} color="#FFFFFF" />
            <Text className="text-[15px] font-bold text-white">Mark Attendance</Text>
          </Pressable>
        </View>

        {/* Verification Signals */}
        <View className="mt-6 px-5">
          <Text className="mb-3 text-[11px] font-bold tracking-[2px] text-[#5B5F73]">
            VERIFICATION SIGNALS
          </Text>
          <View className="flex-row gap-3">
            {/* Bluetooth */}
            <View className="flex-1 items-center rounded-2xl border border-navy-border bg-navy-card py-4">
              <Ionicons name="bluetooth" size={22} color="#6C5CE7" />
              <Text className="mt-2 text-[11px] text-[#8B8FA3]">Bluetooth</Text>
              <Text className="mt-1 text-[10px] font-bold text-emerald-400">ACTIVE</Text>
            </View>
            {/* Biometric */}
            <View className="flex-1 items-center rounded-2xl border border-navy-border bg-navy-card py-4">
              <Icon name="fingerprint" size={22} color="#6C5CE7" />
              <Text className="mt-2 text-[11px] text-[#8B8FA3]">Biometric</Text>
              <Text className="mt-1 text-[10px] font-bold text-[#8B8FA3]">READY</Text>
            </View>
            {/* Secure Link */}
            <View className="flex-1 items-center rounded-2xl border border-navy-border bg-navy-card py-4">
              <Icon name="link" size={22} color="#34D399" />
              <Text className="mt-2 text-[11px] text-[#8B8FA3]">Secure Link</Text>
              <Text className="mt-1 text-[10px] font-bold text-emerald-400">VERIFIED</Text>
            </View>
          </View>
        </View>

        {/* Quick Access */}
        <View className="mt-6 px-5">
          <Text className="mb-3 text-[11px] font-bold tracking-[2px] text-[#5B5F73]">
            QUICK ACCESS
          </Text>

          <Pressable
            onPress={() => router.push("/history")}
            className="mb-3 flex-row items-center rounded-2xl border border-navy-border bg-navy-card px-4 py-4 active:opacity-80"
          >
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-brand/15">
              <Icon name="time-past" size={20} color="#8B7CF6" />
            </View>
            <View className="flex-1">
              <Text className="text-[14px] font-semibold text-white">Attendance History</Text>
              <Text className="mt-0.5 text-[12px] text-[#5B5F73]">View past logs and statistics</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#5B5F73" />
          </Pressable>

          <Pressable
            onPress={() => router.push("/schedule")}
            className="mb-3 flex-row items-center rounded-2xl border border-navy-border bg-navy-card px-4 py-4 active:opacity-80"
          >
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-[#4D5FC4]/15">
              <Icon name="book" size={20} color="#8B7CF6" />
            </View>
            <View className="flex-1">
              <Text className="text-[14px] font-semibold text-white">My Courses</Text>
              <Text className="mt-0.5 text-[12px] text-[#5B5F73]">Manage 6 active enrollments</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#5B5F73" />
          </Pressable>

          <Pressable
            onPress={() => router.push("/alerts")}
            className="flex-row items-center rounded-2xl border border-navy-border bg-navy-card px-4 py-4 active:opacity-80"
          >
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15">
              <Icon name="megaphone" size={20} color="#FBBF24" />
            </View>
            <View className="flex-1">
              <Text className="text-[14px] font-semibold text-white">Alerts & Notices</Text>
              <Text className="mt-0.5 text-[12px] text-[#5B5F73]">2 new administrative updates</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#5B5F73" />
          </Pressable>
        </View>
      </ScrollView>

      <BottomNav active="home" />
    </View>
  );
}
