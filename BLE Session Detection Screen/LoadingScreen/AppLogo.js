import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import COLORS from './colors';
import { scale, verticalScale, moderateScale } from './styles';

// Simple SVG-free checkmark drawn with Views
const Checkmark = () => (
  <View style={logoStyles.checkWrap} pointerEvents="none">
    {/* Horizontal arm of check */}
    <View style={logoStyles.checkLeft} />
    {/* Vertical arm of check */}
    <View style={logoStyles.checkRight} />
  </View>
);

export default function AppLogo() {
  const pulse = useSharedValue(1);
  const float = useSharedValue(0);
  const ringOpacity = useSharedValue(0.6);

  useEffect(() => {
    // Pulsing scale for outer glow rings
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.18, { duration: 1600, easing: Easing.inOut(Easing.sine) }),
        withTiming(1.0, { duration: 1600, easing: Easing.inOut(Easing.sine) })
      ),
      -1,
      false
    );

    // Gentle float
    float.value = withRepeat(
      withSequence(
        withTiming(-verticalScale(9), { duration: 2200, easing: Easing.inOut(Easing.sine) }),
        withTiming(0, { duration: 2200, easing: Easing.inOut(Easing.sine) })
      ),
      -1,
      false
    );

    // Ring opacity breath
    ringOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.sine) }),
        withTiming(0.45, { duration: 1600, easing: Easing.inOut(Easing.sine) })
      ),
      -1,
      false
    );
  }, []);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: float.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: interpolate(pulse.value, [1, 1.18], [0.5, 0.15]),
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
  }));

  return (
    <Animated.View style={[logoStyles.floatWrapper, floatStyle]}>
      {/* Ambient radial glow behind logo */}
      <View style={logoStyles.ambientGlow} />

      {/* Outer pulse ring */}
      <Animated.View style={[logoStyles.pulseRing, pulseStyle]} />

      {/* Outer dashed / thin ring */}
      <Animated.View style={[logoStyles.outerRing, ringStyle]} />

      {/* Mid ring */}
      <View style={logoStyles.midRing}>
        {/* Inner circle background */}
        <LinearGradient
          colors={['#12103A', '#1A1050', '#0D0A2E']}
          style={logoStyles.innerCircle}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
        >
          {/* Diamond container – rotated 45° square = diamond */}
          <View style={logoStyles.diamondWrapper}>
            <LinearGradient
              colors={[
                COLORS.logoGradientStart,
                COLORS.logoGradientMid,
                COLORS.logoGradientEnd,
              ]}
              style={logoStyles.diamond}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Checkmark inside diamond (counter-rotated) */}
              <View style={logoStyles.checkContainer}>
                <CheckIcon />
              </View>
            </LinearGradient>
          </View>
        </LinearGradient>
      </View>
    </Animated.View>
  );
}

// Clean SVG-free check icon using two rotated bars
function CheckIcon() {
  return (
    <View style={logoStyles.checkIconWrap}>
      <View style={logoStyles.checkShortBar} />
      <View style={logoStyles.checkLongBar} />
    </View>
  );
}

const LOGO_SIZE = scale(130);
const DIAMOND_SIZE = scale(62);
const INNER_CIRCLE = scale(108);

const logoStyles = StyleSheet.create({
  floatWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: LOGO_SIZE + scale(40),
    height: LOGO_SIZE + scale(40),
  },

  // Ambient background glow
  ambientGlow: {
    position: 'absolute',
    width: LOGO_SIZE + scale(80),
    height: LOGO_SIZE + scale(80),
    borderRadius: (LOGO_SIZE + scale(80)) / 2,
    backgroundColor: COLORS.glowPurple,
    opacity: 0.4,
  },

  // Pulse animation ring
  pulseRing: {
    position: 'absolute',
    width: LOGO_SIZE + scale(20),
    height: LOGO_SIZE + scale(20),
    borderRadius: (LOGO_SIZE + scale(20)) / 2,
    borderWidth: scale(1.5),
    borderColor: COLORS.purplePrimary,
  },

  // Outer decorative ring
  outerRing: {
    position: 'absolute',
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    borderWidth: scale(1.2),
    borderColor: COLORS.purpleNeon,
    borderStyle: 'solid',
  },

  // Mid ring (slightly inside)
  midRing: {
    width: INNER_CIRCLE + scale(10),
    height: INNER_CIRCLE + scale(10),
    borderRadius: (INNER_CIRCLE + scale(10)) / 2,
    borderWidth: scale(1),
    borderColor: 'rgba(139, 92, 246, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Inner circle
  innerCircle: {
    width: INNER_CIRCLE,
    height: INNER_CIRCLE,
    borderRadius: INNER_CIRCLE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Diamond wrapper (rotated 45°)
  diamondWrapper: {
    width: DIAMOND_SIZE,
    height: DIAMOND_SIZE,
    transform: [{ rotate: '45deg' }],
    borderRadius: scale(12),
    shadowColor: COLORS.purpleNeon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: scale(18),
    elevation: 20,
  },

  diamond: {
    width: DIAMOND_SIZE,
    height: DIAMOND_SIZE,
    borderRadius: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Counter-rotate checkmark so it faces right
  checkContainer: {
    transform: [{ rotate: '-45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    width: DIAMOND_SIZE * 0.58,
    height: DIAMOND_SIZE * 0.58,
  },

  // Check icon
  checkIconWrap: {
    width: scale(22),
    height: scale(22),
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkShortBar: {
    position: 'absolute',
    width: scale(8),
    height: scale(2.8),
    backgroundColor: COLORS.textWhite,
    borderRadius: scale(2),
    bottom: scale(6),
    left: scale(1),
    transform: [{ rotate: '45deg' }],
  },
  checkLongBar: {
    position: 'absolute',
    width: scale(14),
    height: scale(2.8),
    backgroundColor: COLORS.textWhite,
    borderRadius: scale(2),
    bottom: scale(7),
    right: scale(1),
    transform: [{ rotate: '-52deg' }],
  },
});
