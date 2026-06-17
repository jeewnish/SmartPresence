import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const RING_COUNT = 3;

const ScanRing = ({ size, delay, baseOpacity }) => {
  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(baseOpacity)).current;

  useEffect(() => {
    const loop = () => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale,   { toValue: 1.08, duration: 1400, delay, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: baseOpacity * 0.4, duration: 1400, delay, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale,   { toValue: 0.85, duration: 1400, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: baseOpacity, duration: 1400, useNativeDriver: true }),
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
          width: size, height: size, borderRadius: size / 2,
          opacity, transform: [{ scale }],
        },
      ]}
    />
  );
};

const BiometricIcon = () => {
  const glowPulse  = useRef(new Animated.Value(0.7)).current;
  const iconScale  = useRef(new Animated.Value(1)).current;
  const scanLine   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Outer glow breathe
    const glow = () => {
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 1,   duration: 1600, useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 0.55, duration: 1600, useNativeDriver: true }),
      ]).start(() => glow());
    };
    glow();

    // Icon scale breathe
    const pulse = () => {
      Animated.sequence([
        Animated.timing(iconScale, { toValue: 1.06, duration: 1200, useNativeDriver: true }),
        Animated.timing(iconScale, { toValue: 1,    duration: 1200, useNativeDriver: true }),
      ]).start(() => pulse());
    };
    pulse();

    // Scan line sweep
    const sweep = () => {
      Animated.sequence([
        Animated.timing(scanLine, { toValue: 1, duration: 2000, useNativeDriver: false }),
        Animated.timing(scanLine, { toValue: 0, duration: 0,    useNativeDriver: false }),
      ]).start(() => sweep());
    };
    sweep();
  }, []);

  const scanTop = scanLine.interpolate({ inputRange: [0, 1], outputRange: [0, 130] });

  return (
    <View style={styles.container}>
      {/* Scan rings */}
      {[{ size: 260, op: 0.13, delay: 0 },
        { size: 210, op: 0.18, delay: 180 },
        { size: 164, op: 0.25, delay: 360 }].map((r, i) => (
        <ScanRing key={i} size={r.size} baseOpacity={r.op} delay={r.delay} />
      ))}

      {/* Outer glow blob */}
      <Animated.View style={[styles.glowBlob, { opacity: glowPulse }]} />

      {/* Main circle */}
      <Animated.View style={[styles.outerCircle, { transform: [{ scale: iconScale }] }]}>
        <LinearGradient
          colors={['#2A1580', '#1A0D60', '#12085A']}
          style={styles.innerCircle}
        >
          {/* Scan line overlay */}
          <Animated.View
            style={[styles.scanLine, { top: scanTop }]}
            pointerEvents="none"
          />

          {/* Fingerprint drawn with nested arcs using Views */}
          <FingerprintArt />
        </LinearGradient>
      </Animated.View>
    </View>
  );
};

/* Fingerprint art using pure View shapes */
const ARC_SIZES = [22, 34, 46, 58, 70, 82, 94, 106];

const FingerprintArt = () => (
  <View style={fp.wrapper}>
    {ARC_SIZES.map((s, i) => (
      <View
        key={i}
        style={[
          fp.arc,
          {
            width: s, height: s,
            borderRadius: s / 2,
            borderWidth: i < 2 ? 2 : 1.5,
            opacity: 0.72 - i * 0.05,
            top: '50%', left: '50%',
            marginTop: -(s / 2),
            marginLeft: -(s / 2),
          },
        ]}
      />
    ))}
    {/* Centre dot */}
    <View style={fp.dot} />
  </View>
);

const fp = StyleSheet.create({
  wrapper: { width: 120, height: 120, position: 'relative', justifyContent: 'center', alignItems: 'center' },
  arc: {
    position: 'absolute',
    borderColor: 'rgba(180, 155, 255, 0.80)',
    backgroundColor: 'transparent',
    // clip top half so it looks like fingerprint arcs
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: 'rgba(180, 155, 255, 0.9)',
  },
});

const styles = StyleSheet.create({
  container: {
    width: 280, height: 280,
    justifyContent: 'center', alignItems: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(107, 63, 212, 0.55)',
  },
  glowBlob: {
    position: 'absolute',
    width: 155, height: 155, borderRadius: 78,
    backgroundColor: 'rgba(80, 40, 200, 0.38)',
  },
  outerCircle: {
    width: 148, height: 148, borderRadius: 74,
    borderWidth: 2,
    borderColor: 'rgba(140, 100, 255, 0.60)',
    overflow: 'hidden',
    shadowColor: '#6B3FD4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 24,
    elevation: 14,
  },
  innerCircle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  scanLine: {
    position: 'absolute',
    left: 0, right: 0,
    height: 2,
    backgroundColor: 'rgba(155, 111, 255, 0.55)',
    shadowColor: '#9B6FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
});

export default BiometricIcon;
