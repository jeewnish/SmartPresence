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

export default function SignUpScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <View className="flex-1 bg-ink">
      <ScrollView
        bounces={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center gap-3 px-5 pb-2 pt-14">
          <Pressable onPress={() => router.back()}>
            <Icon name="arrow-left" size={20} color="#FFFFFF" />
          </Pressable>
          <Text className="text-[18px] font-bold text-white">
            Student Sign Up
          </Text>
        </View>

        {/* Card */}
        <View className="mx-5 mt-4 rounded-3xl bg-card px-6 pt-6 pb-8">
          <Text className="text-[22px] font-bold text-[#15132B]">
            Create Account
          </Text>
          <Text className="mt-1 text-[13px] text-[#5B5A66]">
            Register your student account
          </Text>

          {/* Full Name */}
          <Text className="mb-2 mt-5 text-[13px] font-semibold text-[#15132B]">
            Full Name
          </Text>
          <View className="flex-row items-center rounded-2xl bg-card-input px-4">
            <Ionicons name="person-outline" size={16} color="#6B6B76" />
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              placeholderTextColor="#8B8A94"
              className="ml-3 h-12 flex-1 text-[14px] text-[#15132B]"
            />
          </View>

          {/* Student ID */}
          <Text className="mb-2 mt-4 text-[13px] font-semibold text-[#15132B]">
            Student ID
          </Text>
          <View className="flex-row items-center rounded-2xl bg-card-input px-4">
            <Icon name="graduation-cap" size={16} color="#6B6B76" />
            <TextInput
              value={studentId}
              onChangeText={setStudentId}
              placeholder="e.g. 24DS0300"
              placeholderTextColor="#8B8A94"
              autoCapitalize="characters"
              className="ml-3 h-12 flex-1 text-[14px] text-[#15132B]"
            />
          </View>

          {/* Email */}
          <Text className="mb-2 mt-4 text-[13px] font-semibold text-[#15132B]">
            University Email
          </Text>
          <View className="flex-row items-center rounded-2xl bg-card-input px-4">
            <Icon name="envelope" size={16} color="#6B6B76" />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="student.name@university.edu"
              placeholderTextColor="#8B8A94"
              autoCapitalize="none"
              keyboardType="email-address"
              className="ml-3 h-12 flex-1 text-[14px] text-[#15132B]"
            />
          </View>

          {/* Password */}
          <Text className="mb-2 mt-4 text-[13px] font-semibold text-[#15132B]">
            Password
          </Text>
          <View className="flex-row items-center rounded-2xl bg-card-input px-4">
            <Icon name="lock" size={16} color="#6B6B76" />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#8B8A94"
              secureTextEntry={!showPassword}
              className="ml-3 h-12 flex-1 text-[14px] text-[#15132B]"
            />
            <Pressable onPress={() => setShowPassword((v) => !v)}>
              <Icon name="eye" size={18} color="#6B6B76" />
            </Pressable>
          </View>

          {/* Confirm Password */}
          <Text className="mb-2 mt-4 text-[13px] font-semibold text-[#15132B]">
            Confirm Password
          </Text>
          <View className="flex-row items-center rounded-2xl bg-card-input px-4">
            <Icon name="lock" size={16} color="#6B6B76" />
            <TextInput
              value={confirm}
              onChangeText={setConfirm}
              placeholder="••••••••"
              placeholderTextColor="#8B8A94"
              secureTextEntry={!showConfirm}
              className="ml-3 h-12 flex-1 text-[14px] text-[#15132B]"
            />
            <Pressable onPress={() => setShowConfirm((v) => !v)}>
              <Icon name="eye" size={18} color="#6B6B76" />
            </Pressable>
          </View>

          {/* Sign Up Button */}
          <Pressable
            onPress={() => router.push("/home")}
            className="mt-7 h-14 flex-row items-center justify-center gap-2 rounded-2xl bg-brand-dark active:opacity-80"
          >
            <Text className="text-[15px] font-bold text-white">
              Create Account
            </Text>
            <Icon name="arrow-right" size={16} color="#FFFFFF" />
          </Pressable>

          {/* Sign in link */}
          <View className="mt-5 items-center">
            <Text className="text-[13px] text-[#5B5A66]">
              Already have an account?{" "}
              <Text
                className="font-bold text-brand-dark"
                onPress={() => router.push("/login")}
              >
                Sign In
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}