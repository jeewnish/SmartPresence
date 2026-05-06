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
  attendanceId: number
  studentName: string
  indexNumber: string
  status: 'PRESENT' | 'LATE' | 'ABSENT'
  checkedInAt: string | null
}

export const sessionsApi = {
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
