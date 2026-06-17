import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const ActionButton = ({
  label,
  onPress,
  variant = 'primary', // 'primary' | 'danger'
  icon,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const onIn = () =>
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  const onOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  if (variant === 'danger') {
    return (
      <Animated.View style={[styles.dangerWrapper, { transform: [{ scale }] }]}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={onIn}
          onPressOut={onOut}
          activeOpacity={0.75}
          style={styles.dangerBtn}
        >
          {icon ? <Text style={styles.dangerIcon}>{icon}</Text> : null}
          <Text style={styles.dangerLabel}>{label}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.primaryWrapper, { transform: [{ scale }] }]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onIn}
        onPressOut={onOut}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={['#5B35CC', '#3D1FA8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.primaryBtn}
        >
          {icon ? <Text style={styles.primaryIcon}>{icon}</Text> : null}
          <Text style={styles.primaryLabel}>{label}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Primary (Change Password)
  primaryWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#5B35CC',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 17,
    paddingHorizontal: 24,
    gap: 10,
  },
  primaryIcon: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  primaryLabel: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Danger (Sign Out)
  dangerWrapper: {
    alignSelf: 'center',
  },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
  },
  dangerIcon: {
    fontSize: 16,
    color: '#FF4F6E',
  },
  dangerLabel: {
    color: '#FF4F6E',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default ActionButton;
