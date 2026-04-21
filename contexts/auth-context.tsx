'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { User, TradieProfile, LoginResponse, MeResponse } from '@/lib/types'
import { api, setTokens, clearTokens, getAccessToken } from '@/lib/api'


interface AuthContextValue {
  user: User | null
  profile: TradieProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  isClient: boolean
  isTradie: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<User>
  registerClient: (data: RegisterClientData) => Promise<User>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

interface RegisterClientData {
  name: string
  email: string
  password: string
  phone?: string
}

const AuthContext = createContext<AuthContextValue | null>(null)


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<TradieProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = getAccessToken()
    if (token) {
      fetchMe().finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
    
    if (typeof window !== 'undefined') {
      window.addEventListener('app:refresh_data', fetchMe)
      return () => window.removeEventListener('app:refresh_data', fetchMe)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchMe = useCallback(async () => {
    try {
      const res = await api.get<MeResponse>('/api/auth/me')
      setUser(res.data.user)
      setProfile(res.data.profile)
    } catch {
      clearTokens()
      setUser(null)
      setProfile(null)
    }
  }, [])

  const login = useCallback(
    async (email: string, password: string): Promise<User> => {
      const res = await api.post<LoginResponse>(
        '/api/auth/login',
        { email, password },
        true
      )
      setTokens(res.data.accessToken, res.data.refreshToken)
      setUser(res.data.user)

      if (res.data.user.role === 'tradie') {
        await fetchMe()
      }

      return res.data.user
    },
    [fetchMe]
  )

  const registerClient = useCallback(
    async (data: RegisterClientData): Promise<User> => {
      const res = await api.post<LoginResponse>(
        '/api/auth/register/client',
        data as unknown as Record<string, unknown>,
        true
      )
      setTokens(res.data.accessToken, res.data.refreshToken)
      setUser(res.data.user)
      return res.data.user
    },
    []
  )

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout', {})
    } catch {
    }
    clearTokens()
    setUser(null)
    setProfile(null)
  }, [])

  const refreshUser = useCallback(async () => {
    await fetchMe()
  }, [fetchMe])

  const value: AuthContextValue = {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    isClient: user?.role === 'client',
    isTradie: user?.role === 'tradie',
    isAdmin: user?.role === 'admin',
    login,
    registerClient,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}


export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
