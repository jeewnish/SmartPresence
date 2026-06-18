import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import StandardCard from '../../components/common/StandardCard';
import AttendanceRow from '../components/AttendanceRow';
import LectureRow from '../../student-space/components/LectureRow';
import { useMyCourses } from '../hooks/useLecturerHome';
import useUserStore from '../../store/userStore';
import { Colors, Typography, Spacing } from '../../theme';

// Mock attendance data until backend exposes per-session attendance summary
const MOCK_PCT = [88, 92, 76, 64];
const MOCK_TIMES = ['08:00 A.M.', '10:30 A.M.', '01:00 P.M.', '03:30 P.M.'];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useUserStore();
  const { data: courses = [], isLoading, refetch } = useMyCourses();

  return (
    <ScrollView
      style={styles.screen}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.lg }]}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refetch}
          tintColor={Colors.primaryAccent}
        />
      }
    >
      {/* ── Header Row ── */}
      <View style={styles.headerRow}>
        <Text style={styles.greeting}>
          Hello {user?.firstName ?? 'Lecturer'}!
        </Text>
        <View style={styles.avatar} />
      </View>

      {/* ── Today's Schedule ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's schedule</Text>
        <StandardCard style={styles.cardNoPad}>
          {courses.length === 0 ? (
            <Text style={styles.empty}>
              {isLoading ? 'Loading…' : 'No courses yet.'}
            </Text>
          ) : (
            courses.slice(0, 4).map((c, i) => (
              <LectureRow
                key={c.id}
                courseCode={c.courseCode}
                courseName={c.courseName}
                time={MOCK_TIMES[i % MOCK_TIMES.length]}
              />
            ))
          )}
        </StandardCard>
      </View>

      {/* ── Attendance of Today's Lectures ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Attendance of Today's lectures</Text>
        <StandardCard style={styles.cardNoPad}>
          {courses.length === 0 ? (
            <Text style={styles.empty}>No data.</Text>
          ) : (
            courses.slice(0, 4).map((c, i) => (
              <AttendanceRow
                key={c.id}
                courseName={c.courseName}
                percentage={MOCK_PCT[i % MOCK_PCT.length]}
              />
            ))
          )}
        </StandardCard>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.primaryBackground,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  greeting: {
    ...Typography.h1,
    flex: 1,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.secondarySurface,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h2,
    marginBottom: Spacing.md,
  },
  cardNoPad: {
    padding: 0,
    paddingHorizontal: Spacing.md,
  },
  empty: {
    ...Typography.bodyMedium,
    color: Colors.secondaryText,
    paddingVertical: Spacing.md,
    textAlign: 'center',
  },
});
