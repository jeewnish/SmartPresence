import type {
  ActiveSession,
  ActivityEvent,
  Alert,
  AttendancePoint,
  AuditLog,
  Course,
  Enrollment,
  KPIStat,
  NotificationItem,
  SessionLog,
  SystemHealth,
  UserAccount,
  VenueBeacon,
} from '../types/models'

export const kpis: KPIStat[] = [
  {
    label: 'Total Active Students',
    value: '2,482',
    trend: { direction: 'up', value: '+4.3% this week' },
  },
  {
    label: "Today's Average Attendance",
    value: '86.7%',
    trend: { direction: 'up', value: '+1.8% vs yesterday' },
  },
  {
    label: 'Active Sessions Right Now',
    value: '12',
    trend: { direction: 'up', value: '+2 from last hour' },
  },
  {
    label: 'Open Security Flags',
    value: '5',
    trend: { direction: 'down', value: '-3 resolved today' },
  },
]

export const sparklineAttendance = [83, 85, 86, 84, 88, 87, 89, 90, 88]

export const systemHealth: SystemHealth = {
  overall: 'YELLOW',
  beaconHealth: 'GREEN',
  database: 'GREEN',
  websocket: 'YELLOW',
}

export const weeklyAttendance: AttendancePoint[] = [
  { day: 'Mon', percentage: 84 },
  { day: 'Tue', percentage: 85 },
  { day: 'Wed', percentage: 87 },
  { day: 'Thu', percentage: 86 },
  { day: 'Fri', percentage: 90 },
  { day: 'Sat', percentage: 81 },
  { day: 'Sun', percentage: 83 },
]

export const activeSessions: ActiveSession[] = [
  {
    id: 'SES-2403',
    courseCode: 'CIS402',
    courseName: 'Distributed Systems',
    lecturer: 'Dr. M. Perera',
    venue: 'Room 402',
    startedAt: '08:15',
    elapsedMinutes: 42,
    checkIns: 56,
    expected: 72,
    tokenRotationCount: 6,
  },
  {
    id: 'SES-2407',
    courseCode: 'SE305',
    courseName: 'Software Architecture',
    lecturer: 'Ms. A. Silva',
    venue: 'A-Block 105',
    startedAt: '09:00',
    elapsedMinutes: 18,
    checkIns: 39,
    expected: 46,
    tokenRotationCount: 2,
  },
  {
    id: 'SES-2410',
    courseCode: 'CS210',
    courseName: 'Algorithms II',
    lecturer: 'Prof. N. Jayasekara',
    venue: 'Lab L2',
    startedAt: '09:10',
    elapsedMinutes: 11,
    checkIns: 28,
    expected: 41,
    tokenRotationCount: 1,
  },
  {
    id: 'SES-2412',
    courseCode: 'IS201',
    courseName: 'Information Security',
    lecturer: 'Dr. R. Fernando',
    venue: 'Room 308',
    startedAt: '09:20',
    elapsedMinutes: 8,
    checkIns: 21,
    expected: 34,
    tokenRotationCount: 1,
  },
]

export const anomalyAlerts: Alert[] = [
  {
    id: 'AL-1001',
    studentName: 'John Doe',
    indexNo: '22CIS0272',
    type: 'Device mismatch',
    severity: 'HIGH',
    time: '09:18',
    description: 'Fingerprint changed from previously registered profile.',
    resolved: false,
  },
  {
    id: 'AL-1002',
    studentName: 'Nimali Dias',
    indexNo: '21CIS0145',
    type: 'Low RSSI anomaly',
    severity: 'MEDIUM',
    time: '09:11',
    description: 'RSSI fluctuated outside expected threshold near doorway.',
    resolved: false,
  },
  {
    id: 'AL-1003',
    studentName: 'Kasun Wijesinghe',
    indexNo: '20CIS0028',
    type: 'Face verification failed',
    severity: 'HIGH',
    time: '08:59',
    description: 'Three consecutive biometric checks failed.',
    resolved: false,
  },
  {
    id: 'AL-1004',
    studentName: 'Sajini Herath',
    indexNo: '22CIS0310',
    type: 'Late check-in burst',
    severity: 'LOW',
    time: '08:54',
    description: 'Multiple near-simultaneous retries from same endpoint.',
    resolved: false,
  },
]

export const checkInTicker = [
  'John Doe (22CIS0272) - FaceID - Room 402 - RSSI -62 dBm',
  'Amila Perera (21CIS0331) - Fingerprint - Lab L2 - RSSI -69 dBm',
  'Nethmi Silva (22CIS0409) - FaceID - A-Block 105 - RSSI -65 dBm',
  'Ravindu Kumar (20CIS0118) - FaceID - Room 308 - RSSI -60 dBm',
]

