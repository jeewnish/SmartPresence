import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const NAV_ITEMS = [
  { label: 'Home',     icon: '⌂',  active: false },
  { label: 'Schedule', icon: '▦',  active: false },
  { label: 'History',  icon: '◷',  active: false },
  { label: 'Profile',  icon: '◉',  active: false },
];

const NavItem = ({ item }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const onIn  = () => Animated.spring(scale, { toValue: 0.88, useNativeDriver: true }).start();
  const onOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true }).start();

  return (
    <TouchableOpacity
      style={styles.item}
      onPressIn={onIn}
      onPressOut={onOut}
      activeOpacity={0.75}
    >
      <Animated.View style={[styles.itemInner, { transform: [{ scale }] }]}>
        <Text style={[styles.icon, item.active && styles.iconActive]}>
          {item.icon}
        </Text>
        <Text style={[styles.label, item.active && styles.labelActive]}>
          {item.label}
        </Text>
        {item.active && <View style={styles.activeDot} />}
      </Animated.View>
    </TouchableOpacity>
  );
};

const BottomNavBar = () => (
  <LinearGradient
    colors={['rgba(8, 6, 24, 0.0)', 'rgba(8, 6, 24, 0.99)']}
    style={styles.gradient}
  >
    <LinearGradient
      colors={['rgba(14, 10, 36, 0.97)', 'rgba(8, 6, 24, 0.99)']}
      style={styles.bar}
    >
      {NAV_ITEMS.map(item => <NavItem key={item.label} item={item} />)}
    </LinearGradient>
  </LinearGradient>
);

const styles = StyleSheet.create({
  gradient: { paddingTop: 6 },
  bar: {
    flexDirection: 'row',
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(107, 63, 212, 0.15)',
  },
  item: { flex: 1, alignItems: 'center' },
  itemInner: { alignItems: 'center', gap: 4 },
  icon: {
    fontSize: 20,
    color: 'rgba(150, 135, 200, 0.45)',
  },
  iconActive: { color: '#9B6FFF' },
  label: {
    fontSize: 10,
    color: 'rgba(150, 135, 200, 0.45)',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  labelActive: { color: '#9B6FFF', fontWeight: '700' },
  activeDot: {
    width: 4, height: 4, borderRadius: 2,
    backgroundColor: '#9B6FFF',
    marginTop: 2,
  },
});

export default BottomNavBar;
