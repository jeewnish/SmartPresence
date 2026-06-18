import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSession } from '../hooks/useSession';
import { useMyCourses } from '../hooks/useLecturerHome';
import PrimaryButton from '../../components/common/PrimaryButton';
import { Colors, Typography, Spacing, Radii } from '../../theme';

export default function BroadcastScreen() {
  const insets = useSafeAreaInsets();
  const { data: courses = [] } = useMyCourses();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const { activeSession, isBroadcasting, startSession, stopSession, loading } = useSession();

  const course = selectedCourse ?? courses[0] ?? null;

  const handleBroadcast = async () => {
    if (!course) {
      Alert.alert('No course', 'Please ensure you have at least one course.');
      return;
    }
    try {
      if (isBroadcasting) {
        await stopSession();
        Alert.alert('Session Ended', 'Attendance session has been closed.');
      } else {
        await startSession(course.id);
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* ── Title ── */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>Broadcasting</Text>
      </View>

      {/* ── Radar animation ── */}
      <View style={styles.animArea}>
        <Image
          source={require('../../../assets/animated-icons/radar.gif')}
          style={[
            styles.radarGif,
            !isBroadcasting && styles.radarInactive,
          ]}
          resizeMode="contain"
        />
      </View>

      {/* ── Session Info Panel ── */}
      <View style={styles.infoPanel}>
        <Text style={styles.courseName}>
          {course?.courseName ?? 'Select a course'}
        </Text>
        <Text style={styles.courseCode}>
          {course?.courseCode ?? '—'}
          {activeSession ? ` · Session #${activeSession.id}` : ''}
        </Text>

        {isBroadcasting && (
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>BROADCASTING</Text>
          </View>
        )}

        <PrimaryButton
          label={isBroadcasting ? 'Stop Broadcast' : 'Broadcast'}
          onPress={handleBroadcast}
          loading={loading}
          style={[styles.broadcastBtn, isBroadcasting && styles.stopBtn]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.primaryBackground,
  },
  titleRow: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h1,
  },
  animArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: Spacing.lg,
  },
  radarGif: {
    width: 240,
    height: 240,
  },
  radarInactive: {
    opacity: 0.4,
  },
  infoPanel: {
    backgroundColor: Colors.primaryText,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },
  courseName: {
    ...Typography.bodyLarge,
    color: Colors.primaryBackground,
    fontFamily: 'Lato_700Bold',
  },
  courseCode: {
    ...Typography.bodyMedium,
    color: Colors.secondaryText,
    marginBottom: Spacing.sm,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.present,
  },
  liveText: {
    ...Typography.captionBold,
    color: Colors.present,
    letterSpacing: 1,
  },
  broadcastBtn: {
    marginTop: Spacing.sm,
  },
  stopBtn: {
    backgroundColor: Colors.absent,
  },
});
