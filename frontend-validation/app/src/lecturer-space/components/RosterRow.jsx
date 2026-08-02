import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radii } from '../../theme';

export default function RosterRow({ firstName, lastName, email, status }) {
  const name = [firstName, lastName].filter(Boolean).join(' ') || email;
  const statusColor =
    status === 'PRESENT'
      ? Colors.present
      : status === 'ABSENT'
        ? Colors.absent
        : status === 'LATE'
          ? Colors.late
          : status === 'EXCUSED'
            ? Colors.excused
            : Colors.secondaryText;

  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <View style={styles.initials}>
          <Text selectable style={styles.initialsText}>
            {(firstName?.[0] ?? '?').toUpperCase()}
          </Text>
        </View>
        <View style={styles.identity}>
          <Text selectable style={styles.name} numberOfLines={1}>{name}</Text>
          <Text selectable style={styles.email} numberOfLines={1}>{email}</Text>
        </View>
      </View>
      <Text selectable style={[styles.status, { color: statusColor }]}>
        {status ?? 'PENDING'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    backgroundColor: Colors.elevatedSurface,
    borderWidth: 1,
    borderColor: Colors.secondarySurface,
    borderRadius: Radii.card,
    marginBottom: Spacing.sm,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  initials: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.secondarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    ...Typography.captionBold,
    color: Colors.primaryText,
    fontSize: 13,
  },
  identity: {
    flex: 1,
  },
  name: {
    ...Typography.bodyMedium,
    fontFamily: 'Lato_700Bold',
  },
  email: {
    ...Typography.caption,
    marginTop: Spacing.xs,
  },
  status: {
    ...Typography.captionBold,
    marginLeft: Spacing.sm,
  },
});
