import { useQuery } from '@tanstack/react-query';
import { analyticsApi, courseApi } from '../../config/api';

/**
 * Returns the lecturer's own courses from GET /courses/my
 */
export function useMyCourses() {
  return useQuery({
    queryKey: ['courses', 'my'],
    queryFn: courseApi.getMyCourses,
    staleTime: 1000 * 60 * 5,
  });
}

export function useLecturerHistory() {
  return useQuery({
    queryKey: ['lecturers', 'history'],
    queryFn: analyticsApi.getLecturerHistory,
    staleTime: 1000 * 60,
  });
}
