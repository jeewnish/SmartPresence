import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radii } from '../../theme';

/**
 * Highlight card — shows a course name, attendance %, and a progress bar.
 *
 * @param {{ courseCode: string, courseName: string, percentage: number }} props
 */
export default function AttendanceCard({ courseCode, courseName, percentage }) {
  const pct = Math.round(Math.max(0, Math.min(100, percentage ?? 0)));
  const barColor =
    pct >= 75 ? Colors.present : pct >= 50 ? Colors.late : Colors.absent;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text selectable style={styles.courseLabel} numberOfLines={1}>
          {(courseCode ? `${courseCode} ` : '') +
            (courseName ?? '').toUpperCase()}
        </Text>
        <Text selectable style={styles.pct}>{pct}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: barColor }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.highlightCardBg,
    borderWidth: 1,
    borderColor: Colors.secondarySurface,
    borderRadius: Radii.card,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  courseLabel: {
    ...Typography.label,
    fontSize: 13,
    flex: 1,
    marginRight: Spacing.sm,
  },
  pct: {
    ...Typography.metricValue,
    fontSize: 20,
  },
  track: {
    height: 6,
    backgroundColor: Colors.secondarySurface,
    borderRadius: Radii.full,
    overflow: 'hidden',
  },
  fill: {
    height: 6,
    borderRadius: Radii.full,
  },
});
