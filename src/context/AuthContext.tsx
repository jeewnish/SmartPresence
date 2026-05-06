import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import {
  clearToken,
  fetchKeycloakToken,
  getToken,
  isTokenExpired,
  setToken,
} from '../api/client'

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  error: string | null
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading]             = useState(true)
  const [error, setError]                     = useState<string | null>(null)

  // On mount, check if a valid token exists
  useEffect(() => {
    const token = getToken()
    setIsAuthenticated(!!token && !isTokenExpired())
    setIsLoading(false)
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    setError(null)
    setIsLoading(true)
    try {
      const res = await fetchKeycloakToken(username, password)
      setToken(res.access_token, res.expires_in)
      setIsAuthenticated(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setIsAuthenticated(false)
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
