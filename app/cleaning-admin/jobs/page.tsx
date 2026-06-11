'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Briefcase, Filter, Loader2, Clock, User, MapPin } from 'lucide-react'
import { api } from '@/lib/api'
import { useCleaningAdminSubscription } from '@/contexts/cleaning-admin-realtime-context'
import { CLEANING_TYPE_LABELS, JOB_STATUS_LABELS, JOB_STATUS_COLORS } from '@/lib/constants'
import type { Job, JobStatus, JobCategory } from '@/lib/types'

const STATUS_FILTERS: { label: string; value: JobStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Dispatching', value: 'dispatching' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
]

export default function CleaningJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all')

  const fetchJobs = useCallback(() => {
    setIsLoading(true)
    const qs = statusFilter !== 'all' ? `?status=${statusFilter}` : ''
    api.getPaginated<Job>(`/api/cleaning-admin/jobs${qs}`)
      .then((res) => setJobs(res.data ?? []))
      .catch(() => setJobs([]))
      .finally(() => setIsLoading(false))
  }, [statusFilter])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  useCleaningAdminSubscription(['jobs'], () => {
    fetchJobs()
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Job Queue</h1>
        <span className="text-sm text-gray-500">{jobs.length} jobs</span>
      </div>

      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-gray-400 shrink-0" />
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              statusFilter === f.value
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Briefcase className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">No jobs found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {jobs.map((job) => {
              const cleaningType = (job as any).cleaningType
              const tasks = (job as any).cleaningTasks || []
              const completedTasks = tasks.filter((t: any) => t.status === 'completed').length
              const assignedTradie = typeof job.assignedTradieId === 'object' && job.assignedTradieId
                ? job.assignedTradieId : null
              const client = typeof job.clientId === 'object' && job.clientId ? job.clientId : null

              return (
                <Link
                  key={job._id}
                  href={`/cleaning-admin/jobs/${job._id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-gray-800 truncate">{job.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${JOB_STATUS_COLORS[job.status]}`}>
                        {JOB_STATUS_LABELS[job.status]}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                      {cleaningType && (
                        <span className="text-teal-600 font-medium">{CLEANING_TYPE_LABELS[cleaningType] || cleaningType}</span>
                      )}
                      <span>{job.jobCode}</span>
                      {client && <span className="flex items-center gap-0.5"><User className="w-3 h-3" />{(client as any).name}</span>}
                      {assignedTradie && <span className="text-gray-600">Assigned: {(assignedTradie as any).name}</span>}
                      {tasks.length > 0 && (
                        <span className="text-teal-600">{completedTasks}/{tasks.length} tasks</span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(job.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
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
