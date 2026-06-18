import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Spacing, Radii, Shadows } from '../../theme';

/**
 * White Standard Card — #FFFFFF bg, 1px #E8E8E7 border, 12px radius.
 *
 * @param {{ children: React.ReactNode, style?: object }} props
 */
export default function StandardCard({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.elevatedSurface,
    borderWidth: 1,
    borderColor: Colors.secondarySurface,
    borderRadius: Radii.card,
    padding: Spacing.md,
    ...Shadows.card,
  },
});
