import { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Icon from "../components/Icon";

// Page 2 — Login
// Reference: Login 2 .png
// Hero photo (university hall) with the wordmark baked into the
// cropped asset, sitting above a soft lavender sign-in card.

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="flex-1 bg-ink">
      <ScrollView bounces={false} contentContainerStyle={{ flexGrow: 1 }}>
        {/* Hero */}
        <Image
          source={require("../assets/images/login-hero.png")}
          className="h-[335px] w-full"
          resizeMode="cover"
        />

        {/* Card */}
        <View className="-mt-6 flex-1 rounded-t-[28px] bg-card px-6 pt-7">
          <Text className="text-[22px] font-bold text-[#15132B]">Welcome Back</Text>
          <Text className="mt-1 text-[13px] text-[#5B5A66]">
            Please sign in to your student account
          </Text>

          {/* Email */}
          <Text className="mb-2 mt-6 text-[13px] font-semibold text-[#15132B]">
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
          <View className="mb-2 mt-5 flex-row items-center justify-between">
            <Text className="text-[13px] font-semibold text-[#15132B]">Password</Text>
            <Pressable>
              <Text className="text-[13px] font-semibold text-[#15132B]">Forgot?</Text>
            </Pressable>
          </View>
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

          {/* Sign in row */}
          <View className="mt-7 flex-row items-center gap-3">
            <Pressable
              onPress={() => router.push("/home")}
              className="h-14 flex-1 flex-row items-center justify-center gap-2 rounded-2xl bg-brand-dark active:opacity-80"
            >
              <Text className="text-[15px] font-bold text-white">Sign In</Text>
              <Icon name="arrow-right" size={16} color="#FFFFFF" />
            </Pressable>

            <Pressable className="h-14 w-14 items-center justify-center rounded-2xl bg-brand-dark/30 active:opacity-80">
              <Icon name="fingerprint" size={24} color="#4D5FC4" />
            </Pressable>
          </View>

          {/* Sign up */}
          <View className="mt-6 items-center">
            <Text className="text-[13px] text-[#5B5A66]">
              Don&apos;t have an account?{" "}
              <Text className="font-bold text-brand-dark">Sign Up</Text>
            </Text>
          </View>

          {/* Trust badges */}
          <View className="mb-6 mt-6 flex-row justify-center gap-6">
            <Ionicons name="business-outline" size={18} color="#6B6A76" />
            <Ionicons name="shield-checkmark-outline" size={18} color="#6B6A76" />
            <Ionicons name="qr-code-outline" size={18} color="#6B6A76" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