export const users: UserAccount[] = [
  {
    id: 'USR-001',
    indexNo: '22CIS0272',
    fullName: 'John Doe',
    email: 'john.doe@smartpresence.edu',
    department: 'Computing',
    enrollmentYear: 2022,
    status: 'Active',
    lastLogin: '2026-04-21 09:20',
    role: 'Student',
    deviceFingerprint: 'A9:12:C4:8F:22:E1',
    deviceModel: 'Samsung S23',
    deviceOS: 'Android 15',
    faceIdEnrolled: true,
    fingerprintEnrolled: true,
    recentAttendance: [
      { course: 'CIS402', date: '2026-04-20', status: 'Present' },
      { course: 'SE305', date: '2026-04-18', status: 'Late' },
      { course: 'CS210', date: '2026-04-17', status: 'Present' },
    ],
  },
  {
    id: 'USR-002',
    indexNo: '22CIS0310',
    fullName: 'Sajini Herath',
    email: 'sajini.herath@smartpresence.edu',
    department: 'Computing',
    enrollmentYear: 2022,
    status: 'Suspended',
    lastLogin: '2026-04-20 16:12',
    role: 'Student',
    deviceFingerprint: 'C2:44:11:DD:AA:3B',
    deviceModel: 'iPhone 15',
    deviceOS: 'iOS 19',
    faceIdEnrolled: true,
    fingerprintEnrolled: false,
    recentAttendance: [
      { course: 'IS201', date: '2026-04-20', status: 'Absent' },
      { course: 'SE305', date: '2026-04-18', status: 'Present' },
      { course: 'CIS402', date: '2026-04-16', status: 'Present' },
    ],
  },
  {
    id: 'USR-003',
    indexNo: 'LEC-015',
    fullName: 'Dr. M. Perera',
    email: 'm.perera@smartpresence.edu',
    department: 'Computing',
    status: 'Active',
    lastLogin: '2026-04-21 08:05',
    role: 'Lecturer',
    deviceFingerprint: 'LEC:11:44:19:00:AA',
    deviceModel: 'MacBook Pro M4',
    deviceOS: 'macOS 16',
    faceIdEnrolled: false,
    fingerprintEnrolled: false,
    recentAttendance: [
      { course: 'CIS402', date: '2026-04-20', status: 'Present' },
      { course: 'CS210', date: '2026-04-19', status: 'Present' },
      { course: 'SE305', date: '2026-04-17', status: 'Present' },
    ],
  },
  {
    id: 'USR-004',
    indexNo: 'ADM-001',
    fullName: 'Admin User',
    email: 'admin@smartpresence.edu',
    department: 'Administration',
    status: 'Active',
    lastLogin: '2026-04-21 09:25',
    role: 'Admin',
    deviceFingerprint: 'ADM:88:20:19:AA:09',
    deviceModel: 'ThinkPad X1',
    deviceOS: 'Windows 12',
    faceIdEnrolled: false,
    fingerprintEnrolled: true,
    recentAttendance: [
      { course: 'OPS', date: '2026-04-20', status: 'Present' },
      { course: 'OPS', date: '2026-04-19', status: 'Present' },
      { course: 'OPS', date: '2026-04-18', status: 'Present' },
    ],
  },
]

export const courses: Course[] = [
  {
    id: 'CRS-001',
    code: 'CIS402',
    name: 'Distributed Systems',
    department: 'Computing',
    credits: 3,
    semester: 'Level 4 / Semester 2',
    lecturer: 'Dr. M. Perera',
    attendanceHealth: 89,
  },
  {
    id: 'CRS-002',
    code: 'SE305',
    name: 'Software Architecture',
    department: 'Software Engineering',
    credits: 4,
    semester: 'Level 3 / Semester 1',
    lecturer: 'Ms. A. Silva',
    attendanceHealth: 82,
  },
  {
    id: 'CRS-003',
    code: 'CS210',
    name: 'Algorithms II',
    department: 'Computer Science',
    credits: 3,
    semester: 'Level 2 / Semester 2',
    lecturer: 'Prof. N. Jayasekara',
    attendanceHealth: 77,
  },
]

