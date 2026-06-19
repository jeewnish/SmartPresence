import { Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Icon from "../components/Icon";
import BottomNav from "../components/BottomNav";

// Page 5 — Schedule (Upcoming Lectures)
// Reference: upcoming lecture alerts Today.png / weeks.png / All.png

type Lecture = {
  code: string;
  title: string;
  date: string;
  time: string;
  iconColor: string;
  iconBg: string;
};

const TODAY_LECTURES: Lecture[] = [
  { code: "CS 402", title: "Data Structures", date: "Today", time: "09:30 AM - 11:00 AM", iconColor: "#8B7CF6", iconBg: "#1A1F4A" },
  { code: "MA 301", title: "Calculus III", date: "23 Oct", time: "01:00 PM - 02:30 PM", iconColor: "#8B7CF6", iconBg: "#1A1F4A" },
  { code: "PH 101", title: "Physics Lab", date: "21 Oct", time: "02:00 PM - 05:00 PM", iconColor: "#8B7CF6", iconBg: "#1A1F4A" },
  { code: "EN 205", title: "Literature", date: "22 Oct", time: "11:30 AM - 01:00 PM", iconColor: "#8B7CF6", iconBg: "#1A1F4A" },
  { code: "CS 301", title: "Web Development", date: "23 Oct", time: "03:00 PM - 05:00 PM", iconColor: "#8B7CF6", iconBg: "#1A1F4A" },
  { code: "MA 201", title: "Linear Algebra", date: "24 Oct", time: "10:00 AM - 11:30 AM", iconColor: "#8B7CF6", iconBg: "#1A1F4A" },
];

function LectureCard({ lecture }: { lecture: Lecture }) {
  return (
    <View className="mb-3 flex-row items-center rounded-2xl border border-navy-border bg-navy-card px-4 py-4">
      <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: lecture.iconBg }}>
        <Ionicons name="code-slash" size={18} color={lecture.iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-[14px] font-bold text-emerald-400">{lecture.code}: {lecture.title}</Text>
        <Text className="mt-0.5 text-[12px] text-[#5B5F73]">{lecture.date} • {lecture.time}</Text>
      </View>
    </View>
  );
}

export default function ScheduleScreen() {
  const router = useRouter();
  const tabs = ["Today", "Week", "All"];
  const activeTab = "Today";

  return (
    <View className="flex-1 bg-navy">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pb-3 pt-14">
        <Text className="text-[18px] font-bold text-white">Smart Presence</Text>
        <Pressable onPress={() => router.push("/alerts")}>
          <Icon name="bell" size={22} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Tab Selector */}
      <View className="mx-5 mb-4 flex-row rounded-2xl border border-navy-border bg-navy-card p-1">
        {tabs.map((tab) => (
          <Pressable
            key={tab}
            className={`flex-1 items-center rounded-xl py-2.5 ${tab === activeTab ? "bg-white" : ""}`}
          >
            <Text className={`text-[13px] font-semibold ${tab === activeTab ? "text-[#15132B]" : "text-[#5B5F73]"}`}>
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-[16px] font-bold text-white">Upcoming Lectures</Text>
          <Text className="text-[12px] font-semibold text-brand-light">VIEW ALL</Text>
        </View>

        {TODAY_LECTURES.map((lec, i) => (
          <LectureCard key={i} lecture={lec} />
        ))}
      </ScrollView>

      <BottomNav active="schedule" />
    </View>
  );
}
