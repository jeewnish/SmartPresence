import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../theme';

/**
 * A single row in the Today's Lectures card.
 *
 * @param {{ courseCode: string, courseName: string, time?: string }} props
 */
export default function LectureRow({ courseCode, courseName, time }) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.code}>{courseCode}</Text>
        <Text style={styles.name} numberOfLines={1}>
          {courseName}
        </Text>
      </View>
      {time ? <Text style={styles.time}>{time}</Text> : null}
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
  left: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  code: {
    ...Typography.captionBold,
    color: Colors.secondaryText,
    marginBottom: 2,
  },
  name: {
    ...Typography.bodyMedium,
    color: Colors.primaryText,
  },
  time: {
    ...Typography.bodyMedium,
    color: Colors.primaryText,
    fontFamily: 'Lato_700Bold',
  },
});
