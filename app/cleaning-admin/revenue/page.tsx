'use client'

import { useEffect, useState, useCallback } from 'react'
import { BarChart3, Loader2, Download, DollarSign, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { api, getAccessToken } from '@/lib/api'
import { API_BASE_URL } from '@/lib/constants'
import { useCleaningAdminSubscription } from '@/contexts/cleaning-admin-realtime-context'

interface RevenueData {
  period: string
  totalRevenue: number
  totalJobs: number
  totalPaidOut: number
  platformCommission: number
  breakdown: { date: string; revenue: number; jobs: number }[]
  transactions: {
    id: string
    jobId: string
    jobCode: string
    stripePi: string
    date: string
    revenue: number
    cleanerPayout: number
    platformFee: number
    status: string
  }[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

interface ApiRevenueReport {
  period: { start: string; end: string }
  summary: {
    totalPayments: number
    totalClientPayments: number
    totalCleanerPayouts: number
    totalPlatformFees: number
  }
  breakdown: { date: string; revenue: number; jobs: number }[]
  pagination: { total: number; page: number; limit: number; totalPages: number }
  payments: {
    _id: string
    jobId: string
    jobCode: string
    stripePaymentIntentId: string
    amount: number
    platformFee: number
    tradieEarnings: number
    status: string
    date: string
  }[]
}

function getDateRange(period: 'week' | 'month' | 'quarter') {
  const end = new Date()
  const start = new Date()
  if (period === 'week') {
    start.setDate(end.getDate() - 7)
  } else if (period === 'quarter') {
    start.setMonth(end.getMonth() - 3)
  } else {
    start.setDate(1)
  }
  return { start, end }
}

function mapReportToRevenue(period: 'week' | 'month' | 'quarter', data: ApiRevenueReport): RevenueData {
  const transactions = (data.payments ?? []).map(p => ({
    id: p._id,
    jobId: p.jobId,
    jobCode: p.jobCode,
    stripePi: p.stripePaymentIntentId,
    date: p.date,
    revenue: p.amount,
    cleanerPayout: p.tradieEarnings,
    platformFee: p.platformFee,
    status: p.status
  }))

  const s = data.summary
  return {
    period,
    totalRevenue: s.totalClientPayments ?? 0,
    totalJobs: s.totalPayments ?? 0,
    totalPaidOut: s.totalCleanerPayouts ?? 0,
    platformCommission: s.totalPlatformFees ?? 0,
    breakdown: data.breakdown ?? [],
    transactions,
    pagination: data.pagination ?? { total: 0, page: 1, limit: 20, totalPages: 1 },
  }
}

export default function RevenuePage() {
  const [revenue, setRevenue] = useState<RevenueData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month')
  const [currentPage, setCurrentPage] = useState(1)

  const fetchRevenue = useCallback(() => {
    setIsLoading(true)
    const { start, end } = getDateRange(period)
    const qs = `?startDate=${start.toISOString()}&endDate=${end.toISOString()}&page=${currentPage}&limit=20`
    api.get<ApiRevenueReport>(`/api/cleaning-admin/revenue${qs}`)
      .then((res) => setRevenue(mapReportToRevenue(period, res.data)))
      .catch(() => setRevenue(null))
      .finally(() => setIsLoading(false))
  }, [period, currentPage])

  useEffect(() => { fetchRevenue() }, [fetchRevenue])

  useCleaningAdminSubscription(['revenue'], () => {
    fetchRevenue()
  })

  const handlePeriodChange = (p: 'week' | 'month' | 'quarter') => {
    setPeriod(p)
    setCurrentPage(1)
  }

  const handleExportCSV = async () => {
    if (!revenue) return
    const { start, end } = getDateRange(period)
    const url = `/api/cleaning-admin/revenue/csv?startDate=${start.toISOString()}&endDate=${end.toISOString()}`
    
    try {
      const token = getAccessToken()
      const res = await fetch(`${API_BASE_URL}${url}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!res.ok) throw new Error('Export failed')
      
      const blob = await res.blob()
      const downloadUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `cleaning-revenue-${period}-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(downloadUrl)
    } catch (err) {
      console.error('Failed to export CSV', err)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Revenue Report</h1>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {(['week', 'month', 'quarter'] as const).map((p) => (
              <button
                key={p}
                onClick={() => handlePeriodChange(p)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${period === p ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={handleExportCSV}
            disabled={!revenue}
            className="flex items-center gap-1.5 bg-teal-600 text-white text-sm font-medium py-2 px-4 rounded-xl hover:bg-teal-700 disabled:opacity-50 transition-colors"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-teal-600 animate-spin" /></div>
      ) : !revenue ? (
        <div className="bg-white border border-gray-200 rounded-xl flex flex-col items-center justify-center py-16">
          <BarChart3 className="w-8 h-8 text-gray-300 mb-2" />
          <p className="text-sm text-gray-500">No revenue data available</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-teal-600" />
                <span className="text-xs text-gray-500">Total Revenue</span>
              </div>
              <p className="text-xl font-bold text-gray-800">${revenue.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-gray-500">Total Jobs</span>
              </div>
              <p className="text-xl font-bold text-gray-800">{revenue.totalJobs}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-amber-500" />
                <span className="text-xs text-gray-500">Paid to Cleaners</span>
              </div>
              <p className="text-xl font-bold text-gray-800">${revenue.totalPaidOut.toFixed(2)}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className="text-xs text-gray-500">Platform Commission</span>
              </div>
              <p className="text-xl font-bold text-gray-800">${revenue.platformCommission.toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-800">Daily Breakdown</h2>
            </div>
            {revenue.breakdown.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-12">No payments in this period</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase">Date</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase">Revenue</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase">Jobs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {revenue.breakdown.map((row) => (
                    <tr key={row.date} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 text-sm text-gray-700">{new Date(row.date).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}</td>
                      <td className="px-4 py-2.5 text-sm text-gray-800 text-right font-medium">${row.revenue.toFixed(2)}</td>
                      <td className="px-4 py-2.5 text-sm text-gray-600 text-right">{row.jobs}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 border-t border-gray-200">
                    <td className="px-4 py-2.5 text-sm font-semibold text-gray-800">Total</td>
                    <td className="px-4 py-2.5 text-sm font-bold text-teal-600 text-right">${revenue.totalRevenue.toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-sm font-semibold text-gray-600 text-right">{revenue.totalJobs}</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mt-6">
            <div className="px-5 py-3 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-800">Detailed Transaction History</h2>
            </div>
            {revenue.transactions.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-12">No transactions in this period</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Date & Time</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Job Code</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Stripe PI</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Client Paid</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Cleaner Payout</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Platform Fee</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {revenue.transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(tx.date).toLocaleString('en-AU', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Link href={`/cleaning-admin/jobs/${tx.jobId}`} className="text-teal-600 hover:underline font-medium">
                            {tx.jobCode}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                          {tx.stripePi || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800 text-right font-medium">${tx.revenue.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-amber-600 text-right">${tx.cleanerPayout.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-green-600 text-right">${tx.platformFee.toFixed(2)}</td>
                        <td className="px-4 py-3 text-xs text-center">
                          <span className={`px-2 py-1 rounded-full ${tx.status === 'released' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {revenue.pagination && revenue.pagination.totalPages > 1 && (
              <div className="px-5 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                <div className="text-sm text-gray-500">
                  Showing {((revenue.pagination.page - 1) * revenue.pagination.limit) + 1} to {Math.min(revenue.pagination.page * revenue.pagination.limit, revenue.pagination.total)} of {revenue.pagination.total} entries
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={revenue.pagination.page === 1}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-600">Page</span>
                    <select
                      value={revenue.pagination.page}
                      onChange={(e) => setCurrentPage(Number(e.target.value))}
                      className="px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    >
                      {Array.from({ length: revenue.pagination.totalPages }, (_, i) => i + 1).map(page => (
                        <option key={page} value={page}>{page}</option>
                      ))}
                    </select>
                    <span className="text-sm text-gray-600">of {revenue.pagination.totalPages}</span>
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(revenue.pagination.totalPages, p + 1))}
                    disabled={revenue.pagination.page === revenue.pagination.totalPages}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
