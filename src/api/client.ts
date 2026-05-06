// ─── Base API client ────────────────────────────────────────────────────────
// All requests go to /api/v1 (proxied to the Spring Boot backend in dev).
// The Keycloak JWT is read from localStorage and injected as a Bearer token.

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

export function getToken(): string | null {
  return localStorage.getItem('sp_access_token')
}

export function setToken(token: string, expiresIn: number): void {
  localStorage.setItem('sp_access_token', token)
  localStorage.setItem('sp_token_expires_at', String(Date.now() + expiresIn * 1000))
}

export function clearToken(): void {
  localStorage.removeItem('sp_access_token')
  localStorage.removeItem('sp_token_expires_at')
}

export function isTokenExpired(): boolean {
  const expiresAt = localStorage.getItem('sp_token_expires_at')
  if (!expiresAt) return true
  return Date.now() > Number(expiresAt) - 30_000 // 30s buffer
}

// ─── Wrapper around fetch ────────────────────────────────────────────────────

interface RequestOptions {
  method?: string
  body?: unknown
  params?: Record<string, string | number | boolean | undefined | null>
  signal?: AbortSignal
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const token = getToken()

  const url = new URL(`${BASE_URL}${path}`, window.location.origin)
  if (options.params) {
    for (const [key, value] of Object.entries(options.params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value))
      }
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(url.toString(), {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  })

  if (res.status === 401) {
    clearToken()
    window.location.href = '/login'
    throw new Error('Unauthorized — redirecting to login')
  }

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${res.status}: ${text}`)
  }

  const json = await res.json()
  // Spring ApiResponse wrapper: { status, message, data }
  if ('data' in json) return json.data as T
  return json as T
}

// ─── Keycloak token endpoint ─────────────────────────────────────────────────

const KEYCLOAK_URL =
  import.meta.env.VITE_KEYCLOAK_URL ?? 'http://localhost:8180'
const KEYCLOAK_REALM =
  import.meta.env.VITE_KEYCLOAK_REALM ?? 'smartpresence'
const KEYCLOAK_CLIENT_ID =
  import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? 'smartpresence-backend'

export interface TokenResponse {
  access_token: string
  expires_in: number
  refresh_token?: string
}

export async function fetchKeycloakToken(
  username: string,
  password: string,
): Promise<TokenResponse> {
  const tokenUrl = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`

  const body = new URLSearchParams({
    grant_type: 'password',
    client_id: KEYCLOAK_CLIENT_ID,
    username,
    password,
  })

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error_description ?? 'Login failed — check credentials')
  }

  return res.json()
}
