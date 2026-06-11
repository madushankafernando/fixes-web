// fixes-web/lib/socket.ts

import { io, Socket } from 'socket.io-client'
import { API_BASE_URL } from './constants'
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './api'

let socket: Socket | null = null
let isRefreshingSocketToken = false

export function getSocket(): Socket | null {
  return socket
}


export function connectSocket(): Socket {
  if (socket?.connected) return socket

  if (socket) {
    socket.removeAllListeners()
    socket.disconnect()
    socket = null
  }

  const token = getAccessToken()

  socket = io(API_BASE_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
  })

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket?.id)
    isRefreshingSocketToken = false
  })

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason)
  })

  socket.on('connect_error', async (err) => {
    const isAuthError =
      err.message?.includes('authentication') ||
      err.message?.includes('token') ||
      err.message?.includes('jwt')

    if (isAuthError && !isRefreshingSocketToken) {
      console.warn('[Socket] Auth error — attempting token refresh…')
      isRefreshingSocketToken = true

      const refreshed = await refreshSocketToken()
      if (refreshed) {
        console.log('[Socket] Token refreshed — reconnecting…')
        reconnectSocket()
      } else {
        console.error('[Socket] Token refresh failed — socket will not reconnect')
      }
    } else if (!isAuthError) {
      console.error('[Socket] Connection error:', err.message)
    }
  })

  return socket
}


async function refreshSocketToken(): Promise<boolean> {
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

    const json = await res.json()
    setTokens(json.data.accessToken, json.data.refreshToken)
    return true
  } catch {
    return false
  }
}


export function reconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners()
    socket.disconnect()
    socket = null
  }
  isRefreshingSocketToken = false
  connectSocket()
}


export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners()
    socket.disconnect()
    socket = null
  }
  isRefreshingSocketToken = false
}


export function joinJobRoom(jobId: string): void {
  socket?.emit('job:join', jobId)   
}

export function leaveJobRoom(jobId: string): void {
  socket?.emit('job:leave', jobId)   
}
