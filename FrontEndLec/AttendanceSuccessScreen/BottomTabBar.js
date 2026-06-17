// components/BottomTabBar.js
import React, { useRef } from 'react';
import {
  View, Text, TouchableOpacity,
  Animated, StyleSheet, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';

const TABS = [
  { label: 'Home',     icon: '⌂',  active: false },
  { label: 'Schedule', icon: '▦',  active: false },
  { label: 'History',  icon: '◷',  active: true  },
  { label: 'Profile',  icon: '◉',  active: false },
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
        <Text style={[styles.tabIcon, tab.active && styles.tabIconActive]}>
          {tab.icon}
        </Text>
        <Text style={[styles.tabLabel, tab.active && styles.tabLabelActive]}>
          {tab.label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const BottomTabBar = () => (
  <View style={styles.wrapper}>
    <LinearGradient
      colors={['rgba(11, 12, 30, 0.97)', 'rgba(8, 9, 22, 0.99)']}
      style={styles.bar}
    >
      {TABS.map(tab => <TabItem key={tab.label} tab={tab} />)}
    </LinearGradient>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(107, 63, 212, 0.15)',
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
    width: 28,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.navActive,
  },
  tabIcon: {
    fontSize: 21,
    color: Colors.navInactive,
  },
  tabIconActive: { color: Colors.navActive },
  tabLabel: {
    fontSize: 10.5,
    color: Colors.navInactive,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: Colors.navActive,
    fontWeight: '700',
  },
});

export default BottomTabBar;
