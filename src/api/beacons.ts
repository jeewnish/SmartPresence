import { apiRequest } from './client'

export interface BeaconStatus {
  venueId: number
  venueCode: string
  venueName: string
  beaconMac: string
  status: 'ONLINE' | 'OFFLINE' | 'DEGRADED' | 'UNKNOWN'
  batteryPct: number | null
  txPowerDbm: number | null
  rssiSelfCheck: number | null
  lastHeartbeatAt: string | null
  offlineSince: string | null
  consecutiveFailures: number | null
  batteryLow: boolean
  hasActiveSession: boolean
  systemHealth: 'GREEN' | 'YELLOW' | 'RED'
}

export const beaconsApi = {
  getAll: () => apiRequest<BeaconStatus[]>('/beacons'),
  getVenue: (venueId: number) => apiRequest<BeaconStatus>(`/beacons/venue/${venueId}`),
  getSystemHealth: () => apiRequest<string>('/beacons/health'),
}
