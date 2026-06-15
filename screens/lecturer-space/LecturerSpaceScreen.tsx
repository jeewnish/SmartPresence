import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { readAuthSession } from '../../services/tokenStorage';
import {
  AttendanceRecord,
  LecturerCourse,
  LecturerSession,
  endLecturerSession,
  fetchLecturerActiveSessions,
  fetchLecturerCourses,
  fetchLecturerProfile,
  fetchSessionAttendance,
  fetchSessionBleToken,
  manualOverrideAttendance,
  startLecturerSession,
} from '../../services/lecturerSpaceApi';
import { pastSessions as fallbackPastSessions, upcomingSessions as fallbackUpcomingSessions } from './data';
import { LecturerBottomNav } from './components/LecturerBottomNav';
import { BroadcastPage } from './pages/BroadcastPage';
import { HistoryPage } from './pages/HistoryPage';
import { RosterPage } from './pages/RosterPage';
import {
  BroadcastSummary,
  HistoryTab,
  LecturerSpaceScreenProps,
  LecturerTab,
  LiveCheckIn,
  RosterFilter,
  StudentRecord,
} from './types';

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  return 'Unexpected backend error. Please try again.';
}

function toStudentName(record: AttendanceRecord): string {
  if (record.student.fullName && record.student.fullName.trim().length > 0) {
    return record.student.fullName.trim();
  }

  const composed = `${record.student.firstName ?? ''} ${record.student.lastName ?? ''}`.trim();
  if (composed.length > 0) {
    return composed;
  }

  return record.student.email || 'Student';
}

