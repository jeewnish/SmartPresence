import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

const RINGS = [
  { size: 260, opacity: 0.10, delay: 0 },
  { size: 200, opacity: 0.15, delay: 100 },
  { size: 148, opacity: 0.20, delay: 200 },
  { size: 100, opacity: 0.30, delay: 300 },
];

const RadarPing = ({ size, baseOpacity, delay, globalPulse }) => {
  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const opacityAnim = useRef(new Animated.Value(baseOpacity)).current;

  useEffect(() => {
    const loop = () => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.06,
            duration: 1600,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: baseOpacity * 0.55,
            duration: 1600,
            delay,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0.88,
            duration: 1600,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: baseOpacity,
            duration: 1600,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => loop());
    };
    loop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.ring,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    />
  );
};

const RadarDisplay = () => {
  // Center icon pulse
  const centerScale = useRef(new Animated.Value(1)).current;
  const centerGlow = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const loop = () => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(centerScale, { toValue: 1.12, duration: 1200, useNativeDriver: true }),
          Animated.timing(centerGlow, { toValue: 1, duration: 1200, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(centerScale, { toValue: 1, duration: 1200, useNativeDriver: true }),
          Animated.timing(centerGlow, { toValue: 0.6, duration: 1200, useNativeDriver: true }),
        ]),
      ]).start(() => loop());
    };
    loop();
  }, []);

  return (
    <View style={styles.container}>
      {/* Concentric rings */}
      {RINGS.map((ring, i) => (
        <View
          key={i}
          style={[
            styles.ringStatic,
            {
              width: ring.size,
              height: ring.size,
              borderRadius: ring.size / 2,
              borderColor: `rgba(107, 63, 212, ${ring.opacity})`,
            },
          ]}
        />
      ))}

      {/* Subtle fill gradient circles */}
      <View style={[styles.fillCircle, { width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(60, 30, 130, 0.08)' }]} />
      <View style={[styles.fillCircle, { width: 148, height: 148, borderRadius: 74, backgroundColor: 'rgba(80, 40, 160, 0.10)' }]} />
      <View style={[styles.fillCircle, { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(100, 55, 190, 0.14)' }]} />

      {/* Animated radar ping overlay */}
      {RINGS.map((ring, i) => (
        <RadarPing
          key={`ping-${i}`}
          size={ring.size}
          baseOpacity={ring.opacity + 0.05}
          delay={ring.delay}
        />
      ))}

      {/* Center glow blob */}
      <Animated.View
        style={[
          styles.centerGlowBlob,
          { opacity: centerGlow },
        ]}
      />

      {/* Center icon circle */}
      <Animated.View
        style={[
          styles.centerCircle,
          { transform: [{ scale: centerScale }] },
        ]}
      >
        <Text style={styles.centerIcon}>📍</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringStatic: {
    position: 'absolute',
    borderWidth: 1,
  },
  ringAnimated: {
    position: 'absolute',
    borderWidth: 1,
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(107, 63, 212, 0.3)',
  },
  fillCircle: {
    position: 'absolute',
  },
  centerGlowBlob: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(107, 63, 212, 0.55)',
  },
  centerCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(80, 45, 175, 0.90)',
    borderWidth: 1.5,
    borderColor: 'rgba(155, 111, 255, 0.70)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6B3FD4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 16,
    elevation: 12,
  },
  centerIcon: {
    fontSize: 22,
  },
});

export default RadarDisplay;
