'use client'

import { useEffect, useState } from 'react'
import { Users, Briefcase, ShieldCheck, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react'
import { api } from '@/lib/api'
import type { AdminStats } from '@/lib/types'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<AdminStats>('/api/admin/stats')
        setStats(res.data)
      } catch {
        // Silent
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const statCards = [
    {
      label: 'Total Users',
      value: stats.users.total,
      sub: `${stats.users.clients} clients • ${stats.users.tradies} tradies`,
      icon: Users,
      color: 'bg-blue-500/15 text-blue-400',
    },
    {
      label: 'Total Jobs',
      value: stats.jobs.total,
      sub: `${stats.jobs.active} active • ${stats.jobs.completed} done`,
      icon: Briefcase,
      color: 'bg-emerald-500/15 text-emerald-400',
    },
    {
      label: 'Pending Verification',
      value: stats.tradies.pendingVerification,
      sub: `${stats.tradies.fullyVerified} fully verified`,
      icon: ShieldCheck,
      color: 'bg-amber-500/15 text-amber-400',
    },
    {
      label: 'Revenue',
      value: `$${stats.revenue.totalRevenue.toLocaleString()}`,
      sub: `$${stats.revenue.platformFee.toLocaleString()} platform fee`,
      icon: DollarSign,
      color: 'bg-cyan-500/15 text-cyan-400',
    },
  ]

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-white mb-6">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="bg-[#1e293b] rounded-xl border border-white/10 p-4 sm:p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${card.color}`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs text-white/50">{card.label}</span>
              </div>
              <p className="text-2xl font-bold text-white">{card.value}</p>
              <p className="text-[10px] text-white/30 mt-1">{card.sub}</p>
            </div>
          )
        })}
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#1e293b] rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-white/50">Completed Payments</span>
          </div>
          <p className="text-lg font-bold text-white">{stats.revenue.completedPayments}</p>
        </div>
        <div className="bg-[#1e293b] rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-white/50">Tradie Earnings</span>
          </div>
          <p className="text-lg font-bold text-white">${stats.revenue.tradieEarnings.toLocaleString()}</p>
        </div>
        <div className="bg-[#1e293b] rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-xs text-white/50">Cancelled Jobs</span>
          </div>
          <p className="text-lg font-bold text-white">{stats.jobs.cancelled}</p>
        </div>
      </div>
    </div>
  )
}
