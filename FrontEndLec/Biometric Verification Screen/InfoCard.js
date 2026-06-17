import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const InfoCard = ({ label, value, icon, index }) => {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(22)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 480,
        delay: 400 + index * 130,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0, tension: 65, friction: 11,
        delay: 400 + index * 130,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <LinearGradient
        colors={['rgba(30, 20, 70, 0.72)', 'rgba(14, 9, 40, 0.90)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Left icon */}
        <View style={styles.iconBox}>
          <Text style={styles.iconText}>{icon}</Text>
        </View>

        {/* Text */}
        <View style={styles.textBlock}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{value}</Text>
        </View>

        {/* Right signal icon (location card only) */}
        {index === 0 && (
          <View style={styles.signalBox}>
            <SignalBars />
          </View>
        )}
      </LinearGradient>
    </Animated.View>
  );
};

const SignalBars = () => (
  <View style={sigStyles.row}>
    {[0.4, 0.65, 0.85, 1].map((h, i) => (
      <View
        key={i}
        style={[
          sigStyles.bar,
          {
            height: 14 * h,
            backgroundColor: `rgba(107, 63, 212, ${h})`,
          },
        ]}
      />
    ))}
  </View>
);

const sigStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 16,
  },
  bar: {
    width: 4,
    borderRadius: 2,
  },
});

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(107, 63, 212, 0.25)',
    overflow: 'hidden',
    shadowColor: '#6B3FD4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
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
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: 'rgba(107, 63, 212, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(107, 63, 212, 0.30)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: { fontSize: 17 },
  textBlock: { flex: 1 },
  label: {
    color: 'rgba(155, 111, 255, 0.75)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  value: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  signalBox: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 4,
  },
});

export default InfoCard;
