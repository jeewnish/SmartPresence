import { Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image } from "react-native";
import Icon from "../components/Icon";
import BottomNav from "../components/BottomNav";

// Page 6 — Attendance History
// Reference: History 8 - month.png

type Session = {
  code: string;
  title: string;
  date: string;
  time: string;
  status: "Present" | "Absent";
  icon: keyof typeof ICONS;
};

const ICONS = {
  code: "code-slash",
  calc: "calculator",
  lab: "flask",
  book: "book",
} as const;

const SESSIONS: Session[] = [
  { code: "CS 402", title: "Data Structures", date: "Today", time: "09:30 AM - 11:00 AM", status: "Present", icon: "code" },
  { code: "MA 301", title: "Calculus III", date: "Yesterday", time: "01:00 PM - 02:30 PM", status: "Present", icon: "calc" },
  { code: "PH 101", title: "Physics Lab", date: "21 Oct", time: "02:00 PM - 05:00 PM", status: "Present", icon: "lab" },
  { code: "EN 205", title: "Literature", date: "22 Oct", time: "11:30 AM - 01:00 PM", status: "Absent", icon: "book" },
];

function SessionCard({ session }: { session: Session }) {
  const isPresent = session.status === "Present";
  return (
    <View className="mb-3 flex-row items-center rounded-2xl border border-navy-border bg-navy-card px-4 py-4">
      <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-[#1A1F4A]">
        <Ionicons name="code-slash" size={18} color="#8B7CF6" />
      </View>
      <View className="flex-1">
        <Text className="text-[14px] font-bold text-brand-light">{session.code}: {session.title}</Text>
        <Text className="mt-0.5 text-[12px] text-[#5B5F73]">{session.date} • {session.time}</Text>
      </View>
      <View className={`rounded-full px-3 py-1.5 ${isPresent ? "bg-emerald-500/20" : "bg-rose-500/20"}`}>
        <Text className={`text-[11px] font-bold ${isPresent ? "text-emerald-400" : "text-rose-400"}`}>
          {session.status}
        </Text>
      </View>
    </View>
  );
}

export default function HistoryScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-navy">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pb-3 pt-14">
        <Pressable onPress={() => router.back()}>
          <Icon name="arrow-left" size={20} color="#FFFFFF" />
        </Pressable>
        <Text className="text-[16px] font-semibold text-white">Attendance History</Text>
        <Icon name="bell" size={20} color="#FFFFFF" />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {/* Student ID Card */}
        <View className="items-center pt-2">
          <View className="relative">
            <Image
              source={require("../assets/images/avatar-placeholder.png")}
              className="h-20 w-20 rounded-full border-2 border-brand"
              resizeMode="cover"
            />
            <View className="absolute bottom-0 right-0 h-5 w-5 items-center justify-center rounded-full bg-emerald-400 border-2 border-navy" />
          </View>
          <Text className="mt-3 text-[17px] font-bold text-white">Kaveesha Lakshan</Text>
          <Text className="text-[13px] text-[#5B5F73]">24DS0300</Text>
        </View>

        {/* Attendance Health Card */}
        <View className="mx-5 mt-5 flex-row items-center justify-between rounded-3xl bg-[#1A1F4A] p-5">
          <View>
            <Text className="text-[12px] text-[#8B8FA3]">Attendance Health</Text>
            <Text className="mt-1 text-[26px] font-extrabold text-white">Excellent</Text>
            <View className="mt-1 flex-row items-center gap-1">
              <Ionicons name="trending-up" size={12} color="#34D399" />
              <Text className="text-[11px] text-emerald-400">+2.4% from last month</Text>
            </View>
          </View>
          {/* Circle progress */}
          <View className="h-20 w-20 items-center justify-center rounded-full border-4 border-rose-400">
            <Text className="text-[20px] font-extrabold text-white">95%</Text>
          </View>
        </View>

        {/* Tab Selector */}
        <View className="mx-5 mt-4 flex-row rounded-2xl border border-navy-border bg-navy-card p-1">
          {["Week", "Month", "All"].map((tab, i) => (
            <Pressable
              key={tab}
              className={`flex-1 items-center rounded-xl py-2.5 ${i === 1 ? "bg-white" : ""}`}
            >
              <Text className={`text-[13px] font-semibold ${i === 1 ? "text-[#15132B]" : "text-[#5B5F73]"}`}>
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Recent Sessions */}
        <View className="mt-5 px-5">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-[15px] font-bold text-white">Recent Sessions</Text>
            <Text className="text-[12px] font-semibold text-brand-light">VIEW ALL</Text>
          </View>

          {SESSIONS.map((s, i) => (
            <SessionCard key={i} session={s} />
          ))}

          <Pressable className="mt-3 items-center rounded-2xl bg-brand-dark py-4 active:opacity-80">
            <Text className="text-[15px] font-bold text-white">Explore more</Text>
          </Pressable>
        </View>
      </ScrollView>

      <BottomNav active="history" />
    </View>
  );
}
