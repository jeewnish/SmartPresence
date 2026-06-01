import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type StudentSpaceScreenProps = {
  onExit: () => void;
};

type StudentTab = 'radar' | 'progress' | 'alerts';
type RadarState = 'scanning' | 'verify' | 'success';

type ModuleStatus = 'good' | 'warning' | 'danger';

type ModuleCard = {
  id: string;
  title: string;
  attendanceRate: number;
  status: ModuleStatus;
  recentCheckIns: string[];
};

const moduleCards: ModuleCard[] = [
  {
    id: 'capstone',
    title: 'Capstone Project',
    attendanceRate: 92,
    status: 'good',
    recentCheckIns: [
      'May 30, 2026 09:02 AM - SRID 18A4 matched',
      'May 28, 2026 09:00 AM - SRID 18A4 matched',
      'May 26, 2026 09:05 AM - SRID 18A4 matched',
    ],
  },
  {
    id: 'cloud-computing',
    title: 'Cloud Computing',
    attendanceRate: 76,
    status: 'warning',
    recentCheckIns: ['May 29, 2026 11:03 AM - SRID 3F11 matched'],
  },
  {
    id: 'data-structures',
    title: 'Data Structures',
    attendanceRate: 58,
    status: 'danger',
    recentCheckIns: ['May 21, 2026 02:02 PM - SRID 1BAE matched'],
  },
];

const upcomingAlerts = [
  {
    id: 'upcoming-1',
    title: 'IS 4110 Capstone',
    detail: 'Starts in 10 minutes at Engineering Block A',
    time: 'Today, 8:50 AM',
  },
  {
    id: 'upcoming-2',
    title: 'Cloud Computing',
    detail: 'Starts tomorrow at 11:00 AM in Lab 2',
    time: 'Tomorrow, 10:00 AM',
  },
];

const missedAlerts = [
  {
    id: 'missed-1',
    title: 'Data Structures',
    detail: 'Check-in was not detected for Friday session',
    time: 'May 29, 2026',
  },
];

const statusColorMap: Record<ModuleStatus, string> = {
  good: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
};

