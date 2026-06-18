import React from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import GreenHeader from '../../components/common/GreenHeader';
import NotificationItem from '../components/NotificationItem';
import { Colors, Typography, Spacing } from '../../theme';

// Mock notification data — derived from attendance history
// Will be replaced by real API data when a /notifications endpoint is available
const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    date: '2026/02/02',
    courseCode: 'IS31000',
    courseName: 'Web Application',
    status: 'ATTENDED',
    message: 'Marked your attendance at 08:23 A.M. at Hall Z1',
  },
  {
    id: '2',
    date: '2026/02/02',
    courseCode: 'IS31001',
    courseName: 'Database Systems',
    status: 'ATTENDED',
    message: 'Marked your attendance at 10:30 A.M. at Hall Z3',
  },
  {
    id: '3',
    date: '2026/02/04',
    courseCode: 'IS31000',
    courseName: 'Web Application',
    status: 'NOT_ATTENDED',
    message: 'Not participated to the lecture at 10:30 A.M. at Hall Z9',
  },
  {
    id: '4',
    date: '2026/02/06',
    courseCode: 'IS31002',
    courseName: 'Software Engineering',
    status: 'ATTENDED',
    message: 'Marked your attendance at 08:00 A.M. at Hall Z2',
  },
  {
    id: '5',
    date: '2026/02/07',
    courseCode: 'IS31003',
    courseName: 'Computer Networks',
    status: 'NOT_ATTENDED',
    message: 'Not participated to the lecture at 01:00 P.M. at Hall Z7',
  },
];

export default function NotificationScreen() {
  return (
    <View style={styles.screen}>
      <GreenHeader title="Notification" />

      <FlatList
        data={MOCK_NOTIFICATIONS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <NotificationItem
            date={item.date}
            courseCode={item.courseCode}
            courseName={item.courseName}
            status={item.status}
            message={item.message}
          />
        )}
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
  list: {
    padding: Spacing.md,
    paddingTop: Spacing.lg,
  },
  empty: {
    ...Typography.bodyMedium,
    color: Colors.secondaryText,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});
