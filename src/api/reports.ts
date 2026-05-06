import { apiRequest } from './client'

export interface ReportRow {
  [key: string]: string | number | boolean | null
}

export interface SecurityFlag {
  flagId: number
  flagType: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH'
  description: string
  flaggedAt: string
  resolved: boolean
  resolvedAt: string | null
  resolutionNote: string | null
  user: {
    userId: number
    firstName: string
    lastName: string
    indexNumber: string | null
  }
  session?: {
    sessionId: number
    courseCode: string
    courseName: string
  }
}

export interface SecurityFlagPage {
  content: SecurityFlag[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export const reportsApi = {
  courseAttendance: (params: { courseId: number; from: string; to: string }) =>
    apiRequest<ReportRow[]>('/reports/course-attendance', { params }),

  studentSummary: (params: { courseId: number; from: string; to: string }) =>
    apiRequest<ReportRow[]>('/reports/student-summary', { params }),

  securityAnomalies: (params: { from: string; to: string }) =>
    apiRequest<SecurityFlag[]>('/reports/security-anomalies', { params }),
}

export const securityFlagsApi = {
  getOpen: (params?: { page?: number; size?: number }) =>
    apiRequest<SecurityFlagPage>('/security-flags/open', { params }),

  resolve: (flagId: number, note: string) =>
    apiRequest<SecurityFlag>(`/security-flags/${flagId}/resolve`, {
      method: 'PATCH',
      params: { note },
    }),

  getByStudent: (studentId: number) =>
    apiRequest<SecurityFlag[]>(`/security-flags/student/${studentId}`),
}