function formatClock(isoDateTime: string | null | undefined): string {
  if (!isoDateTime) {
    return 'Now';
  }

  const parsed = new Date(isoDateTime);
  if (Number.isNaN(parsed.getTime())) {
    return 'Now';
  }

  return parsed.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function mapAttendanceToRoster(records: AttendanceRecord[]): StudentRecord[] {
  return records.map((record) => {
    const warningParts: string[] = [];
    if (!record.bleVerified) warningParts.push('BLE not verified.');
    if (!record.biometricVerified) warningParts.push('Biometric not verified.');
    if (!record.deviceVerified) warningParts.push('Registered device not verified.');
    if (record.overrideReason) warningParts.push(`Note: ${record.overrideReason}`);

    const present = ['PRESENT', 'LATE', 'MANUAL_OVERRIDE'].includes(record.status);

    return {
      id: `st-${record.student.userId}`,
      userId: record.student.userId,
      name: toStudentName(record),
      studentId: record.student.indexNumber || `ID-${record.student.userId}`,
      present,
      flagged: warningParts.length > 0 ? warningParts.join(' ') : undefined,
    };
  });
}

function mapAttendanceToLiveFeed(records: AttendanceRecord[]): LiveCheckIn[] {
  return records.map((record) => {
    const verification = record.isManualOverride
      ? 'Manual override by lecturer'
      : record.bleVerified && record.biometricVerified && record.deviceVerified
        ? 'BLE + biometric + device verified'
        : 'Partially verified check-in';

    return {
      id: `ci-${record.recordId}`,
      name: toStudentName(record),
      time: formatClock(record.checkedInAt),
      verification,
    };
  });
}

function buildBroadcastSummary(
  activeSession: LecturerSession | null,
  courses: LecturerCourse[],
  rosterCount: number
): BroadcastSummary {
  if (activeSession) {
    const startedAt = formatClock(activeSession.startedAt);
    const duration = activeSession.scheduledDurationMinutes ?? 90;
    const room = activeSession.venue?.venueName || activeSession.venue?.venueCode || 'Assigned venue';

    return {
      title: `${activeSession.course.courseCode} ${activeSession.course.courseName}`,
      time: `${startedAt} - ${duration} min`,
      room,
      enrolledText: `${Math.max(rosterCount, 0)} students checked in`,
    };
  }

  if (courses.length > 0) {
    const nextCourse = courses[0];
    return {
      title: `${nextCourse.courseCode} ${nextCourse.courseName}`,
      time: 'Ready to start a new live session',
      room: 'Venue assigned when session starts',
      enrolledText: `${courses.length} assigned course${courses.length === 1 ? '' : 's'}`,
    };
  }

  return {
    title: 'No assigned courses',
    time: 'Ask an admin to assign a course',
    room: 'Venue unavailable',
    enrolledText: '0 assigned courses',
  };
}

export function LecturerSpaceScreen({ onExit }: LecturerSpaceScreenProps) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<LecturerTab>('broadcast');
  const [accessToken, setAccessToken] = useState('');
  const [lecturerName, setLecturerName] = useState('Lecturer');
  const [backendStatus, setBackendStatus] = useState('Connecting to backend...');
  const [courses, setCourses] = useState<LecturerCourse[]>([]);
  const [activeSession, setActiveSession] = useState<LecturerSession | null>(null);
  const [isWorking, setIsWorking] = useState(false);
  const [broadcastToken, setBroadcastToken] = useState('');
  const [liveFeed, setLiveFeed] = useState<LiveCheckIn[]>([]);
  const [studentRoster, setStudentRoster] = useState<StudentRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [rosterFilter, setRosterFilter] = useState<RosterFilter>('all');
  const [historyTab, setHistoryTab] = useState<HistoryTab>('past');

  const isBroadcasting = activeSession !== null;

  const refreshSessionData = useCallback(async (token: string, sessionId: number) => {
    const attendance = await fetchSessionAttendance(token, sessionId);
    setStudentRoster(mapAttendanceToRoster(attendance));
    setLiveFeed(mapAttendanceToLiveFeed(attendance));

    try {
      const tokenPayload = await fetchSessionBleToken(token, sessionId);
      setBroadcastToken(tokenPayload.bleToken);
    } catch {
      setBroadcastToken('');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const initializeLecturerConnection = async () => {
      const session = await readAuthSession();

      if (!session?.accessToken) {
        if (!cancelled) {
          setBackendStatus('Sign in first to connect Lecturer Space with backend.');
        }
        return;
      }

      if (!cancelled) {
        setAccessToken(session.accessToken);
      }

      try {
        const profile = await fetchLecturerProfile(session.accessToken);
        if (cancelled) {
          return;
        }

        setLecturerName(profile.fullName || profile.email || 'Lecturer');
        if (profile.role !== 'LECTURER') {
          setBackendStatus(`Signed in as ${profile.role}. Lecturer role is required for this screen.`);
          return;
        }

        setBackendStatus(`Connected as ${profile.email}`);
      } catch (error) {
        if (!cancelled) {
          setBackendStatus(toErrorMessage(error));
        }
        return;
      }

      try {
        const [assignedCourses, sessions] = await Promise.all([
          fetchLecturerCourses(session.accessToken),
          fetchLecturerActiveSessions(session.accessToken),
        ]);

        if (cancelled) {
          return;
        }

        setCourses(assignedCourses);

        const current = sessions[0] ?? null;
        setActiveSession(current);

        if (current) {
          await refreshSessionData(session.accessToken, current.sessionId);
          if (!cancelled) {
            setBackendStatus('Active session restored from backend.');
          }
        } else {
          setBackendStatus(
            assignedCourses.length > 0
              ? 'Ready to start broadcasting.'
              : 'No assigned courses found for this lecturer.'
          );
        }
      } catch (error) {
        if (!cancelled) {
          setBackendStatus(toErrorMessage(error));
        }
      }
    };

    void initializeLecturerConnection();

    return () => {
      cancelled = true;
    };
  }, [refreshSessionData]);

  useEffect(() => {
    if (!accessToken || !activeSession) {
      return;
    }

    const timer = setInterval(() => {
      void refreshSessionData(accessToken, activeSession.sessionId);
    }, 5000);

    return () => clearInterval(timer);
  }, [accessToken, activeSession, refreshSessionData]);

  const startBroadcast = async () => {
    if (!accessToken || isWorking) {
      return;
    }

    if (courses.length === 0) {
      setBackendStatus('Cannot start session. No assigned course found.');
      return;
    }

    setIsWorking(true);
    try {
      const created = await startLecturerSession(accessToken, {
        courseId: courses[0].courseId,
        durationMinutes: 90,
      });

      setActiveSession(created);
      await refreshSessionData(accessToken, created.sessionId);
      setBackendStatus('Broadcast started and syncing live attendance.');
    } catch (error) {
      setBackendStatus(toErrorMessage(error));
    } finally {
      setIsWorking(false);
    }
  };

  const stopBroadcast = async () => {
    if (!accessToken || !activeSession || isWorking) {
      return;
    }

    setIsWorking(true);
    try {
      await endLecturerSession(accessToken, activeSession.sessionId);
      setActiveSession(null);
      setBroadcastToken('');
      setLiveFeed([]);
      setStudentRoster([]);
      setBackendStatus('Broadcast ended.');
    } catch (error) {
      setBackendStatus(toErrorMessage(error));
    } finally {
      setIsWorking(false);
    }
  };

  const toggleManualAttendance = async (id: string, nextValue: boolean) => {
    if (!accessToken || !activeSession) {
      setBackendStatus('Start a broadcast session before applying manual attendance changes.');
      return;
    }

    const target = studentRoster.find((student) => student.id === id);
    if (!target?.userId) {
      setBackendStatus('This record cannot be updated because the student ID is unavailable.');
      return;
    }

    setIsWorking(true);
    try {
      await manualOverrideAttendance(accessToken, activeSession.sessionId, {
        studentId: target.userId,
        newStatus: nextValue ? 'MANUAL_OVERRIDE' : 'ABSENT',
        reason: 'Updated from lecturer mobile UI.',
      });
      await refreshSessionData(accessToken, activeSession.sessionId);
      setBackendStatus('Manual attendance update saved.');
    } catch (error) {
      setBackendStatus(toErrorMessage(error));
    } finally {
      setIsWorking(false);
    }
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

  const nextBroadcast = useMemo(
    () => buildBroadcastSummary(activeSession, courses, filteredRoster.length),
    [activeSession, courses, filteredRoster.length]
  );

  const broadcastStatus = useMemo(() => {
    if (isBroadcasting && broadcastToken) {
      return `Live token: ${broadcastToken}`;
    }
    return backendStatus;
  }, [backendStatus, broadcastToken, isBroadcasting]);

  return (
    <View className="flex-1 bg-[#F6F8FC]">
      <View className="px-6 pb-3" style={{ paddingTop: insets.top + 12 }}>
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="font-inter-semibold text-[14px] text-[#6B768D]">Lecturer Portal</Text>
            <Text className="font-inter text-[11px] text-[#7985A3]">{lecturerName}</Text>
          </View>
          <Pressable onPress={onExit}>
            <Text className="font-inter-semibold text-[13px] text-[#4762EA]">Exit Demo</Text>
          </Pressable>
        </View>
        <Text className="font-inter mt-2 text-[11px] text-[#5F6D86]">{backendStatus}</Text>
      </View>

      {activeTab === 'broadcast' && (
        <BroadcastPage
          isBroadcasting={isBroadcasting}
          liveFeed={liveFeed}
          nextBroadcast={nextBroadcast}
          statusMessage={broadcastStatus}
          isBusy={isWorking}
          onStartBroadcast={() => void startBroadcast()}
          onStopBroadcast={() => void stopBroadcast()}
        />
      )}

      {activeTab === 'roster' && (
        <RosterPage
          searchQuery={searchQuery}
          rosterFilter={rosterFilter}
          filteredRoster={filteredRoster}
          onSearchQueryChange={setSearchQuery}
          onFilterChange={setRosterFilter}
          onToggleManualAttendance={(id, nextValue) => void toggleManualAttendance(id, nextValue)}
        />
      )}

      {activeTab === 'history' && (
        <HistoryPage
          historyTab={historyTab}
          pastSessions={fallbackPastSessions}
          upcomingSessions={fallbackUpcomingSessions}
          onHistoryTabChange={setHistoryTab}
        />
      )}

      <LecturerBottomNav activeTab={activeTab} bottomInset={insets.bottom} onTabChange={setActiveTab} />
    </View>
  );
}
