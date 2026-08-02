import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import GreenHeader from '../../components/common/GreenHeader';
import AttendanceCard from '../../components/common/AttendanceCard';
import SecondaryButton from '../../components/common/SecondaryButton';
import StandardCard from '../../components/common/StandardCard';
import { useCourseCatalog, useEnrollInCourse, useMyEnrollments } from '../hooks/useCourses';
import { useStudentProgress } from '../hooks/useStudentProgress';
import { Colors, Spacing, Typography } from '../../theme';

export default function CoursesScreen() {
  const progressQuery = useStudentProgress();
  const enrollmentQuery = useMyEnrollments();
  const catalogQuery = useCourseCatalog();
  const enrollMutation = useEnrollInCourse();
  const progressCourses = progressQuery.data?.courses ?? [];
  const enrolledCourseIds = useMemo(
    () => new Set((enrollmentQuery.data ?? []).map((item) => item.courseId)),
    [enrollmentQuery.data]
  );
  const availableCourses = (catalogQuery.data ?? []).filter(
    (course) => !enrolledCourseIds.has(course.id)
  );
  const refreshing =
    progressQuery.isRefetching || enrollmentQuery.isRefetching || catalogQuery.isRefetching;

  const refresh = () => {
    progressQuery.refetch();
    enrollmentQuery.refetch();
    catalogQuery.refetch();
  };

  const enroll = async (course) => {
    try {
      await enrollMutation.mutateAsync(course.id);
      Alert.alert('Enrolled', `You are now enrolled in ${course.courseCode}.`);
    } catch (error) {
      Alert.alert(
        'Enrollment failed',
        error?.response?.data?.message ?? error?.message ?? 'Please try again.'
      );
    }
  };

  return (
    <View style={styles.screen}>
      <GreenHeader title="Courses" />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={Colors.primaryAccent}
          />
        }
      >
        <Text style={styles.sectionTitle}>My attendance</Text>
        {progressQuery.isLoading ? (
          <ActivityIndicator color={Colors.primaryAccent} />
        ) : progressCourses.length === 0 ? (
          <Text style={styles.empty}>No enrolled courses with attendance data yet.</Text>
        ) : (
          progressCourses.map((course) => (
            <AttendanceCard
              key={course.courseId}
              courseCode={course.courseCode}
              courseName={course.courseName}
              percentage={course.attendancePercentage}
            />
          ))
        )}

        <Text style={[styles.sectionTitle, styles.catalogTitle]}>Available courses</Text>
        {catalogQuery.isLoading || enrollmentQuery.isLoading ? (
          <ActivityIndicator color={Colors.primaryAccent} />
        ) : catalogQuery.isError || enrollmentQuery.isError ? (
          <Text style={styles.error}>The course catalog could not be loaded.</Text>
        ) : availableCourses.length === 0 ? (
          <Text style={styles.empty}>You are enrolled in every available course.</Text>
        ) : (
          availableCourses.map((course) => (
            <StandardCard key={course.id} style={styles.courseCard}>
              <Text style={styles.courseCode}>{course.courseCode}</Text>
              <Text style={styles.courseName}>{course.courseName}</Text>
              <Text style={styles.courseMeta}>
                {[course.semester, course.lecturerName].filter(Boolean).join(' • ')}
              </Text>
              <SecondaryButton
                label={
                  enrollMutation.isPending && enrollMutation.variables === course.id
                    ? 'Enrolling…'
                    : 'Enroll'
                }
                onPress={() => enroll(course)}
                loading={enrollMutation.isPending && enrollMutation.variables === course.id}
                disabled={enrollMutation.isPending}
                style={styles.enrollButton}
              />
            </StandardCard>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.primaryBackground,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h2,
    marginBottom: Spacing.md,
  },
  catalogTitle: {
    marginTop: Spacing.xl,
  },
  empty: {
    ...Typography.bodyMedium,
    color: Colors.secondaryText,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
  error: {
    ...Typography.bodyMedium,
    color: Colors.absent,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
  courseCard: {
    marginBottom: Spacing.sm,
  },
  courseCode: {
    ...Typography.label,
    color: Colors.primaryAccent,
    marginBottom: Spacing.xs,
  },
  courseName: {
    ...Typography.h3,
  },
  courseMeta: {
    ...Typography.caption,
    marginTop: Spacing.sm,
  },
  enrollButton: {
    marginTop: Spacing.md,
  },
});
