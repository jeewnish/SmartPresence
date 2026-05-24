import { apiRequest } from './client'

export interface ApiDepartment {
  departmentId: number
  departmentCode: string
  departmentName: string
  name: string
  faculty: string
  isActive: boolean
}

export const departmentsApi = {
  getAll: (params?: { isActive?: boolean }) =>
    apiRequest<ApiDepartment[]>('/departments', {
      params: params as Record<string, string | number | boolean | undefined | null>,
    }),
}
