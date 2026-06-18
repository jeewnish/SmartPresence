import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radii } from '../../theme';

/**
 * @param {{ date: string, courseCode: string, courseName: string, status: 'ATTENDED' | 'NOT_ATTENDED', message: string }} props
 */
export default function NotificationItem({
  date,
  courseCode,
  courseName,
  status,
  message,
}) {
  const attended = status === 'ATTENDED';
  const statusColor = attended ? Colors.present : Colors.absent;
  const statusBg = attended ? Colors.presentLight : Colors.absentLight;
  const statusLabel = attended ? 'ATTENDED' : 'NOT ATTENDED';

  return (
    <View style={styles.card}>
      <Text style={styles.date}>{date}</Text>
      <Text style={styles.course}>
        {(courseCode ? `${courseCode} ` : '') + (courseName ?? '').toUpperCase()}
      </Text>

      {/* Status badge */}
      <View style={[styles.badge, { backgroundColor: statusBg }]}>
        <View style={[styles.dot, { backgroundColor: statusColor }]} />
        <Text style={[styles.badgeText, { color: statusColor }]}>{statusLabel}</Text>
      </View>

      <Text style={[styles.message, { color: statusColor }]}>{message}</Text>
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
  date: {
    ...Typography.captionBold,
    color: Colors.secondaryText,
    marginBottom: 4,
  },
  course: {
    ...Typography.label,
    fontSize: 13,
    marginBottom: Spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: Radii.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: Spacing.sm,
    gap: 5,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  badgeText: {
    ...Typography.captionBold,
    fontSize: 11,
  },
  message: {
    ...Typography.bodyMedium,
    fontSize: 13,
  },
});
