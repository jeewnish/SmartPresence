import { useQuery } from '@tanstack/react-query';
import { activityApi, analyticsApi } from '../../config/api';

export function useStudentProgress() {
  return useQuery({
    queryKey: ['students', 'me', 'progress'],
    queryFn: analyticsApi.getMyProgress,
    staleTime: 1000 * 60 * 2,
  });
}

export function useStudentAttendanceHistory() {
  return useQuery({
    queryKey: ['students', 'me', 'attendance-history'],
    queryFn: activityApi.getStudentAttendance,
    staleTime: 1000 * 60,
  });
}
