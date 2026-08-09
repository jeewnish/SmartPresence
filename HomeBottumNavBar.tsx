import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeTab } from '../types';

// ─── Types ───────────────────────────────────────────────────────────────────

type HomeBottomNavProps = {
  activeTab: HomeTab;
  onTabChange: (tab: HomeTab) => void;
  onFabPress?: () => void;
};

// ─── Tab Config ──────────────────────────────────────────────────────────────

type NavItem = {
  tab: HomeTab;
  label: string;
  iconActive: React.ComponentProps<typeof Ionicons>['name'];
  iconInactive: React.ComponentProps<typeof Ionicons>['name'];
};

const LEFT_TABS: NavItem[] = [
  {
    tab: 'home',
    label: 'Home',
    iconActive: 'home',
    iconInactive: 'home-outline',
  },
  {
    tab: 'schedule',
    label: 'Schedule',
    iconActive: 'calendar',
    iconInactive: 'calendar-outline',
  },
];

const RIGHT_TABS: NavItem[] = [
  {
    tab: 'alerts',
    label: 'Alerts',
    iconActive: 'notifications',
    iconInactive: 'notifications-outline',
  },
  {
    tab: 'settings',
    label: 'Settings',
    iconActive: 'settings',
    iconInactive: 'settings-outline',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function HomeBottomNav({
  activeTab,
  onTabChange,
  onFabPress,
}: HomeBottomNavProps) {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 10);

  function tabColor(tab: HomeTab): string {
    return activeTab === tab ? '#E8871A' : '#AEAEAE';
  }

  function renderItem(item: NavItem) {
    const isActive = activeTab === item.tab;
    const color = tabColor(item.tab);

    return (
      <Pressable
        key={item.tab}
        style={styles.tab}
        onPress={() => onTabChange(item.tab)}
        android_ripple={{ color: '#FFE0B220', borderless: true, radius: 36 }}
        accessibilityRole="tab"
        accessibilityLabel={item.label}
        accessibilityState={{ selected: isActive }}
      >
        <View style={[styles.tabIndicator, isActive && styles.tabIndicatorActive]} />
        <Ionicons
          name={isActive ? item.iconActive : item.iconInactive}
          size={22}
          color={color}
        />
        <Text style={[styles.tabLabel, { color }]}>{item.label}</Text>
      </Pressable>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: bottomPad }]}>
      {/* Left tabs */}
      <View style={styles.halfRow}>{LEFT_TABS.map(renderItem)}</View>

      {/* Centre FAB spacer + button */}
      <View style={styles.fabSlot}>
        <TouchableOpacity
          style={styles.fab}
          onPress={onFabPress}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Check-in"
        >
          {/* Outer glow ring */}
          <View style={styles.fabGlow} />
          <Ionicons name="radio" size={26} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Right tabs */}
      <View style={styles.halfRow}>{RIGHT_TABS.map(renderItem)}</View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const ORANGE = '#E8871A';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0EDE8',
    paddingTop: 10,
    // Subtle top shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 10,
  },
  halfRow: {
    flex: 2,
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 4,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    top: -10,
    height: 2.5,
    width: 24,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  tabIndicatorActive: {
    backgroundColor: ORANGE,
  },
  tabLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    marginTop: 3,
  },

  // FAB
  fabSlot: {
    flex: 1,
    alignItems: 'center',
    // Push the FAB above the nav bar
    marginTop: -28,
    marginBottom: 4,
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    // shadow
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
    position: 'relative',
  },
  fabGlow: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: ORANGE,
    opacity: 0.15,
  },
});
