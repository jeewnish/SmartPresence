import { apiRequest } from './client'
import type { Page } from './users'

export interface ApiCourse {
  courseId: number
  courseCode: string
  courseName: string
  department: { departmentId: number; name?: string; departmentName?: string } | null
  creditHours: number
  level: number
  semester: number
  academicYear: number
  isActive: boolean
  description: string | null
}

export interface CourseUpsertPayload {
  courseCode: string
  courseName: string
  departmentId: number
  creditHours: number
  level: number
  semester: number
  academicYear: number
  description?: string | null
  isActive: boolean
}

export const coursesApi = {
  getAll: (params?: { isActive?: boolean; page?: number; size?: number }) =>
    apiRequest<Page<ApiCourse>>('/courses', { params: params as Record<string, string | number | boolean | undefined | null> }),

  create: (payload: CourseUpsertPayload) =>
    apiRequest<ApiCourse>('/courses', { method: 'POST', body: payload }),

  update: (courseId: number, payload: CourseUpsertPayload) =>
    apiRequest<ApiCourse>(`/courses/${courseId}`, { method: 'PUT', body: payload }),

  assignLecturer: (courseId: number, lecturerId: number) =>
    apiRequest(`/courses/${courseId}/assign-lecturer`, {
      method: 'POST',
      params: { lecturerId },
    }),
}
