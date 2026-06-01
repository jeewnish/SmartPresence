export type LecturerSpaceScreenProps = {
  onExit: () => void;
};

export type LecturerTab = 'broadcast' | 'roster' | 'history';
export type RosterFilter = 'all' | 'present' | 'absent' | 'flagged';
export type HistoryTab = 'past' | 'upcoming';

export type StudentRecord = {
  id: string;
  name: string;
  studentId: string;
  present: boolean;
  flagged?: string;
};

export type SessionRecord = {
  id: string;
  date: string;
  time: string;
  room: string;
  completion: number;
};

export type UpcomingSession = {
  id: string;
  title: string;
  date: string;
  time: string;
  room: string;
};

export type LiveCheckIn = {
  id: string;
  name: string;
  time: string;
  verification: string;
};
