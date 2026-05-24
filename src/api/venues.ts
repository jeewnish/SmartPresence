import { apiRequest } from './client'
import type { Page } from './users'

export interface ApiVenue {
  venueId: number
  venueCode: string
  venueName: string
  building: string | null
  floor: number | null
  capacity: number | null
  beaconMac: string | null
  beaconUuid: string | null
  rssiThreshold: number
  isActive: boolean
}

export interface VenueUpsertPayload {
  venueCode: string
  venueName: string
  building?: string | null
  floor?: number | null
  capacity?: number | null
  beaconMac?: string | null
  beaconUuid?: string | null
  rssiThreshold: number
  isActive: boolean
}

export const venuesApi = {
  getAll: (params?: { isActive?: boolean; page?: number; size?: number }) =>
    apiRequest<Page<ApiVenue>>('/venues', {
      params: params as Record<string, string | number | boolean | undefined | null>,
    }),

  create: (payload: VenueUpsertPayload) =>
    apiRequest<ApiVenue>('/venues', { method: 'POST', body: payload }),

  update: (venueId: number, payload: VenueUpsertPayload) =>
    apiRequest<ApiVenue>(`/venues/${venueId}`, { method: 'PUT', body: payload }),
}
