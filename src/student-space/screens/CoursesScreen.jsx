import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import GreenHeader from '../../components/common/GreenHeader';
import AttendanceCard from '../../components/common/AttendanceCard';
import { useMyEnrollments } from '../hooks/useCourses';
import { Colors, Typography, Spacing } from '../../theme';

// Mock percentages until backend exposes per-course attendance
const PCT_MAP = [95, 90, 75, 45, 95, 90, 75];

export default function CoursesScreen() {
  const { data: enrollments = [], isLoading, refetch } = useMyEnrollments();

  return (
    <View style={styles.screen}>
      <GreenHeader title="Attendance of lectures" />

      <FlatList
        data={enrollments}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={Colors.primaryAccent}
          />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            {isLoading ? 'Loading…' : 'No enrolled courses.'}
          </Text>
        }
        renderItem={({ item, index }) => (
          <AttendanceCard
            courseCode={item.courseCode}
            courseName={item.courseName}
            percentage={PCT_MAP[index % PCT_MAP.length]}
          />
        )}
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
