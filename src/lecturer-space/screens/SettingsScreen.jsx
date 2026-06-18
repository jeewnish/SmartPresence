import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@clerk/expo';

import PrimaryButton from '../../components/common/PrimaryButton';
import SvgIcon from '../../components/common/SvgIcon';
import useUserStore from '../../store/userStore';
import { Colors, Typography, Spacing, Radii } from '../../theme';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useUserStore();
  const { signOut } = useAuth();

  const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();

  const handleResetPassword = () => {
    Alert.alert(
      'Reset Password',
      'A password reset link will be sent to your email.',
      [{ text: 'OK' }]
    );
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.lg }]}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Title ── */}
      <Text style={styles.title}>Settings</Text>

      {/* ── Avatar ── */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <SvgIcon name="user" size={44} color={Colors.primaryText} />
        </View>
      </View>

      {/* ── Profile Fields ── */}
      <View style={styles.fieldsSection}>
        <ProfileField label="Name" value={fullName || 'Lecturer Name'} />
        <ProfileField label="Email" value={user?.email ?? '—'} />
        <ProfileField label="Role" value="Lecturer" />
      </View>

      {/* ── Actions ── */}
      <PrimaryButton
        label="Reset Password"
        onPress={handleResetPassword}
        style={styles.resetBtn}
      />

      <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function ProfileField({ label, value }) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.primaryBackground,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  title: {
    ...Typography.h1,
    marginBottom: Spacing.xl,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.secondaryAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldsSection: {
    backgroundColor: Colors.elevatedSurface,
    borderWidth: 1,
    borderColor: Colors.secondarySurface,
    borderRadius: Radii.card,
    marginBottom: Spacing.xl,
    overflow: 'hidden',
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.secondarySurface,
  },
  fieldLabel: {
    ...Typography.bodyMedium,
    color: Colors.secondaryText,
  },
  fieldValue: {
    ...Typography.bodyMedium,
    fontFamily: 'Lato_700Bold',
    flex: 1,
    textAlign: 'right',
  },
  resetBtn: {
    marginBottom: Spacing.md,
  },
  logoutBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  logoutText: {
    ...Typography.bodyMedium,
    color: Colors.absent,
    fontFamily: 'Lato_700Bold',
  },
});
