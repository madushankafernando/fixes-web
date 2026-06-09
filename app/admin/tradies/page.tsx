// app/admin/tradies/page.tsx

'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { ShieldCheck, Loader2, Clock, CheckCircle, XCircle, ChevronRight } from 'lucide-react'
import { api } from '@/lib/api'
import { CATEGORY_LABELS } from '@/lib/constants'
import type { User, TradieCategory } from '@/lib/types'


interface WaitlistTradie {
  _id: string
  userId: Pick<User, '_id' | 'name' | 'email' | 'fixId' | 'createdAt' | 'avatarUrl'>
  categories: string[]
  skillLevel: string
  waitlistStatus: 'pending' | 'approved' | 'rejected'
  waitlistNotes?: string | null
  waitlistReviewedAt?: string | null
  createdAt: string
}

interface PendingTradie {
  userId: Pick<User, '_id' | 'name' | 'email' | 'fixId' | 'createdAt' | 'avatarUrl'>
  categories: string[]
  isFullyVerified: boolean
  rating: { average: number; count: number }
  docSummary: { total: number; uploaded: number; verified: number; pending: number }
}

type Tab = 'waitlist' | 'documents'


function WaitlistTab() {
  const [tradies, setTradies] = useState<WaitlistTradie[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [rejectModalId, setRejectModalId] = useState<string | null>(null)
  const [rejectNotes, setRejectNotes] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchTradies = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await api.getPaginated<WaitlistTradie>(`/api/admin/tradies/waitlist?status=pending&page=${page}&limit=20`)
      setTradies(res.data)
      setTotal(res.pagination.total)
    } catch { /* silent */ } finally { setIsLoading(false) }
  }, [page])

  useEffect(() => { fetchTradies() }, [fetchTradies])

  const handleApprove = async (userId: string) => {
    setActionLoading(userId + '_approve')
    try {
      await api.patch(`/api/admin/tradies/${userId}/waitlist-approve`, {})
      fetchTradies()
    } catch { /* silent */ } finally { setActionLoading(null) }
  }

  const handleReject = async () => {
    if (!rejectModalId) return
    setActionLoading(rejectModalId + '_reject')
    try {
      await api.patch(`/api/admin/tradies/${rejectModalId}/waitlist-reject`, { notes: rejectNotes })
      setRejectModalId(null)
      setRejectNotes('')
      fetchTradies()
    } catch { /* silent */ } finally { setActionLoading(null) }
  }

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime()
    const hours = Math.floor(diff / 3_600_000)
    const days  = Math.floor(hours / 24)
    if (days  > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return 'just now'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 text-[#2563EB] animate-spin" />
      </div>
    )
  }

  if (tradies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-500" />
        </div>
        <p className="text-base font-semibold text-gray-700 mb-1">All clear!</p>
        <p className="text-sm text-gray-400">No tradies waiting for approval.</p>
      </div>
    )
  }

  return (
    <>
      <p className="text-xs text-gray-400 mb-4">{total} pending approval</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tradies.map((tradie) => {
          const user = tradie.userId as User | null
          if (!user) return null
          const isApprovingThis = actionLoading === user._id + '_approve'
          const isRejectingThis = actionLoading === user._id + '_reject'

          return (
            <div
              key={user._id}
              className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#2563EB] flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-gray-800 truncate">{user.name}</h3>
                  <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                </div>
                <span className="text-[10px] text-gray-400 shrink-0">{timeAgo(tradie.createdAt)}</span>
              </div>

              <div className="flex flex-wrap gap-1">
                {tradie.categories.slice(0, 3).map((cat) => (
                  <span key={cat} className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600">
                    {CATEGORY_LABELS[cat as TradieCategory] || cat}
                  </span>
                ))}
                {tradie.skillLevel && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 capitalize">
                    {tradie.skillLevel}
                  </span>
                )}
              </div>

              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => handleApprove(user._id)}
                  disabled={!!actionLoading}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {isApprovingThis
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <CheckCircle className="w-3.5 h-3.5" />
                  }
                  Approve
                </button>
                <button
                  onClick={() => { setRejectModalId(user._id); setRejectNotes('') }}
                  disabled={!!actionLoading}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold transition-colors disabled:opacity-50 border border-red-100"
                >
                  {isRejectingThis
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <XCircle className="w-3.5 h-3.5" />
                  }
                  Reject
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {total > 20 && (
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-500 disabled:opacity-30 hover:bg-gray-50">Previous</button>
          <span className="px-3 py-1.5 text-xs text-gray-400">Page {page} of {Math.ceil(total / 20)}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(total / 20)}
            className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-500 disabled:opacity-30 hover:bg-gray-50">Next</button>
        </div>
      )}

      {rejectModalId && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setRejectModalId(null)} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl shadow-2xl p-6 max-w-md mx-auto">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Reject Application</h3>
            <p className="text-xs text-gray-400 mb-4">The tradie will see this reason on their waitlist screen.</p>
            <textarea
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              placeholder="Reason for rejection (optional but recommended)…"
              rows={3}
              className="w-full border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 p-3 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setRejectModalId(null)}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!!actionLoading}
                className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Rejecting…' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}


function DocumentsTab() {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 text-[#2563EB] animate-spin" />
      </div>
    )
  }

  if (tradies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
          <ShieldCheck className="w-8 h-8 text-emerald-500" />
        </div>
        <p className="text-base font-semibold text-gray-700 mb-1">All clear!</p>
        <p className="text-sm text-gray-400">No pending documents to review.</p>
      </div>
    )
  }

  return (
    <>
      <p className="text-xs text-gray-400 mb-4">{total} pending document review</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tradies.map((tradie) => {
          const user = tradie.userId as User | null
          if (!user) return null
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
                <div className="h-full bg-[#2563EB] rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <p className="text-[10px] text-gray-400 text-right">{tradie.docSummary.verified}/{tradie.docSummary.total} verified</p>
            </Link>
          )
        })}
      </div>

      {total > 20 && (
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-500 disabled:opacity-30 hover:bg-gray-50">Previous</button>
          <span className="px-3 py-1.5 text-xs text-gray-400">Page {page} of {Math.ceil(total / 20)}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(total / 20)}
            className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-500 disabled:opacity-30 hover:bg-gray-50">Next</button>
        </div>
      )}
    </>
  )
}


export default function AdminTradiesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('waitlist')

  const tabs: { id: Tab; label: string; icon: typeof Clock }[] = [
    { id: 'waitlist',   label: 'Waitlist',          icon: Clock },
    { id: 'documents',  label: 'Document Review',    icon: ShieldCheck },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Tradie Management</h1>
        <p className="text-sm text-gray-400 mt-0.5">Approve new tradies and verify compliance documents</p>
      </div>

      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6 w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'waitlist'  && <WaitlistTab />}
      {activeTab === 'documents' && <DocumentsTab />}
    </div>
  )
}
