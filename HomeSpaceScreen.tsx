import React, { useEffect, useRef, useState } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { readAuthSession } from '../../services/tokenStorage';
import {
  fetchStudentProfile,
  lookupBleSession,
  registerStudentDevice,
  submitStudentCheckin,
} from '../../services/studentSpaceApi';

import { DashboardPage }  from './pages/DashboardPage';
import { SchedulePage }   from './pages/SchedulePage';
import { AlertsPage }     from './pages/AlertsPage';
import { SettingsPage }   from './pages/SettingsPage';

import { HomeBottomNav }        from './components/HomeBottomNav';
import { BiometricVerifyModal } from './components/BiometricVerifyModal';

import {
  HomeSpaceScreenProps,
  HomeTab,
  RadarState,
} from './types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message.trim().length > 0) {
    return err.message;
  }
  return 'Unexpected backend error. Please try again.';
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export function HomeSpaceScreen({ onExit }: HomeSpaceScreenProps) {
  const insets = useSafeAreaInsets();

  // ── Navigation state ──────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<HomeTab>('home');

  // ── Auth / profile ────────────────────────────────────────────────────────
  const [accessToken, setAccessToken]       = useState('');
  const [studentDisplay, setStudentDisplay] = useState('Student');

  // ── Check-in (FAB / radar) state ─────────────────────────────────────────
  const [radarState, setRadarState]               = useState<RadarState>('scanning');
  const [radarVisible, setRadarVisible]           = useState(false);   // modal open?
  const [bleTokenInput, setBleTokenInput]         = useState('');
  const [resolvedBleToken, setResolvedBleToken]   = useState('');
  const [resolvedBeaconMac, setResolvedBeaconMac] = useState<string | undefined>(undefined);
  const [checkinMessage, setCheckinMessage]       = useState('');
  const [isCheckingIn, setIsCheckingIn]           = useState(false);

  // ── Pulse animation (kept alive for when FAB is pressed) ──────────────────
  const pulseScale   = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseScale,   { toValue: 1.2, duration: 1200, useNativeDriver: true }),
          Animated.timing(pulseScale,   { toValue: 1,   duration: 1200, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOpacity, { toValue: 0.12, duration: 1200, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0.4,  duration: 1200, useNativeDriver: true }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseOpacity, pulseScale]);

  // ── Auth init ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const session = await readAuthSession();
      if (!session?.accessToken || cancelled) return;

      setAccessToken(session.accessToken);

      try {
        const profile = await fetchStudentProfile(session.accessToken);
        if (!cancelled) {
          setStudentDisplay(profile.fullName || profile.email || 'Student');
        }
      } catch { /* silent — dashboard still works with fallback name */ }

      try {
        await registerStudentDevice(session.accessToken);
      } catch (err) {
        const msg = toErrorMessage(err);
        if (!msg.toLowerCase().includes('already registered')) {
          // non-fatal; device may already be registered
        }
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // ── FAB pressed → open check-in flow ─────────────────────────────────────
  const handleFabPress = async () => {
    if (isCheckingIn) return;

    if (!accessToken) {
      setCheckinMessage('Session expired. Sign in again to check in.');
      setRadarVisible(true);
      return;
    }

    const token = bleTokenInput.trim();
    if (!token) {
      setCheckinMessage('Enter the BLE token before checking in.');
      setRadarVisible(true);
      return;
    }

    setCheckinMessage('');

    try {
      const session = await lookupBleSession(accessToken, token);
      setResolvedBleToken(session.bleToken);
      setResolvedBeaconMac(session.beaconMac ?? undefined);
      setRadarState('verify');
      setRadarVisible(true);
    } catch (err) {
      const msg = toErrorMessage(err);
      setResolvedBleToken('');
      setResolvedBeaconMac(undefined);
      setCheckinMessage(msg);
      setRadarVisible(true);
    }
  };

  // ── Biometric confirm ─────────────────────────────────────────────────────
  const handleBiometricVerify = async () => {
    if (!accessToken || !resolvedBleToken || isCheckingIn) {
      setCheckinMessage('Validate a BLE token first, then retry.');
      setRadarState('scanning');
      return;
    }

    setIsCheckingIn(true);
    setCheckinMessage('Submitting attendance…');

    try {
      const result = await submitStudentCheckin(accessToken, {
        bleToken:         resolvedBleToken,
        biometricPassed:  true,
        biometricMethod:  'Fingerprint',
        rssiDbm:          -61,
        rssiSamples:      4,
        txPowerDbm:       -4,
        detectedBeaconMac: resolvedBeaconMac,
      });

      if (!result.success) throw new Error(result.message || 'Backend rejected the check-in.');

      setCheckinMessage(result.message || 'Attendance recorded successfully.');
      setRadarState('success');
    } catch (err) {
      setCheckinMessage(toErrorMessage(err));
      setRadarState('scanning');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleResetCheckin = () => {
    setRadarState('scanning');
    setRadarVisible(false);
    setResolvedBleToken('');
    setResolvedBeaconMac(undefined);
    setCheckinMessage('');
    setBleTokenInput('');
  };

  // ── Derive first name for greeting ───────────────────────────────────────
  const firstName = studentDisplay.split(' ')[0] ?? 'Student';

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* ── Page content area ─────────────────────────────────────── */}
      <View style={styles.content}>
        {activeTab === 'home' && (
          <DashboardPage
            studentName={firstName}
            onViewAll={() => setActiveTab('alerts')}
          />
        )}

        {activeTab === 'schedule' && <SchedulePage />}

        {activeTab === 'alerts' && <AlertsPage />}

        {activeTab === 'settings' && (
          <SettingsPage
            studentName={studentDisplay}
            onSignOut={onExit}
          />
        )}
      </View>

      {/* ── Fixed bottom navigation ───────────────────────────────── */}
      <HomeBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onFabPress={() => void handleFabPress()}
      />

      {/* ── Biometric check-in modal ──────────────────────────────── */}
      <BiometricVerifyModal
        visible={radarState === 'verify'}
        onVerify={() => void handleBiometricVerify()}
        onCancel={(errorMsg?: string) => {
          if (errorMsg) setCheckinMessage(errorMsg);
          setRadarState('scanning');
          setRadarVisible(false);
        }}
      />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  content: {
    flex: 1,
  },
});
