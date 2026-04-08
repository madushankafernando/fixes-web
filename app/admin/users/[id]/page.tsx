'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  Ban,
  CheckCircle2,
  Briefcase,
  Loader2,
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
      } catch {
        // Silent
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [userId])

  const handleBan = async () => {
    if (!data) return
    try {
      await api.patch(`/api/admin/users/${userId}/ban`)
      setData((prev) => prev ? { ...prev, user: { ...prev.user, isActive: !prev.user.isActive } } : prev)
    } catch {
      // Silent
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <UserIcon className="w-10 h-10 text-white/20 mb-3" />
        <p className="text-sm text-white/40">User not found</p>
        <button onClick={() => router.push('/admin/users')} className="text-xs text-cyan-400 hover:underline mt-2">
          Back to users
        </button>
      </div>
    )
  }

  const { user, profile, recentJobs } = data

  return (
    <div>
      <button
        onClick={() => router.push('/admin/users')}
        className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors mb-4"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to users
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* User info card */}
        <div className="bg-[#1e293b] rounded-xl border border-white/10 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold text-lg">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">{user.name}</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 font-medium capitalize">
                {user.role}
              </span>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-white/50">
              <Mail className="w-3.5 h-3.5" />
              <span>{user.email}</span>
              {user.isEmailVerified && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
            </div>
            {user.phone && (
              <div className="flex items-center gap-2 text-white/50">
                <Phone className="w-3.5 h-3.5" />
                <span>{user.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-white/50">
              <Calendar className="w-3.5 h-3.5" />
              <span>Joined {new Date(user.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2 text-white/40 font-mono text-[10px]">
              {user.fixId}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {user.isActive ? (
                <span className="flex items-center gap-1 text-xs text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Active
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-red-400">
                  <Ban className="w-3.5 h-3.5" />
                  Banned
                </span>
              )}
            </div>
            {user.role !== 'admin' && (
              <button
                onClick={handleBan}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  user.isActive
                    ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                }`}
              >
                {user.isActive ? 'Ban User' : 'Unban User'}
              </button>
            )}
          </div>
        </div>

        {/* Tradie profile (if tradie) */}
        {profile && (
          <div className="bg-[#1e293b] rounded-xl border border-white/10 p-5">
            <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Tradie Profile
            </h2>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-white/40 block mb-1">Categories</span>
                <div className="flex flex-wrap gap-1">
                  {profile.categories.map((cat) => (
                    <span key={cat} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                      {CATEGORY_LABELS[cat as JobCategory] || cat}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Rating</span>
                <span className="text-white">{profile.rating.average.toFixed(1)} ({profile.rating.count})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Success Rate</span>
                <span className="text-white">{Math.round(profile.jobSuccessRate)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Verified</span>
                <span className={profile.isFullyVerified ? 'text-emerald-400' : 'text-amber-400'}>
                  {profile.isFullyVerified ? 'Fully Verified' : 'Pending'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Online</span>
                <span className={profile.isOnline ? 'text-emerald-400' : 'text-white/40'}>
                  {profile.isOnline ? 'Yes' : 'No'}
                </span>
              </div>
              <Link
                href={`/admin/tradies/${userId}`}
                className="block text-center text-xs text-cyan-400 hover:underline mt-2"
              >
                View Documents →
              </Link>
            </div>
          </div>
        )}

        {/* Recent Jobs */}
        <div className={`bg-[#1e293b] rounded-xl border border-white/10 p-5 ${!profile ? 'lg:col-span-2' : ''}`}>
          <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-cyan-400" />
            Recent Jobs
          </h2>
          {recentJobs.length === 0 ? (
            <p className="text-xs text-white/30 py-4 text-center">No jobs</p>
          ) : (
            <div className="space-y-2">
              {recentJobs.map((job) => (
                <div
                  key={job._id}
                  className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                >
                  <div>
                    <p className="text-xs text-white font-medium">{job.title}</p>
                    <p className="text-[10px] text-white/30">{job.jobCode} • {CATEGORY_LABELS[job.category as JobCategory] || job.category}</p>
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
