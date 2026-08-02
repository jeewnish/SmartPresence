import axios from 'axios';

// Base URL from .env — use 10.0.2.2 for Android emulator (maps to host localhost)
const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

if (!BASE_URL) {
  throw new Error('Missing EXPO_PUBLIC_API_BASE_URL environment variable.');
}

export const apiClient = axios.create({
  baseURL: BASE_URL.replace(/\/+$/, ''),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

/**
 * Attach a Clerk JWT token to every request.
 * Call this once in the root navigator after the user signs in.
 *
 * Safe to call multiple times: the Axios client owns one permanent
 * interceptor and this function only replaces the token getter it uses.
 *
 * @param {() => Promise<string | null>} getToken - Clerk's getToken function
 */
let authTokenProvider = null;
const AUTH_TOKEN_TIMEOUT_MS = 8000;

function withTimeout(promise, timeoutMs, message) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

export function setAuthTokenProvider(getToken) {
  authTokenProvider = typeof getToken === 'function' ? getToken : null;
}

apiClient.interceptors.request.use(async (config) => {
  if (!authTokenProvider) {
    return config;
  }

  try {
    const token = await withTimeout(
      authTokenProvider(),
      AUTH_TOKEN_TIMEOUT_MS,
      'Clerk token retrieval timed out'
    );
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.warn('Could not attach Clerk token:', error?.message ?? error);
    throw new Error(
      'Your Clerk session token is unavailable. Sign out, then sign in again.'
    );
  }
  return config;
});

// ─── User ────────────────────────────────────────────────────────────────────
export const userApi = {
  /** GET /users/me */
  getMe: () => apiClient.get('/users/me').then((r) => r.data),
  /** POST /users/onboard */
  onboard: (body) => apiClient.post('/users/onboard', body).then((r) => r.data),
};

// ─── Courses ─────────────────────────────────────────────────────────────────
export const courseApi = {
  /** GET /courses/my  (Lecturer) */
  getMyCourses: () => apiClient.get('/courses/my').then((r) => r.data),
  /** GET /courses */
  getAll: () => apiClient.get('/courses').then((r) => r.data),
  /** GET /courses/:id */
  getById: (id) => apiClient.get(`/courses/${id}`).then((r) => r.data),
  /** POST /courses  (Lecturer) */
  create: (body) => apiClient.post('/courses', body).then((r) => r.data),
};

// ─── Enrollments ─────────────────────────────────────────────────────────────
export const enrollmentApi = {
  /** GET /enrollments/me  (Student) */
  getMyEnrollments: () => apiClient.get('/enrollments/me').then((r) => r.data),
  /** POST /enrollments  (Student) */
  enroll: (body) => apiClient.post('/enrollments', body).then((r) => r.data),
};

// ─── Sessions ────────────────────────────────────────────────────────────────
export const sessionApi = {
  /** POST /sessions/start  (Lecturer) */
  start: (body) => apiClient.post('/sessions/start', body).then((r) => r.data),
  /** POST /sessions/:id/end  (Lecturer) */
  end: (id) => apiClient.post(`/sessions/${id}/end`).then((r) => r.data),
  /** GET /sessions/:id */
  get: (id) => apiClient.get(`/sessions/${id}`).then((r) => r.data),
  /** GET /sessions/:id/roster  (Lecturer) */
  getRoster: (id) => apiClient.get(`/sessions/${id}/roster`).then((r) => r.data),
};

// ─── Attendance ───────────────────────────────────────────────────────────────
export const attendanceApi = {
  /** POST /attendance/challenge  (Student) */
  challenge: (body) => apiClient.post('/attendance/challenge', body).then((r) => r.data),
  /** POST /attendance/token  (Student) */
  token: (body) => apiClient.post('/attendance/token', body).then((r) => r.data),
  /** POST /attendance/check-in  (Student) */
  checkIn: (body) => apiClient.post('/attendance/check-in', body).then((r) => r.data),
  /** POST /attendance/offline-sync  (Student) */
  offlineSync: (records) =>
    apiClient.post('/attendance/offline-sync', { records }).then((r) => r.data),
};

export const deviceApi = {
  /** POST /devices/register */
  register: (body) => apiClient.post('/devices/register', body).then((r) => r.data),
  /** GET /devices/me */
  getMine: () => apiClient.get('/devices/me').then((r) => r.data),
};

// Analytics
export const analyticsApi = {
  /** GET /students/me/progress (Student) */
  getMyProgress: () =>
    apiClient.get('/students/me/progress').then((r) => r.data),
  /** GET /lecturers/history (Lecturer) */
  getLecturerHistory: () =>
    apiClient.get('/lecturers/history').then((r) => r.data),
};

export const activityApi = {
  getStudentCourses: () =>
    apiClient.get('/api/v1/students/me/courses').then((r) => r.data),
  getStudentAttendance: () =>
    apiClient.get('/api/v1/students/me/attendance').then((r) => r.data),
  getLecturerCourses: () =>
    apiClient.get('/api/v1/lecturers/me/courses').then((r) => r.data),
  getActiveSession: (courseId) =>
    apiClient.get('/api/v1/sessions/active', { params: { courseId } }).then((r) => r.data),
  getSessionAttendance: (sessionId) =>
    apiClient.get(`/api/v1/sessions/${sessionId}/attendance`).then((r) => r.data),
  getMyCheckInEvents: (sessionId) =>
    apiClient.get(`/api/v1/sessions/${sessionId}/checkin-events/me`).then((r) => r.data),
};
