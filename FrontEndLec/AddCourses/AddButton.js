// AddButton.js
import React, { useEffect, useRef } from 'react';
import {
  TouchableOpacity, Text, Animated, StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from './colors';

const AddButton = ({ label = '+ Add Course', onPress, disabled = false }) => {
  const scale     = useRef(new Animated.Value(1)).current;
  const pulse     = useRef(new Animated.Value(1)).current;
  const glowPulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // Gentle continuous pulse
    const loop = () => {
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.025, duration: 1300, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1,     duration: 1300, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(glowPulse, { toValue: 0.75, duration: 1300, useNativeDriver: false }),
          Animated.timing(glowPulse, { toValue: 0.4,  duration: 1300, useNativeDriver: false }),
        ]),
      ]).start(() => loop());
    };
    loop();
  }, []);

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          transform: [{ scale: Animated.multiply(scale, pulse) }],
          shadowOpacity: glowPulse,
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={0.9}
        disabled={disabled}
        style={{ opacity: disabled ? 0.6 : 1 }}
      >
        <LinearGradient
          colors={['#4A3CFF', '#3A2BFF', '#2418C8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.button}
        >
          <Text style={styles.label}>{label}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    borderRadius: 16,
    shadowColor: colors.shadowPurple,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 20,
    elevation: 10,
  },
  button: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default AddButton;
