'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Search, Briefcase, Loader2, Filter, ChevronRight } from 'lucide-react'
import { api } from '@/lib/api'
import { JOB_STATUS_LABELS, JOB_STATUS_COLORS, CATEGORY_LABELS, VALID_CATEGORIES } from '@/lib/constants'
import type { Job, JobStatus, JobCategory, User, Quote } from '@/lib/types'

const STATUS_OPTIONS: { label: string; value: JobStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Analyzing', value: 'analyzing' },
  { label: 'Quoted', value: 'quoted' },
  { label: 'Dispatching', value: 'dispatching' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
]

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  const fetchJobs = useCallback(async () => {
    setIsLoading(true)
    try {
      const qs = new URLSearchParams()
      qs.set('page', String(page))
      qs.set('limit', '20')
      if (statusFilter !== 'all') qs.set('status', statusFilter)
      if (categoryFilter !== 'all') qs.set('category', categoryFilter)
      if (search) qs.set('search', search)
      const res = await api.getPaginated<Job>(`/api/admin/jobs?${qs.toString()}`)
      setJobs(res.data)
      setTotal(res.pagination.total)
    } catch { /* silent */ } finally { setIsLoading(false) }
  }, [page, statusFilter, categoryFilter, search])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Jobs</h1>
        <p className="text-sm text-gray-400 mt-0.5">Monitor all platform jobs</p>
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { setSearch(searchInput); setPage(1) } }}
            placeholder="Search by title or job code..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
          />
        </div>
        <button
          onClick={() => { setSearch(searchInput); setPage(1) }}
          className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-medium rounded-lg transition-colors"
        >
          Search
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setStatusFilter(opt.value); setPage(1) }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap transition-colors ${
                statusFilter === opt.value
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }}
          className="bg-white border border-gray-200 rounded-lg text-xs text-gray-600 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
        >
          <option value="all">All Categories</option>
          {VALID_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
          ))}
        </select>
      </div>

      {!isLoading && <p className="text-xs text-gray-400 mb-3">{total} job{total !== 1 ? 's' : ''}</p>}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 text-[#2563EB] animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Briefcase className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">No jobs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Job','Client','Category','Price','Status','Date'].map((h, i) => (
                    <th key={h} className={`text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider ${i === 2 ? 'hidden sm:table-cell' : ''} ${i >= 3 ? 'hidden md:table-cell' : ''}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {jobs.map((job) => {
                  const client = typeof job.clientId === 'object' ? (job.clientId as User) : null
                  const quote = typeof job.quote === 'object' ? (job.quote as Quote) : null
                  return (
                    <tr key={job._id} className="hover:bg-blue-50/50 transition-colors cursor-pointer">
                      <td className="px-4 py-3">
                        <Link href={`/admin/jobs/${job._id}`} className="block">
                          <p className="text-xs font-medium text-gray-800">{job.title}</p>
                          <p className="text-[10px] font-mono text-gray-400">{job.jobCode}</p>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-gray-500">{client?.name || '—'}</p>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-[10px] text-gray-400">{CATEGORY_LABELS[job.category as JobCategory] || job.category}</span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs text-gray-600">{quote ? `$${quote.suggestedFixedPrice}` : '—'}</span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${JOB_STATUS_COLORS[job.status]}`}>
                          {JOB_STATUS_LABELS[job.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-[10px] text-gray-400">
                          {new Date(job.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/jobs/${job._id}`}>
                          <ChevronRight className="w-4 h-4 text-gray-300" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
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
    </div>
  )
}
