// fixes-web/app/dashboard/page.tsx

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Briefcase, PlusCircle, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { api } from '@/lib/api'
import { JOB_STATUS_LABELS, JOB_STATUS_COLORS, CATEGORY_LABELS } from '@/lib/constants'
import type { Job, JobCategory } from '@/lib/types'

export default function DashboardPage() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await api.getPaginated<Job>('/api/jobs?limit=50')
        setJobs(res.data)
      } catch {
      } finally {
        setIsLoading(false)
      }
    }
    fetchJobs()
    
    const unsubs = () => window.removeEventListener('app:refresh_data', fetchJobs)
    window.addEventListener('app:refresh_data', fetchJobs)
    
    return unsubs
  }, [])

  const activeJobs = jobs.filter(
    (j) => !['completed', 'cancelled', 'no_tradie_found'].includes(j.status)
  )
  const completedJobs = jobs.filter((j) => j.status === 'completed')
  const pendingQuotes = jobs.filter((j) => j.status === 'quoted')

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-(--upwork-navy)">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-xs sm:text-sm text-(--upwork-gray) mt-1">
          Here&apos;s what&apos;s happening with your jobs.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <Briefcase className="w-4.5 h-4.5 text-blue-600" />
            </div>
            <span className="text-sm text-(--upwork-gray)">Active Jobs</span>
          </div>
          <p className="text-3xl font-bold text-(--upwork-navy)">{activeJobs.length}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-4.5 h-4.5 text-(--upwork-green)" />
            </div>
            <span className="text-sm text-(--upwork-gray)">Completed</span>
          </div>
          <p className="text-3xl font-bold text-(--upwork-navy)">{completedJobs.length}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
              <Clock className="w-4.5 h-4.5 text-amber-600" />
            </div>
            <span className="text-sm text-(--upwork-gray)">Pending Quotes</span>
          </div>
          <p className="text-3xl font-bold text-(--upwork-navy)">{pendingQuotes.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-(--upwork-navy)">Your Jobs</h2>
          <Link
            href="/post-job"
            className="flex items-center gap-1.5 text-sm font-medium text-(--upwork-green) hover:underline"
          >
            <PlusCircle className="w-4 h-4" />
            Post a Job
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-(--upwork-green) border-t-transparent rounded-full animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Briefcase className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-(--upwork-navy) font-medium mb-1">No jobs yet</p>
            <p className="text-sm text-(--upwork-gray) mb-6 text-center">
              Post your first job and get an instant AI quote.
            </p>
            <Link
              href="/post-job"
              className="bg-(--upwork-green) hover:bg-(--upwork-green-dark) text-white font-medium py-2.5 px-6 rounded-xl transition-colors text-sm"
            >
              Post a Job
            </Link>
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
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                      <h3 className="text-xs sm:text-sm font-medium text-(--upwork-navy) truncate group-hover:text-(--upwork-green) transition-colors">
                        {job.title}
                      </h3>
                      <span
                        className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${JOB_STATUS_COLORS[job.status]}`}
                      >
                        {JOB_STATUS_LABELS[job.status]}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 text-[10px] sm:text-xs text-gray-400">
                      <span>{CATEGORY_LABELS[job.category as JobCategory] || job.category}</span>
                      <span>•</span>
                      <span>{job.jobCode}</span>
                      {assignedTradie && (
                        <>
                          <span>•</span>
                          <span className="text-(--upwork-navy)">
                            {assignedTradie.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(job.createdAt).toLocaleDateString('en-AU', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {pendingQuotes.length > 0 && (
        <div className="mt-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-700">
              You have {pendingQuotes.length} pending quote{pendingQuotes.length > 1 ? 's' : ''}
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Review and accept quotes to start finding tradies.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
