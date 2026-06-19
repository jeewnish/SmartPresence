import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Icon from "../components/Icon";
import BottomNav from "../components/BottomNav";

// Page 10 — Attendance Success
// Reference: Attendance Success Screen 7.png

export default function AttendanceSuccessScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-navy">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pb-3 pt-14">
        <Pressable onPress={() => router.back()}>
          <Icon name="arrow-left" size={20} color="#FFFFFF" />
        </Pressable>
        <Text className="text-[16px] font-semibold text-white">Attendance Status</Text>
        <Icon name="bell" size={20} color="#FFFFFF" />
      </View>

      <View className="flex-1 items-center justify-center px-6">
        {/* Checkmark ring */}
        <View className="mb-8 h-40 w-40 items-center justify-center">
          <View className="absolute h-40 w-40 rounded-full border-2 border-brand/20" />
          <View className="absolute h-32 w-32 rounded-full border-2 border-brand/40" />
          <View className="h-24 w-24 items-center justify-center rounded-full bg-brand">
            <Ionicons name="checkmark" size={44} color="#FFFFFF" />
          </View>
        </View>

        <Text className="text-center text-[26px] font-extrabold leading-snug text-white">
          Attendance Marked{"\n"}Successfully
        </Text>
        <Text className="mt-3 text-center text-[13px] text-[#5B5F73]">
          Your presence has been recorded for today's session.
        </Text>

        {/* Course detail card */}
        <View className="mt-8 w-full overflow-hidden rounded-2xl">
          {/* Gradient top border */}
          <View className="h-1 w-full bg-brand" />
          <View className="bg-[#B3AEBC]/20 p-5">
            <Text className="text-[11px] font-bold tracking-wider text-brand-light">COURSE DETAILS</Text>

            <View className="mt-3 flex-row items-start gap-3">
              <Icon name="book" size={20} color="#8B8FA3" />
              <Text className="text-[16px] font-bold text-white">CS402 Advanced Algorithms</Text>
            </View>

            <View className="mt-4 flex-row items-center gap-3">
              <Ionicons name="person-outline" size={16} color="#8B8FA3" />
              <View>
                <Text className="text-[11px] text-[#8B8FA3]">Lecturer</Text>
                <Text className="text-[13px] font-semibold text-white">Mr.J.W.P.Perera</Text>
              </View>
            </View>

            <View className="mt-4 flex-row gap-6">
              <View className="flex-row items-center gap-2">
                <Icon name="clock-five" size={15} color="#8B8FA3" />
                <View>
                  <Text className="text-[11px] text-[#8B8FA3]">Time</Text>
                  <Text className="text-[13px] font-semibold text-white">10:15 AM</Text>
                </View>
              </View>
              <View className="flex-row items-center gap-2">
                <Ionicons name="business-outline" size={15} color="#8B8FA3" />
                <View>
                  <Text className="text-[11px] text-[#8B8FA3]">Hall No</Text>
                  <Text className="text-[13px] font-semibold text-white">Hall 4B</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* CTA buttons */}
      <View className="px-5 pb-8 gap-3">
        <Pressable
          onPress={() => router.push("/home")}
          className="flex-row items-center justify-center gap-2 rounded-2xl bg-brand-dark py-5 active:opacity-80"
        >
          <Text className="text-[16px] font-bold text-white">Back to Dashboard</Text>
          <Ionicons name="grid-outline" size={18} color="#FFFFFF" />
        </Pressable>

        <Pressable
          onPress={() => router.push("/history")}
          className="items-center py-3 active:opacity-70"
        >
          <Text className="text-[14px] text-[#8B8FA3]">View History</Text>
        </Pressable>
      </View>

      <BottomNav active="home" />
    </View>
  );
}
