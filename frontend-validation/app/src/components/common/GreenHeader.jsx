import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
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
        ) : null}

        <Text selectable style={styles.title}>
          {title}
        </Text>

        {rightElement ? <View style={styles.rightElement}>{rightElement}</View> : null}
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
  },
  backBtn: {
    width: 32,
    alignItems: 'flex-start',
  },
  rightElement: {
    marginLeft: Spacing.sm,
  },
  title: {
    ...Typography.pageTitle,
    color: Colors.primaryText,
    lineHeight: 32,
    flex: 1,
    textAlign: 'left',
  },
});
