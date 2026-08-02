import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth, useUser } from '@clerk/expo';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import GreenHeader from '../../components/common/GreenHeader';
import StandardCard from '../../components/common/StandardCard';
import PrimaryButton from '../../components/common/PrimaryButton';
import SvgIcon from '../../components/common/SvgIcon';
import useAuthProfile from '../../auth-space/hooks/useAuthProfile';
import { Colors, Typography, Spacing, Radii } from '../../theme';

export default function SettingsScreen() {
  const authSpaceUser = useAuthProfile();
  const { signOut } = useAuth();
  const { user: clerkUser } = useUser();
  const [password, setPassword] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleProfileImageChange = async () => {
    if (!clerkUser || uploadingImage) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Photo access required',
        'Allow photo access to choose a profile picture.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      selectionLimit: 1,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    let fileSize = asset.fileSize;

    if (fileSize == null) {
      const selectedFile = await fetch(asset.uri).then((response) => response.blob());
      fileSize = selectedFile.size;
    }

    if (fileSize >= 2 * 1024 * 1024) {
      Alert.alert(
        'Image is too large',
        'Choose a profile picture smaller than 2 MB.'
      );
      return;
    }

    setUploadingImage(true);
    try {
      await clerkUser.setProfileImage({ file: asset.file ?? asset.uri });
      await clerkUser.reload();
    } catch (error) {
      Alert.alert(
        'Profile picture not updated',
        error?.errors?.[0]?.longMessage ??
          error?.message ??
          'Please try another image.'
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const handleChange = () => {
    if (!password) {
      Alert.alert('Validation', 'Please enter a new password.');
      return;
    }
    Alert.alert(
      'Password reset unavailable',
      'The current backend does not expose a password update endpoint.'
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
        {/* ── Avatar + Name ── */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Choose profile picture"
              activeOpacity={0.8}
              onPress={handleProfileImageChange}
              style={styles.avatar}
            >
              {authSpaceUser.imageUrl ? (
                <Image
                  source={authSpaceUser.imageUrl}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                />
              ) : (
                <SvgIcon name="user" size={40} color={Colors.secondaryText} />
              )}
              {uploadingImage ? (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator color={Colors.primaryBackground} />
                </View>
              ) : null}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.editBadge}
              onPress={handleProfileImageChange}
              disabled={uploadingImage}
            >
              <SvgIcon name="edit" size={14} color="#FDFDFD" />
            </TouchableOpacity>
          </View>
          <Text selectable style={styles.nameText}>
            {authSpaceUser.fullName || 'Student'}
          </Text>
          <Text selectable style={styles.idText}>
            {authSpaceUser.studentId
              ? `Student ID ${authSpaceUser.studentId}`
              : 'Student ID pending'}
          </Text>
        </View>

        {/* ── Editable Fields ── */}
        <StandardCard style={styles.formCard}>
          <FieldInput
            label="Student ID"
            value={authSpaceUser.studentId}
            placeholder="Student ID unavailable"
            icon="id"
            editable={false}
          />
          <FieldInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            icon="lock"
            secureTextEntry
          />
          <FieldInput
            label="Email"
            value={authSpaceUser.email}
            placeholder="No email available"
            icon="mail"
            keyboardType="email-address"
            editable={false}
            isLast
          />
        </StandardCard>

        {/* ── Actions ── */}
        <PrimaryButton
          label="Reset Password"
          onPress={handleChange}
          style={styles.changeBtn}
        />

        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function FieldInput({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  secureTextEntry,
  keyboardType,
  isLast,
  editable = true,
}) {
  return (
    <View style={[styles.fieldWrap, !isLast && styles.fieldBorder]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.secondaryText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          editable={editable}
          autoCapitalize="none"
        />
        <SvgIcon name={icon} size={18} color={Colors.present} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.primaryBackground,
  },
  body: {
    padding: Spacing.md,
    paddingTop: Spacing.xl,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.secondarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(60,61,72,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primaryAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameText: {
    ...Typography.h3,
    marginBottom: 4,
  },
  idText: {
    ...Typography.captionBold,
    color: Colors.secondaryText,
  },
  formCard: {
    padding: 0,
    marginBottom: Spacing.md,
  },
  fieldWrap: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  fieldBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.secondarySurface,
  },
  fieldLabel: {
    ...Typography.label,
    fontSize: 13,
    marginBottom: Spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondarySurface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.standard,
    paddingHorizontal: Spacing.sm,
    height: 44,
  },
  input: {
    flex: 1,
    ...Typography.bodyMedium,
    color: Colors.primaryText,
    paddingVertical: 0,
  },
  changeBtn: {
    marginTop: Spacing.sm,
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
