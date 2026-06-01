import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertsPage } from './pages/AlertsPage';
import { ProgressPage } from './pages/ProgressPage';
import { RadarPage } from './pages/RadarPage';
import { BiometricVerifyModal } from './components/BiometricVerifyModal';
import { StudentBottomNav } from './components/StudentBottomNav';
import { RadarState, StudentSpaceScreenProps, StudentTab } from './types';

export function StudentSpaceScreen({ onExit }: StudentSpaceScreenProps) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<StudentTab>('radar');
  const [radarState, setRadarState] = useState<RadarState>('scanning');
  const [signalFound, setSignalFound] = useState(false);
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>('capstone');

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

  return (
    <View className="flex-1 bg-[#F6F8FC]">
      <View className="px-6 pb-3" style={{ paddingTop: insets.top + 12 }}>
        <View className="flex-row items-center justify-between">
          <Text className="font-inter-semibold text-[14px] text-[#6B768D]">Student Space</Text>
          <Pressable onPress={onExit}>
            <Text className="font-inter-semibold text-[13px] text-[#4762EA]">Exit Demo</Text>
          </Pressable>
        </View>
      </View>

      {activeTab === 'radar' && (
        <RadarPage
          radarState={radarState}
          signalFound={signalFound}
          pulseOpacity={pulseOpacity}
          pulseScale={pulseScale}
          signalCardOpacity={signalCardOpacity}
          signalCardTranslateY={signalCardTranslateY}
          onOpenVerify={() => setRadarState('verify')}
          onResetDemo={() => setRadarState('scanning')}
        />
      )}

      {activeTab === 'progress' && (
        <ProgressPage
          expandedModuleId={expandedModuleId}
          onExpandedModuleChange={setExpandedModuleId}
        />
      )}

      {activeTab === 'alerts' && <AlertsPage />}

      <StudentBottomNav activeTab={activeTab} bottomInset={insets.bottom} onTabChange={setActiveTab} />

      <BiometricVerifyModal
        visible={radarState === 'verify'}
        onVerify={() => setRadarState('success')}
        onCancel={() => setRadarState('scanning')}
      />
    </View>
  );
}
