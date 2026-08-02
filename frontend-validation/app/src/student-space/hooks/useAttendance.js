import { useState } from 'react';
import { attendanceApi } from '../../config/api';
import { getDeviceIdentity } from '../../services/deviceIdentity';

/**
 * Handles the 3-step attendance check-in flow:
 *   1. POST /attendance/challenge  (with deviceId + sessionId)
 *   2. POST /attendance/token       (with challenge)
 *   3. POST /attendance/check-in    (with BLE token + attendance token)
 *
 * Returns { checkIn, loading, error, success }
 */
export function useAttendanceCheckIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const checkIn = async ({ sessionId, token, rssi, timestamp }) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { deviceId } = await getDeviceIdentity();

      // Step 1: Request a challenge
      const challengeRes = await attendanceApi.challenge({ deviceId, sessionId });

      // Step 2: Exchange challenge for attendance token
      // (biometric proof is handled by expo-local-authentication before calling this)
      const tokenRes = await attendanceApi.token({
        challenge: challengeRes.challenge,
      });

      // Step 3: Submit check-in
      const result = await attendanceApi.checkIn({
        sessionId,
        timestamp,
        token,
        rssi,
        deviceId,
        attendanceToken: tokenRes.attendanceToken,
      });

      setSuccess(result);
      return result;
    } catch (e) {
      const msg =
        e?.response?.data?.message ?? e?.message ?? 'Check-in failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  return { checkIn, loading, error, success };
}
