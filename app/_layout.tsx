import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "../global.css";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="home" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="history" />
        <Stack.Screen name="schedule" />
        <Stack.Screen name="alerts" />
        <Stack.Screen name="attendance" />
        <Stack.Screen name="biometric" />
        <Stack.Screen name="attendance-success" />
      </Stack>
    </>
  );
}
