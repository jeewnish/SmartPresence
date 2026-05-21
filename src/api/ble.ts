import { apiRequest } from './client'

export type BleBroadcastEventType =
  | 'TOKEN_ISSUED'
  | 'TOKEN_ROTATED'
  | 'TOKEN_EXPIRED'
  | 'SESSION_ENDED'

export interface BleBroadcastEvent {
  eventId: number
  eventType: BleBroadcastEventType
  bleToken: string
  tokenIssuedAt: string
  tokenExpiresAt: string
  txPowerDbm: number | null
  note: string | null
}

export const bleApi = {
  getEventLog: (sessionId: number) =>
    apiRequest<BleBroadcastEvent[]>(`/ble/session/${sessionId}/events`),
  rotateToken: (sessionId: number) =>
    apiRequest(`/ble/session/${sessionId}/rotate-token`, { method: 'POST' }),
  getTokenStatus: (sessionId: number) =>
    apiRequest<boolean>(`/ble/session/${sessionId}/token-status`),
}
