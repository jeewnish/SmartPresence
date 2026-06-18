import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SvgIcon from './SvgIcon';
import { Colors, Typography, Spacing } from '../../theme';

/**
 * Green (#4E8D63) header strip used in student screens.
 *
 * @param {{ title: string, onBack?: () => void, rightElement?: React.ReactNode }} props
 */
export default function GreenHeader({ title, onBack, rightElement }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + Spacing.sm },
      ]}
    >
      <View style={styles.row}>
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.backBtn}
          >
            <SvgIcon name="arrowLeft" size={22} color="#FDFDFD" />
          </TouchableOpacity>
        ) : (
          <View style={styles.backBtn} />
        )}

        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        <View style={styles.backBtn}>{rightElement ?? null}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.headerGreen,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 32,
    alignItems: 'flex-start',
  },
  title: {
    ...Typography.bodyLarge,
    color: Colors.primaryBackground,
    fontFamily: 'Lato_700Bold',
    flex: 1,
    textAlign: 'center',
  },
});
