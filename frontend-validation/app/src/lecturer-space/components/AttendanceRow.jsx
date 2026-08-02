import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radii } from '../../theme';

export default function AttendanceRow({ courseName, percentage }) {
  const pct = Math.round(Math.max(0, Math.min(100, Number(percentage) || 0)));
  const progressColor =
    pct >= 90 ? Colors.present : pct >= 75 ? Colors.primaryAccent : Colors.absent;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text selectable style={styles.name} numberOfLines={1}>{courseName}</Text>
        <Text selectable style={styles.pct}>{pct}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: progressColor }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.elevatedSurface,
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
  name: {
    ...Typography.label,
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
