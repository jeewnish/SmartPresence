import { apiRequest } from './client'
import type { Page } from './users'

export interface ApiCourse {
  courseId: number
  courseCode: string
  courseName: string
  department: { departmentId: number; name: string } | null
  creditHours: number
  level: number
  semester: number
  academicYear: number
  isActive: boolean
  description: string | null
}

export const coursesApi = {
  getAll: (params?: { isActive?: boolean; page?: number; size?: number }) =>
    apiRequest<Page<ApiCourse>>('/courses', { params: params as Record<string, string | number | boolean | undefined | null> }),

  assignLecturer: (courseId: number, lecturerId: number) =>
    apiRequest(`/courses/${courseId}/assign-lecturer`, {
      method: 'POST',
      params: { lecturerId },
    }),
}