const statusLabelMap: Record<ModuleStatus, string> = {
  good: 'Good Standing',
  warning: 'Warning',
  danger: 'At Risk',
};

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

  const screenBody = useMemo(() => {
    if (activeTab === 'radar') {
      if (radarState === 'success') {
        return (
          <View className="flex-1 items-center justify-center px-6">
            <View className="h-24 w-24 items-center justify-center rounded-full bg-[#EAF9EF]">
              <Ionicons name="checkmark" size={58} color="#16A34A" />
            </View>
            <Text className="font-inter-bold mt-8 text-center text-[24px] leading-[32px] text-[#122046]">
              Check-In Complete
            </Text>
            <Text className="font-inter mt-3 text-center text-[14px] leading-[22px] text-[#5F6C84]">
              Attendance validated and synced.
            </Text>
            <Pressable
              className="mt-10 w-full rounded-[18px] bg-[#4762EA] py-4"
              onPress={() => setRadarState('scanning')}>
              <Text className="font-inter-semibold text-center text-[16px] text-white">
                Reset Demo
              </Text>
            </Pressable>
          </View>
        );
      }

      return (
        <View className="flex-1 px-6 pt-6 pb-4">
          <Text className="font-inter-bold text-[26px] leading-[34px] text-[#101A39]">
            Live Radar
          </Text>
          <Text className="font-inter mt-2 text-[14px] leading-[22px] text-[#5E6A7A]">
            Scanning nearby BLE broadcasts for scheduled sessions.
          </Text>

          <View className="mt-12 items-center">
            <Animated.View
              className="absolute h-52 w-52 rounded-full bg-[#4C66EA]"
              style={{ opacity: pulseOpacity, transform: [{ scale: pulseScale }] }}
            />
            <View className="h-44 w-44 items-center justify-center rounded-full border border-[#D8DEEF] bg-[#EEF2FE]">
              <Ionicons name="radio" size={62} color="#4762EA" />
            </View>
            <Text className="font-inter-semibold mt-6 text-[15px] text-[#324C90]">Scanning...</Text>
          </View>

          <View className="mt-auto">
            {signalFound && (
              <Animated.View
                className="mb-4 rounded-[18px] border border-[#D7E1FF] bg-[#F3F6FF] px-4 py-4"
                style={{
                  opacity: signalCardOpacity,
                  transform: [{ translateY: signalCardTranslateY }],
                }}>
                <View className="flex-row items-start">
                  <View className="mt-1 h-3 w-3 rounded-full bg-[#22C55E]" />
                  <View className="ml-3 flex-1">
                    <Text className="font-inter-semibold text-[14px] text-[#22356B]">
                      Signal Found
                    </Text>
                    <Text className="font-inter mt-1 text-[12px] leading-[18px] text-[#556281]">
                      IS 4110 Capstone - Room A BLE broadcaster matched.
                    </Text>
                  </View>
                </View>
              </Animated.View>
            )}

            <Pressable
              className={`rounded-[18px] py-4 ${signalFound ? 'bg-[#4762EA]' : 'bg-[#B8C2E3]'}`}
              disabled={!signalFound}
              onPress={() => setRadarState('verify')}>
              <Text className="font-inter-semibold text-center text-[16px] text-white">
                Check In Now
              </Text>
            </Pressable>
          </View>
        </View>
      );
    }

    if (activeTab === 'progress') {
      return (
        <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 28 }}>
          <Text className="font-inter-bold text-[26px] leading-[34px] text-[#101A39]">
            Student Progress
          </Text>
          <Text className="font-inter mt-2 text-[14px] leading-[22px] text-[#5E6A7A]">
            Monitor attendance standing across all modules.
          </Text>

          <View className="mt-6 gap-4">
            {moduleCards.map((moduleCard) => {
              const statusColor = statusColorMap[moduleCard.status];
              const isExpanded = expandedModuleId === moduleCard.id;

              return (
                <View
                  key={moduleCard.id}
                  className="rounded-[18px] border border-[#E4E8F0] bg-white px-4 py-4">
                  <Pressable
                    className="flex-row items-center"
                    onPress={() =>
                      setExpandedModuleId((current) =>
                        current === moduleCard.id ? null : moduleCard.id
                      )
                    }>
                    <View className="flex-1">
                      <Text className="font-inter-semibold text-[15px] text-[#17254B]">
                        {moduleCard.title}
                      </Text>
                      <Text className="font-inter mt-1 text-[12px]" style={{ color: statusColor }}>
                        {statusLabelMap[moduleCard.status]}
                      </Text>
                    </View>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={22}
                      color="#7A869F"
                    />
                  </Pressable>

                  <View className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#E9EDF5]">
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${moduleCard.attendanceRate}%`,
                        backgroundColor: statusColor,
                      }}
                    />
                  </View>
                  <Text className="font-inter mt-2 text-[12px] text-[#5F6D86]">
                    {moduleCard.attendanceRate}% attendance
                  </Text>

                  {isExpanded && (
                    <View className="mt-4 border-t border-[#EDF1F6] pt-3">
                      {moduleCard.recentCheckIns.map((entry) => (
                        <Text
                          key={entry}
                          className="font-inter mb-2 text-[12px] leading-[18px] text-[#5F6D86]">
                          {entry}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
      );
    }

    return (
      <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 28 }}>
        <Text className="font-inter-bold text-[26px] leading-[34px] text-[#101A39]">Alerts</Text>
        <Text className="font-inter mt-2 text-[14px] leading-[22px] text-[#5E6A7A]">
          Stay on top of upcoming classes and missed sessions.
        </Text>

        <Text className="font-inter-semibold mt-6 text-[14px] text-[#384A70]">Upcoming</Text>
        <View className="mt-3 gap-3">
          {upcomingAlerts.map((alert) => (
            <View
              key={alert.id}
              className="rounded-[16px] border border-[#DDE6FF] bg-[#F3F7FF] px-4 py-4">
              <Text className="font-inter-semibold text-[14px] text-[#1E3770]">{alert.title}</Text>
              <Text className="font-inter mt-1 text-[12px] leading-[18px] text-[#5D6A84]">
                {alert.detail}
              </Text>
              <Text className="font-inter mt-2 text-[11px] text-[#7280A0]">{alert.time}</Text>
            </View>
          ))}
        </View>

        <Text className="font-inter-semibold mt-6 text-[14px] text-[#384A70]">Missed</Text>
        <View className="mt-3 gap-3">
          {missedAlerts.map((alert) => (
            <View
              key={alert.id}
              className="rounded-[16px] border border-[#FFD9D9] bg-[#FFF5F5] px-4 py-4">
              <Text className="font-inter-semibold text-[14px] text-[#8F2630]">{alert.title}</Text>
              <Text className="font-inter mt-1 text-[12px] leading-[18px] text-[#7A4E55]">
                {alert.detail}
              </Text>
              <Text className="font-inter mt-2 text-[11px] text-[#9A6B73]">{alert.time}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  }, [
    activeTab,
    expandedModuleId,
    pulseOpacity,
    pulseScale,
    radarState,
    signalCardOpacity,
    signalCardTranslateY,
    signalFound,
  ]);

  const tabTextColor = (tab: StudentTab) => (activeTab === tab ? '#4762EA' : '#8B95A7');

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

      {screenBody}

      <View
        className="border-t border-[#E3E8F2] bg-white px-2"
        style={{ paddingBottom: Math.max(insets.bottom, 12), paddingTop: 8 }}>
        <View className="flex-row">
          <Pressable className="flex-1 items-center py-2" onPress={() => setActiveTab('radar')}>
            <Ionicons
              name={activeTab === 'radar' ? 'radio' : 'radio-outline'}
              size={23}
              color={tabTextColor('radar')}
            />
            <Text
              className="font-inter-semibold mt-1 text-[11px]"
              style={{ color: tabTextColor('radar') }}>
              Radar
            </Text>
          </Pressable>

          <Pressable className="flex-1 items-center py-2" onPress={() => setActiveTab('progress')}>
            <Ionicons
              name={activeTab === 'progress' ? 'stats-chart' : 'stats-chart-outline'}
              size={23}
              color={tabTextColor('progress')}
            />
            <Text
              className="font-inter-semibold mt-1 text-[11px]"
              style={{ color: tabTextColor('progress') }}>
              Progress
            </Text>
          </Pressable>

          <Pressable className="flex-1 items-center py-2" onPress={() => setActiveTab('alerts')}>
            <Ionicons
              name={activeTab === 'alerts' ? 'notifications' : 'notifications-outline'}
              size={23}
              color={tabTextColor('alerts')}
            />
            <Text
              className="font-inter-semibold mt-1 text-[11px]"
              style={{ color: tabTextColor('alerts') }}>
              Alerts
            </Text>
          </Pressable>
        </View>
      </View>

      <Modal transparent visible={radarState === 'verify'} animationType="fade">
        <View className="flex-1 items-center justify-center bg-[rgba(12,19,40,0.65)] px-6">
          <View className="w-full rounded-[22px] bg-white px-6 py-7">
            <Text className="font-inter-semibold text-center text-[21px] leading-[30px] text-[#101B3A]">
              Biometric Verification
            </Text>
            <Text className="font-inter mt-3 text-center text-[14px] leading-[22px] text-[#647085]">
              Verify identity to complete attendance check-in.
            </Text>
            <View className="mt-5 items-center">
              <Ionicons name="finger-print" size={48} color="#4762EA" />
            </View>

            <Pressable
              className="mt-7 rounded-[16px] bg-[#4762EA] py-4"
              onPress={() => setRadarState('success')}>
              <Text className="font-inter-semibold text-center text-[15px] text-white">
                Verify with Biometrics
              </Text>
            </Pressable>
            <Pressable className="mt-3 py-2" onPress={() => setRadarState('scanning')}>
              <Text className="font-inter-semibold text-center text-[14px] text-[#60708D]">
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
