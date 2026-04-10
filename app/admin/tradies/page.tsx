// fixes-web/app/admin/tradies/page.tsx

'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { ShieldCheck, Loader2 } from 'lucide-react'
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
    } catch { /* silent */ } finally { setIsLoading(false) }
  }, [page])

  useEffect(() => { fetchTradies() }, [fetchTradies])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Verification Queue</h1>
          <p className="text-sm text-gray-400 mt-0.5">Review and approve tradie documents</p>
        </div>
        {!isLoading && (
          <span className="text-xs px-3 py-1.5 rounded-full font-semibold bg-amber-50 text-amber-600">
            {total} pending
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 text-[#2563EB] animate-spin" />
        </div>
      ) : tradies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8 text-emerald-500" />
          </div>
          <p className="text-base font-semibold text-gray-700 mb-1">All clear!</p>
          <p className="text-sm text-gray-400">No pending documents to review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tradies.map((tradie) => {
            const user = tradie.userId as User
            const pct = tradie.docSummary.total > 0
              ? (tradie.docSummary.verified / tradie.docSummary.total) * 100
              : 0

            return (
              <Link
                key={user._id}
                href={`/admin/tradies/${user._id}`}
                className="bg-white rounded-xl border border-gray-200 p-5 block hover:shadow-md hover:border-gray-300 transition-all group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#2563EB] flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gray-800 truncate group-hover:text-[#2563EB] transition-colors">{user.name}</h3>
                    <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {tradie.categories.slice(0, 3).map((cat) => (
                    <span key={cat} className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                      {CATEGORY_LABELS[cat as TradieCategory] || cat}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2 text-center bg-gray-50 rounded-lg p-3 mb-4">
                  <div>
                    <p className="text-lg font-bold text-gray-800">{tradie.docSummary.uploaded}</p>
                    <p className="text-[9px] text-gray-400">Uploaded</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-emerald-600">{tradie.docSummary.verified}</p>
                    <p className="text-[9px] text-gray-400">Verified</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-amber-600">{tradie.docSummary.pending}</p>
                    <p className="text-[9px] text-gray-400">Pending</p>
                  </div>
                </div>

                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1.5">
                  <div
                    className="h-full bg-[#2563EB] rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-400 text-right">
                  {tradie.docSummary.verified}/{tradie.docSummary.total} verified
                </p>
              </Link>
            )
          })}
        </div>
      )}

      {total > 20 && (
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-500 disabled:opacity-30 hover:bg-gray-50">Previous</button>
          <span className="px-3 py-1.5 text-xs text-gray-400">Page {page} of {Math.ceil(total / 20)}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(total / 20)}
            className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-500 disabled:opacity-30 hover:bg-gray-50">Next</button>
        </div>
      )}
    </div>
  )
}
