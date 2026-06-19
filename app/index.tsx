import { useEffect, useRef } from "react";
import { Animated, Easing, Image, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

// Page 1 — Splash
// Reference: First 1.png
// Dark navy/violet gradient, animated checkmark mark, three-dot loader
// and a progress bar that fills while "AI core" finishes initializing.

export default function SplashScreen() {
  const router = useRouter();
  const progress = useRef(new Animated.Value(0)).current;
  const dotScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 1800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(dotScale, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(dotScale, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
    ).start();

    const timer = setTimeout(() => router.replace("/login"), 2000);
    return () => clearTimeout(timer);
  }, []);

  const barWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <LinearGradient
      colors={["#171234", "#0E0C28", "#020617"]}
      locations={[0, 0.45, 1]}
      className="flex-1"
    >
      <View className="flex-1 items-center justify-center px-10">
        {/* Mark */}
        <View className="mb-7 h-24 w-24 items-center justify-center rounded-full border border-brand/40">
          <Image
            source={require("../assets/images/splash-icon.png")}
            className="h-[72px] w-[72px] rounded-2xl"
            resizeMode="contain"
          />
        </View>

        {/* Wordmark */}
        <Text className="text-[28px] font-extrabold tracking-wide">
          <Text className="text-white">SMART</Text>
          <Text className="text-brand-light">PRESENCE</Text>
        </Text>
        <Text className="mt-1 text-[12px] font-bold tracking-[3px] text-brand-light">
          AI POWER SYSTEM
        </Text>
      </View>

      <View className="items-center px-10 pb-16">
        <Text className="mb-10 text-[13px] text-slate-400">Secure Smart Attendance System</Text>

        {/* Pagination dots */}
        <View className="mb-4 flex-row gap-2">
          <View className="h-1.5 w-1.5 rounded-full bg-brand-light" />
          <View className="h-1.5 w-1.5 rounded-full bg-blue-400" />
          <View className="h-1.5 w-1.5 rounded-full bg-slate-500" />
        </View>

        <Text className="mb-3 text-[11px] font-semibold tracking-[2px] text-slate-500">
          INITIALIZING AI CORE
        </Text>

        <View className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <Animated.View style={{ width: barWidth }} className="h-full">
            <LinearGradient
              colors={["#6C5CE7", "#4D8DF6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="h-full w-full"
            />
          </Animated.View>
        </View>
      </View>
    </LinearGradient>
  );
}
