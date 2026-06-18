import { useState } from 'react';
import { sessionApi } from '../../config/api';

/**
 * Manages the active broadcast session state.
 * Returns { activeSession, isBroadcasting, startSession, stopSession, loading, error }
 */
export function useSession() {
  const [activeSession, setActiveSession] = useState(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const startSession = async (courseId) => {
    setLoading(true);
    setError(null);
    try {
      const session = await sessionApi.start({ courseId });
      setActiveSession(session);
      setIsBroadcasting(true);
      return session;
    } catch (e) {
      const msg = e?.response?.data?.message ?? 'Failed to start session';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const stopSession = async () => {
    if (!activeSession?.id) return;
    setLoading(true);
    setError(null);
    try {
      const session = await sessionApi.end(activeSession.id);
      setActiveSession(session);
      setIsBroadcasting(false);
      return session;
    } catch (e) {
      const msg = e?.response?.data?.message ?? 'Failed to end session';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  return {
    activeSession,
    isBroadcasting,
    startSession,
    stopSession,
    loading,
    error,
  };
}
