import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMyEnrollments } from '../hooks/useCourses';
import useUserStore from '../../store/userStore';
import LectureRow from '../components/LectureRow';
import AttendanceCard from '../../components/common/AttendanceCard';
import StandardCard from '../../components/common/StandardCard';
import { Colors, Typography, Spacing, Radii } from '../../theme';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useUserStore();
  const { data: enrollments = [], isLoading, refetch } = useMyEnrollments();

  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
  const formattedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  // Mock attendance percentages until backend exposes them per-course
  const mockPct = [95, 90, 75, 45];

  return (
    <ScrollView
      style={styles.screen}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refetch}
          tintColor={Colors.primaryAccent}
        />
      }
    >
      {/* ── Green Header Band ── */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <View style={styles.headerTop}>
          <View style={styles.instRow}>
            <View style={styles.instAvatar} />
            <Text style={styles.instLabel} numberOfLines={1}>
              Sabaragamuwa University of Sri Lanka / Faculty of Computing
            </Text>
          </View>
          <View style={styles.avatar} />
        </View>

        <View style={styles.greeting}>
          <Text style={styles.hello}>Hello</Text>
          <Text style={styles.name}>{user?.firstName ?? 'Student'}!</Text>
        </View>
      </View>

      <View style={styles.body}>
        {/* ── Today's Lectures ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's lectures</Text>
            <Text style={styles.dateLabel}>{formattedDate}</Text>
          </View>

          <StandardCard style={styles.cardNoPad}>
            {enrollments.length === 0 ? (
              <Text style={[styles.emptyMsg]}>No lectures enrolled yet.</Text>
            ) : (
              enrollments.slice(0, 6).map((enr, idx) => (
                <LectureRow
                  key={enr.id}
                  courseCode={enr.courseCode}
                  courseName={enr.courseName}
                  time={idx % 2 === 0 ? '08:00 A.M.' : '10:30 A.M.'}
                />
              ))
            )}
          </StandardCard>
        </View>

        {/* ── Attendance of Today's Lectures ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attendance of Today's lectures</Text>
          {enrollments.length === 0 ? (
            <Text style={styles.emptyMsg}>No courses to display.</Text>
          ) : (
            enrollments.slice(0, 4).map((enr, idx) => (
              <AttendanceCard
                key={enr.id}
                courseCode={enr.courseCode}
                courseName={enr.courseName}
                percentage={mockPct[idx] ?? 80}
              />
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.primaryBackground,
  },
  header: {
    backgroundColor: Colors.headerGreen,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  instRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  instAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  instLabel: {
    ...Typography.caption,
    color: 'rgba(253,253,253,0.85)',
    flex: 1,
    fontSize: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.secondarySurface,
    marginLeft: Spacing.sm,
  },
  greeting: {
    marginTop: Spacing.xs,
  },
  hello: {
    ...Typography.bodyLarge,
    color: Colors.primaryBackground,
  },
  name: {
    ...Typography.h1,
    color: Colors.primaryBackground,
  },
  body: {
    padding: Spacing.md,
    paddingTop: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h2,
  },
  dateLabel: {
    ...Typography.bodyMedium,
    color: Colors.secondaryText,
  },
  cardNoPad: {
    padding: 0,
    paddingHorizontal: Spacing.md,
    overflow: 'hidden',
  },
  emptyMsg: {
    ...Typography.bodyMedium,
    color: Colors.secondaryText,
    paddingVertical: Spacing.md,
    textAlign: 'center',
  },
});
