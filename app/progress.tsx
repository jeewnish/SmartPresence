import { Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image } from "react-native";
import Icon from "../components/Icon";
import BottomNav from "../components/BottomNav";

type CourseBar = {
  name: string;
  percent: number;
  color: string;
};

const COURSES: CourseBar[] = [
  { name: "DATA BASE", percent: 95, color: "#34D399" },
  { name: "OOAD", percent: 45, color: "#F87171" },
  { name: "OOP", percent: 85, color: "#6C5CE7" },
  { name: "CAPSTONE", percent: 90, color: "#34D399" },
];

export default function ProgressScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-navy">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pb-3 pt-14">
        <Pressable onPress={() => router.back()}>
          <Icon name="arrow-left" size={20} color="#FFFFFF" />
        </Pressable>
        <Text className="text-[16px] font-semibold text-white">Progress</Text>
        <Pressable onPress={() => router.push("/alerts")}>
          <Icon name="bell" size={22} color="#FFFFFF" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Attendance Health Card */}
        <View className="mx-5 rounded-3xl bg-emerald-500 p-5">
          <Text className="text-[13px] font-semibold text-emerald-100">
            Attendance Health
          </Text>
          <View className="mt-1 flex-row items-center gap-3">
            <Text className="text-[32px] font-extrabold text-white">
              Excellent
            </Text>
            <View className="flex-row items-center gap-1">
              <Ionicons name="trending-up" size={13} color="#d1fae5" />
              <Text className="text-[11px] text-emerald-100">
                +2.4% from last month
              </Text>
            </View>
          </View>

          <View className="mt-4 flex-row items-center justify-between">
            {/* Avatar */}
            <View className="relative">
              <Image
                source={require("../assets/images/avatar-placeholder.png")}
                className="h-20 w-20 rounded-full border-2 border-white/40"
                resizeMode="cover"
              />
              <View className="absolute bottom-0 right-0 h-5 w-5 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-400" />
              <Text className="mt-2 text-center text-[11px] font-bold text-white">
                22CIS0200
              </Text>
            </View>

            {/* Circle progress */}
            <View className="h-24 w-24 items-center justify-center rounded-full border-4 border-white/60">
              <Text className="text-[24px] font-extrabold text-white">95%</Text>
            </View>
          </View>
        </View>

        {/* Recent Check-ins */}
        <View className="mx-5 mt-5 rounded-3xl bg-[#B3C8F0] p-5">
          <Text className="mb-3 text-[11px] font-bold tracking-wider text-[#4A5568]">
            RECENT CHECK-INS
          </Text>
          {["Oct 24, 10:05 AM", "Oct 24, 10:05 AM", "Oct 24, 10:05 AM"].map(
            (time, i) => (
              <View
                key={i}
                className="flex-row items-center justify-between py-2.5 border-b border-white/30 last:border-0"
              >
                <Text className="text-[14px] text-[#2D3748]">{time}</Text>
                <Text className="text-[14px] font-semibold text-[#2D3748]">
                  Present
                </Text>
              </View>
            )
          )}
        </View>

        {/* Monthly Progress */}
        <View className="mt-6 px-5">
          <Text className="mb-4 text-[16px] font-bold text-white">
            Monthly Progress
          </Text>

          {COURSES.map((course, i) => (
            <View key={i} className="mb-5">
              <View className="mb-1.5 flex-row items-center justify-between">
                <Text className="text-[12px] font-semibold tracking-wider text-[#8B8FA3]">
                  {course.name}
                </Text>
                <Text className="text-[15px] font-bold text-brand-light">
                  {course.percent}%
                </Text>
              </View>
              <View className="h-2 overflow-hidden rounded-full bg-navy-card">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${course.percent}%`,
                    backgroundColor: course.color,
                  }}
                />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <BottomNav active="profile" />
    </View>
  );
}