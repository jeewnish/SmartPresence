import { Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Icon from "../components/Icon";
import BottomNav from "../components/BottomNav";

// Page 7 — Alerts & Notices
// Reference: Alerts and notices.png

type Alert = {
  date: string;
  type: string;
  title: string;
  time: string;
  location: string;
  status: "UPCOMING" | "TODAY";
};

const ALERTS: Alert[] = [
  {
    date: "2026/08/10",
    type: "Assignment",
    title: "Data Structures & Algorithms",
    time: "10:00 AM - 12:00 PM",
    location: "Lecture Hall 4B",
    status: "UPCOMING",
  },
  {
    date: "2026/08/10",
    type: "Assignment",
    title: "OOAD",
    time: "10:00 AM - 12:00 PM",
    location: "Lecture Hall 4B",
    status: "UPCOMING",
  },
];

function AlertCard({ alert }: { alert: Alert }) {
  return (
    <View className="mb-4 rounded-3xl border border-navy-border bg-[#10142A] p-5">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Icon name="calendar" size={14} color="#8B8FA3" />
          <Text className="text-[12px] text-[#8B8FA3]">{alert.date}</Text>
        </View>
        <View className="flex-row items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-1">
          <View className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <Text className="text-[10px] font-bold text-emerald-400">{alert.status}</Text>
        </View>
      </View>
      <Text className="mt-2 text-[12px] font-semibold text-brand-light">{alert.type}</Text>
      <Text className="mt-1 text-[20px] font-bold leading-snug text-white">{alert.title}</Text>
      <View className="mt-3 gap-1.5">
        <View className="flex-row items-center gap-2">
          <Icon name="clock-five" size={13} color="#8B8FA3" />
          <Text className="text-[12px] text-[#8B8FA3]">{alert.time}</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Icon name="location" size={13} color="#8B8FA3" />
          <Text className="text-[12px] text-[#8B8FA3]">{alert.location}</Text>
        </View>
      </View>
    </View>
  );
}

export default function AlertsScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-navy">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pb-3 pt-14">
        <Pressable onPress={() => router.back()}>
          <Icon name="arrow-left" size={20} color="#FFFFFF" />
        </Pressable>
        <Text className="text-[16px] font-semibold text-white">Alerts & Notices</Text>
        <View className="w-6" />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {ALERTS.map((alert, i) => (
          <AlertCard key={i} alert={alert} />
        ))}
      </ScrollView>

      <BottomNav active="home" />
    </View>
  );
}
