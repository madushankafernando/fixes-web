'use client'

// app/admin/notifications/page.tsx
// Admin broadcast compose panel — send notifications to all tradies, clients, or everyone

import { useState } from 'react'
import { Bell, Megaphone, Send, Users, Wrench, Globe } from 'lucide-react'
import { api } from '@/lib/api'

type Target = 'tradie' | 'client' | 'all'

const TARGET_OPTIONS: { value: Target; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    value: 'tradie',
    label: 'All Tradies',
    desc:  'App changes, new features, verification updates',
    icon:  <Wrench className="w-5 h-5" />,
  },
  {
    value: 'client',
    label: 'All Clients',
    desc:  'Platform fee changes, policy updates for clients',
    icon:  <Users className="w-5 h-5" />,
  },
  {
    value: 'all',
    label: 'Everyone',
    desc:  'Service outages, community news, platform-wide updates',
    icon:  <Globe className="w-5 h-5" />,
  },
]

export default function AdminNotificationsPage() {
  const [target,   setTarget]   = useState<Target>('tradie')
  const [title,    setTitle]    = useState('')
  const [body,     setBody]     = useState('')
  const [loading,  setLoading]  = useState(false)
  const [result,   setResult]   = useState<{ total: number; failures: number } | null>(null)
  const [error,    setError]    = useState<string | null>(null)

  const canSend = title.trim() && body.trim() && !loading

  const handleSend = async () => {
    if (!canSend) return
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const res = await api.post<{ total: number; failures: number }>(
        '/api/admin/notifications/broadcast',
        { title: title.trim(), body: body.trim(), target }
      )
      setResult(res.data)
      setTitle('')
      setBody('')
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center">
          <Bell className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Broadcast Notification</h1>
          <p className="text-sm text-gray-500">Send a push + in-app notification to a user group</p>
        </div>
      </div>

      {/* Target selector */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Send to</label>
        <div className="grid grid-cols-3 gap-3">
          {TARGET_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setTarget(opt.value)}
              className={`flex flex-col items-start gap-2 p-4 rounded-xl border-2 transition-all text-left ${
                target === opt.value
                  ? 'border-[#2563EB] bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <span className={target === opt.value ? 'text-[#2563EB]' : 'text-gray-400'}>
                {opt.icon}
              </span>
              <span className={`text-sm font-semibold ${target === opt.value ? 'text-[#2563EB]' : 'text-gray-700'}`}>
                {opt.label}
              </span>
              <span className="text-xs text-gray-400 leading-snug">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Compose */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Title <span className="text-gray-400 font-normal">({title.length}/100)</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value.slice(0, 100))}
            placeholder="e.g. Platform maintenance tonight"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Message <span className="text-gray-400 font-normal">({body.length}/300)</span>
          </label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value.slice(0, 300))}
            placeholder="Describe what users need to know..."
            rows={4}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] resize-none"
          />
        </div>

        {/* Preview */}
        {(title || body) && (
          <div className="bg-gray-900 rounded-xl p-4">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Preview</p>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center flex-shrink-0">
                <Megaphone className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{title || 'Notification title'}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-snug">{body || 'Notification message...'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Result / error */}
      {result && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-sm font-semibold text-green-700">✅ Broadcast sent!</p>
          <p className="text-xs text-green-600 mt-1">
            Delivered to <strong>{result.total}</strong> users
            {result.failures > 0 && ` · ${result.failures} failures`}
          </p>
        </div>
      )}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Send */}
      <button
        onClick={handleSend}
        disabled={!canSend}
        className="mt-6 flex items-center gap-2 px-6 py-3 bg-[#2563EB] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <Send className="w-4 h-4" />
        {loading ? 'Sending…' : `Send to ${TARGET_OPTIONS.find(o => o.value === target)?.label}`}
      </button>
    </div>
  )
}
