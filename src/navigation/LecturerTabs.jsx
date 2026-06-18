import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';

import { Colors, Typography, Shadows } from '../theme';
import SvgIcon from '../components/common/SvgIcon';

import HomeScreen from '../lecturer-space/screens/HomeScreen';
import RosterScreen from '../lecturer-space/screens/RosterScreen';
import BroadcastScreen from '../lecturer-space/screens/BroadcastScreen';
import NotificationScreen from '../lecturer-space/screens/NotificationScreen';
import SettingsScreen from '../lecturer-space/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Home', icon: 'home', label: 'Home', component: HomeScreen },
  { name: 'Roster', icon: 'roster', label: 'Roster', component: RosterScreen },
  { name: 'Broadcast', icon: 'radar', label: '', component: BroadcastScreen },
  { name: 'Alert', icon: 'bell', label: 'Alert', component: NotificationScreen },
  { name: 'Settings', icon: 'settings', label: 'Settings', component: SettingsScreen },
];

function TabIcon({ name, icon, focused }) {
  const color = focused ? Colors.primaryAccent : Colors.secondaryText;
  if (name === 'Broadcast') {
    return (
      <View style={styles.centerTab}>
        <SvgIcon name={icon} size={26} color="#FDFDFD" />
      </View>
    );
  }
  return <SvgIcon name={icon} size={22} color={color} />;
}

export default function LecturerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primaryAccent,
        tabBarInactiveTintColor: Colors.secondaryText,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused }) => {
          const tab = TABS.find((t) => t.name === route.name);
          return <TabIcon name={route.name} icon={tab?.icon ?? 'home'} focused={focused} />;
        },
      })}
    >
      {TABS.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            tabBarLabel: tab.label,
            tabBarShowLabel: tab.name !== 'Broadcast',
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.primaryBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.secondarySurface,
    height: 64,
    paddingBottom: 8,
    paddingTop: 4,
    ...Shadows.nav,
  },
  tabLabel: {
    ...Typography.navLabel,
    fontSize: 11,
    marginTop: 2,
  },
  centerTab: {
    backgroundColor: Colors.primaryAccent,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: Colors.primaryAccent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
});
