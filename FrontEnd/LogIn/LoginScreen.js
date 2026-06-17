import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';

import InputField, { EnvelopeIcon, LockIcon } from './InputField';
import GradientButton from './GradientButton';
import COLORS from './colors';
import loginStyles, { scale, vs, ms } from './styles';

// ─── Small inline icons for the tab bar ──────────────────────────────────────
function TabIcon({ type }) {
  const color = COLORS.tabIcon;
  if (type === 'home') {
    return (
      <View style={tabIconStyles.wrap}>
        <View style={[tabIconStyles.houseRoof, { borderBottomColor: color }]} />
        <View style={[tabIconStyles.houseBody, { borderColor: color }]} />
      </View>
    );
  }
  if (type === 'shield') {
    return (
      <View style={tabIconStyles.wrap}>
        <View style={[tabIconStyles.shield, { borderColor: color }]} />
      </View>
    );
  }
  // grid / apps
  return (
    <View style={tabIconStyles.grid}>
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={[tabIconStyles.gridCell, { borderColor: color }]} />
      ))}
    </View>
  );
}

// ─── School logo icon ────────────────────────────────────────────────────────
function SchoolIcon() {
  return (
    <View style={logoIconStyles.wrap}>
      <View style={logoIconStyles.hat} />
      <View style={logoIconStyles.brim} />
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Entry animations
  const rootOpacity = useSharedValue(0);
  const headerY = useSharedValue(vs(-20));
  const headerOpacity = useSharedValue(0);
  const sheetY = useSharedValue(vs(40));
  const sheetOpacity = useSharedValue(0);

  // Header float
  const floatY = useSharedValue(0);

  useEffect(() => {
    rootOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });

    headerOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
    headerY.value = withDelay(200, withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }));

    sheetOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    sheetY.value = withDelay(400, withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }));

    // Gentle float for header
    floatY.value = withRepeat(
      withSequence(
        withTiming(-vs(5), { duration: 2500, easing: Easing.inOut(Easing.sine) }),
        withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.sine) })
      ),
      -1,
      false
    );
  }, []);

  const rootStyle = useAnimatedStyle(() => ({ opacity: rootOpacity.value }));
  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerY.value }, { translateY: floatY.value }],
  }));
  const sheetStyle = useAnimatedStyle(() => ({
    opacity: sheetOpacity.value,
    transform: [{ translateY: sheetY.value }],
  }));

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Animated.View style={[{ flex: 1 }, rootStyle]}>
        <LinearGradient
          colors={[
            COLORS.bgDeepBlack,
            COLORS.bgDarkBlue,
            COLORS.bgNavy,
            COLORS.bgDarkPurple,
          ]}
          locations={[0, 0.3, 0.6, 1]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={loginStyles.gradient}
        >
          {/* Corner glows */}
          <View style={loginStyles.glowTL} />
          <View style={loginStyles.glowBR} />

          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -vs(20)}
          >
            {/* ── Hero header ─────────────────────────────────────── */}
            <Animated.View style={[loginStyles.heroArea, headerStyle]}>
              {/* Logo badge */}
              <View style={loginStyles.logoIcon}>
                <SchoolIcon />
              </View>
              <Text style={loginStyles.appName}>Smart Presence</Text>
              <Text style={loginStyles.appSubtitle}>Academic Attendance System</Text>
            </Animated.View>

            {/* ── Sliding sheet ────────────────────────────────────── */}
            <Animated.View style={[{ flex: 1 }, sheetStyle]}>
              <View style={loginStyles.sheet}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{ flexGrow: 1 }}
                >
                  {/* Welcome */}
                  <View style={loginStyles.welcomeBlock}>
                    <Text style={loginStyles.welcomeTitle}>Welcome Back</Text>
                    <Text style={loginStyles.welcomeSub}>
                      Please sign in to your student account
                    </Text>
                  </View>

                  {/* Email */}
                  <InputField
                    label="University Email"
                    placeholder="student.name@university.edu"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    LeftIcon={EnvelopeIcon}
                  />

                  {/* Password */}
                  <InputField
                    label="Password"
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    showToggle
                    LeftIcon={LockIcon}
                    forgotLabel="Forgot?"
                    onForgot={() => {}}
                  />

                  {/* Buttons row */}
                  <View style={loginStyles.btnWrapper}>
                    <GradientButton
                      label="Sign In"
                      onPress={() => {}}
                    />
                    {/* Biometric button */}
                    <TouchableOpacity
                      style={loginStyles.bioBtn}
                      activeOpacity={0.8}
                      onPress={() => {}}
                    >
                      <FingerprintIcon />
                    </TouchableOpacity>
                  </View>

                  {/* Footer */}
                  <View style={loginStyles.footer}>
                    <Text style={loginStyles.footerText}>
                      Don't have an account?{' '}
                      <Text style={loginStyles.footerLink}>Sign Up</Text>
                    </Text>
                  </View>
                </ScrollView>

                {/* Bottom tab bar */}
                <View style={loginStyles.tabBar}>
                  <TouchableOpacity style={loginStyles.tabIcon}>
                    <TabIcon type="home" />
                  </TouchableOpacity>
                  <TouchableOpacity style={loginStyles.tabIcon}>
                    <TabIcon type="shield" />
                  </TouchableOpacity>
                  <TouchableOpacity style={loginStyles.tabIcon}>
                    <TabIcon type="grid" />
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </LinearGradient>
      </Animated.View>
    </>
  );
}

