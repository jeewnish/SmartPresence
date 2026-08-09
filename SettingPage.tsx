import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

// ─── Types ───────────────────────────────────────────────────────────────────

type SettingsRowProps = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value?: string;
  hasChevron?: boolean;
  isSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (v: boolean) => void;
  onPress?: () => void;
  last?: boolean;
};

// ─── Sub-component ────────────────────────────────────────────────────────────

function SettingsRow({
  icon,
  label,
  value,
  hasChevron = true,
  isSwitch,
  switchValue,
  onSwitchChange,
  onPress,
  last,
}: SettingsRowProps) {
  return (
    <Pressable
      style={[styles.row, !last && styles.rowBorder]}
      onPress={onPress}
      android_ripple={{ color: '#FFE0B220' }}
      disabled={isSwitch}
    >
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={18} color="#E8871A" />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowRight}>
        {value !== undefined && (
          <Text style={styles.rowValue}>{value}</Text>
        )}
        {isSwitch && (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: '#D5D5D5', true: '#F0C080' }}
            thumbColor={switchValue ? '#E8871A' : '#FFFFFF'}
          />
        )}
        {hasChevron && !isSwitch && (
          <Ionicons name="chevron-forward" size={16} color="#CCCCCC" />
        )}
      </View>
    </Pressable>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type SettingsPageProps = {
  studentName?: string;
  studentEmail?: string;
  onSignOut?: () => void;
};

export function SettingsPage({
  studentName = 'Nadun Perera',
  studentEmail = 'nadun@student.sab.ac.lk',
  onSignOut,
}: SettingsPageProps) {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [biometricEnabled, setBiometricEnabled] = React.useState(true);

  return (
    <View style={styles.root}>
      {/* Page header */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Settings</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitial}>{studentName.charAt(0)}</Text>
          </View>
          <View style={styles.profileText}>
            <Text style={styles.profileName}>{studentName}</Text>
            <Text style={styles.profileEmail}>{studentEmail}</Text>
          </View>
          <Ionicons name="pencil-outline" size={18} color="#AAAAAA" />
        </View>

        {/* Account section */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.card}>
          <SettingsRow icon="person-outline"    label="Profile"          onPress={() => {}} />
          <SettingsRow icon="school-outline"    label="Student ID"       value="SC/2021/0078" onPress={() => {}} />
          <SettingsRow icon="lock-closed-outline" label="Change Password" onPress={() => {}} last />
        </View>

        {/* Preferences section */}
        <Text style={styles.sectionLabel}>PREFERENCES</Text>
        <View style={styles.card}>
          <SettingsRow
            icon="notifications-outline"
            label="Push Notifications"
            isSwitch
            switchValue={notificationsEnabled}
            onSwitchChange={setNotificationsEnabled}
            hasChevron={false}
          />
          <SettingsRow
            icon="finger-print-outline"
            label="Biometric Login"
            isSwitch
            switchValue={biometricEnabled}
            onSwitchChange={setBiometricEnabled}
            hasChevron={false}
            last
          />
        </View>

        {/* Support section */}
        <Text style={styles.sectionLabel}>SUPPORT</Text>
        <View style={styles.card}>
          <SettingsRow icon="help-circle-outline" label="Help & FAQ"     onPress={() => {}} />
          <SettingsRow icon="mail-outline"        label="Contact Us"     onPress={() => {}} last />
        </View>

        {/* Sign out */}
        <Pressable style={styles.signOutBtn} onPress={onSignOut}>
          <Ionicons name="log-out-outline" size={18} color="#D44338" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>

        <Text style={styles.version}>SmartPresence v1.0.0</Text>
        <View style={{ height: 16 }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const ORANGE = '#E8871A';
const BG     = '#FAF9F6';
const WHITE  = '#FFFFFF';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  pageHeader: {
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: BG,
  },
  pageTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 26,
    color: '#1A1A1A',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 4,
  },

  // Profile
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  profileAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#C87514',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  profileInitial: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: WHITE,
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: '#1A1A1A',
  },
  profileEmail: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#AAAAAA',
    marginTop: 2,
  },

  // Sections
  sectionLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    color: '#AAAAAA',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: WHITE,
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F3F3',
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFF4E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowLabel: {
    flex: 1,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#2D2D2D',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowValue: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#AAAAAA',
  },

  // Sign out
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF0EF',
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 16,
  },
  signOutText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#D44338',
  },
  version: {
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#CCCCCC',
    marginBottom: 8,
  },
});
