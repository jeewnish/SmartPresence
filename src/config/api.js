import axios from 'axios';

// Base URL from .env — use 10.0.2.2 for Android emulator (maps to host localhost)
const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || 'http://10.0.2.2:8080';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

/**
 * Attach a Clerk JWT token to every request.
 * Call this once in the root navigator after the user signs in.
 *
 * @param {() => Promise<string | null>} getToken - Clerk's getToken function
 */
export function setAuthTokenProvider(getToken) {
  apiClient.interceptors.request.use(async (config) => {
    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // silently fail — the request will hit the server without auth and return 401
    }
    return config;
  });
}

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
};
