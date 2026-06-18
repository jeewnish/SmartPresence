import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';

import { Colors, Typography, Shadows } from '../theme';
import SvgIcon from '../components/common/SvgIcon';

import HomeScreen from '../student-space/screens/HomeScreen';
import CoursesScreen from '../student-space/screens/CoursesScreen';
import RadarScreen from '../student-space/screens/RadarScreen';
import NotificationScreen from '../student-space/screens/NotificationScreen';
import SettingsScreen from '../student-space/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Home', icon: 'home', label: 'Home', component: HomeScreen },
  { name: 'Courses', icon: 'book', label: 'Courses', component: CoursesScreen },
  { name: 'Radar', icon: 'radar', label: '', component: RadarScreen },
  { name: 'Alert', icon: 'bell', label: 'Alert', component: NotificationScreen },
  { name: 'Settings', icon: 'settings', label: 'Settings', component: SettingsScreen },
];

function TabIcon({ name, icon, focused }) {
  const color = focused ? Colors.primaryAccent : Colors.secondaryText;
  const isCenter = name === 'Radar';

  if (isCenter) {
    return (
      <View style={styles.centerTab}>
        <SvgIcon name={icon} size={26} color="#FDFDFD" />
      </View>
    );
  }

  return <SvgIcon name={icon} size={22} color={color} />;
}

export default function StudentTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: true,
        tabBarActiveTintColor: Colors.primaryAccent,
        tabBarInactiveTintColor: Colors.secondaryText,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused }) => {
          const tab = TABS.find((t) => t.name === route.name);
          return (
            <TabIcon name={route.name} icon={tab?.icon ?? 'home'} focused={focused} />
          );
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
            tabBarShowLabel: tab.name !== 'Radar',
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
