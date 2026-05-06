import { apiRequest } from './client'

export interface ApiUser {
  userId: number
  indexNumber: string | null
  firstName: string
  lastName: string
  email: string
  role: 'STUDENT' | 'LECTURER' | 'ADMIN'
  department: { departmentId: number; name: string } | null
  enrollmentYear: number | null
  isActive: boolean
  keycloakId: string
  createdAt: string
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface RegisterUserPayload {
  firstName: string
  lastName: string
  email: string
  role: 'STUDENT' | 'LECTURER' | 'ADMIN'
  departmentId?: number
  indexNumber?: string
  enrollmentYear?: number
}

export const usersApi = {
  search: (params: {
    role?: string
    departmentId?: number
    enrollmentYear?: number
    isActive?: boolean
    search?: string
    page?: number
    size?: number
  }) =>
    apiRequest<Page<ApiUser>>('/users', { params: params as Record<string, string | number | boolean | undefined | null> }),

  getById: (userId: number) => apiRequest<ApiUser>(`/users/${userId}`),

  register: (payload: RegisterUserPayload) =>
    apiRequest<ApiUser>('/users/register', { method: 'POST', body: payload }),

  setStatus: (userId: number, active: boolean) =>
    apiRequest<ApiUser>(`/users/${userId}/status`, {
      method: 'PATCH',
      params: { active },
    }),
}
