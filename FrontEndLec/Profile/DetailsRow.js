import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const DetailRow = ({ label, value, icon, index, onEdit }) => {
  const slideAnim = useRef(new Animated.Value(35)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const editScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 480,
        delay: 300 + index * 120,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 11,
        delay: 300 + index * 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onEditIn = () =>
    Animated.spring(editScale, { toValue: 0.88, useNativeDriver: true }).start();
  const onEditOut = () =>
    Animated.spring(editScale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <LinearGradient
        colors={['rgba(38, 26, 80, 0.72)', 'rgba(16, 10, 42, 0.90)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Left icon */}
        <View style={styles.iconBox}>
          <Text style={styles.iconText}>{icon}</Text>
        </View>

        {/* Text block */}
        <View style={styles.textBlock}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{value}</Text>
        </View>

        {/* Edit pencil */}
        <Animated.View style={{ transform: [{ scale: editScale }] }}>
          <TouchableOpacity
            onPress={onEdit}
            onPressIn={onEditIn}
            onPressOut={onEditOut}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <Text style={styles.pencil}>✏</Text>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(107, 63, 212, 0.30)',
    overflow: 'hidden',
    shadowColor: '#6B3FD4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 5,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 14,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(107, 63, 212, 0.20)',
    borderWidth: 1,
    borderColor: 'rgba(107, 63, 212, 0.32)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 16,
  },
  textBlock: {
    flex: 1,
  },
  label: {
    color: 'rgba(170, 155, 220, 0.70)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  value: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '600',
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  pencil: {
    fontSize: 15,
    color: 'rgba(155, 111, 255, 0.75)',
  },
});

export default DetailRow;