export const venueBeacons: VenueBeacon[] = [
  {
    id: 'VEN-01',
    venueCode: 'R402',
    venueName: 'Room 402',
    buildingFloor: 'Main / 4F',
    beaconMac: '84:CC:A8:12:90:3D',
    rssiThreshold: -72,
    batteryPercent: 92,
    lastHeartbeat: '09:25:19',
    status: 'ONLINE',
    heartbeatHistory: [
      { time: '09:20', signal: -66 },
      { time: '09:21', signal: -65 },
      { time: '09:22', signal: -67 },
      { time: '09:23', signal: -66 },
      { time: '09:24', signal: -65 },
    ],
  },
  {
    id: 'VEN-02',
    venueCode: 'LAB-L2',
    venueName: 'Lab L2',
    buildingFloor: 'Tech / 2F',
    beaconMac: '84:CC:A8:14:AB:91',
    rssiThreshold: -70,
    batteryPercent: 46,
    lastHeartbeat: '09:24:47',
    status: 'DEGRADED',
    heartbeatHistory: [
      { time: '09:20', signal: -75 },
      { time: '09:21', signal: -78 },
      { time: '09:22', signal: -76 },
      { time: '09:23', signal: -80 },
      { time: '09:24', signal: -77 },
    ],
  },
  {
    id: 'VEN-03',
    venueCode: 'A105',
    venueName: 'A-Block 105',
    buildingFloor: 'A-Block / 1F',
    beaconMac: '84:CC:A8:00:19:4F',
    rssiThreshold: -74,
    batteryPercent: 15,
    lastHeartbeat: '09:12:03',
    status: 'OFFLINE',
    heartbeatHistory: [
      { time: '09:20', signal: -90 },
      { time: '09:21', signal: -92 },
      { time: '09:22', signal: -93 },
      { time: '09:23', signal: -95 },
      { time: '09:24', signal: -96 },
    ],
  },
]

export const enrollments: Enrollment[] = [
  {
    courseId: 'CRS-001',
    students: [
      {
        id: 'USR-001',
        indexNo: '22CIS0272',
        fullName: 'John Doe',
        department: 'Computing',
      },
      {
        id: 'USR-002',
        indexNo: '22CIS0310',
        fullName: 'Sajini Herath',
        department: 'Computing',
      },
    ],
  },
  {
    courseId: 'CRS-002',
    students: [
      {
        id: 'USR-001',
        indexNo: '22CIS0272',
        fullName: 'John Doe',
        department: 'Computing',
      },
    ],
  },
]

export const sessionLogs: Record<string, SessionLog[]> = {
  'SES-2403': [
    {
      id: 'LOG-1001',
      timestamp: '09:21:03',
      studentName: 'John Doe',
      indexNo: '22CIS0272',
      rssi: -62,
      estimatedDistance: '1.2m',
      blePassed: true,
      biometricPassed: true,
      devicePassed: true,
    },
    {
      id: 'LOG-1002',
      timestamp: '09:21:22',
      studentName: 'Kasun Wijesinghe',
      indexNo: '20CIS0028',
      rssi: -88,
      estimatedDistance: '7.8m',
      blePassed: false,
      biometricPassed: false,
      devicePassed: true,
      failureReason: 'BLE out of threshold and biometric mismatch',
    },
    {
      id: 'LOG-1003',
      timestamp: '09:22:10',
      studentName: 'Nimali Dias',
      indexNo: '21CIS0145',
      rssi: -69,
      estimatedDistance: '2.7m',
      blePassed: true,
      biometricPassed: true,
      devicePassed: false,
      failureReason: 'Unrecognized device fingerprint',
    },
  ],
}

export const activityEvents: Record<string, ActivityEvent[]> = {
  'SES-2403': [
    { id: 'EV-01', message: 'Token rotated automatically', time: '09:22:00' },
    { id: 'EV-02', message: 'Manual lecturer override rejected', time: '09:20:54' },
    { id: 'EV-03', message: 'New beacon handshake acknowledged', time: '09:19:31' },
    { id: 'EV-04', message: '31 students checked in within 10 mins', time: '09:18:47' },
  ],
}

export const notifications: NotificationItem[] = [
  {
    id: 'NT-1',
    text: 'Beacon LAB-L2 battery dropped below threshold.',
    time: '1m ago',
    unread: true,
  },
  {
    id: 'NT-2',
    text: '2 new unresolved security anomalies detected.',
    time: '4m ago',
    unread: true,
  },
  {
    id: 'NT-3',
    text: 'Attendance summary for CIS402 generated.',
    time: '12m ago',
    unread: false,
  },
]

export const auditLogs: AuditLog[] = [
  {
    id: 'AUD-01',
    actor: 'Admin User',
    action: 'UPDATE_THRESHOLD',
    entity: 'BLE_CONFIG',
    changes: '{"rssiThreshold":{"old":-75,"new":-72}}',
    timestamp: '2026-04-21 09:10:42',
  },
  {
    id: 'AUD-02',
    actor: 'Admin User',
    action: 'SUSPEND_ACCOUNT',
    entity: 'USER:USR-002',
    changes: '{"status":{"old":"Active","new":"Suspended"}}',
    timestamp: '2026-04-21 08:48:10',
  },
  {
    id: 'AUD-03',
    actor: 'Dr. M. Perera',
    action: 'ROTATE_TOKEN',
    entity: 'SESSION:SES-2403',
    changes: '{"tokenVersion":{"old":41,"new":42}}',
    timestamp: '2026-04-21 08:43:03',
  },
]
