import { ModuleCard, ModuleStatus } from './types';

export const moduleCards: ModuleCard[] = [
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

export const upcomingAlerts = [
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

export const missedAlerts = [
  {
    id: 'missed-1',
    title: 'Data Structures',
    detail: 'Check-in was not detected for Friday session',
    time: 'May 29, 2026',
  },
];

export const statusColorMap: Record<ModuleStatus, string> = {
  good: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
};

export const statusLabelMap: Record<ModuleStatus, string> = {
  good: 'Good Standing',
  warning: 'Warning',
  danger: 'At Risk',
};
