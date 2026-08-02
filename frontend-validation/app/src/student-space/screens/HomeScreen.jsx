import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useAuthProfile from '../../auth-space/hooks/useAuthProfile';
import { useStudentProgress } from '../hooks/useStudentProgress';
import AttendanceCard from '../../components/common/AttendanceCard';
import StandardCard from '../../components/common/StandardCard';
import SvgIcon from '../../components/common/SvgIcon';
import { Colors, Typography, Spacing, Radii } from '../../theme';

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const authSpaceUser = useAuthProfile();
  const progressQuery = useStudentProgress();
  const courses = progressQuery.data?.courses ?? [];
  const formattedDate = new Date().toLocaleDateString('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return (
    <ScrollView
      style={styles.screen}
      contentInsetAdjustmentBehavior="never"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={progressQuery.isRefetching}
          onRefresh={progressQuery.refetch}
          tintColor={Colors.primaryAccent}
        />
      }
    >
      {/* ── Green Header Band ── */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Text selectable style={styles.instLabel}>
          Sabaragamuwa University of Sri Lanka / Faculty of Computing
        </Text>

        <Text style={styles.hello}>Hello</Text>
        <View style={styles.nameRow}>
          <Text selectable style={styles.name}>
            {authSpaceUser.firstName || 'Student'}!
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open profile settings"
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
              <SvgIcon name="user" size={24} color={Colors.secondaryText} />
            )}
          </Pressable>
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
            <Text selectable style={styles.emptyTitle}>Schedule unavailable</Text>
            <Text selectable style={styles.emptyMsg}>
              Today’s lecture times are not exposed by the current backend.
            </Text>
          </StandardCard>
        </View>

        {/* ── Attendance of Today's Lectures ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attendence of Today's lectures</Text>
          {progressQuery.isLoading ? (
            <ActivityIndicator color={Colors.primaryAccent} />
          ) : progressQuery.isError ? (
            <Text selectable style={styles.errorMsg}>
              Attendance could not be loaded. Pull down to try again.
            </Text>
          ) : courses.length === 0 ? (
            <Text selectable style={styles.emptyMsg}>No attendance records yet.</Text>
          ) : (
            courses.slice(0, 4).map((course) => (
              <AttendanceCard
                key={course.courseId}
                courseCode={course.courseCode}
                courseName={course.courseName}
                percentage={course.attendancePercentage}
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
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  instLabel: {
    ...Typography.caption,
    color: 'rgba(253,253,253,0.85)',
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'right',
    alignSelf: 'flex-end',
    maxWidth: '82%',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.secondarySurface,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(253,253,253,0.7)',
  },
  avatarPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.97 }],
  },
  hello: {
    ...Typography.bodyLarge,
    color: Colors.primaryBackground,
  },
  name: {
    ...Typography.h1,
    color: Colors.primaryBackground,
    flex: 1,
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
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  emptyTitle: {
    ...Typography.label,
    marginBottom: Spacing.xs,
  },
  emptyMsg: {
    ...Typography.bodyMedium,
    color: Colors.secondaryText,
    paddingVertical: Spacing.md,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorMsg: {
    ...Typography.bodyMedium,
    color: Colors.absent,
    lineHeight: 20,
  },
});
