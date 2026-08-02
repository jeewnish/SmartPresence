import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { useAuth } from '@clerk/expo';

import GreenHeader from '../../components/common/GreenHeader';
import StandardCard from '../../components/common/StandardCard';
import PrimaryButton from '../../components/common/PrimaryButton';
import SvgIcon from '../../components/common/SvgIcon';
import useAuthProfile from '../../auth-space/hooks/useAuthProfile';
import { Colors, Typography, Spacing } from '../../theme';

export default function SettingsScreen() {
  const authSpaceUser = useAuthProfile();
  const { signOut } = useAuth();

  const handleResetPassword = () => {
    Alert.alert(
      'Password reset unavailable',
      'Authentication is managed by Clerk and the current backend has no password reset endpoint.'
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
      contentInsetAdjustmentBehavior="never"
      showsVerticalScrollIndicator={false}
    >
      <GreenHeader title="Settings" />

      <View style={styles.body}>
        <View style={styles.profile}>
          <View style={styles.avatar}>
            {authSpaceUser.imageUrl ? (
              <Image
                source={authSpaceUser.imageUrl}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
              />
            ) : (
              <SvgIcon name="user" size={36} color={Colors.secondaryText} />
            )}
          </View>
          <View>
            <Text selectable style={styles.name}>
              {authSpaceUser.fullName || 'Lecturer'}
            </Text>
            <Text selectable style={styles.role}>
              {(authSpaceUser.role ?? 'ROLE_LECTURER').replace('ROLE_', '')}
            </Text>
          </View>
        </View>

        <StandardCard style={styles.infoCard}>
          <ProfileField label="Name" value={authSpaceUser.fullName || 'Not available'} />
          <ProfileField label="Email" value={authSpaceUser.email || 'Not available'} />
          <ProfileField
            label="User ID"
            value={authSpaceUser.id ? String(authSpaceUser.id) : 'Pending'}
          />
          <ProfileField
            label="Role"
            value={authSpaceUser.role ?? 'ROLE_LECTURER'}
            isLast
          />
        </StandardCard>

        <Text selectable style={styles.backendNote}>
          Department and staff ID are not included in the backend user profile.
        </Text>

        <PrimaryButton label="Reset Password" onPress={handleResetPassword} />

        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text selectable style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function ProfileField({ label, value, isLast }) {
  return (
    <View style={[styles.field, !isLast && styles.fieldBorder]}>
      <Text selectable style={styles.fieldLabel}>{label}</Text>
      <Text selectable style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.primaryBackground,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.secondarySurface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  name: {
    ...Typography.h3,
    marginBottom: Spacing.xs,
  },
  role: {
    ...Typography.captionBold,
    letterSpacing: 1,
  },
  infoCard: {
    padding: 0,
    marginBottom: Spacing.sm,
  },
  field: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  fieldBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.secondarySurface,
  },
  fieldLabel: {
    ...Typography.caption,
    marginBottom: Spacing.xs,
  },
  fieldValue: {
    ...Typography.bodyMedium,
    fontFamily: 'Lato_700Bold',
  },
  backendNote: {
    ...Typography.caption,
    lineHeight: 17,
    marginBottom: Spacing.xl,
  },
  logoutButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  logoutText: {
    ...Typography.bodyMedium,
    color: Colors.absent,
    fontFamily: 'Lato_700Bold',
  },
});
