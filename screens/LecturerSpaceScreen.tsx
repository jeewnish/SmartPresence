import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type LecturerSpaceScreenProps = {
  onExit: () => void;
};

type LecturerTab = 'broadcast' | 'roster' | 'history';
type RosterFilter = 'all' | 'present' | 'absent' | 'flagged';
type HistoryTab = 'past' | 'upcoming';

type StudentRecord = {
  id: string;
  name: string;
  studentId: string;
  present: boolean;
  flagged?: string;
};

type SessionRecord = {
  id: string;
  date: string;
  time: string;
  room: string;
  completion: number;
};

type UpcomingSession = {
  id: string;
  title: string;
  date: string;
  time: string;
  room: string;
};

type LiveCheckIn = {
  id: string;
  name: string;
  time: string;
  verification: string;
};

const initialRoster: StudentRecord[] = [
  { id: 'st-1', name: 'Alicia Perera', studentId: 'SP-22014', present: true },
  { id: 'st-2', name: 'Brian Fernando', studentId: 'SP-22019', present: true },
  {
    id: 'st-3',
    name: 'Charlie Davis',
    studentId: 'SP-22022',
    present: false,
    flagged: 'Device mismatch - linked phone changed on May 30, 2026.',
  },
  { id: 'st-4', name: 'Dinuka Ranasinghe', studentId: 'SP-22028', present: false },
  { id: 'st-5', name: 'Esha Jayawardena', studentId: 'SP-22031', present: false },
  { id: 'st-6', name: 'Farhan Ismail', studentId: 'SP-22037', present: true },
];

const pastSessions: SessionRecord[] = [
  {
    id: 'ps-1',
    date: 'May 29, 2026',
    time: '9:00 AM',
    room: 'Engineering A-03',
    completion: 90,
  },
  {
    id: 'ps-2',
    date: 'May 27, 2026',
    time: '9:00 AM',
    room: 'Engineering A-03',
    completion: 86,
  },
  {
    id: 'ps-3',
    date: 'May 22, 2026',
    time: '9:00 AM',
    room: 'Engineering A-03',
    completion: 93,
  },
];

const upcomingSessions: UpcomingSession[] = [
  {
    id: 'up-1',
    title: 'IS 4110 Capstone',
    date: 'June 03, 2026',
    time: '9:00 AM',
    room: 'Engineering A-03',
  },
  {
    id: 'up-2',
    title: 'IS 4110 Capstone',
    date: 'June 05, 2026',
    time: '9:00 AM',
    room: 'Engineering A-03',
  },
  {
    id: 'up-3',
    title: 'IS 4110 Capstone',
    date: 'June 10, 2026',
    time: '9:00 AM',
    room: 'Engineering A-03',
  },
];

const mockCheckIns: LiveCheckIn[] = [
  {
    id: 'ci-1',
    name: 'Alicia Perera',
    time: '9:02 AM',
    verification: 'Touch ID verified',
  },
  {
    id: 'ci-2',
    name: 'Brian Fernando',
    time: '9:03 AM',
    verification: 'Touch ID verified',
  },
  {
    id: 'ci-3',
    name: 'Farhan Ismail',
    time: '9:05 AM',
    verification: 'Touch ID verified',
  },
  {
    id: 'ci-4',
    name: 'Charlie Davis',
    time: '9:07 AM',
    verification: 'Face ID verified',
  },
];

const rosterFilters: { key: RosterFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'present', label: 'Present' },
  { key: 'absent', label: 'Absent' },
  { key: 'flagged', label: 'Flagged' },
];

