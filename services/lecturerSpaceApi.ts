import { backendBaseUrl, backendEndpoints } from '../constants/backend';

type BackendEnvelope<T> = {
  success: boolean;
  message: string | null;
  data: T;
};

export type LecturerProfile = {
  userId: number;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  keycloakSubject?: string | null;
  tokenExpiresAt?: string | null;
};

export type LecturerCourse = {
  courseId: number;
  courseCode: string;
  courseName: string;
};

type SessionCourse = {
  courseId: number;
  courseCode: string;
  courseName: string;
};

type SessionVenue = {
  venueId: number;
  venueCode?: string | null;
  venueName?: string | null;
  beaconMac?: string | null;
};

export type SessionStatus = 'SCHEDULED' | 'ACTIVE' | 'ENDED' | 'FORCE_ENDED';

export type LecturerSession = {
  sessionId: number;
  course: SessionCourse;
  venue?: SessionVenue | null;
  status: SessionStatus;
  startedAt?: string | null;
  endedAt?: string | null;
  scheduledDurationMinutes?: number | null;
  bleToken?: string | null;
  bleTokenExpiresAt?: string | null;
};

export type AttendanceStatus = 'PRESENT' | 'LATE' | 'MANUAL_OVERRIDE' | 'ABSENT';

type AttendanceStudent = {
  userId: number;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  indexNumber?: string | null;
};

export type AttendanceRecord = {
  recordId: number;
  student: AttendanceStudent;
  status: AttendanceStatus;
  bleVerified: boolean;
  biometricVerified: boolean;
  deviceVerified: boolean;
  checkedInAt?: string | null;
  isManualOverride?: boolean;
  overrideReason?: string | null;
};

export type BleSessionPayload = {
  sessionId: number;
  courseCode?: string | null;
  courseName?: string | null;
  venueCode?: string | null;
  beaconMac?: string | null;
  bleToken: string;
  tokenExpiresAt?: string | null;
  sessionActive: boolean;
  rotationCount?: number | null;
};

type StartSessionPayload = {
  courseId: number;
  venueId?: number;
  durationMinutes?: number;
};

type ManualOverridePayload = {
  studentId: number;
  newStatus: AttendanceStatus;
  reason: string;
};

function getAuthHeader(accessToken: string): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

async function parseBackendResponse<T>(response: Response): Promise<T> {
  const rawText = await response.text();
  const hasBody = rawText.trim().length > 0;

  if (!response.ok) {
    if (!hasBody) {
      throw new Error(`Backend ${response.status}: Request failed.`);
    }

    try {
      const parsed = JSON.parse(rawText) as { message?: string };
      const message = parsed.message?.trim();
      throw new Error(`Backend ${response.status}: ${message || 'Request failed.'}`);
    } catch {
      throw new Error(`Backend ${response.status}: ${rawText}`);
    }
  }

  if (!hasBody) {
    return undefined as T;
  }

  const parsed = JSON.parse(rawText) as BackendEnvelope<T> | T;
  if (
    typeof parsed === 'object' &&
    parsed !== null &&
    'success' in parsed &&
    typeof parsed.success === 'boolean'
  ) {
    const envelope = parsed as BackendEnvelope<T>;
    if (!envelope.success) {
      throw new Error(envelope.message || 'Backend request was rejected.');
    }
    return envelope.data;
  }

  return parsed as T;
}

async function safeFetch<T>(url: string, init: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, init);
  } catch {
    throw new Error('Unable to reach backend service. Check backend host and port settings.');
  }

  return parseBackendResponse<T>(response);
}

export async function fetchLecturerProfile(accessToken: string): Promise<LecturerProfile> {
  return safeFetch<LecturerProfile>(backendEndpoints.me, {
    method: 'GET',
    headers: {
      ...getAuthHeader(accessToken),
    },
  });
}

export async function fetchLecturerCourses(accessToken: string): Promise<LecturerCourse[]> {
  return safeFetch<LecturerCourse[]>(`${backendBaseUrl}/courses/my-courses`, {
    method: 'GET',
    headers: {
      ...getAuthHeader(accessToken),
    },
  });
}

export async function fetchLecturerActiveSessions(accessToken: string): Promise<LecturerSession[]> {
  return safeFetch<LecturerSession[]>(`${backendBaseUrl}/sessions/my-active`, {
    method: 'GET',
    headers: {
      ...getAuthHeader(accessToken),
    },
  });
}

export async function startLecturerSession(
  accessToken: string,
  payload: StartSessionPayload
): Promise<LecturerSession> {
  return safeFetch<LecturerSession>(`${backendBaseUrl}/sessions/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(accessToken),
    },
    body: JSON.stringify(payload),
  });
}

export async function endLecturerSession(accessToken: string, sessionId: number): Promise<void> {
  await safeFetch<void>(`${backendBaseUrl}/sessions/${sessionId}/end`, {
    method: 'POST',
    headers: {
      ...getAuthHeader(accessToken),
    },
  });
}

export async function fetchSessionAttendance(
  accessToken: string,
  sessionId: number
): Promise<AttendanceRecord[]> {
  return safeFetch<AttendanceRecord[]>(`${backendBaseUrl}/sessions/${sessionId}/attendance`, {
    method: 'GET',
    headers: {
      ...getAuthHeader(accessToken),
    },
  });
}

export async function fetchSessionBleToken(
  accessToken: string,
  sessionId: number
): Promise<BleSessionPayload> {
  return safeFetch<BleSessionPayload>(`${backendBaseUrl}/ble/session/${sessionId}/token`, {
    method: 'GET',
    headers: {
      ...getAuthHeader(accessToken),
    },
  });
}

export async function manualOverrideAttendance(
  accessToken: string,
  sessionId: number,
  payload: ManualOverridePayload
): Promise<AttendanceRecord> {
  return safeFetch<AttendanceRecord>(`${backendBaseUrl}/sessions/${sessionId}/override`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(accessToken),
    },
    body: JSON.stringify(payload),
  });
}
