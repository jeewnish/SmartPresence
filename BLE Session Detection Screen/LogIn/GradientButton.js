import React, { useEffect } from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import COLORS from './colors';
import { scale, vs, ms } from './styles';

export default function GradientButton({ label, onPress, style }) {
  const glow = useSharedValue(0);
  const press = useSharedValue(1);

  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sine) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.sine) })
      ),
      -1,
      false
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glow.value, [0, 1], [0.35, 0.7]),
    transform: [{ scale: interpolate(glow.value, [0, 1], [1, 1.04]) }],
  }));

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: press.value }],
  }));

  const handlePressIn = () => {
    press.value = withTiming(0.96, { duration: 100 });
  };
  const handlePressOut = () => {
    press.value = withTiming(1, { duration: 160 });
  };

  return (
    <Animated.View style={[btnStyles.wrapper, style, pressStyle]}>
      {/* Glow halo behind button */}
      <Animated.View style={[btnStyles.glowHalo, glowStyle]} />
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={btnStyles.touchable}
      >
        <LinearGradient
          colors={[COLORS.purpleBright, COLORS.purpleDeep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={btnStyles.gradient}
        >
          <Text style={btnStyles.label}>{label}</Text>
          <ArrowIcon />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

function ArrowIcon() {
  return (
    <View style={arrowStyles.wrap}>
      <View style={arrowStyles.shaft} />
      <View style={arrowStyles.headTop} />
      <View style={arrowStyles.headBot} />
    </View>
  );
}

const BTN_H = vs(52);

const btnStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    height: BTN_H,
    borderRadius: scale(14),
  },
  glowHalo: {
    position: 'absolute',
    inset: -scale(6),
    top: -scale(6),
    left: -scale(6),
    right: -scale(6),
    bottom: -scale(6),
    borderRadius: scale(20),
    backgroundColor: COLORS.purpleGlow,
  },
  touchable: {
    flex: 1,
    borderRadius: scale(14),
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(10),
    borderRadius: scale(14),
  },
  label: {
    fontSize: ms(16),
    fontWeight: '700',
    color: COLORS.textWhite,
    letterSpacing: 0.4,
  },
});

const arrowStyles = StyleSheet.create({
  wrap: {
    width: scale(16),
    height: scale(14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  shaft: {
    position: 'absolute',
    width: scale(12),
    height: scale(2),
    backgroundColor: COLORS.textWhite,
    borderRadius: 1,
    right: 0,
  },
  headTop: {
    position: 'absolute',
    width: scale(7),
    height: scale(2),
    backgroundColor: COLORS.textWhite,
    borderRadius: 1,
    right: 0,
    top: scale(2),
    transform: [{ rotate: '45deg' }, { translateX: scale(1) }],
  },
  headBot: {
    position: 'absolute',
    width: scale(7),
    height: scale(2),
    backgroundColor: COLORS.textWhite,
    borderRadius: 1,
    right: 0,
    bottom: scale(2),
    transform: [{ rotate: '-45deg' }, { translateX: scale(1) }],
  },
});
