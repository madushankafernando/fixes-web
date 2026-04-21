// fixes-web/app/admin/bug-reports/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { Bug, Filter, RefreshCw, ChevronDown } from 'lucide-react'
import { api } from '@/lib/api'


interface Reporter {
  name: string
  email: string
  fixId: string
  role: string
}

interface BugReport {
  _id: string
  category: string
  title: string
  description: string
  status: 'open' | 'investigating' | 'resolved' | 'wont_fix'
  reporter: Reporter
  platform: string
  appVersion: string
  createdAt: string
}

interface ApiResult {
  reports: BugReport[]
  pagination: { total: number; page: number; pages: number }
}


const CATEGORIES = ['App Crash', 'Payment Issue', 'Job Dispatch', 'Profile', 'Chat', 'Other']

const STATUS_CONFIG = {
  open:          { label: 'Open',          classes: 'bg-red-100 text-red-700' },
  investigating: { label: 'Investigating', classes: 'bg-amber-100 text-amber-700' },
  resolved:      { label: 'Resolved',      classes: 'bg-green-100 text-green-700' },
  wont_fix:      { label: "Won't Fix",     classes: 'bg-gray-100 text-gray-500' },
}

const TRANSITIONS: Record<string, string[]> = {
  open:          ['investigating', 'wont_fix'],
  investigating: ['resolved', 'wont_fix'],
  resolved:      ['open'],
  wont_fix:      ['open'],
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}


export default function BugReportsPage() {
  const [reports, setReports]               = useState<BugReport[]>([])
  const [total, setTotal]                   = useState(0)
  const [loading, setLoading]               = useState(true)
  const [statusFilter, setStatusFilter]     = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [expanded, setExpanded]             = useState<string | null>(null)
  const [updating, setUpdating]             = useState<string | null>(null)

  const loadReports = async (status = statusFilter, category = categoryFilter) => {
    setLoading(true)
    try {
      const qs = new URLSearchParams({ limit: '50' })
      if (status !== 'all')   qs.set('status', status)
      if (category !== 'all') qs.set('category', category)
      const res = await api.get<ApiResult>(`/api/support/bug-reports?${qs}`)
      setReports(res.data.reports)
      setTotal(res.data.pagination.total)
    } catch { /* silent */ } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadReports() }, [])

  const handleStatusFilter = (val: string) => {
    setStatusFilter(val)
    loadReports(val, categoryFilter)
  }

  const handleCategoryFilter = (val: string) => {
    setCategoryFilter(val)
    loadReports(statusFilter, val)
  }

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdating(id)
    try {
      await api.patch(`/api/support/bug-reports/${id}/status`, { status: newStatus })
      setReports(prev =>
        prev.map(r => r._id === id ? { ...r, status: newStatus as BugReport['status'] } : r)
      )
    } catch { /* silent */ } finally {
      setUpdating(null)
    }
  }

  const counts = reports.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Bug className="w-6 h-6 text-red-500" />
            Bug Reports
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">{total} total submissions</p>
        </div>
        <button
          onClick={() => loadReports()}
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

        <div className="w-px h-5 bg-gray-200 mx-1" />

        <select
          value={categoryFilter}
          onChange={e => handleCategoryFilter(e.target.value)}
          className="px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 bg-white text-gray-500 outline-none cursor-pointer"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Bug className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-700 font-medium mb-1">No reports found</p>
            <p className="text-sm text-gray-400">Try a different filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {reports.map((report) => {
              const cfg       = STATUS_CONFIG[report.status]
              const isOpen    = expanded === report._id
              const nextSteps = TRANSITIONS[report.status] ?? []

              return (
                <div key={report._id}>
                  <button
                    onClick={() => setExpanded(isOpen ? null : report._id)}
                    className="w-full flex items-start sm:items-center justify-between px-4 sm:px-5 py-4 hover:bg-gray-50 transition-colors text-left group"
                  >
                    <div className="flex-1 min-w-0 mr-3">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${cfg.classes}`}>
                          {cfg.label}
                        </span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">
                          {report.category}
                        </span>
                        <span className="text-xs text-gray-400 shrink-0">
                          {report.platform} · v{report.appVersion}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-[#2563EB] transition-colors">
                        {report.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {report.reporter.name} ({report.reporter.role}) · {report.reporter.fixId}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-gray-400 hidden sm:block">{fmt(report.createdAt)}</span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-3 bg-gray-50 border-t border-gray-100 space-y-4">
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Description</p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-white border border-gray-200 rounded-lg px-4 py-3">
                          {report.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { label: 'Name',     value: report.reporter.name },
                          { label: 'Email',    value: report.reporter.email },
                          { label: 'Fix ID',   value: report.reporter.fixId },
                          { label: 'Reported', value: fmt(report.createdAt) },
                        ].map(({ label, value }) => (
                          <div key={label} className="bg-white border border-gray-200 rounded-lg p-2.5">
                            <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
                            <p className="text-xs font-medium text-gray-700 truncate">{value}</p>
                          </div>
                        ))}
                      </div>

                      {nextSteps.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <span className="text-xs text-gray-400 font-medium">Move to:</span>
                          {nextSteps.map(s => (
                            <button
                              key={s}
                              disabled={updating === report._id}
                              onClick={() => updateStatus(report._id, s)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity disabled:opacity-50 hover:opacity-80 ${
                                STATUS_CONFIG[s as keyof typeof STATUS_CONFIG].classes
                              }`}
                            >
                              {updating === report._id
                                ? '…'
                                : STATUS_CONFIG[s as keyof typeof STATUS_CONFIG].label}
                            </button>
                          ))}
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
