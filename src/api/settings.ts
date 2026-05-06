import { apiRequest } from './client'
import type { Page } from './users'

export interface SystemSetting {
  settingId: number
  key: string
  value: string
  group: string
  description: string | null
  updatedAt: string
}

export const settingsApi = {
  getByGroup: (group: string) =>
    apiRequest<SystemSetting[]>(`/settings/group/${group}`),

  get: (key: string) => apiRequest<string>(`/settings/${key}`),

  update: (key: string, value: string) =>
    apiRequest<SystemSetting>(`/settings/${key}`, {
      method: 'PUT',
      params: { value },
    }),
}

// ─── Audit Logs ──────────────────────────────────────────────────────────────

export interface AuditLogEntry {
  logId: number
  actor: { userId: number; firstName: string; lastName: string; email: string }
  action: string
  entityType: string
  entityId: number
  oldValue: unknown
  newValue: unknown
  performedAt: string
}

export const auditLogsApi = {
  getAll: (params?: { page?: number; size?: number }) =>
    apiRequest<Page<AuditLogEntry>>('/audit-logs', { params: params as Record<string, string | number | boolean | undefined | null> }),
}
