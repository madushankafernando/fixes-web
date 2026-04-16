// fixes-web/lib/socket.ts

import { io, Socket } from 'socket.io-client'
import { API_BASE_URL } from './constants'
import { getAccessToken } from './api'

let socket: Socket | null = null

export function getSocket(): Socket | null {
  return socket
}

export function connectSocket(): Socket {
  if (socket?.connected) return socket

  const token = getAccessToken()

  socket = io(API_BASE_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    autoConnect: true,
  })

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket?.id)
  })

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason)
  })

  socket.on('connect_error', (err) => {
    console.error('[Socket] Connection error:', err.message)
  })

  return socket
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}


export function joinJobRoom(jobId: string): void {
  socket?.emit('job:join', jobId)   
}

export function leaveJobRoom(jobId: string): void {
  socket?.emit('job:leave', jobId)   
}
