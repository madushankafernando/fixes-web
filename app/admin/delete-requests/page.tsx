// app/admin/delete-requests/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { Trash2, Filter, RefreshCw, ChevronDown, Check, X } from 'lucide-react'
import { api } from '@/lib/api'


interface DeleteRequest {
  _id: string
  email: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  reviewedBy?: {
    name: string
    email: string
  }
  reviewedAt?: string
}

interface ApiResult {
  success: boolean
  data: DeleteRequest[]
  pagination: { total: number; page: number; pages: number }
  message: string
}


const STATUS_CONFIG = {
  pending:  { label: 'Pending',  classes: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Approved', classes: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', classes: 'bg-red-100 text-red-700' },
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}


export default function DeleteRequestsPage() {
  const [requests, setRequests]             = useState<DeleteRequest[]>([])
  const [total, setTotal]                   = useState(0)
  const [loading, setLoading]               = useState(true)
  const [statusFilter, setStatusFilter]     = useState('all')
  const [expanded, setExpanded]             = useState<string | null>(null)
  const [updating, setUpdating]             = useState<string | null>(null)

  const loadRequests = async (status = statusFilter) => {
    setLoading(true)
    try {
      const qs = new URLSearchParams({ limit: '50' })
      if (status !== 'all') qs.set('status', status)
      const res = await api.raw<ApiResult>(`/api/admin/delete-requests?${qs}`)
      
      const list = Array.isArray(res.data) ? res.data : []
      setRequests(list)
      setTotal(res.pagination?.total || 0)
    } catch { /* silent */ } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadRequests() }, [])

  const handleStatusFilter = (val: string) => {
    setStatusFilter(val)
    loadRequests(val)
  }

  const updateStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
    if (!window.confirm(`Are you sure you want to ${newStatus} this request?`)) return
    
    setUpdating(id)
    try {
      const endpointAction = newStatus === 'approved' ? 'approve' : 'reject'
      await api.patch(`/api/admin/delete-requests/${id}/${endpointAction}`)
      setRequests(prev => prev.map(r => r._id === id ? { ...r, status: newStatus } : r))
    } catch (err: any) {
      alert(err.message || 'Failed to update request')
    } finally {
      setUpdating(null)
    }
  }

  const counts = requests.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Trash2 className="w-6 h-6 text-red-500" />
            Account Deletion Requests
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">{total} total requests</p>
        </div>
        <button
          onClick={() => loadRequests()}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 border border-gray-200 bg-white hover:bg-gray-50 px-4 py-2 rounded-xl transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {(Object.entries(STATUS_CONFIG) as [string, { label: string; classes: string }][]).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => handleStatusFilter(statusFilter === key ? 'all' : key)}
            className={`bg-white border rounded-xl p-4 text-left transition-colors hover:border-[#2563EB] ${statusFilter === key ? 'border-[#2563EB] shadow-sm' : 'border-gray-200'}`}
          >
            <p className="text-2xl font-bold text-gray-800 mb-1">{counts[key] ?? 0}</p>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.classes}`}>{cfg.label}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-5">
        <Filter className="w-4 h-4 text-gray-400 shrink-0" />

        {['all', ...Object.keys(STATUS_CONFIG)].map((s) => (
          <button
            key={s}
            onClick={() => handleStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              statusFilter === s
                ? 'bg-[#2563EB] text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {s === 'all' ? 'All' : STATUS_CONFIG[s as keyof typeof STATUS_CONFIG].label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-700 font-medium mb-1">No requests found</p>
            <p className="text-sm text-gray-400">Try a different filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {requests.map((req) => {
              const cfg       = STATUS_CONFIG[req.status]
              const isOpen    = expanded === req._id

              return (
                <div key={req._id}>
                  <button
                    onClick={() => setExpanded(isOpen ? null : req._id)}
                    className="w-full flex items-start sm:items-center justify-between px-4 sm:px-5 py-4 hover:bg-gray-50 transition-colors text-left group"
                  >
                    <div className="flex-1 min-w-0 mr-3">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${cfg.classes}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-[#2563EB] transition-colors">
                        {req.email}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                        {req.reason}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-gray-400 hidden sm:block">{fmt(req.createdAt)}</span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-3 bg-gray-50 border-t border-gray-100 space-y-4">
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Reason provided</p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-white border border-gray-200 rounded-lg px-4 py-3">
                          {req.reason}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { label: 'Email',    value: req.email },
                          { label: 'Requested', value: fmt(req.createdAt) },
                          { label: 'Reviewed By', value: req.reviewedBy ? req.reviewedBy.name : 'Pending' },
                          { label: 'Reviewed At', value: req.reviewedAt ? fmt(req.reviewedAt) : 'Pending' },
                        ].map(({ label, value }) => (
                          <div key={label} className="bg-white border border-gray-200 rounded-lg p-2.5">
                            <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
                            <p className="text-xs font-medium text-gray-700 truncate">{value}</p>
                          </div>
                        ))}
                      </div>

                      {req.status === 'pending' && (
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <button
                            disabled={updating === req._id}
                            onClick={() => updateStatus(req._id, 'approved')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-100 text-green-700 transition-opacity disabled:opacity-50 hover:opacity-80"
                          >
                            <Check className="w-3.5 h-3.5" />
                            {updating === req._id ? 'Processing...' : 'Approve & Deactivate User'}
                          </button>
                          
                          <button
                            disabled={updating === req._id}
                            onClick={() => updateStatus(req._id, 'rejected')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-100 text-red-700 transition-opacity disabled:opacity-50 hover:opacity-80"
                          >
                            <X className="w-3.5 h-3.5" />
                            {updating === req._id ? 'Processing...' : 'Reject Request'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
