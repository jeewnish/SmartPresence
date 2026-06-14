import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { readAuthSession } from '../../services/tokenStorage';
import {
  fetchStudentProfile,
  lookupBleSession,
  registerStudentDevice,
  submitStudentCheckin,
} from '../../services/studentSpaceApi';
import { AlertsPage } from './pages/AlertsPage';
import { ProgressPage } from './pages/ProgressPage';
import { RadarPage } from './pages/RadarPage';
import { BiometricVerifyModal } from './components/BiometricVerifyModal';
import { StudentBottomNav } from './components/StudentBottomNav';
import { RadarState, StudentSpaceScreenProps, StudentTab } from './types';

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  return 'Unexpected backend error. Please try again.';
}

export function StudentSpaceScreen({ onExit }: StudentSpaceScreenProps) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<StudentTab>('radar');
  const [radarState, setRadarState] = useState<RadarState>('scanning');
  const [signalFound, setSignalFound] = useState(false);
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>('capstone');
  const [accessToken, setAccessToken] = useState('');
  const [studentDisplay, setStudentDisplay] = useState('Student');
  const [backendStatus, setBackendStatus] = useState('Connecting to backend...');
  const [bleTokenInput, setBleTokenInput] = useState('');
  const [lookupMessage, setLookupMessage] = useState('Paste a BLE token to validate the session.');
  const [resolvedBleToken, setResolvedBleToken] = useState('');
  const [resolvedBeaconMac, setResolvedBeaconMac] = useState<string | undefined>(undefined);
  const [checkinMessage, setCheckinMessage] = useState('');
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.4)).current;
  const signalCardTranslateY = useRef(new Animated.Value(34)).current;
  const signalCardOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseScale, {
            toValue: 1.2,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseScale, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOpacity, {
            toValue: 0.12,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.4,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    pulseLoop.start();
    return () => {
      pulseLoop.stop();
    };
  }, [pulseOpacity, pulseScale]);

  useEffect(() => {
    let cancelled = false;

    const initializeStudentConnection = async () => {
      const session = await readAuthSession();

      if (!session?.accessToken) {
        if (!cancelled) {
          setBackendStatus('Sign in first to enable live check-in with backend.');
        }
        return;
      }

      if (!cancelled) {
        setAccessToken(session.accessToken);
      }

      try {
        const profile = await fetchStudentProfile(session.accessToken);
        if (!cancelled) {
          setStudentDisplay(profile.fullName || profile.email || 'Student');
          setBackendStatus(`Connected as ${profile.email}`);
        }
      } catch (error) {
        if (!cancelled) {
          setBackendStatus(toErrorMessage(error));
        }
        return;
      }

      try {
        await registerStudentDevice(session.accessToken);
        if (!cancelled) {
          setBackendStatus('Device linked. Ready for secure check-in.');
        }
      } catch (error) {
        const message = toErrorMessage(error);
        if (cancelled) {
          return;
        }

        if (message.toLowerCase().includes('already registered')) {
          setBackendStatus('Device already linked. Ready for secure check-in.');
          return;
        }

        setBackendStatus(message);
      }
    };

    void initializeStudentConnection();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (activeTab !== 'radar' || radarState !== 'scanning') {
      return;
    }

    setSignalFound(false);
    signalCardTranslateY.setValue(34);
    signalCardOpacity.setValue(0);

    const timer = setTimeout(() => {
      setSignalFound(true);
      Animated.parallel([
        Animated.timing(signalCardTranslateY, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(signalCardOpacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start();
    }, 1700);

    return () => clearTimeout(timer);
  }, [activeTab, radarState, signalCardOpacity, signalCardTranslateY]);

  const handleOpenVerify = async () => {
    if (isCheckingIn) {
      return;
    }

    if (!accessToken) {
      setCheckinMessage('Session expired. Sign in again to check in.');
      return;
    }

    const trimmedToken = bleTokenInput.trim();
    if (!trimmedToken) {
      setCheckinMessage('Enter the BLE token before checking in.');
      return;
    }

    setCheckinMessage('');
    setLookupMessage('Validating BLE token...');

    try {
      const session = await lookupBleSession(accessToken, trimmedToken);
      setResolvedBleToken(session.bleToken);
      setResolvedBeaconMac(session.beaconMac ?? undefined);
      setLookupMessage(
        `Session active: ${session.courseCode ?? session.courseName ?? 'Course'} at ${session.venueCode ?? 'assigned venue'}.`
      );
      setRadarState('verify');
    } catch (error) {
      const message = toErrorMessage(error);
      setResolvedBleToken('');
      setResolvedBeaconMac(undefined);
      setLookupMessage(message);
      setCheckinMessage(message);
    }
  };

  const handleBiometricVerify = async () => {
    if (!accessToken || !resolvedBleToken || isCheckingIn) {
      setCheckinMessage('Validate a BLE token first, then retry.');
      setRadarState('scanning');
      return;
    }

    setIsCheckingIn(true);
    setCheckinMessage('Submitting attendance...');

    try {
      const result = await submitStudentCheckin(accessToken, {
        bleToken: resolvedBleToken,
        biometricPassed: true,
        biometricMethod: 'Fingerprint',
        rssiDbm: -61,
        rssiSamples: 4,
        txPowerDbm: -4,
        detectedBeaconMac: resolvedBeaconMac,
      });

      if (!result.success) {
        throw new Error(result.message || 'Backend rejected the check-in.');
      }

      const successMessage = result.message || 'Attendance recorded successfully.';
      setCheckinMessage(successMessage);
      setRadarState('success');
    } catch (error) {
      const message = toErrorMessage(error);
      setCheckinMessage(message);
      setRadarState('scanning');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleResetDemo = () => {
    setRadarState('scanning');
    setResolvedBleToken('');
    setResolvedBeaconMac(undefined);
    setCheckinMessage('');
    setLookupMessage('Paste a BLE token to validate the session.');
  };

  return (
    <View className="flex-1 bg-[#F6F8FC]">
      <View className="px-6 pb-3" style={{ paddingTop: insets.top + 12 }}>
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="font-inter-semibold text-[14px] text-[#6B768D]">Student Space</Text>
            <Text className="font-inter text-[11px] text-[#7985A3]">{studentDisplay}</Text>
          </View>
          <Pressable onPress={onExit}>
            <Text className="font-inter-semibold text-[13px] text-[#4762EA]">Exit Demo</Text>
          </Pressable>
        </View>
        <Text className="font-inter mt-2 text-[11px] text-[#5F6D86]">{backendStatus}</Text>
      </View>

      {activeTab === 'radar' && (
        <RadarPage
          radarState={radarState}
          signalFound={signalFound}
          isCheckingIn={isCheckingIn}
          checkinMessage={checkinMessage}
          bleTokenInput={bleTokenInput}
          onBleTokenChange={setBleTokenInput}
          lookupMessage={lookupMessage}
          pulseOpacity={pulseOpacity}
          pulseScale={pulseScale}
          signalCardOpacity={signalCardOpacity}
          signalCardTranslateY={signalCardTranslateY}
          onOpenVerify={() => void handleOpenVerify()}
          onResetDemo={handleResetDemo}
        />
      )}

      {activeTab === 'progress' && (
        <ProgressPage
          expandedModuleId={expandedModuleId}
          onExpandedModuleChange={setExpandedModuleId}
        />
      )}

      {activeTab === 'alerts' && <AlertsPage />}

      <StudentBottomNav
        activeTab={activeTab}
        bottomInset={insets.bottom}
        onTabChange={setActiveTab}
      />

      <BiometricVerifyModal
        visible={radarState === 'verify'}
        onVerify={() => void handleBiometricVerify()}
        onCancel={(errorMsg?: string) => {
          if (errorMsg) setCheckinMessage(errorMsg);
          setRadarState('scanning');
        }}
      />
    </View>
  );
}
