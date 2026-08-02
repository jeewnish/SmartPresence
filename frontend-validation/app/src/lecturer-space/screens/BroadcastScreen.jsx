import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Pressable,
} from 'react-native';

import GreenHeader from '../../components/common/GreenHeader';
import PrimaryButton from '../../components/common/PrimaryButton';
import { useMyCourses } from '../hooks/useLecturerHome';
import { useRoster } from '../hooks/useRoster';
import { useSession } from '../hooks/useSession';
import { Colors, Typography, Spacing, Radii } from '../../theme';

export default function BroadcastScreen() {
  const coursesQuery = useMyCourses();
  const courses = coursesQuery.data ?? [];
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const { activeSession, isBroadcasting, startSession, stopSession, loading } = useSession();
  const rosterQuery = useRoster(activeSession?.id ?? null);

  useEffect(() => {
    if (!selectedCourseId && courses[0]?.id) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);

  const course = courses.find((item) => item.id === selectedCourseId) ?? null;

  const handleBroadcast = async () => {
    if (!course) {
      Alert.alert('No course', 'No lecturer course is available to broadcast.');
      return;
    }

    try {
      if (isBroadcasting) {
        await stopSession();
        Alert.alert('Session ended', 'The attendance broadcast has stopped.');
      } else {
        await startSession(course.id);
      }
    } catch (error) {
      Alert.alert('Broadcast failed', error.message);
    }
  };

  return (
    <View style={styles.screen}>
      <GreenHeader title={isBroadcasting ? 'Broadcasting…' : 'Broadcasting'} />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {!isBroadcasting ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.courseOptions}
          >
            {courses.map((item) => {
              const selected = item.id === selectedCourseId;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setSelectedCourseId(item.id)}
                  style={[styles.courseChip, selected && styles.courseChipSelected]}
                >
                  <Text
                    selectable
                    style={[styles.courseChipText, selected && styles.courseChipTextSelected]}
                  >
                    {item.courseCode}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : null}

        <View style={styles.radarArea}>
          <Image
            source={require('../../../assets/animated-icons/radar.gif')}
            style={[styles.radar, !isBroadcasting && styles.radarInactive]}
            resizeMode="contain"
          />
          <Text selectable style={styles.metricLabel}>Connected Students</Text>
          <Text selectable style={styles.metricValue}>
            {rosterQuery.data?.presentCount ?? 0}
          </Text>
        </View>

        <View style={styles.sheet}>
          <InfoField label="Course" value={course?.courseName ?? 'No course available'} />
          <InfoField label="Course Code" value={course?.courseCode ?? '—'} />
          <InfoField
            label="Session"
            value={activeSession?.id ? `#${activeSession.id}` : 'Not started'}
          />
          <InfoField
            label="Started"
            value={
              activeSession?.startedAt
                ? new Date(activeSession.startedAt).toLocaleString()
                : 'Not started'
            }
          />
          <InfoField
            label="Current Attendance"
            value={`${rosterQuery.data?.presentCount ?? 0} Students`}
            isLast
          />

          <PrimaryButton
            label={isBroadcasting ? 'Stop Broadcast' : 'Start Broadcast'}
            onPress={handleBroadcast}
            loading={loading}
            disabled={!course}
            style={[styles.action, isBroadcasting && styles.stopAction]}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function InfoField({ label, value, isLast }) {
  return (
    <View style={[styles.infoField, !isLast && styles.infoBorder]}>
      <Text selectable style={styles.infoLabel}>{label}</Text>
      <Text selectable style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.primaryBackground,
  },
  content: {
    flexGrow: 1,
    paddingTop: Spacing.md,
  },
  courseOptions: {
    gap: Spacing.sm,
    paddingHorizontal: 20,
  },
  courseChip: {
    backgroundColor: Colors.elevatedSurface,
    borderWidth: 1,
    borderColor: Colors.secondarySurface,
    borderRadius: Radii.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  courseChipSelected: {
    borderColor: Colors.primaryAccent,
    backgroundColor: Colors.highlightCardBg,
  },
  courseChipText: {
    ...Typography.bodyMedium,
  },
  courseChipTextSelected: {
    color: Colors.primaryAccent,
    fontFamily: 'Lato_700Bold',
  },
  radarArea: {
    minHeight: 330,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
  },
  radar: {
    width: 220,
    height: 220,
  },
  radarInactive: {
    opacity: 0.35,
  },
  metricLabel: {
    ...Typography.bodyMedium,
    color: Colors.secondaryText,
    marginTop: Spacing.sm,
  },
  metricValue: {
    ...Typography.metricValue,
    fontSize: 48,
    fontVariant: ['tabular-nums'],
  },
  sheet: {
    backgroundColor: Colors.elevatedSurface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: Colors.secondarySurface,
    padding: Spacing.lg,
  },
  infoField: {
    paddingVertical: Spacing.md,
  },
  infoBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.secondarySurface,
  },
  infoLabel: {
    ...Typography.caption,
    marginBottom: Spacing.xs,
  },
  infoValue: {
    ...Typography.bodyLarge,
    fontFamily: 'Lato_700Bold',
  },
  action: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  stopAction: {
    backgroundColor: Colors.absent,
  },
});
