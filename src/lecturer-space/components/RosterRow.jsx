import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radii } from '../../theme';

/**
 * A single row in the student roster.
 *
 * @param {{ firstName: string, lastName: string, email: string, status: string, index: number }} props
 */
export default function RosterRow({ firstName, lastName, email, status, index }) {
  const name = `${firstName ?? ''} ${lastName ?? ''}`.trim() || email;
  const statusColor =
    status === 'PRESENT'
      ? Colors.present
      : status === 'ABSENT'
      ? Colors.absent
      : Colors.secondaryText;

  return (
    <View style={[styles.row, index > 0 && styles.borderTop]}>
      <View style={styles.left}>
        <View style={styles.initials}>
          <Text style={styles.initialsText}>
            {(firstName?.[0] ?? '?').toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
      </View>
      <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm + 2,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: Colors.secondarySurface,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  initials: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.secondarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    ...Typography.captionBold,
    color: Colors.primaryText,
    fontSize: 13,
  },
  name: {
    ...Typography.bodyMedium,
    flex: 1,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
