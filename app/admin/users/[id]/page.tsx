// fixes-web/app/admin/users/[id]/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, User as UserIcon, Mail, Phone, Calendar,
  ShieldCheck, Ban, CheckCircle2, Briefcase, Loader2,
} from 'lucide-react'
import { api } from '@/lib/api'
import { JOB_STATUS_LABELS, JOB_STATUS_COLORS, CATEGORY_LABELS } from '@/lib/constants'
import type { AdminUserDetail, JobCategory, JobStatus } from '@/lib/types'

export default function AdminUserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const [data, setData] = useState<AdminUserDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<AdminUserDetail>(`/api/admin/users/${userId}`)
        setData(res.data)
      } catch { /* silent */ } finally { setIsLoading(false) }
    }
    load()
  }, [userId])

  const handleBan = async () => {
    if (!data) return
    try {
      await api.patch(`/api/admin/users/${userId}/ban`)
      setData((prev) => prev ? { ...prev, user: { ...prev.user, isActive: !prev.user.isActive } } : prev)
    } catch { /* silent */ }
  }

  if (isLoading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="w-6 h-6 text-[#2563EB] animate-spin" />
    </div>
  )

  if (!data) return (
    <div className="flex flex-col items-center justify-center py-24">
      <UserIcon className="w-10 h-10 text-gray-300 mb-3" />
      <p className="text-sm text-gray-400">User not found</p>
      <button onClick={() => router.push('/admin/users')} className="text-xs text-[#2563EB] hover:underline mt-2">Back to users</button>
    </div>
  )

  const { user, profile, recentJobs } = data

  return (
    <div>
      <button onClick={() => router.push('/admin/users')}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors mb-5">
        <ArrowLeft className="w-3.5 h-3.5" />Back to users
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-full bg-[#2563EB] flex items-center justify-center text-white font-bold text-lg shrink-0">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900">{user.name}</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium capitalize bg-[#EFF6FF] text-[#2563EB]">{user.role}</span>
            </div>
          </div>

          <div className="space-y-2.5 text-xs mb-5">
            <div className="flex items-center gap-2 text-gray-500">
              <Mail className="w-3.5 h-3.5 text-gray-400" /><span>{user.email}</span>
              {user.isEmailVerified && <CheckCircle2 className="w-3 h-3 text-emerald-500 ml-auto" />}
            </div>
            {user.phone && (
              <div className="flex items-center gap-2 text-gray-500">
                <Phone className="w-3.5 h-3.5 text-gray-400" /><span>{user.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-500">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>Joined {new Date(user.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <p className="text-gray-400 font-mono text-[10px] pt-1">{user.fixId}</p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            {user.isActive ? (
              <span className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle2 className="w-3.5 h-3.5" />Active</span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-red-500"><Ban className="w-3.5 h-3.5" />Banned</span>
            )}
            {user.role !== 'admin' && (
              <button onClick={handleBan}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  user.isActive ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                }`}>
                {user.isActive ? 'Ban User' : 'Unban User'}
              </button>
            )}
          </div>
        </div>

        {profile && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#2563EB]" />Tradie Profile
            </h2>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-gray-400 block mb-2">Categories</span>
                <div className="flex flex-wrap gap-1">
                  {profile.categories.map((cat) => (
                    <span key={cat} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                      {CATEGORY_LABELS[cat as JobCategory] || cat}
                    </span>
                  ))}
                </div>
              </div>
              {[
                ['Rating', `${profile.rating.average.toFixed(1)} (${profile.rating.count})`],
                ['Success Rate', `${Math.round(profile.jobSuccessRate)}%`],
                ['Verified', profile.isFullyVerified ? 'Fully Verified' : 'Pending'],
                ['Online', profile.isOnline ? 'Yes' : 'No'],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-400">{label}</span>
                  <span className={
                    val === 'Fully Verified' ? 'text-emerald-600' :
                    val === 'Pending' ? 'text-amber-600' : 'text-gray-700'
                  }>{val}</span>
                </div>
              ))}
              <Link href={`/admin/tradies/${userId}`}
                className="block text-center text-xs font-medium mt-3 py-2 rounded-lg bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE] transition-colors">
                View Documents →
              </Link>
            </div>
          </div>
        )}

        <div className={`bg-white rounded-xl border border-gray-200 p-5 ${!profile ? 'lg:col-span-2' : ''}`}>
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-[#2563EB]" />Recent Jobs
          </h2>
          {!recentJobs || recentJobs.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">No jobs yet</p>
          ) : (
            <div className="space-y-2">
              {recentJobs.map((job) => (
                <div key={job._id} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-xs text-gray-700 font-medium">{job.title}</p>
                    <p className="text-[10px] text-gray-400">{job.jobCode} • {CATEGORY_LABELS[job.category as JobCategory] || job.category}</p>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${JOB_STATUS_COLORS[job.status as JobStatus]}`}>
                    {JOB_STATUS_LABELS[job.status as JobStatus]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
