import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import StandardCard from '../../components/common/StandardCard';
import RosterRow from '../components/RosterRow';
import SecondaryButton from '../../components/common/SecondaryButton';
import PrimaryButton from '../../components/common/PrimaryButton';
import { useRoster } from '../hooks/useRoster';
import { Colors, Typography, Spacing, Radii } from '../../theme';

// TODO: replace with the real active session ID from BroadcastScreen / global store
const ACTIVE_SESSION_ID = null;

// Mock roster data until a live session is running
const MOCK_ROSTER = [
  { studentId: 1, firstName: 'Nadun', lastName: 'Perera', email: 'nadun@uni.lk', status: 'PRESENT' },
  { studentId: 2, firstName: 'Sasha', lastName: 'Fernando', email: 'sasha@uni.lk', status: 'PRESENT' },
  { studentId: 3, firstName: 'Kusal', lastName: 'Silva', email: 'kusal@uni.lk', status: 'ABSENT' },
  { studentId: 4, firstName: 'Amara', lastName: 'Mendis', email: 'amara@uni.lk', status: 'PRESENT' },
  { studentId: 5, firstName: 'Dinesh', lastName: 'Rajapaksa', email: 'dinesh@uni.lk', status: 'ABSENT' },
  { studentId: 6, firstName: 'Thilini', lastName: 'Wickrama', email: 'thilini@uni.lk', status: 'PRESENT' },
  { studentId: 7, firstName: 'Ravindu', lastName: 'Gamage', email: 'ravindu@uni.lk', status: 'PRESENT' },
];

export default function RosterScreen() {
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
  const [manualName, setManualName] = useState('');

  const { data: rosterData } = useRoster(ACTIVE_SESSION_ID);
  const students = rosterData?.students ?? MOCK_ROSTER;
  const presentCount = students.filter((s) => s.status === 'PRESENT').length;

  const handleAddManual = () => {
    if (!manualName.trim()) {
      Alert.alert('Validation', 'Please enter a student name.');
      return;
    }
    Alert.alert('Added', `${manualName} marked as present manually.`);
    setManualName('');
    setModalVisible(false);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* ── Page Title ── */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>Roster</Text>
      </View>

      {/* ── Control Row ── */}
      <View style={styles.controlRow}>
        <Text style={styles.countLabel}>
          Current Attendance —{' '}
          <Text style={styles.countNum}>{presentCount}</Text>
        </Text>
        <SecondaryButton
          label="Add Manually"
          onPress={() => setModalVisible(true)}
          style={styles.addBtn}
        />
      </View>

      {/* ── Student List ── */}
      <FlatList
        data={students}
        keyExtractor={(item) => String(item.studentId)}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <RosterRow
            firstName={item.firstName}
            lastName={item.lastName}
            email={item.email}
            status={item.status}
            index={index}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No students in roster.</Text>
        }
      />

      {/* ── Add Manually Modal ── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Student Manually</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Student name or ID"
              placeholderTextColor={Colors.secondaryText}
              value={manualName}
              onChangeText={setManualName}
            />
            <PrimaryButton label="Add" onPress={handleAddManual} style={styles.modalBtn} />
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.primaryBackground,
  },
  titleRow: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.h1,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  countLabel: {
    ...Typography.bodyMedium,
    flex: 1,
  },
  countNum: {
    ...Typography.bodyMedium,
    fontFamily: 'Lato_700Bold',
    color: Colors.primaryAccent,
  },
  addBtn: {
    height: 38,
    paddingHorizontal: Spacing.md,
  },
  list: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  empty: {
    ...Typography.bodyMedium,
    color: Colors.secondaryText,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.elevatedSurface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  modalTitle: {
    ...Typography.h3,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  modalInput: {
    backgroundColor: Colors.secondarySurface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.standard,
    paddingHorizontal: Spacing.md,
    height: 48,
    ...Typography.bodyMedium,
    color: Colors.primaryText,
  },
  modalBtn: {},
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  cancelText: {
    ...Typography.bodyMedium,
    color: Colors.secondaryText,
  },
});
