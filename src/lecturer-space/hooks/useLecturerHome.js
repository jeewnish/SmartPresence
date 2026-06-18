import { useQuery } from '@tanstack/react-query';
import { courseApi } from '../../config/api';

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
