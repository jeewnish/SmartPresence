import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mockCheckIns, initialRoster } from './data';
import { LecturerBottomNav } from './components/LecturerBottomNav';
import { BroadcastPage } from './pages/BroadcastPage';
import { HistoryPage } from './pages/HistoryPage';
import { RosterPage } from './pages/RosterPage';
import { HistoryTab, LecturerSpaceScreenProps, LecturerTab, LiveCheckIn, RosterFilter, StudentRecord } from './types';

export function LecturerSpaceScreen({ onExit }: LecturerSpaceScreenProps) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<LecturerTab>('broadcast');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [liveFeed, setLiveFeed] = useState<LiveCheckIn[]>([]);
  const [feedIndex, setFeedIndex] = useState(0);
  const [studentRoster, setStudentRoster] = useState<StudentRecord[]>(initialRoster);
  const [searchQuery, setSearchQuery] = useState('');
  const [rosterFilter, setRosterFilter] = useState<RosterFilter>('all');
  const [historyTab, setHistoryTab] = useState<HistoryTab>('past');

  useEffect(() => {
    if (!isBroadcasting || feedIndex >= mockCheckIns.length) {
      return;
    }

    const interval = setInterval(() => {
      setLiveFeed((current) => {
        const nextEntry = mockCheckIns[feedIndex];
        setFeedIndex((previous) => previous + 1);
        return [nextEntry, ...current];
      });
    }, 1800);

    return () => clearInterval(interval);
  }, [feedIndex, isBroadcasting]);

  const startBroadcast = () => {
    setIsBroadcasting(true);
    setLiveFeed([]);
    setFeedIndex(0);
  };

  const stopBroadcast = () => {
    setIsBroadcasting(false);
  };

  const toggleManualAttendance = (id: string, nextValue: boolean) => {
    setStudentRoster((current) =>
      current.map((student) => (student.id === id ? { ...student, present: nextValue } : student))
    );
  };

  const filteredRoster = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return studentRoster.filter((student) => {
      const matchesSearch =
        normalizedQuery.length === 0 ||
        student.name.toLowerCase().includes(normalizedQuery) ||
        student.studentId.toLowerCase().includes(normalizedQuery);

      if (!matchesSearch) {
        return false;
      }

      if (rosterFilter === 'present') {
        return student.present;
      }

      if (rosterFilter === 'absent') {
        return !student.present;
      }

      if (rosterFilter === 'flagged') {
        return Boolean(student.flagged);
      }

      return true;
    });
  }, [rosterFilter, searchQuery, studentRoster]);

  return (
    <View className="flex-1 bg-[#F6F8FC]">
      <View className="px-6 pb-3" style={{ paddingTop: insets.top + 12 }}>
        <View className="flex-row items-center justify-between">
          <Text className="font-inter-semibold text-[14px] text-[#6B768D]">Lecturer Portal</Text>
          <Pressable onPress={onExit}>
            <Text className="font-inter-semibold text-[13px] text-[#4762EA]">Exit Demo</Text>
          </Pressable>
        </View>
      </View>

      {activeTab === 'broadcast' && (
        <BroadcastPage
          isBroadcasting={isBroadcasting}
          liveFeed={liveFeed}
          onStartBroadcast={startBroadcast}
          onStopBroadcast={stopBroadcast}
        />
      )}

      {activeTab === 'roster' && (
        <RosterPage
          searchQuery={searchQuery}
          rosterFilter={rosterFilter}
          filteredRoster={filteredRoster}
          onSearchQueryChange={setSearchQuery}
          onFilterChange={setRosterFilter}
          onToggleManualAttendance={toggleManualAttendance}
        />
      )}

      {activeTab === 'history' && (
        <HistoryPage historyTab={historyTab} onHistoryTabChange={setHistoryTab} />
      )}

      <LecturerBottomNav activeTab={activeTab} bottomInset={insets.bottom} onTabChange={setActiveTab} />
    </View>
  );
}
