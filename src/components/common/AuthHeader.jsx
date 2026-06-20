import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../theme';

/**
 * Logo + title + subtitle block shown at the top of every auth screen.
 *
 * @param {{ title: string, subtitle?: string }} props
 */
export default function AuthHeader({ title, subtitle }) {
  return (
    <View style={styles.wrap}>
      <Image source={require('../../../assets/icons/radar.png')} style={styles.logo} />
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: Spacing.md,
    resizeMode: 'contain',
  },
  title: {
    ...Typography.h1,
    fontSize: 28,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.bodyMedium,
    color: Colors.secondaryText,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});
