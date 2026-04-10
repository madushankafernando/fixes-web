// fixes-web/lib/api.ts

import type { ApiResponse, PaginatedResponse } from './types'
import { API_BASE_URL } from './constants'


let accessToken: string | null = null
let refreshTokenValue: string | null = null

export function setTokens(access: string, refresh: string): void {
  accessToken = access
  refreshTokenValue = refresh
  if (typeof window !== 'undefined') {
    localStorage.setItem('fixes_access_token', access)
    localStorage.setItem('fixes_refresh_token', refresh)
  }
}

export function getAccessToken(): string | null {
  if (accessToken) return accessToken
  if (typeof window !== 'undefined') {
    accessToken = localStorage.getItem('fixes_access_token')
  }
  return accessToken
}

export function getRefreshToken(): string | null {
  if (refreshTokenValue) return refreshTokenValue
  if (typeof window !== 'undefined') {
    refreshTokenValue = localStorage.getItem('fixes_refresh_token')
  }
  return refreshTokenValue
}

export function clearTokens(): void {
  accessToken = null
  refreshTokenValue = null
  if (typeof window !== 'undefined') {
    localStorage.removeItem('fixes_access_token')
    localStorage.removeItem('fixes_refresh_token')
  }
}


let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

async function attemptTokenRefresh(): Promise<boolean> {
  const refresh = getRefreshToken()
  if (!refresh) return false

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refresh }),
    })

    if (!res.ok) {
      clearTokens()
      return false
    }

    const json = (await res.json()) as ApiResponse<{
      accessToken: string
      refreshToken: string
    }>
    setTokens(json.data.accessToken, json.data.refreshToken)
    return true
  } catch {
    clearTokens()
    return false
  }
}


interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: Record<string, unknown> | FormData
  headers?: Record<string, string>
  noAuth?: boolean
}

async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {}, noAuth = false } = options

  const requestHeaders: Record<string, string> = { ...headers }

  if (!noAuth) {
    const token = getAccessToken()
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`
    }
  }

  const fetchOptions: RequestInit = { method, headers: requestHeaders }

  if (body) {
    if (body instanceof FormData) {
      fetchOptions.body = body
    } else {
      requestHeaders['Content-Type'] = 'application/json'
      fetchOptions.body = JSON.stringify(body)
    }
  }

  let res = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions)

  if (res.status === 401 && !noAuth) {
    if (!isRefreshing) {
      isRefreshing = true
      refreshPromise = attemptTokenRefresh()
    }

    const refreshed = await refreshPromise
    isRefreshing = false
    refreshPromise = null

    if (refreshed) {
      const newToken = getAccessToken()
      if (newToken) {
        requestHeaders['Authorization'] = `Bearer ${newToken}`
      }
      fetchOptions.headers = requestHeaders
      res = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions)
    } else {
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      throw new Error('Session expired. Please log in again.')
    }
  }

  const json = await res.json()

  if (!res.ok) {
    throw new ApiError(json.message || 'Something went wrong', res.status, json)
  }

  return json as T
}


export class ApiError extends Error {
  status: number
  data: Record<string, unknown>

  constructor(
    message: string,
    status: number,
    data: Record<string, unknown> = {}
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}


export const api = {
  get<T>(endpoint: string, noAuth?: boolean): Promise<ApiResponse<T>> {
    return apiFetch<ApiResponse<T>>(endpoint, { noAuth })
  },

  getPaginated<T>(
    endpoint: string,
    noAuth?: boolean
  ): Promise<PaginatedResponse<T>> {
    return apiFetch<PaginatedResponse<T>>(endpoint, { noAuth })
  },

  post<T>(
    endpoint: string,
    body?: Record<string, unknown>,
    noAuth?: boolean
  ): Promise<ApiResponse<T>> {
    return apiFetch<ApiResponse<T>>(endpoint, { method: 'POST', body, noAuth })
  },

  patch<T>(
    endpoint: string,
    body?: Record<string, unknown>
  ): Promise<ApiResponse<T>> {
    return apiFetch<ApiResponse<T>>(endpoint, { method: 'PATCH', body })
  },

  put<T>(
    endpoint: string,
    body?: Record<string, unknown>
  ): Promise<ApiResponse<T>> {
    return apiFetch<ApiResponse<T>>(endpoint, { method: 'PUT', body })
  },

  delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return apiFetch<ApiResponse<T>>(endpoint, { method: 'DELETE' })
  },

  raw<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return apiFetch<T>(endpoint, options)
  },
}
