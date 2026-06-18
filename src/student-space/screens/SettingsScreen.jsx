import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '@clerk/expo';
import GreenHeader from '../../components/common/GreenHeader';
import StandardCard from '../../components/common/StandardCard';
import PrimaryButton from '../../components/common/PrimaryButton';
import SvgIcon from '../../components/common/SvgIcon';
import useUserStore from '../../store/userStore';
import { Colors, Typography, Spacing, Radii } from '../../theme';

export default function SettingsScreen() {
  const { user } = useUserStore();
  const { signOut } = useAuth();
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState(user?.email ?? '');
  const [studentId, setStudentId] = useState('22CIS0200');
  const [saving, setSaving] = useState(false);

  const handleChange = () => {
    if (!password) {
      Alert.alert('Validation', 'Please enter a new password.');
      return;
    }
    setSaving(true);
    // TODO: call password reset API when endpoint is available
    setTimeout(() => {
      setSaving(false);
      Alert.alert('Success', 'Your details have been updated.');
    }, 1200);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <GreenHeader title="Settings" />

      <View style={styles.body}>
        {/* ── Avatar + Name ── */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <SvgIcon name="user" size={40} color={Colors.secondaryText} />
            </View>
            <TouchableOpacity style={styles.editBadge}>
              <SvgIcon name="edit" size={14} color="#FDFDFD" />
            </TouchableOpacity>
          </View>
          <Text style={styles.nameText}>{fullName || 'Student Name'}</Text>
          <Text style={styles.idText}>{studentId}</Text>
        </View>

        {/* ── Editable Fields ── */}
        <StandardCard style={styles.formCard}>
          <FieldInput
            label="Student ID"
            value={studentId}
            onChangeText={setStudentId}
            placeholder="STU-2024-XXXX"
            icon="id"
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
            value={email}
            onChangeText={setEmail}
            placeholder="email@example.com"
            icon="mail"
            keyboardType="email-address"
            isLast
          />
        </StandardCard>

        {/* ── Actions ── */}
        <PrimaryButton
          label="Change"
          onPress={handleChange}
          loading={saving}
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
