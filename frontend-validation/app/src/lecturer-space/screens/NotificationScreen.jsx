import React from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';

import GreenHeader from '../../components/common/GreenHeader';
import { useLecturerHistory } from '../hooks/useLecturerHome';
import { Colors, Typography, Spacing, Radii } from '../../theme';

export default function NotificationScreen() {
  const historyQuery = useLecturerHistory();
  const sessions = historyQuery.data?.sessions ?? [];

  return (
    <View style={styles.screen}>
      <GreenHeader title="Notifications" />
      <FlatList
        data={sessions}
        keyExtractor={(item) => String(item.sessionId)}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={historyQuery.isRefetching}
            onRefresh={historyQuery.refetch}
            tintColor={Colors.primaryAccent}
          />
        }
        renderItem={({ item }) => <SessionNotification session={item} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyDot} />
            <Text selectable style={styles.emptyTitle}>No session history</Text>
            <Text selectable style={styles.empty}>
              Attendance events will appear after you start a session.
            </Text>
          </View>
        }
      />
    </View>
  );
}

function SessionNotification({ session }) {
  const isActive = session.status === 'ACTIVE';
  const isLowAttendance = !isActive && session.attendanceRate < 75;
  const color = isActive
    ? Colors.primaryAccent
    : isLowAttendance
      ? Colors.late
      : Colors.present;
  const statusLabel = isActive
    ? 'SESSION ACTIVE'
    : isLowAttendance
      ? 'LOW ATTENDANCE'
      : 'SESSION COMPLETED';
  const eventDate = session.endedAt ?? session.startedAt;

  return (
    <View style={styles.card}>
      <Text selectable style={styles.date}>
        {eventDate ? new Date(eventDate).toLocaleDateString('en-CA') : 'Date unavailable'}
      </Text>
      <Text selectable style={styles.course}>
        {`${session.courseCode} ${session.courseName}`.toUpperCase()}
      </Text>
      <View style={styles.statusRow}>
        <View style={[styles.statusDot, { backgroundColor: color }]} />
        <Text selectable style={[styles.status, { color }]}>{statusLabel}</Text>
      </View>
      <Text selectable style={styles.detail}>
        {session.presentCount} of {session.totalEnrolled} students marked attendance
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.primaryBackground,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.sm,
    flexGrow: 1,
  },
  card: {
    backgroundColor: Colors.elevatedSurface,
    borderWidth: 1,
    borderColor: Colors.secondarySurface,
    borderRadius: Radii.card,
    padding: Spacing.md,
  },
  date: {
    ...Typography.caption,
    marginBottom: Spacing.sm,
  },
  course: {
    ...Typography.label,
    marginBottom: Spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  status: {
    ...Typography.captionBold,
    letterSpacing: 0.8,
  },
  detail: {
    ...Typography.bodyMedium,
    color: Colors.secondaryText,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  emptyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.present,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    ...Typography.h3,
    marginBottom: Spacing.sm,
  },
  empty: {
    ...Typography.bodyMedium,
    color: Colors.secondaryText,
    textAlign: 'center',
  },
});
