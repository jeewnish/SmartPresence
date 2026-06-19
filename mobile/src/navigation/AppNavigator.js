import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../screens/auth/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

import HomeScreen from '../screens/home/HomeScreen';
import ScheduleScreen from '../screens/home/ScheduleScreen';
import ProfileScreen from '../screens/home/ProfileScreen';
import AttendanceHistoryScreen from '../screens/home/AttendanceHistoryScreen';

import BLEDetectionScreen from '../screens/attendance/BLEDetectionScreen';
import BiometricScreen from '../screens/attendance/BiometricScreen';
import AttendanceSuccessScreen from '../screens/attendance/AttendanceSuccessScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>

        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />

        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Schedule" component={ScheduleScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="History" component={AttendanceHistoryScreen} />

        <Stack.Screen name="BLEDetection" component={BLEDetectionScreen} />
        <Stack.Screen name="Biometric" component={BiometricScreen} />
        <Stack.Screen name="AttendanceSuccess" component={AttendanceSuccessScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}