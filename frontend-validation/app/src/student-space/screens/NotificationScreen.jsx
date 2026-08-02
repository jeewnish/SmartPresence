import React from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import GreenHeader from '../../components/common/GreenHeader';
import NotificationItem from '../components/NotificationItem';
import { useStudentAttendanceHistory } from '../hooks/useStudentProgress';
import { Colors, Spacing, Typography } from '../../theme';

export default function NotificationScreen() {
  const attendanceQuery = useStudentAttendanceHistory();
  const records = attendanceQuery.data?.records ?? [];

  return (
    <View style={styles.screen}>
      <GreenHeader title="Notifications" />

      <FlatList
        data={records}
        keyExtractor={(item) => String(item.recordId)}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={attendanceQuery.isRefetching}
            onRefresh={attendanceQuery.refetch}
            tintColor={Colors.primaryAccent}
          />
        }
        renderItem={({ item }) => (
          <NotificationItem
            date={
              item.attendanceTime
                ? new Date(item.attendanceTime).toLocaleString()
                : 'Time unavailable'
            }
            courseCode={item.course?.courseCode}
            courseName={item.course?.courseName}
            status={item.status === 'PRESENT' ? 'ATTENDED' : 'NOT_ATTENDED'}
            message={
              item.status === 'PRESENT'
                ? `Verified with ${String(item.verificationMethod ?? 'attendance check')
                    .replaceAll('_', ' ')
                    .toLowerCase()}.`
                : 'Attendance was not recorded for this session.'
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyDot} />
            <Text selectable style={styles.emptyTitle}>
              {attendanceQuery.isLoading ? 'Loading attendance…' : 'No attendance history'}
            </Text>
            <Text selectable style={styles.empty}>
              {attendanceQuery.isError
                ? 'Attendance history could not be loaded. Pull down to try again.'
                : 'Successful attendance check-ins will appear here.'}
            </Text>
          </View>
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
    flexGrow: 1,
  },
  empty: {
    ...Typography.bodyMedium,
    color: Colors.secondaryText,
    textAlign: 'center',
    lineHeight: 20,
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
});
