import { apiRequest } from './client'

export interface ApiSession {
  sessionId: number
  courseCode: string
  courseName: string
  lecturerName: string
  venueName: string
  status: 'ACTIVE' | 'ENDED' | 'FORCE_ENDED'
  startedAt: string
  endedAt: string | null
  durationMinutes: number
}

export interface AttendanceRecord {
  attendanceId?: number
  recordId?: number
  student?: {
    userId: number
    firstName: string
    lastName: string
    indexNumber: string | null
  }
  studentName: string
  indexNumber: string
  status: 'PRESENT' | 'LATE' | 'MANUAL_OVERRIDE' | 'ABSENT'
  checkedInAt: string | null
}

export const sessionsApi = {
  start: (payload: { courseId: number; venueId?: number; durationMinutes: number }) =>
    apiRequest<ApiSession>('/sessions/start', {
      method: 'POST',
      body: payload,
    }),

  end: (sessionId: number) =>
    apiRequest<ApiSession>(`/sessions/${sessionId}/end`, {
      method: 'POST',
    }),

  forceEnd: (sessionId: number, reason: string) =>
    apiRequest<ApiSession>(`/sessions/${sessionId}/force-end`, {
      method: 'POST',
      params: { reason },
    }),

  getAttendance: (sessionId: number) =>
    apiRequest<AttendanceRecord[]>(`/sessions/${sessionId}/attendance`),

  manualOverride: (
    sessionId: number,
    payload: { studentId: number; reason: string; newStatus: string },
  ) =>
    apiRequest(`/sessions/${sessionId}/override`, {
      method: 'POST',
      body: payload,
    }),
}
