'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Briefcase, Users, DollarSign, Clock, Loader2, TrendingUp } from 'lucide-react'
import { api } from '@/lib/api'
import { useCleaningAdminSubscription } from '@/contexts/cleaning-admin-realtime-context'

interface DashboardStats {
  totalJobs: number
  activeJobs: number
  pendingDispatch: number
  completedToday: number
  totalCleaners: number
  onlineCleaners: number
  revenue: { total: number; thisWeek: number }
}

export default function CleaningAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchDashboard = useCallback(() => {
    api.get<{ stats: Omit<DashboardStats, 'revenue'> & { todayScheduled?: number }; recentJobs: unknown[] }>(
      '/api/cleaning-admin/dashboard'
    )
      .then((res) => {
        const s = res.data.stats
        setStats({
          totalJobs: (res.data.recentJobs?.length ?? 0) + s.activeJobs + s.pendingDispatch,
          activeJobs: s.activeJobs,
          pendingDispatch: s.pendingDispatch,
          completedToday: s.completedToday,
          totalCleaners: s.totalCleaners,
          onlineCleaners: s.onlineCleaners,
          revenue: { total: 0, thisWeek: 0 },
        })
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => { fetchDashboard() }, [fetchDashboard])

  useCleaningAdminSubscription(['dashboard', 'jobs', 'cleaners', 'revenue'], () => {
    fetchDashboard()
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />
      </div>
    )
  }

  const cards = [
    { label: 'Active Jobs', value: stats?.activeJobs ?? 0, icon: Briefcase, color: 'bg-teal-50 text-teal-700', href: '/cleaning-admin/jobs' },
    { label: 'Pending Dispatch', value: stats?.pendingDispatch ?? 0, icon: Clock, color: 'bg-amber-50 text-amber-700', href: '/cleaning-admin/jobs' },
    { label: 'Total Cleaners', value: stats?.totalCleaners ?? 0, icon: Users, color: 'bg-blue-50 text-blue-700', href: '/cleaning-admin/cleaners' },
    { label: 'Completed Today', value: stats?.completedToday ?? 0, icon: TrendingUp, color: 'bg-green-50 text-green-700', href: '/cleaning-admin/jobs' },
    { label: 'This Week Revenue', value: `$${(stats?.revenue?.thisWeek ?? 0).toFixed(0)}`, icon: DollarSign, color: 'bg-purple-50 text-purple-700', href: '/cleaning-admin/revenue' },
    { label: 'Online Cleaners', value: stats?.onlineCleaners ?? 0, icon: Users, color: 'bg-emerald-50 text-emerald-700', href: '/cleaning-admin/cleaners' },
  ]

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">Cleaning Admin Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.label}
              href={card.href}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                  <p className="text-xs text-gray-500">{card.label}</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">Quick Actions</h2>
          <div className="space-y-2">
            <Link href="/cleaning-admin/jobs" className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium">
              <Briefcase className="w-4 h-4" /> View Job Queue
            </Link>
            <Link href="/cleaning-admin/invites" className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium">
              <Users className="w-4 h-4" /> Generate Invite Link
            </Link>
            <Link href="/cleaning-admin/rates" className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium">
              <DollarSign className="w-4 h-4" /> Update Rates
            </Link>
            <Link href="/cleaning-admin/revenue" className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium">
              <TrendingUp className="w-4 h-4" /> Revenue Report
            </Link>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">System Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Total Jobs (All Time)</span>
              <span className="font-medium text-gray-800">{stats?.totalJobs ?? 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Total Revenue</span>
              <span className="font-medium text-gray-800">${(stats?.revenue?.total ?? 0).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Cleaners Online Now</span>
              <span className="font-medium text-gray-800">{stats?.onlineCleaners ?? 0} / {stats?.totalCleaners ?? 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
