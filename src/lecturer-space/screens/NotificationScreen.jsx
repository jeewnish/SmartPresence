import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radii } from '../../theme';

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    type: 'success',
    message: 'Attendance marked — 24 students present',
    course: 'IS31000 Web Application',
    time: '08:45 A.M.',
  },
  {
    id: '2',
    type: 'warning',
    message: 'Missed IS31001 Database Systems',
    course: 'IS31001 Database Systems',
    time: 'Yesterday 10:30 A.M.',
  },
  {
    id: '3',
    type: 'error',
    message: 'Not verified — suspicious check-in detected',
    course: 'IS31002 Software Engineering',
    time: 'Yesterday 02:00 P.M.',
  },
  {
    id: '4',
    type: 'success',
    message: 'Attendance marked — 18 students present',
    course: 'IS31003 Computer Networks',
    time: '2 days ago',
  },
];

const TYPE_COLORS = {
  success: Colors.present,
  warning: Colors.late,
  error: Colors.absent,
};

export default function NotificationScreen() {
  const insets = useSafeAreaInsets();

  const renderItem = ({ item }) => {
    const dotColor = TYPE_COLORS[item.type] ?? Colors.secondaryText;
    return (
      <View style={styles.item}>
        <View style={[styles.leftBorder, { backgroundColor: dotColor }]} />
        <View style={styles.itemContent}>
          <Text style={styles.message}>{item.message}</Text>
          <Text style={styles.course}>{item.course}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Notification</Text>
      </View>

      <FlatList
        data={MOCK_NOTIFICATIONS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>No notifications yet.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.primaryBackground,
  },
  titleRow: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h1,
  },
  list: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },
  item: {
    flexDirection: 'row',
    backgroundColor: Colors.elevatedSurface,
    borderWidth: 1,
    borderColor: Colors.secondarySurface,
    borderRadius: Radii.card,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  leftBorder: {
    width: 4,
  },
  itemContent: {
    flex: 1,
    padding: Spacing.md,
    gap: 3,
  },
  message: {
    ...Typography.bodyMedium,
    fontFamily: 'Lato_700Bold',
  },
  course: {
    ...Typography.bodyMedium,
    color: Colors.secondaryText,
    fontSize: 13,
  },
  time: {
    ...Typography.caption,
    marginTop: 2,
  },
  empty: {
    ...Typography.bodyMedium,
    color: Colors.secondaryText,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});
