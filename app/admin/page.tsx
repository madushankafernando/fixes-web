// fixes-web/app/admin/page.tsx

'use client'

import { useEffect, useState, useCallback } from 'react'
import { Users, Briefcase, ShieldCheck, DollarSign, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react'
import { api } from '@/lib/api'
import type { AdminStats } from '@/lib/types'

const REFRESH_INTERVAL_MS = 30_000 

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const load = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true)
    else setIsRefreshing(true)
    try {
      const res = await api.get<AdminStats>('/api/admin/stats')
      setStats(res.data)
      setLastUpdated(new Date())
    } catch {
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const interval = setInterval(() => load(true), REFRESH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [load])

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const statCards = [
    {
      label: 'Total Users',
      value: stats.users.total,
      sub: `${stats.users.clients} clients • ${stats.users.tradies} tradies`,
      icon: Users,
      iconBg: 'bg-[#EFF6FF]',
      iconColor: 'text-[#2563EB]',
    },
    {
      label: 'Total Jobs',
      value: stats.jobs.total,
      sub: `${stats.jobs.active} active • ${stats.jobs.completed} done`,
      icon: Briefcase,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      label: 'Pending Verification',
      value: stats.tradies.pendingVerification,
      sub: `${stats.tradies.fullyVerified} fully verified`,
      icon: ShieldCheck,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      label: 'Revenue',
      value: `$${stats.revenue.totalRevenue.toLocaleString()}`,
      sub: `$${stats.revenue.platformFee.toLocaleString()} platform fee`,
      icon: DollarSign,
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-600',
    },
  ]

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Platform overview and key metrics</p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-gray-400 hidden sm:block">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => load(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-400">{card.label}</span>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${card.iconBg}`}>
                  <Icon className={`w-4 h-4 ${card.iconColor}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-[11px] text-gray-400 mt-1">{card.sub}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Completed Payments', value: stats.revenue.completedPayments, icon: TrendingUp, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
          { label: 'Tradie Earnings', value: `$${stats.revenue.tradieEarnings.toLocaleString()}`, icon: DollarSign, iconBg: 'bg-[#EFF6FF]', iconColor: 'text-[#2563EB]' },
          { label: 'Cancelled Jobs', value: stats.jobs.cancelled, icon: AlertTriangle, iconBg: 'bg-red-50', iconColor: 'text-red-500' },
        ].map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${item.iconBg}`}>
                <Icon className={`w-5 h-5 ${item.iconColor}`} />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 mb-0.5">{item.label}</p>
                <p className="text-xl font-bold text-gray-900">{item.value}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
