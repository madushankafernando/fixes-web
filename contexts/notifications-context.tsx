'use client'

// contexts/notifications-context.tsx
// Shared notification state for web portals (client dashboard + admin)
// Fetches from GET /api/notifications and listens to socket 'notification:new'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { api } from '@/lib/api'
import { connectSocket } from '@/lib/socket'
import { useAuth } from '@/contexts/auth-context'

export interface WebNotification {
  _id: string
  title: string
  body: string
  type: string
  category: 'alert' | 'update'
  data: Record<string, any>
  isRead: boolean
  createdAt: string
}

interface NotificationsContextValue {
  notifications: WebNotification[]
  unreadCount: number
  loading: boolean
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
  refresh: () => void
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null)

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState<WebNotification[]>([])
  const [loading, setLoading] = useState(true)
  const socketRef = useRef<ReturnType<typeof connectSocket>>(null)

  const unreadCount = notifications.filter(n => !n.isRead).length

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get<{ notifications: WebNotification[] }>(
        '/api/notifications?limit=30'
      )
      setNotifications(res.data.notifications ?? [])
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  const markRead = useCallback(async (id: string) => {
    try {
      await api.patch(`/api/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
    } catch { }
  }, [])

  const markAllRead = useCallback(async () => {
    try {
      await api.patch('/api/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch { }
  }, [])

  // Mount: fetch + socket listener
  useEffect(() => {
    if (!isAuthenticated || !user) return
    fetchAll()

    // Attach to existing socket (connected by layout)
    const socket = connectSocket()
    if (!socket) return
    socketRef.current = socket

    const handleNew = (notif: WebNotification) => {
      setNotifications(prev => [notif, ...prev])
      
      // Global broadcast so page components can re-fetch live data 
      // without needing their own dedicated socket connections
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('app:refresh_data'))
      }
    }

    socket.on('notification:new', handleNew)
    return () => { socket.off('notification:new', handleNew) }
  }, [isAuthenticated, user?._id])

  return (
    <NotificationsContext.Provider value={{
      notifications, unreadCount, loading, markRead, markAllRead, refresh: fetchAll,
    }}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useWebNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useWebNotifications must be used within <NotificationsProvider>')
  return ctx
}
