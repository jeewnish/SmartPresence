import { useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Icon from "../components/Icon";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  return (
    <View className="flex-1 bg-navy">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pb-3 pt-14">
        <Pressable onPress={() => router.back()}>
          <Icon name="arrow-left" size={20} color="#FFFFFF" />
        </Pressable>
        <Text className="text-[16px] font-semibold text-white">
          Change Password
        </Text>
        <Icon name="bell" size={20} color="#FFFFFF" />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="mt-4 text-[28px] font-extrabold text-white">
          Change Smart Presence
        </Text>
        <Text className="mt-1 text-[13px] text-[#8B8FA3]">
          Enter your academic details to get started.
        </Text>

        {/* Full Name */}
        <Text className="mb-2 mt-6 text-[13px] font-semibold text-white">
          Full Name
        </Text>
        <View className="flex-row items-center rounded-2xl border border-navy-border bg-navy-card px-4">
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder="e.g. Alex Johnson"
            placeholderTextColor="#5B5F73"
            className="h-14 flex-1 text-[14px] text-white"
          />
          <Ionicons name="person-outline" size={18} color="#5B5F73" />
        </View>

        {/* Student ID */}
        <Text className="mb-2 mt-4 text-[13px] font-semibold text-white">
          Student ID
        </Text>
        <View className="flex-row items-center rounded-2xl border border-navy-border bg-navy-card px-4">
          <TextInput
            value={studentId}
            onChangeText={setStudentId}
            placeholder="STU-2024-XXXX"
            placeholderTextColor="#5B5F73"
            autoCapitalize="characters"
            className="h-14 flex-1 text-[14px] text-white"
          />
          <Ionicons name="id-card-outline" size={18} color="#5B5F73" />
        </View>

        {/* Old Password */}
        <Text className="mb-2 mt-4 text-[13px] font-semibold text-white">
          Old Password
        </Text>
        <View className="flex-row items-center rounded-2xl border border-navy-border bg-navy-card px-4">
          <TextInput
            value={oldPassword}
            onChangeText={setOldPassword}
            placeholder="••••••••"
            placeholderTextColor="#5B5F73"
            secureTextEntry={!showOld}
            className="h-14 flex-1 text-[14px] text-white"
          />
          <Pressable onPress={() => setShowOld((v) => !v)}>
            <Icon name="lock" size={18} color="#5B5F73" />
          </Pressable>
        </View>

        {/* New Password */}
        <Text className="mb-2 mt-4 text-[13px] font-semibold text-white">
          New Password
        </Text>
        <View className="flex-row items-center rounded-2xl border border-navy-border bg-navy-card px-4">
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="••••••••"
            placeholderTextColor="#5B5F73"
            secureTextEntry={!showNew}
            className="h-14 flex-1 text-[14px] text-white"
          />
          <Pressable onPress={() => setShowNew((v) => !v)}>
            <Icon name="lock" size={18} color="#5B5F73" />
          </Pressable>
        </View>

        {/* Upload University ID */}
        <Text className="mb-2 mt-4 text-[13px] font-semibold text-white">
          Upload University ID
        </Text>
        <Pressable className="items-center justify-center rounded-2xl border border-dashed border-navy-border bg-navy-card py-8">
          <Icon name="upload" size={32} color="#5B5F73" />
          <Text className="mt-3 text-[13px] text-[#8B8FA3]">
            Click to upload photo of your ID
          </Text>
          <Text className="mt-1 text-[11px] text-[#5B5F73]">
            PNG, JPG up to 5MB
          </Text>
        </Pressable>

        {/* Button */}
        <Pressable
          onPress={() => router.push("/verification-pending")}
          className="mt-7 h-14 items-center justify-center rounded-2xl bg-brand-dark active:opacity-80"
        >
          <Text className="text-[15px] font-bold text-white">
            Change Password
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}