export function LecturerSpaceScreen({ onExit }: LecturerSpaceScreenProps) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<LecturerTab>('broadcast');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [liveFeed, setLiveFeed] = useState<LiveCheckIn[]>([]);
  const [feedIndex, setFeedIndex] = useState(0);
  const [studentRoster, setStudentRoster] = useState(initialRoster);
  const [searchQuery, setSearchQuery] = useState('');
  const [rosterFilter, setRosterFilter] = useState<RosterFilter>('all');
  const [historyTab, setHistoryTab] = useState<HistoryTab>('past');

  useEffect(() => {
    if (!isBroadcasting) {
      return;
    }

    if (feedIndex >= mockCheckIns.length) {
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

  const tabColor = (tab: LecturerTab) => (activeTab === tab ? '#3C5AE8' : '#8993A7');

  const liveCount = liveFeed.length;

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
        <View className="flex-1 px-6 pb-4">
          <Text className="font-inter-bold text-[26px] leading-[34px] text-[#101A39]">
            Broadcast
          </Text>
          <Text className="font-inter mt-2 text-[14px] leading-[22px] text-[#5E6A7A]">
            Start BLE attendance broadcasting for the current lecture.
          </Text>

          <View className="mt-6 rounded-[20px] border border-[#DCE3F5] bg-[#ECF1FF] px-5 py-5">
            <Text className="font-inter-semibold text-[13px] text-[#314B8F]">Next Up</Text>
            <Text className="font-inter-bold mt-2 text-[20px] text-[#11204A]">
              IS 4110 Capstone
            </Text>
            <Text className="font-inter mt-2 text-[13px] text-[#5A6B8E]">9:00 AM - 10:30 AM</Text>
            <Text className="font-inter mt-1 text-[13px] text-[#5A6B8E]">Engineering A-03</Text>
            <Text className="font-inter mt-1 text-[13px] text-[#5A6B8E]">36 students enrolled</Text>
          </View>

          <View className="mt-10 items-center">
            <Pressable
              className={`h-52 w-52 items-center justify-center rounded-full ${isBroadcasting ? 'bg-[#E44141]' : 'bg-[#3F5EEA]'}`}
              onPress={isBroadcasting ? stopBroadcast : startBroadcast}>
              <Ionicons name={isBroadcasting ? 'stop' : 'play'} size={56} color="#FFFFFF" />
              <Text className="font-inter-bold mt-2 text-[28px] text-white">
                {isBroadcasting ? 'STOP' : 'START'}
              </Text>
            </Pressable>
            <Text className="font-inter mt-4 text-[13px] text-[#5F6D86]">
              {isBroadcasting
                ? 'Broadcast active. Tap to finalize session attendance.'
                : 'Tap start to activate Bluetooth broadcasting.'}
            </Text>
          </View>

          {isBroadcasting && (
            <View className="mt-auto rounded-t-[24px] border border-[#DBE3F7] bg-white px-5 pt-5 pb-6">
              <View className="flex-row items-center justify-between">
                <Text className="font-inter-semibold text-[15px] text-[#1C2F63]">Live Monitor</Text>
                <View className="rounded-full bg-[#E8EEFF] px-3 py-1">
                  <Text className="font-inter-semibold text-[12px] text-[#3250C5]">
                    {liveCount} checked in
                  </Text>
                </View>
              </View>

              <ScrollView className="mt-4" showsVerticalScrollIndicator={false}>
                {liveFeed.length === 0 && (
                  <View className="rounded-[14px] border border-[#E6EBF7] bg-[#F9FAFE] px-4 py-4">
                    <Text className="font-inter text-[12px] text-[#697A99]">
                      Waiting for students to verify attendance...
                    </Text>
                  </View>
                )}

                {liveFeed.map((entry) => (
                  <View
                    key={entry.id}
                    className="mb-3 rounded-[14px] border border-[#E3E9F7] bg-[#F7F9FF] px-4 py-3">
                    <View className="flex-row items-center justify-between">
                      <Text className="font-inter-semibold text-[13px] text-[#203662]">
                        {entry.name}
                      </Text>
                      <Text className="font-inter text-[11px] text-[#7280A0]">{entry.time}</Text>
                    </View>
                    <Text className="font-inter mt-1 text-[12px] text-[#596A8D]">
                      {entry.verification}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      )}

      {activeTab === 'roster' && (
        <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 22 }}>
          <Text className="font-inter-bold text-[26px] leading-[34px] text-[#101A39]">
            Class Roster
          </Text>
          <Text className="font-inter mt-2 text-[14px] leading-[22px] text-[#5E6A7A]">
            Manage attendance manually and review security flags.
          </Text>

          <View className="mt-5 flex-row items-center rounded-[16px] border border-[#D9DFEC] bg-white px-4 py-3">
            <Ionicons name="search" size={20} color="#8390A8" />
            <TextInput
              className="font-inter ml-2 flex-1 text-[14px] text-[#1A2B45]"
              placeholder="Search by name or student ID"
              placeholderTextColor="#95A1B5"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
            {rosterFilters.map((filter) => {
              const selected = rosterFilter === filter.key;
              return (
                <Pressable
                  key={filter.key}
                  className={`mr-3 rounded-full px-4 py-2 ${selected ? 'bg-[#3C5AE8]' : 'bg-[#E9EDF7]'}`}
                  onPress={() => setRosterFilter(filter.key)}>
                  <Text
                    className="font-inter-semibold text-[12px]"
                    style={{ color: selected ? '#FFFFFF' : '#51617F' }}>
                    {filter.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View className="mt-5 gap-3">
            {filteredRoster.map((student) => (
              <View
                key={student.id}
                className="rounded-[16px] border border-[#E4E8F0] bg-white px-4 py-4">
                <View className="flex-row items-center">
                  <View className="flex-1">
                    <Text className="font-inter-semibold text-[14px] text-[#15264C]">
                      {student.name}
                    </Text>
                    <Text className="font-inter mt-1 text-[12px] text-[#61708A]">
                      {student.studentId}
                    </Text>
                  </View>
                  <Switch
                    value={student.present}
                    onValueChange={(nextValue) => toggleManualAttendance(student.id, nextValue)}
                    trackColor={{ false: '#CAD2E2', true: '#8CA2FF' }}
                    thumbColor={student.present ? '#3F5EEA' : '#FFFFFF'}
                  />
                </View>

                {student.flagged && (
                  <View className="mt-3 rounded-[12px] border border-[#FFD4D4] bg-[#FFF3F3] px-3 py-3">
                    <View className="flex-row items-start">
                      <Ionicons name="warning" size={16} color="#CC3A3A" />
                      <Text className="font-inter ml-2 flex-1 text-[12px] leading-[18px] text-[#A33A3A]">
                        {student.flagged}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            ))}

            {filteredRoster.length === 0 && (
              <View className="rounded-[16px] border border-[#E2E8F4] bg-white px-4 py-5">
                <Text className="font-inter text-[13px] text-[#6B7892]">
                  No students match this search/filter combination.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {activeTab === 'history' && (
        <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 22 }}>
          <Text className="font-inter-bold text-[26px] leading-[34px] text-[#101A39]">
            Schedule & History
          </Text>
          <Text className="font-inter mt-2 text-[14px] leading-[22px] text-[#5E6A7A]">
            Review completed sessions and plan upcoming lectures.
          </Text>

          <View className="mt-5 flex-row rounded-[14px] bg-[#E8EDF8] p-1">
            <Pressable
              className={`flex-1 rounded-[11px] py-2 ${historyTab === 'past' ? 'bg-white' : ''}`}
              onPress={() => setHistoryTab('past')}>
              <Text
                className="font-inter-semibold text-center text-[13px]"
                style={{ color: historyTab === 'past' ? '#2F4CC2' : '#667794' }}>
                Past Sessions
              </Text>
            </Pressable>
            <Pressable
              className={`flex-1 rounded-[11px] py-2 ${historyTab === 'upcoming' ? 'bg-white' : ''}`}
              onPress={() => setHistoryTab('upcoming')}>
              <Text
                className="font-inter-semibold text-center text-[13px]"
                style={{ color: historyTab === 'upcoming' ? '#2F4CC2' : '#667794' }}>
                Upcoming
              </Text>
            </Pressable>
          </View>

          {historyTab === 'past' && (
            <View className="mt-5 gap-3">
              {pastSessions.map((session) => (
                <View
                  key={session.id}
                  className="rounded-[16px] border border-[#E3E8F4] bg-white px-4 py-4">
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="font-inter-semibold text-[14px] text-[#142750]">
                        {session.date}
                      </Text>
                      <Text className="font-inter mt-1 text-[12px] text-[#64748F]">
                        {session.time} - {session.room}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Text className="font-inter-bold text-[16px] text-[#1A336E]">
                        {session.completion}%
                      </Text>
                      <Ionicons name="chevron-forward" size={18} color="#7A86A0" />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {historyTab === 'upcoming' && (
            <View className="mt-5 gap-3">
              {upcomingSessions.map((session) => (
                <View
                  key={session.id}
                  className="rounded-[16px] border border-[#DDE6FF] bg-[#F3F6FF] px-4 py-4">
                  <Text className="font-inter-semibold text-[14px] text-[#1F3770]">
                    {session.title}
                  </Text>
                  <Text className="font-inter mt-2 text-[12px] text-[#5E6C88]">
                    {session.date} - {session.time}
                  </Text>
                  <Text className="font-inter mt-1 text-[12px] text-[#5E6C88]">{session.room}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      <View
        className="border-t border-[#E3E8F2] bg-white px-2"
        style={{ paddingBottom: Math.max(insets.bottom, 12), paddingTop: 8 }}>
        <View className="flex-row">
          <Pressable className="flex-1 items-center py-2" onPress={() => setActiveTab('broadcast')}>
            <Ionicons
              name={activeTab === 'broadcast' ? 'radio' : 'radio-outline'}
              size={22}
              color={tabColor('broadcast')}
            />
            <Text
              className="font-inter-semibold mt-1 text-[11px]"
              style={{ color: tabColor('broadcast') }}>
              Broadcast
            </Text>
          </Pressable>

          <Pressable className="flex-1 items-center py-2" onPress={() => setActiveTab('roster')}>
            <Ionicons
              name={activeTab === 'roster' ? 'people' : 'people-outline'}
              size={22}
              color={tabColor('roster')}
            />
            <Text
              className="font-inter-semibold mt-1 text-[11px]"
              style={{ color: tabColor('roster') }}>
              Roster
            </Text>
          </Pressable>

          <Pressable className="flex-1 items-center py-2" onPress={() => setActiveTab('history')}>
            <Ionicons
              name={activeTab === 'history' ? 'time' : 'time-outline'}
              size={22}
              color={tabColor('history')}
            />
            <Text
              className="font-inter-semibold mt-1 text-[11px]"
              style={{ color: tabColor('history') }}>
              History
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