// ─── Fingerprint icon (concentric arcs) ──────────────────────────────────────
function FingerprintIcon() {
  const c = COLORS.purpleAccent;
  return (
    <View style={fpStyles.wrap}>
      {[14, 10, 6].map((size, i) => (
        <View
          key={i}
          style={[
            fpStyles.arc,
            {
              width: scale(size),
              height: scale(size),
              borderRadius: scale(size / 2),
              borderColor: c,
              opacity: 1 - i * 0.2,
            },
          ]}
        />
      ))}
      <View style={[fpStyles.dot, { backgroundColor: c }]} />
    </View>
  );
}

const fpStyles = StyleSheet.create({
  wrap: {
    width: scale(22),
    height: scale(22),
    alignItems: 'center',
    justifyContent: 'center',
  },
  arc: {
    position: 'absolute',
    borderWidth: 1.2,
    backgroundColor: 'transparent',
  },
  dot: {
    width: scale(2.5),
    height: scale(2.5),
    borderRadius: scale(1.5),
  },
});

// ─── Tab bar icon styles ──────────────────────────────────────────────────────
const tabIconStyles = StyleSheet.create({
  wrap: {
    width: scale(20),
    height: scale(20),
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  houseRoof: {
    width: 0,
    height: 0,
    borderLeftWidth: scale(9),
    borderRightWidth: scale(9),
    borderBottomWidth: scale(8),
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginBottom: -1,
  },
  houseBody: {
    width: scale(14),
    height: scale(10),
    borderWidth: 1.4,
    borderTopWidth: 0,
    borderBottomLeftRadius: 1,
    borderBottomRightRadius: 1,
  },
  shield: {
    width: scale(14),
    height: scale(16),
    borderWidth: 1.4,
    borderTopLeftRadius: scale(3),
    borderTopRightRadius: scale(3),
    borderBottomLeftRadius: scale(7),
    borderBottomRightRadius: scale(7),
  },
  grid: {
    width: scale(16),
    height: scale(16),
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(2),
  },
  gridCell: {
    width: scale(6),
    height: scale(6),
    borderWidth: 1.2,
    borderRadius: 1,
  },
});

// ─── School logo icon ─────────────────────────────────────────────────────────
const logoIconStyles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: scale(22),
    height: scale(22),
  },
  hat: {
    width: 0,
    height: 0,
    borderLeftWidth: scale(10),
    borderRightWidth: scale(10),
    borderBottomWidth: scale(9),
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(255,255,255,0.9)',
    marginBottom: -1,
  },
  brim: {
    width: scale(22),
    height: scale(3),
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 1,
  },
});
