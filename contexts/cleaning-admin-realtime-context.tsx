// fixes-web/contexts/cleaning-admin-realtime-context.tsx


'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { connectSocket, getSocket } from '@/lib/socket'
import { useAuth } from '@/contexts/auth-context'


export interface CleaningAdminEvent {
  entity: string
  action: string
  jobId?: string
  jobCode?: string
  cleanerId?: string
  inviteId?: string
  category?: string
  status?: string
  affects: string[]
  title?: string
  message?: string
  severity?: 'info' | 'warning' | 'critical'
  changedAt: string
}

type SectionKey =
  | 'dashboard'
  | 'jobs'
  | 'jobDetail'
  | 'cleaners'
  | 'invites'
  | 'rates'
  | 'settings'
  | 'revenue'
  | 'operationsInbox'

type RefreshCallback = (event: CleaningAdminEvent) => void

interface CleaningAdminRealtimeContextValue {
  isConnected: boolean

  recentEvents: CleaningAdminEvent[]

  unreadAlertCount: number

  clearAlerts: () => void

  /**
   * Register a callback that fires when an event affects the given sections.
   * Returns an unsubscribe function — call it on cleanup.
   *
   * @example
   * useEffect(() => {
   *   const unsub = subscribe(['dashboard', 'jobs'], (evt) => refetch())
   *   return unsub
   * }, [subscribe])
   */
  subscribe: (sections: SectionKey[], callback: RefreshCallback) => () => void
}

const CleaningAdminRealtimeContext =
  createContext<CleaningAdminRealtimeContextValue | null>(null)

const MAX_RECENT_EVENTS = 50


export function CleaningAdminRealtimeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isAdmin } = useAuth()
  const [isConnected, setIsConnected] = useState(false)
  const [recentEvents, setRecentEvents] = useState<CleaningAdminEvent[]>([])
  const [unreadAlertCount, setUnreadAlertCount] = useState(0)

  const subscribersRef = useRef<
    Map<string, { sections: SectionKey[]; callback: RefreshCallback }>
  >(new Map())

  const nextIdRef = useRef(0)

  const clearAlerts = useCallback(() => {
    setUnreadAlertCount(0)
  }, [])

  const subscribe = useCallback(
    (sections: SectionKey[], callback: RefreshCallback): (() => void) => {
      const id = String(++nextIdRef.current)
      subscribersRef.current.set(id, { sections, callback })
      return () => {
        subscribersRef.current.delete(id)
      }
    },
    []
  )

  const dispatchEvent = useCallback((event: CleaningAdminEvent) => {
    const affects = event.affects || []

    subscribersRef.current.forEach(({ sections, callback }) => {
      const matched = sections.some((s) => affects.includes(s))
      if (matched) {
        try {
          callback(event)
        } catch (err) {
          console.error('[CleaningAdminRealtime] subscriber callback error:', err)
        }
      }
    })
  }, [])

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return

    const socket = connectSocket()

    const handleConnect = () => setIsConnected(true)
    const handleDisconnect = () => setIsConnected(false)

    const handleUpdate = (event: CleaningAdminEvent) => {
      setRecentEvents((prev) => [event, ...prev].slice(0, MAX_RECENT_EVENTS))

      if (event.title) {
        setUnreadAlertCount((c) => c + 1)
      }

      dispatchEvent(event)
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('cleaning-admin:update', handleUpdate)

    if (socket.connected) setIsConnected(true)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('cleaning-admin:update', handleUpdate)
    }
  }, [isAuthenticated, isAdmin, dispatchEvent])

  const value: CleaningAdminRealtimeContextValue = {
    isConnected,
    recentEvents,
    unreadAlertCount,
    clearAlerts,
    subscribe,
  }

  return (
    <CleaningAdminRealtimeContext.Provider value={value}>
      {children}
    </CleaningAdminRealtimeContext.Provider>
  )
}


export function useCleaningAdminRealtime(): CleaningAdminRealtimeContextValue {
  const ctx = useContext(CleaningAdminRealtimeContext)
  if (!ctx) {
    throw new Error(
      'useCleaningAdminRealtime must be used within <CleaningAdminRealtimeProvider>'
    )
  }
  return ctx
}

/**
 * Convenience hook: auto-subscribes to the given sections and calls `onEvent`
 * when a matching event arrives. Cleans up on unmount.
 *
 * @example
 * useCleaningAdminSubscription(['dashboard', 'jobs'], () => {
 *   refetchDashboard()
 * })
 */
export function useCleaningAdminSubscription(
  sections: SectionKey[],
  onEvent: RefreshCallback
) {
  const { subscribe } = useCleaningAdminRealtime()
  const callbackRef = useRef(onEvent)
  callbackRef.current = onEvent

  useEffect(() => {
    const unsub = subscribe(sections, (evt) => callbackRef.current(evt))
    return unsub
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscribe, ...sections])
}
