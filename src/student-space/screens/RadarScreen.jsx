import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Alert,
  Platform,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

import GreenHeader from '../../components/common/GreenHeader';
import ScanningAnimation from '../components/ScanningAnimation';
import StandardCard from '../../components/common/StandardCard';
import SecondaryButton from '../../components/common/SecondaryButton';
import SvgIcon from '../../components/common/SvgIcon';
import { useAttendanceCheckIn } from '../hooks/useAttendance';
import { Colors, Typography, Spacing, Radii } from '../../theme';

// ─── Mock detected session (replace with real BLE scanner when native module is ready) ───
const MOCK_SESSION = {
  sessionId: 1,
  lecturer: 'Prof. Shantha Bandara',
  course: 'IS31000 Web Application',
  hall: 'Z9 Hall',
  currentAttendance: 95,
};

export default function RadarScreen() {
  const [sessionDetected] = useState(true); // will be driven by BLE in production
  const [checkingIn, setCheckingIn] = useState(false);
  const [done, setDone] = useState(false);
  const slideAnim = useRef(new Animated.Value(300)).current;
  const { checkIn, loading, error, success } = useAttendanceCheckIn();

  // Slide-up animation for session card
  useEffect(() => {
    if (sessionDetected) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }).start();
    }
  }, [sessionDetected]);

  const handleCheckAttendance = async () => {
    // Step 1: biometric auth
    try {
      const hasHW = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();

      if (hasHW && enrolled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Verify your identity to mark attendance',
          fallbackLabel: 'Use Passcode',
          cancelLabel: 'Cancel',
        });
        if (!result.success) return;
      }
    } catch (e) {
      // Device has no biometrics — proceed anyway in dev
      console.warn('Biometric check skipped:', e.message);
    }

    // Step 2: API check-in
    setCheckingIn(true);
    try {
      await checkIn({
        deviceId: 'DEVICE_' + Platform.OS,
        sessionId: MOCK_SESSION.sessionId,
        bleToken: 'mock-ble-token', // Real BLE scanner provides this
      });
      setDone(true);
    } catch {
      Alert.alert('Check-in failed', error ?? 'Please try again.');
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <View style={styles.screen}>
      <GreenHeader title="Scanning..." />

      {/* ── Scanning Area ── */}
      <View style={styles.scanArea}>
        <ScanningAnimation size={180} />

        {/* Current attendance percentage */}
        <Text style={styles.pctLabel}>{MOCK_SESSION.currentAttendance}%</Text>
        <Text style={styles.pctCaption}>Your current attendance</Text>
      </View>

      {/* ── Session Info Card (slides up) ── */}
      {sessionDetected && (
        <Animated.View
          style={[styles.cardWrap, { transform: [{ translateY: slideAnim }] }]}
        >
          {done ? (
            <View style={styles.successWrap}>
              <SvgIcon name="checkCircle" size={48} color={Colors.present} />
              <Text style={styles.successTitle}>Attendance Marked!</Text>
              <Text style={styles.successSub}>
                Your attendance for {MOCK_SESSION.course} has been recorded.
              </Text>
            </View>
          ) : (
            <StandardCard style={styles.sessionCard}>
              <InfoRow icon="professor" label={MOCK_SESSION.lecturer} />
              <InfoRow icon="book" label={MOCK_SESSION.course} />
              <InfoRow icon="hall" label={MOCK_SESSION.hall} />

              <SecondaryButton
                label={loading || checkingIn ? 'Verifying…' : 'Check Attendance'}
                onPress={handleCheckAttendance}
                loading={loading || checkingIn}
                style={styles.btn}
              />
            </StandardCard>
          )}
        </Animated.View>
      )}
    </View>
  );
}

function InfoRow({ icon, label }) {
  return (
    <View style={styles.infoRow}>
      <SvgIcon name={icon} size={18} color={Colors.secondaryText} />
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.primaryBackground,
  },
  scanArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: Spacing.xl,
  },
  pctLabel: {
    ...Typography.metricValue,
    fontSize: 28,
    marginTop: Spacing.xl,
  },
  pctCaption: {
    ...Typography.caption,
    marginTop: 4,
  },
  cardWrap: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  sessionCard: {
    gap: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  infoLabel: {
    ...Typography.bodyMedium,
    flex: 1,
  },
  btn: {
    marginTop: Spacing.sm,
  },
  successWrap: {
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
    backgroundColor: Colors.presentLight,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.present,
  },
  successTitle: {
    ...Typography.h3,
    color: Colors.present,
  },
  successSub: {
    ...Typography.bodyMedium,
    color: Colors.present,
    textAlign: 'center',
  },
});
