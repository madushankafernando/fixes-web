'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { ShieldCheck, Loader2, FileText, Clock, CheckCircle2 } from 'lucide-react'
import { api } from '@/lib/api'
import { CATEGORY_LABELS } from '@/lib/constants'
import type { User, TradieCategory } from '@/lib/types'

interface PendingTradie {
  userId: Pick<User, '_id' | 'name' | 'email' | 'fixId' | 'createdAt' | 'avatarUrl'>
  categories: string[]
  isFullyVerified: boolean
  rating: { average: number; count: number }
  docSummary: { total: number; uploaded: number; verified: number; pending: number }
}

export default function AdminTradiesPage() {
  const [tradies, setTradies] = useState<PendingTradie[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  const fetchTradies = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await api.getPaginated<PendingTradie>(`/api/admin/tradies/pending?page=${page}&limit=20`)
      setTradies(res.data)
      setTotal(res.pagination.total)
    } catch {
      // Silent
    } finally {
      setIsLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchTradies()
  }, [fetchTradies])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Verification Queue</h1>
        {!isLoading && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 font-medium">
            {total} pending
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
        </div>
      ) : tradies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <ShieldCheck className="w-12 h-12 text-white/20 mb-3" />
          <p className="text-sm text-white/40">All tradies are verified!</p>
          <p className="text-xs text-white/20 mt-1">No pending documents to review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tradies.map((tradie) => {
            const user = tradie.userId as User
            return (
              <Link
                key={user._id}
                href={`/admin/tradies/${user._id}`}
                className="bg-[#1e293b] rounded-xl border border-white/10 p-4 sm:p-5 hover:border-cyan-500/30 transition-all group"
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate group-hover:text-cyan-400 transition-colors">
                      {user.name}
                    </h3>
                    <p className="text-[10px] text-white/30">{user.email}</p>
                  </div>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {tradie.categories.slice(0, 3).map((cat) => (
                    <span key={cat} className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                      {CATEGORY_LABELS[cat as TradieCategory] || cat}
                    </span>
                  ))}
                </div>

                {/* Doc stats */}
                <div className="bg-white/5 rounded-lg p-3 mb-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold text-white">{tradie.docSummary.uploaded}</p>
                      <p className="text-[10px] text-white/30">Uploaded</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-emerald-400">{tradie.docSummary.verified}</p>
                      <p className="text-[10px] text-white/30">Verified</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-amber-400">{tradie.docSummary.pending}</p>
                      <p className="text-[10px] text-white/30">Pending</p>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all"
                    style={{ width: `${(tradie.docSummary.verified / tradie.docSummary.total) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-white/30 text-right">
                  {tradie.docSummary.verified}/{tradie.docSummary.total} verified
                </p>
              </Link>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg bg-[#1e293b] border border-white/10 text-xs text-white/50 disabled:opacity-30 hover:bg-white/5 transition-colors"
          >
            Previous
          </button>
          <span className="px-3 py-1.5 text-xs text-white/30">Page {page} of {Math.ceil(total / 20)}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(total / 20)}
            className="px-3 py-1.5 rounded-lg bg-[#1e293b] border border-white/10 text-xs text-white/50 disabled:opacity-30 hover:bg-white/5 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
