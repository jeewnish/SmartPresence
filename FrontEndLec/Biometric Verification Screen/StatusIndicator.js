import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

const StatusIndicator = ({ label, delay = 0 }) => {
  const pulse = useRef(new Animated.Value(1)).current;
  const outerPulse = useRef(new Animated.Value(1)).current;
  const outerOpacity = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    const loop = () => {
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.25, duration: 700, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.parallel([
            Animated.timing(outerPulse, { toValue: 2.2, duration: 900, useNativeDriver: true }),
            Animated.timing(outerOpacity, { toValue: 0, duration: 900, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(outerPulse, { toValue: 1, duration: 0, useNativeDriver: true }),
            Animated.timing(outerOpacity, { toValue: 0.7, duration: 0, useNativeDriver: true }),
          ]),
        ]),
      ]).start(() => loop());
    };
    const t = setTimeout(loop, delay);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={styles.wrapper}>
      {/* Pill background */}
      <View style={styles.pill}>
        {/* Dot with outer ring pulse */}
        <View style={styles.dotContainer}>
          <Animated.View
            style={[
              styles.outerRing,
              { opacity: outerOpacity, transform: [{ scale: outerPulse }] },
            ]}
          />
          <Animated.View
            style={[styles.dot, { transform: [{ scale: pulse }] }]}
          />
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 5,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 22, 65, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(107, 63, 212, 0.35)',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 14,
    gap: 7,
  },
  dotContainer: {
    width: 9,
    height: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerRing: {
    position: 'absolute',
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: 'rgba(57, 255, 149, 0.35)',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#39FF95',
  },
  label: {
    color: 'rgba(200, 190, 235, 0.85)',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});

export default StatusIndicator;
