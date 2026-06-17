// BottomNavBar.js
import React, { useRef } from 'react';
import {
  View, Text, TouchableOpacity,
  Animated, StyleSheet, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from './colors';

const TABS = [
  { label: 'Home',     icon: '⌂', active: false },
  { label: 'Schedule', icon: '▦', active: false },
  { label: 'History',  icon: '◷', active: false },
  { label: 'Profile',  icon: '◉', active: true  },
];

const TabItem = ({ tab }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const onIn  = () => Animated.spring(scale, { toValue: 0.85, useNativeDriver: true }).start();
  const onOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true }).start();

  return (
    <TouchableOpacity
      style={styles.tab}
      onPressIn={onIn}
      onPressOut={onOut}
      activeOpacity={0.75}
    >
      <Animated.View style={[styles.tabInner, { transform: [{ scale }] }]}>
        {tab.active && <View style={styles.activeIndicator} />}
        <Text style={[styles.icon, tab.active && styles.iconActive]}>{tab.icon}</Text>
        <Text style={[styles.label, tab.active && styles.labelActive]}>{tab.label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const BottomNavBar = () => (
  <View style={styles.wrapper}>
    <LinearGradient
      colors={['rgba(14, 10, 36, 0.97)', 'rgba(8, 6, 24, 0.99)']}
      style={styles.bar}
    >
      {TABS.map(tab => <TabItem key={tab.label} tab={tab} />)}
    </LinearGradient>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  bar: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    paddingHorizontal: 8,
  },
  tab: { flex: 1, alignItems: 'center' },
  tabInner: { alignItems: 'center', gap: 4, position: 'relative' },
  activeIndicator: {
    position: 'absolute',
    top: -10,
    width: 26,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.navActive,
  },
  icon: {
    fontSize: 20,
    color: colors.navInactive,
  },
  iconActive: { color: colors.navActive },
  label: {
    fontSize: 10.5,
    color: colors.navInactive,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  labelActive: {
    color: colors.navActive,
    fontWeight: '700',
  },
});

export default BottomNavBar;
