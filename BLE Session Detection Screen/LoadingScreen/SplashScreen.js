import React, { useEffect } from 'react';
import { View, Text, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';

import AppLogo from './AppLogo';
import COLORS from './colors';
import splashStyles, { scale, verticalScale } from './styles';

// ─── Pagination Dot ───────────────────────────────────────────────────────────
function PaginationDot({ active, delay }) {
  const opacity = useSharedValue(active ? 1 : 0.5);

  useEffect(() => {
    if (!active) {
      opacity.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(0.8, { duration: 1400, easing: Easing.inOut(Easing.sine) }),
            withTiming(0.4, { duration: 1400, easing: Easing.inOut(Easing.sine) })
          ),
          -1,
          false
        )
      );
    }
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        splashStyles.dot,
        active ? splashStyles.dotActive : splashStyles.dotInactive,
        animStyle,
      ]}
    />
  );
}

// ─── Loading Bar ──────────────────────────────────────────────────────────────
function LoadingBar() {
  const progress = useSharedValue(0);

  useEffect(() => {
    // Animate to ~65% then pause (simulates "initializing")
    progress.value = withDelay(
      600,
      withTiming(0.65, { duration: 2800, easing: Easing.out(Easing.quad) })
    );
  }, []);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${interpolate(progress.value, [0, 1], [0, 100])}%`,
  }));

  return (
    <View style={splashStyles.loadingBarContainer}>
      <Animated.View style={fillStyle}>
        <LinearGradient
          colors={[COLORS.purpleDeep, COLORS.purplePrimary, COLORS.blueAccent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={splashStyles.loadingBarFill}
        />
      </Animated.View>
    </View>
  );
}

// ─── Main SplashScreen ────────────────────────────────────────────────────────
export default function SplashScreen() {
  const rootOpacity = useSharedValue(0);
  const titleY = useSharedValue(verticalScale(20));
  const titleOpacity = useSharedValue(0);
  const bottomOpacity = useSharedValue(0);

  useEffect(() => {
    // Fade in entire screen
    rootOpacity.value = withTiming(1, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });

    // Title slides up and fades in
    titleOpacity.value = withDelay(
      400,
      withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) })
    );
    titleY.value = withDelay(
      400,
      withTiming(0, { duration: 700, easing: Easing.out(Easing.cubic) })
    );

    // Bottom section fades in last
    bottomOpacity.value = withDelay(
      800,
      withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) })
    );
  }, []);

  const rootStyle = useAnimatedStyle(() => ({ opacity: rootOpacity.value }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));
  const bottomStyle = useAnimatedStyle(() => ({ opacity: bottomOpacity.value }));

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Animated.View style={[{ flex: 1 }, rootStyle]}>
        <LinearGradient
          colors={[
            COLORS.bgDeepBlack,
            COLORS.bgDarkBlue,
            COLORS.bgMidnight,
            COLORS.bgDarkPurple,
          ]}
          locations={[0, 0.35, 0.65, 1]}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={splashStyles.gradient}
        >
          {/* Corner ambient glows */}
          <View style={splashStyles.cornerGlowTopLeft} />
          <View style={splashStyles.cornerGlowTopRight} />
          <View style={splashStyles.cornerGlowBottomRight} />

          {/* ── Center: Logo + Title ─────────────────────────────── */}
          <View style={splashStyles.logoSection}>
            <AppLogo />

            {/* Title block */}
            <Animated.View style={[splashStyles.titleSection, titleStyle]}>
              <View style={splashStyles.titleRow}>
                <Text style={splashStyles.titleSmart}>SMART</Text>
                <Text style={splashStyles.titlePresence}>PRESENCE</Text>
              </View>
              <Text style={splashStyles.subtitle}>AI POWER SYSTEM</Text>
            </Animated.View>
          </View>

          {/* ── Bottom Section ───────────────────────────────────── */}
          <Animated.View style={[splashStyles.bottomSection, bottomStyle]}>
            <Text style={splashStyles.secureText}>Secure Smart Attendance System</Text>

            {/* Pagination dots */}
            <View style={splashStyles.dotsRow}>
              <PaginationDot active={false} delay={0} />
              <PaginationDot active={true} delay={300} />
              <PaginationDot active={false} delay={600} />
            </View>

            {/* Loading label */}
            <Text style={splashStyles.loadingText}>INITIALIZING AI CORE</Text>

            {/* Progress bar */}
            <LoadingBar />
          </Animated.View>
        </LinearGradient>
      </Animated.View>
    </>
  );
}
