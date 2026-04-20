export type HealthState = 'GREEN' | 'YELLOW' | 'RED'
export type Severity = 'LOW' | 'MEDIUM' | 'HIGH'
export type UserRole = 'Student' | 'Lecturer' | 'Admin'

export interface AttendancePoint {
  day: string
  percentage: number
}

export interface KPIStat {
  label: string
  value: string
  trend?: {
    direction: 'up' | 'down'
    value: string
  }
}

export interface SystemHealth {
  overall: HealthState
  beaconHealth: HealthState
  database: HealthState
  websocket: HealthState
}

export interface ActiveSession {
  id: string
  courseCode: string
  courseName: string
  lecturer: string
  venue: string
  startedAt: string
  elapsedMinutes: number
  checkIns: number
  expected: number
  tokenRotationCount: number
}

export interface SessionLog {
  id: string
  timestamp: string
  studentName: string
  indexNo: string
  rssi: number
  estimatedDistance: string
  blePassed: boolean
  biometricPassed: boolean
  devicePassed: boolean
  failureReason?: string
}

export interface ActivityEvent {
  id: string
  message: string
  time: string
}

export interface Alert {
  id: string
  studentName: string
  indexNo: string
  type: string
  severity: Severity
  time: string
  description: string
  resolved: boolean
}

export interface UserAccount {
  id: string
  indexNo: string
  fullName: string
  email: string
  department: string
  enrollmentYear?: number
  status: 'Active' | 'Suspended'
  lastLogin: string
  role: UserRole
  deviceFingerprint: string
  deviceModel: string
  deviceOS: string
  faceIdEnrolled: boolean
  fingerprintEnrolled: boolean
  recentAttendance: Array<{
    course: string
    date: string
    status: 'Present' | 'Late' | 'Absent'
  }>
}

export interface Course {
  id: string
  code: string
  name: string
  department: string
  credits: number
  semester: string
  lecturer: string
  attendanceHealth: number
}

export interface VenueBeacon {
  id: string
  venueCode: string
  venueName: string
  buildingFloor: string
  beaconMac: string
  rssiThreshold: number
  batteryPercent: number
  lastHeartbeat: string
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE'
  heartbeatHistory: Array<{
    time: string
    signal: number
  }>
}

export interface Enrollment {
  courseId: string
  students: Array<{
    id: string
    indexNo: string
    fullName: string
    department: string
  }>
}

export interface AuditLog {
  id: string
  actor: string
  action: string
  entity: string
  changes: string
  timestamp: string
}

export interface NotificationItem {
  id: string
  text: string
  time: string
  unread: boolean
}
