import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Icon, { type IconName } from "./Icon";

type Tab = {
  key: string;
  label: string;
  icon: IconName;
  href: "/home" | "/schedule" | "/history" | "/profile";
};

const TABS: Tab[] = [
  { key: "home", label: "Home", icon: "home", href: "/home" },
  { key: "schedule", label: "Schedule", icon: "calendar", href: "/schedule" },
  { key: "history", label: "History", icon: "time-past", href: "/history" },
  { key: "profile", label: "Profile", icon: "user", href: "/profile" },
];

export default function BottomNav({ active }: { active: Tab["key"] }) {
  const router = useRouter();

  return (
    <View className="flex-row items-center justify-between border-t border-navy-border bg-navy px-8 pb-7 pt-3">
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Pressable
            key={tab.key}
            onPress={() => router.push(tab.href)}
            className="items-center gap-1"
          >
            <Icon name={tab.icon} size={22} color={isActive ? "#FFFFFF" : "#5B5F73"} />
            <Text
              className={`text-[11px] ${isActive ? "text-white font-semibold" : "text-[#5B5F73]"}`}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
