import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Colors } from '../../theme';
import SvgIcon from '../../components/common/SvgIcon';

/**
 * Animated concentric rings radiating from center — simulates BLE scan.
 * Three rings fade and expand on repeat.
 */
export default function ScanningAnimation({ size = 200 }) {
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const ring3 = useRef(new Animated.Value(0)).current;

  function buildAnim(val, delay) {
    return Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(val, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(val, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
  }

  useEffect(() => {
    const a1 = buildAnim(ring1, 0);
    const a2 = buildAnim(ring2, 600);
    const a3 = buildAnim(ring3, 1200);
    a1.start();
    a2.start();
    a3.start();
    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, []);

  function ringStyle(val) {
    return {
      opacity: val.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.7, 0.3, 0] }),
      transform: [
        {
          scale: val.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1.6] }),
        },
      ],
    };
  }

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {[ring1, ring2, ring3].map((val, i) => (
        <Animated.View key={i} style={[styles.ring, ringStyle(val), { width: size, height: size, borderRadius: size / 2 }]} />
      ))}
      {/* Core circle */}
      <View style={[styles.core, { width: size * 0.36, height: size * 0.36, borderRadius: size * 0.18 }]}>
        <SvgIcon name="bluetooth" size={size * 0.18} color={Colors.primaryBackground} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ring: {
    position: 'absolute',
    backgroundColor: Colors.present,
  },
  core: {
    backgroundColor: Colors.present,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.present,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
