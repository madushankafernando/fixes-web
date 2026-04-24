// fixes-web/app/dashboard/jobs/page.tsx

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Briefcase, PlusCircle, Filter } from 'lucide-react'
import { api } from '@/lib/api'
import { JOB_STATUS_LABELS, JOB_STATUS_COLORS, CATEGORY_LABELS } from '@/lib/constants'
import type { Job, JobStatus, JobCategory } from '@/lib/types'
import { SkeletonJobList } from '../_components/skeletons'

const STATUS_FILTERS: { label: string; value: JobStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Quoted', value: 'quoted' },
  { label: 'Dispatching', value: 'dispatching' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
]

export default function MyJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all')

  useEffect(() => {
    async function fetchJobs() {
      try {
        const qs = statusFilter !== 'all' ? `&status=${statusFilter}` : ''
        const res = await api.getPaginated<Job>(`/api/jobs?limit=100${qs}`)
        setJobs(res.data)
      } catch {
      } finally {
        setIsLoading(false)
      }
    }
    setIsLoading(true)
    fetchJobs()
    
    const unsubs = () => window.removeEventListener('app:refresh_data', fetchJobs)
    window.addEventListener('app:refresh_data', fetchJobs)
    
    return unsubs
  }, [statusFilter])

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-(--upwork-navy)">My Jobs</h1>
        <Link
          href="/post-job"
          className="inline-flex items-center gap-1.5 bg-(--upwork-green) hover:bg-(--upwork-green-dark) text-white font-medium text-sm py-2.5 px-5 rounded-xl transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Post a Job
        </Link>
      </div>

      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-gray-400 shrink-0" />
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              statusFilter === f.value
                ? 'bg-(--upwork-navy) text-white'
                : 'bg-gray-100 text-(--upwork-gray) hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        {isLoading ? (
          <SkeletonJobList />
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Briefcase className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-(--upwork-navy) font-medium mb-1">
              {statusFilter === 'all' ? 'No jobs yet' : 'No jobs with this status'}
            </p>
            <p className="text-sm text-(--upwork-gray) text-center">
              {statusFilter === 'all'
                ? 'Post your first job to get started.'
                : 'Try a different filter.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {jobs.map((job) => {
              const assignedTradie =
                typeof job.assignedTradieId === 'object' && job.assignedTradieId
                  ? job.assignedTradieId
                  : null

              return (
                <Link
                  key={job._id}
                  href={`/dashboard/jobs/${job.jobCode}`}
                  className="flex items-center justify-between px-3 sm:px-5 py-3 sm:py-4 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-xs sm:text-sm font-medium text-(--upwork-navy) truncate group-hover:text-(--upwork-green) transition-colors">
                        {job.title}
                      </h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${JOB_STATUS_COLORS[job.status]}`}
                      >
                        {JOB_STATUS_LABELS[job.status]}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-400">
                      <span>{CATEGORY_LABELS[job.category as JobCategory] || job.category}</span>
                      <span>•</span>
                      <span>{job.jobCode}</span>
                      {assignedTradie && (
                        <>
                          <span>•</span>
                          <span className="text-(--upwork-navy)">{assignedTradie.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(job.createdAt).toLocaleDateString('en-AU', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
