// components/admin/CleaningAdminInbox.tsx

'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, AlertTriangle, CheckCircle, Info, ExternalLink, X } from 'lucide-react'
import {
  useCleaningAdminRealtime,
  type CleaningAdminEvent,
} from '@/contexts/cleaning-admin-realtime-context'

function getAlertIcon(event: CleaningAdminEvent) {
  if (event.severity === 'critical') return <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
  if (event.severity === 'warning') return <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
  return <Info className="w-3.5 h-3.5 text-teal-500 shrink-0" />
}

function getAlertBorder(event: CleaningAdminEvent) {
  if (event.severity === 'critical') return 'border-l-red-500'
  if (event.severity === 'warning') return 'border-l-amber-500'
  return 'border-l-teal-500'
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const secs = Math.floor(diff / 1000)
  if (secs < 60) return 'just now'
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function getEventHref(event: CleaningAdminEvent): string | null {
  if (event.jobId) return `/cleaning-admin/jobs/${event.jobId}`
  if (event.entity === 'cleaner') return '/cleaning-admin/cleaners'
  if (event.entity === 'invite') return '/cleaning-admin/invites'
  if (event.entity === 'rates') return '/cleaning-admin/rates'
  if (event.entity === 'config') return '/cleaning-admin/settings'
  if (event.entity === 'revenue') return '/cleaning-admin/revenue'
  return null
}

export default function CleaningAdminInbox() {
  const { recentEvents, unreadAlertCount, clearAlerts, isConnected } = useCleaningAdminRealtime()
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const alerts = recentEvents.filter((e) => e.title)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleOpen = () => {
    setOpen(!open)
    if (!open) clearAlerts()
  }

  const handleNavigate = (event: CleaningAdminEvent) => {
    const href = getEventHref(event)
    if (href) {
      router.push(href)
      setOpen(false)
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        title="Operations Inbox"
      >
        <Bell className="w-4.5 h-4.5" />

        {unreadAlertCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1 animate-pulse">
            {unreadAlertCount > 9 ? '9+' : unreadAlertCount}
          </span>
        )}

        <span
          className={`absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full border border-white ${
            isConnected ? 'bg-emerald-400' : 'bg-gray-300'
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/80">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-800">Operations Inbox</h3>
              <span
                className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-gray-300'}`}
                title={isConnected ? 'Live' : 'Disconnected'}
              />
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Alert list */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {alerts.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <CheckCircle className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No operations alerts</p>
                <p className="text-xs text-gray-300 mt-1">
                  Alerts appear here when jobs, cleaners, or payments need attention.
                </p>
              </div>
            ) : (
              alerts.map((event, i) => {
                const href = getEventHref(event)
                return (
                  <button
                    key={`${event.changedAt}-${i}`}
                    onClick={() => handleNavigate(event)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-l-[3px] ${getAlertBorder(event)} ${
                      href ? 'cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {getAlertIcon(event)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-gray-800 truncate">
                            {event.title}
                          </p>
                          <span className="text-[10px] text-gray-400 shrink-0">
                            {timeAgo(event.changedAt)}
                          </span>
                        </div>
                        {event.message && (
                          <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                            {event.message}
                          </p>
                        )}
                        {event.jobCode && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-[10px] font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                              {event.jobCode}
                            </span>
                            {href && <ExternalLink className="w-2.5 h-2.5 text-gray-400" />}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>

          {alerts.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50">
              <p className="text-[10px] text-gray-400 text-center">
                Showing {alerts.length} recent alert{alerts.length !== 1 ? 's' : ''} · Live updates {isConnected ? 'active' : 'paused'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
