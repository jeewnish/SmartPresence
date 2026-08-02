import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  RefreshControl,
} from 'react-native';

import GreenHeader from '../../components/common/GreenHeader';
import StandardCard from '../../components/common/StandardCard';
import SecondaryButton from '../../components/common/SecondaryButton';
import RosterRow from '../components/RosterRow';
import { useLecturerHistory } from '../hooks/useLecturerHome';
import { useRoster } from '../hooks/useRoster';
import { Colors, Typography, Spacing, Radii } from '../../theme';

export default function RosterScreen() {
  const historyQuery = useLecturerHistory();
  const sessions = historyQuery.data?.sessions ?? [];
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  useEffect(() => {
    if (!selectedSessionId && sessions[0]?.sessionId) {
      setSelectedSessionId(sessions[0].sessionId);
    }
  }, [selectedSessionId, sessions]);

  const rosterQuery = useRoster(selectedSessionId);
  const roster = rosterQuery.data;
  const students = roster?.students ?? [];
  const absentCount = Math.max(0, (roster?.totalEnrolled ?? 0) - (roster?.presentCount ?? 0));
  const attendanceRate = roster?.totalEnrolled
    ? Math.round((roster.presentCount / roster.totalEnrolled) * 100)
    : 0;
  const selectedSession = useMemo(
    () => sessions.find((session) => session.sessionId === selectedSessionId),
    [selectedSessionId, sessions]
  );

  const refresh = () => {
    historyQuery.refetch();
    rosterQuery.refetch();
  };

  return (
    <View style={styles.screen}>
      <GreenHeader title="Roster" />

      <FlatList
        data={students}
        keyExtractor={(item) => String(item.studentId)}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={historyQuery.isRefetching || rosterQuery.isRefetching}
            onRefresh={refresh}
            tintColor={Colors.primaryAccent}
          />
        }
        ListHeaderComponent={
          <View>
            <Text selectable style={styles.label}>Session</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sessionOptions}
            >
              {sessions.map((session) => {
                const selected = session.sessionId === selectedSessionId;
                return (
                  <Pressable
                    key={session.sessionId}
                    onPress={() => setSelectedSessionId(session.sessionId)}
                    style={[styles.sessionChip, selected && styles.sessionChipSelected]}
                  >
                    <Text
                      selectable
                      style={[styles.sessionChipText, selected && styles.sessionChipTextSelected]}
                    >
                      {session.courseCode} · #{session.sessionId}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {sessions.length === 0 ? (
              <Text selectable style={styles.empty}>No attendance sessions available.</Text>
            ) : (
              <>
                <Text selectable style={styles.selectedCourse}>
                  {selectedSession?.courseName ?? roster?.courseCode ?? 'Selected session'}
                </Text>
                <StandardCard style={styles.summaryCard}>
                  <SummaryMetric label="Present" value={roster?.presentCount ?? 0} />
                  <SummaryMetric label="Absent" value={absentCount} />
                  <SummaryMetric label="Attendance" value={`${attendanceRate}%`} accent />
                </StandardCard>
                <SecondaryButton
                  label="Add Attendance Manually"
                  onPress={() =>
                    Alert.alert(
                      'Not available',
                      'The current backend does not provide a manual attendance endpoint.'
                    )
                  }
                  style={styles.manualButton}
                />
                <Text selectable style={styles.listTitle}>Student Attendance</Text>
              </>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <RosterRow
            firstName={item.firstName}
            lastName={item.lastName}
            email={item.email}
            status={item.status}
          />
        )}
        ListEmptyComponent={
          selectedSessionId ? (
            <Text selectable style={styles.empty}>
              {rosterQuery.isLoading ? 'Loading roster…' : 'No students in this roster.'}
            </Text>
          ) : null
        }
      />
    </View>
  );
}

function SummaryMetric({ label, value, accent }) {
  return (
    <View style={styles.metric}>
      <Text selectable style={styles.metricLabel}>{label}</Text>
      <Text selectable style={[styles.metricValue, accent && styles.metricAccent]}>
        {value}
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
    flexGrow: 1,
  },
  label: {
    ...Typography.label,
    marginBottom: Spacing.sm,
  },
  sessionOptions: {
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  sessionChip: {
    backgroundColor: Colors.elevatedSurface,
    borderWidth: 1,
    borderColor: Colors.secondarySurface,
    borderRadius: Radii.card,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  sessionChipSelected: {
    borderColor: Colors.primaryAccent,
    backgroundColor: Colors.highlightCardBg,
  },
  sessionChipText: {
    ...Typography.bodyMedium,
  },
  sessionChipTextSelected: {
    color: Colors.primaryAccent,
    fontFamily: 'Lato_700Bold',
  },
  selectedCourse: {
    ...Typography.h3,
    marginBottom: Spacing.md,
  },
  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.highlightCardBg,
    marginBottom: Spacing.md,
  },
  metric: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    ...Typography.caption,
    marginBottom: Spacing.xs,
  },
  metricValue: {
    ...Typography.h3,
    fontVariant: ['tabular-nums'],
  },
  metricAccent: {
    ...Typography.metricValue,
  },
  manualButton: {
    marginBottom: Spacing.xl,
  },
  listTitle: {
    ...Typography.h2,
    marginBottom: Spacing.md,
  },
  empty: {
    ...Typography.bodyMedium,
    color: Colors.secondaryText,
    textAlign: 'center',
    paddingVertical: Spacing.xl,
  },
});
