import { apiRequest } from './client'

export interface DashboardKpi {
  totalActiveStudents: number
  todayAvgAttendancePct: number
  activeSessionsNow: number
  openSecurityFlags: number
}

export interface ActiveSession {
  sessionId: number
  courseCode: string
  courseName: string
  lecturerName: string
  venueName: string
  venueCode: string
  startedAt: string
  elapsedMinutes: number
  remainingMinutes: number
  studentsCheckedIn: number
}

export interface AlertItem {
  flagId: number
  flagType: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH'
  studentName: string
  indexNumber: string
  courseCode: string
  description: string
  flaggedAt: string
}

export const dashboardApi = {
  getKpis: () => apiRequest<DashboardKpi>('/dashboard/kpis'),
  getActiveSessions: () => apiRequest<ActiveSession[]>('/dashboard/active-sessions'),
  getAlerts: () => apiRequest<AlertItem[]>('/dashboard/alerts'),
}
