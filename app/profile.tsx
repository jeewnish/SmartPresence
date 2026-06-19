import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Icon from "../components/Icon";
import BottomNav from "../components/BottomNav";

// Page 3 — Profile
// Reference: Profile 3.png
// Dark navy settings screen. Only the mobile number is editable;
// department + institutional email are read-only.

function InfoCard({
  icon,
  label,
  value,
  trailing,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trailing: React.ReactNode;
}) {
  return (
    <View className="mb-3 flex-row items-center rounded-2xl border border-navy-border bg-navy-card px-4 py-3.5">
      <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-brand-dark/25">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-[11px] font-semibold tracking-wider text-rose">{label}</Text>
        <Text className="mt-0.5 text-[15px] font-semibold text-white">{value}</Text>
      </View>
      {trailing}
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-navy">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pb-3 pt-14">
        <Pressable onPress={() => router.push("/home")}>
          <Icon name="arrow-left" size={20} color="#FFFFFF" />
        </Pressable>
        <Text className="text-[16px] font-semibold text-white">Profile Settings</Text>
        <Icon name="settings" size={20} color="#FFFFFF" />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Avatar */}
        <View className="items-center pt-2">
          <View className="relative">
            <Image
              source={require("../assets/images/avatar-placeholder.png")}
              className="h-[92px] w-[92px] rounded-full border-2 border-brand"
            />
            <Pressable className="absolute bottom-0 right-0 h-7 w-7 items-center justify-center rounded-full bg-brand-dark">
              <Ionicons name="pencil" size={13} color="#FFFFFF" />
            </Pressable>
          </View>

          <View className="mt-3 flex-row items-center gap-2">
            <Ionicons name="phone-portrait-outline" size={14} color="#8B8FA3" />
            <Text className="text-[13px] text-[#8B8FA3]">Device Status</Text>
          </View>
          <Text className="text-[12px] text-[#5B5F73]">iPhone 15 Pro Max</Text>

          <View className="mt-3 flex-row items-center gap-1.5 rounded-full bg-mint/10 px-3 py-1.5">
            <View className="h-1.5 w-1.5 rounded-full bg-mint" />
            <Text className="text-[11px] font-bold tracking-wide text-mint">
              DEVICE AUTHORIZED
            </Text>
          </View>

          <Text className="mt-4 text-[19px] font-bold text-white">Kaveesha Lakshan</Text>
          <Text className="mt-0.5 text-[12px] text-[#5B5F73]">ID: 24DS0300</Text>
        </View>

        {/* Academic details */}
        <View className="px-5 pt-7">
          <Text className="mb-3 text-[12px] font-semibold tracking-wider text-[#5B5F73]">
            ACADEMIC DETAILS
          </Text>

          <InfoCard
            icon={<Icon name="graduation-cap" size={18} color="#8B7CF6" />}
            label="DEPARTMENT"
            value={"Computer Science & Engineering"}
            trailing={<Ionicons name="chevron-forward" size={18} color="#5B5F73" />}
          />

          <InfoCard
            icon={<Icon name="envelope" size={18} color="#8B7CF6" />}
            label="INSTITUTIONAL EMAIL"
            value="a.jeew@university.edu"
            trailing={<Icon name="lock" size={15} color="#F472B6" />}
          />

          <InfoCard
            icon={<Ionicons name="call-outline" size={18} color="#8B7CF6" />}
            label="MOBILE NUMBER"
            value="+1 (555) 012-3456"
            trailing={<Ionicons name="pencil" size={15} color="#F472B6" />}
          />

          <Pressable className="mt-3 flex-row items-center justify-center gap-2 rounded-2xl bg-navy-card py-4 active:opacity-80">
            <Ionicons name="key-outline" size={16} color="#FFFFFF" />
            <Text className="text-[14px] font-semibold text-white">Change Password</Text>
          </Pressable>

          <Pressable
            onPress={() => router.replace("/login")}
            className="mt-4 flex-row items-center justify-center gap-2 py-2 active:opacity-70"
          >
            <Ionicons name="log-out-outline" size={16} color="#F87171" />
            <Text className="text-[14px] font-semibold text-[#F87171]">Sign Out</Text>
          </Pressable>
        </View>
      </ScrollView>

      <BottomNav active="profile" />
    </View>
  );
}
