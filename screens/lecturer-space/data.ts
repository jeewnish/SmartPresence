import {
  LiveCheckIn,
  RosterFilter,
  SessionRecord,
  StudentRecord,
  UpcomingSession,
} from './types';

export const initialRoster: StudentRecord[] = [
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

export const pastSessions: SessionRecord[] = [
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

export const upcomingSessions: UpcomingSession[] = [
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

export const mockCheckIns: LiveCheckIn[] = [
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

export const rosterFilters: { key: RosterFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'present', label: 'Present' },
  { key: 'absent', label: 'Absent' },
  { key: 'flagged', label: 'Flagged' },
];
