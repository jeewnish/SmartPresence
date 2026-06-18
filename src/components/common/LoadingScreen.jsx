import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { Colors, Typography, Spacing } from '../../theme';

export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primaryAccent} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  text: {
    ...Typography.bodyMedium,
    color: Colors.secondaryText,
    marginTop: Spacing.sm,
  },
});
