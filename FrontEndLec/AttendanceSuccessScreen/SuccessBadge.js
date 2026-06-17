// components/SuccessBadge.js
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';

const SuccessBadge = () => {
  const outerPulse   = useRef(new Animated.Value(0.88)).current;
  const outerOpacity = useRef(new Animated.Value(0.55)).current;
  const midPulse     = useRef(new Animated.Value(0.92)).current;
  const midOpacity   = useRef(new Animated.Value(0.70)).current;
  const innerGlow    = useRef(new Animated.Value(0.75)).current;
  const checkScale   = useRef(new Animated.Value(0)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;
  const entranceScale = useRef(new Animated.Value(0.6)).current;
  const entranceFade  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance pop
    Animated.parallel([
      Animated.spring(entranceScale, {
        toValue: 1, tension: 55, friction: 8, delay: 100, useNativeDriver: true,
      }),
      Animated.timing(entranceFade, {
        toValue: 1, duration: 400, delay: 100, useNativeDriver: true,
      }),
    ]).start();

    // Checkmark pop after entrance
    Animated.parallel([
      Animated.spring(checkScale, {
        toValue: 1, tension: 60, friction: 7, delay: 400, useNativeDriver: true,
      }),
      Animated.timing(checkOpacity, {
        toValue: 1, duration: 300, delay: 400, useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse on rings
    const ringPulse = () => {
      Animated.parallel([
        Animated.sequence([
          Animated.parallel([
            Animated.timing(outerPulse,   { toValue: 1.07, duration: 1600, useNativeDriver: true }),
            Animated.timing(outerOpacity, { toValue: 0.28, duration: 1600, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(outerPulse,   { toValue: 0.88, duration: 1600, useNativeDriver: true }),
            Animated.timing(outerOpacity, { toValue: 0.55, duration: 1600, useNativeDriver: true }),
          ]),
        ]),
        Animated.sequence([
          Animated.parallel([
            Animated.timing(midPulse,   { toValue: 1.05, duration: 1400, delay: 150, useNativeDriver: true }),
            Animated.timing(midOpacity, { toValue: 0.40, duration: 1400, delay: 150, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(midPulse,   { toValue: 0.92, duration: 1400, useNativeDriver: true }),
            Animated.timing(midOpacity, { toValue: 0.70, duration: 1400, useNativeDriver: true }),
          ]),
        ]),
        Animated.sequence([
          Animated.timing(innerGlow, { toValue: 1,    duration: 1200, delay: 100, useNativeDriver: true }),
          Animated.timing(innerGlow, { toValue: 0.60, duration: 1200, useNativeDriver: true }),
        ]),
      ]).start(() => ringPulse());
    };
    const t = setTimeout(ringPulse, 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: entranceFade, transform: [{ scale: entranceScale }] },
      ]}
    >
      {/* Outer ring 1 – largest / most transparent */}
      <Animated.View
        style={[
          styles.ring,
          {
            width: 168, height: 168, borderRadius: 84,
            borderColor: 'rgba(91, 53, 204, 0.35)',
            opacity: outerOpacity,
            transform: [{ scale: outerPulse }],
          },
        ]}
      />

      {/* Outer ring 2 */}
      <Animated.View
        style={[
          styles.ring,
          {
            width: 148, height: 148, borderRadius: 74,
            borderColor: 'rgba(91, 53, 204, 0.50)',
            opacity: midOpacity,
            transform: [{ scale: midPulse }],
          },
        ]}
      />

      {/* Static dark band ring (visible black ring in design) */}
      <View style={styles.darkRing} />

      {/* Glow blob behind circle */}
      <Animated.View style={[styles.glowBlob, { opacity: innerGlow }]} />

      {/* Main gradient circle */}
      <LinearGradient
        colors={['#7B5FFF', '#4A30CC', '#2E18A8']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={styles.mainCircle}
      >
        {/* Checkmark */}
        <Animated.View
          style={{
            opacity: checkOpacity,
            transform: [{ scale: checkScale }],
          }}
        >
          <Text style={styles.checkmark}>✓</Text>
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  darkRing: {
    position: 'absolute',
    width: 126,
    height: 126,
    borderRadius: 63,
    borderWidth: 5,
    borderColor: '#0B0C1E',
    backgroundColor: 'transparent',
  },
  glowBlob: {
    position: 'absolute',
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: 'rgba(91, 53, 204, 0.42)',
  },
  mainCircle: {
    width: 108,
    height: 108,
    borderRadius: 54,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#5B35CC',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 16,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 44,
    fontWeight: '800',
    lineHeight: 52,
    marginTop: 2,
  },
});

export default SuccessBadge;
