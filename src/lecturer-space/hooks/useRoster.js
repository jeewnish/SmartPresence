import { useQuery } from '@tanstack/react-query';
import { sessionApi } from '../../config/api';

/**
 * Fetches the roster for a given session ID.
 * @param {number | null} sessionId
 */
export function useRoster(sessionId) {
  return useQuery({
    queryKey: ['roster', sessionId],
    queryFn: () => sessionApi.getRoster(sessionId),
    enabled: !!sessionId,
    staleTime: 1000 * 30, // 30 seconds — real-time feel
  });
}
