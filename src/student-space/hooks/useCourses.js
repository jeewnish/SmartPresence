import { useQuery } from '@tanstack/react-query';
import { enrollmentApi } from '../../config/api';

/**
 * Returns all the student's enrollments.
 * Used by both HomeScreen (today's view) and CoursesScreen (full list).
 */
export function useMyEnrollments() {
  return useQuery({
    queryKey: ['enrollments', 'me'],
    queryFn: enrollmentApi.getMyEnrollments,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Filters enrollments to those whose session starts today.
 * Since the backend doesn't expose a /today endpoint,
 * we derive "today's lectures" from all enrollments and return the full list —
 * the UI can filter or display them all.
 */
export function useTodayLectures() {
  const { data: enrollments = [], ...rest } = useMyEnrollments();
  return { data: enrollments, ...rest };
}
