import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../theme';

/**
 * A row in the "Attendance of Today's Lectures" section on the lecturer home screen.
 *
 * @param {{ courseName: string, percentage: number | string }} props
 */
export default function AttendanceRow({ courseName, percentage }) {
  return (
    <View style={styles.row}>
      <Text style={styles.name} numberOfLines={1}>
        {courseName}
      </Text>
      <Text style={styles.pct}>{percentage}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.secondarySurface,
  },
  name: {
    ...Typography.bodyMedium,
    flex: 1,
    marginRight: Spacing.sm,
  },
  pct: {
    ...Typography.metricValue,
    fontSize: 18,
  },
});
