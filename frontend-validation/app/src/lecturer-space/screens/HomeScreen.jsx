import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import StandardCard from '../../components/common/StandardCard';
import SvgIcon from '../../components/common/SvgIcon';
import AttendanceRow from '../components/AttendanceRow';
import { useLecturerHistory, useMyCourses } from '../hooks/useLecturerHome';
import useAuthProfile from '../../auth-space/hooks/useAuthProfile';
import { Colors, Typography, Spacing } from '../../theme';

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const authSpaceUser = useAuthProfile();
  const coursesQuery = useMyCourses();
  const historyQuery = useLecturerHistory();
  const courses = coursesQuery.data ?? [];
  const sessions = historyQuery.data?.sessions ?? [];
  const isRefreshing = coursesQuery.isRefetching || historyQuery.isRefetching;

  const refresh = () => {
    coursesQuery.refetch();
    historyQuery.refetch();
  };

  return (
    <ScrollView
      style={styles.screen}
      contentInsetAdjustmentBehavior="never"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={refresh}
          tintColor={Colors.primaryAccent}
        />
      }
    >
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Text selectable style={styles.institution}>
          Sabaragamuwa University{'\n'}of Sri Lanka{'\n'}Faculty of Computing
        </Text>

        <View style={styles.profileRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open lecturer settings"
            onPress={() => navigation.navigate('Settings')}
            style={({ pressed }) => [styles.avatar, pressed && styles.avatarPressed]}
          >
            {authSpaceUser.imageUrl ? (
              <Image
                source={authSpaceUser.imageUrl}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
              />
            ) : (
              <SvgIcon name="user" size={26} color={Colors.secondaryText} />
            )}
          </Pressable>
          <View style={styles.greeting}>
            <Text selectable style={styles.hello}>Hello,</Text>
            <Text selectable style={styles.name}>
              {authSpaceUser.firstName || 'Lecturer'}!
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.section}>
          <Text selectable style={styles.sectionTitle}>Today's Lectures</Text>
          {coursesQuery.isLoading ? (
            <ActivityIndicator color={Colors.primaryAccent} />
          ) : courses.length === 0 ? (
            <Text selectable style={styles.empty}>No assigned courses.</Text>
          ) : (
            courses.slice(0, 4).map((course) => (
              <StandardCard key={course.id} style={styles.lectureCard}>
                <View style={styles.lectureTop}>
                  <View style={styles.lectureIdentity}>
                    <Text selectable style={styles.courseName}>{course.courseName}</Text>
                    <Text selectable style={styles.courseCode}>{course.courseCode}</Text>
                  </View>
                  <Text selectable style={styles.semester}>
                    {course.semester || 'Semester unavailable'}
                  </Text>
                </View>
                <Text selectable style={styles.unavailable}>
                  Time, venue, and class size are not provided by the backend.
                </Text>
              </StandardCard>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text selectable style={styles.sectionTitle}>Attendance Overview</Text>
          {historyQuery.isLoading ? (
            <ActivityIndicator color={Colors.primaryAccent} />
          ) : sessions.length === 0 ? (
            <Text selectable style={styles.empty}>No completed attendance sessions yet.</Text>
          ) : (
            sessions.slice(0, 4).map((session) => (
              <AttendanceRow
                key={session.sessionId}
                courseName={`${session.courseCode} ${session.courseName}`.toUpperCase()}
                percentage={session.attendanceRate}
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
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  header: {
    backgroundColor: Colors.headerGreen,
    paddingHorizontal: 20,
    paddingBottom: Spacing.xl,
  },
  institution: {
    ...Typography.caption,
    color: Colors.primaryBackground,
    fontFamily: 'Lato_700Bold',
    lineHeight: 16,
    textAlign: 'right',
    alignSelf: 'flex-end',
    marginBottom: Spacing.lg,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.secondarySurface,
    borderWidth: 2,
    borderColor: 'rgba(253,253,253,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.97 }],
  },
  greeting: {
    flex: 1,
  },
  hello: {
    ...Typography.bodyLarge,
    color: Colors.primaryBackground,
  },
  name: {
    ...Typography.pageTitle,
    color: Colors.primaryBackground,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h2,
    marginBottom: Spacing.md,
  },
  lectureCard: {
    marginBottom: Spacing.sm,
  },
  lectureTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  lectureIdentity: {
    flex: 1,
  },
  courseName: {
    ...Typography.label,
  },
  courseCode: {
    ...Typography.bodyMedium,
    color: Colors.secondaryText,
    marginTop: Spacing.xs,
  },
  semester: {
    ...Typography.captionBold,
    color: Colors.primaryAccent,
    textAlign: 'right',
  },
  unavailable: {
    ...Typography.caption,
    marginTop: Spacing.md,
    lineHeight: 17,
  },
  empty: {
    ...Typography.bodyMedium,
    color: Colors.secondaryText,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
});
