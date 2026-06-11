'use client'

import { useEffect, useState, useCallback } from 'react'
import { Users, Loader2, Star, MapPin, Briefcase } from 'lucide-react'
import { api } from '@/lib/api'
import { useCleaningAdminSubscription } from '@/contexts/cleaning-admin-realtime-context'

interface CleanerItem {
  _id: string
  userId: { _id: string; name: string; email: string; phone?: string }
  categories: string[]
  rating: { average: number; count: number }
  isOnline: boolean
  isFullyVerified: boolean
  documents: { type: string; isVerified: boolean }[]
}

export default function CleanersPage() {
  const [cleaners, setCleaners] = useState<CleanerItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchCleaners = useCallback(() => {
    setIsLoading(true)
    api.getPaginated<CleanerItem>('/api/cleaning-admin/cleaners?limit=100')
      .then((res) => setCleaners(res.data ?? []))
      .catch(() => setCleaners([]))
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => { fetchCleaners() }, [fetchCleaners])

  useCleaningAdminSubscription(['cleaners'], () => {
    fetchCleaners()
  })

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-teal-600 animate-spin" /></div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Cleaners</h1>
        <span className="text-sm text-gray-500">{cleaners.length} registered</span>
      </div>

      {cleaners.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl flex flex-col items-center justify-center py-16">
          <Users className="w-8 h-8 text-gray-300 mb-2" />
          <p className="text-sm text-gray-500">No cleaners registered yet</p>
          <p className="text-xs text-gray-400 mt-1">Generate invite links to onboard cleaners</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cleaners.map((c) => {
            const verifiedDocs = c.documents.filter((d) => d.isVerified).length
            const totalDocs = c.documents.length

            return (
              <div key={c._id} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold ${c.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}>
                    {c.userId?.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{c.userId?.name || 'Deleted User'}</p>
                    <p className="text-xs text-gray-400 truncate">{c.userId?.email || 'N/A'}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.isOnline ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {c.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center gap-1"><Star className="w-3 h-3" /> Rating</span>
                    <span className="font-medium text-gray-700">{c.rating.average.toFixed(1)} ({c.rating.count} reviews)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center gap-1"><Briefcase className="w-3 h-3" /> Categories</span>
                    <span className="font-medium text-gray-700 capitalize">{c.categories.join(', ')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Documents</span>
                    <span className={`font-medium ${c.isFullyVerified ? 'text-green-600' : 'text-amber-600'}`}>
                      {verifiedDocs}/{totalDocs} verified
                    </span>
                  </div>
                  {c.userId?.phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Phone</span>
                      <span className="font-medium text-gray-700">{c.userId.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
