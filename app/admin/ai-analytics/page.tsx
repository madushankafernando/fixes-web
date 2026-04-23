// fixes-web/app/admin/ai-analytics/page.tsx

'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  Bot, BrainCircuit, Clock, Coins, ShieldCheck, AlertTriangle,
  ChevronRight, Loader2, TrendingUp, Filter,
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { api } from '@/lib/api'
import { CATEGORY_LABELS } from '@/lib/constants'
import type { JobCategory } from '@/lib/types'

interface KPIs {
  totalCalls: number
  successCount: number
  fallbackCount: number
  successRate: number
  avgLatencyMs: number
  p95LatencyMs: number | null
  avgTokensTotal: number | null
  totalTokensUsed: number | null
  totalTokensIn: number | null
  totalTokensOut: number | null
  totalCostAud: number | null
  avgConfidence: number | null
}

interface AiLog {
  _id: string
  jobId: string | null
  inputTitle: string
  inputCategory: string
  outputCategory: string | null
  outputFixedPrice: number | null
  outputConfidence: number | null
  engine: 'gemini' | 'rule_based' | 'placeholder'
  success: boolean
  latencyMs: number | null
  createdAt: string
}

interface StatsResponse {
  period: string
  kpis: KPIs
  callsByCategory: { category: string; count: number }[]
  callsByDay: { date: string; gemini: number; rule_based: number }[]
  skillLevelDistribution: { level: string; count: number }[]
  avgPriceByCategory: { category: string; avgFixed: number; count: number }[]
  finishReasonBreakdown: { reason: string; count: number }[]
}

const PERIOD_OPTIONS = [
  { label: '7 days',  value: '7d'  },
  { label: '30 days', value: '30d' },
  { label: '90 days', value: '90d' },
  { label: 'All time', value: 'all' },
]

const CATEGORY_COLORS: Record<string, string> = {
  electrical:          '#3B82F6',
  plumbing:            '#06B6D4',
  hvac:                '#8B5CF6',
  plastering:          '#F59E0B',
  painting:            '#EC4899',
  flooring:            '#10B981',
  carpentry:           '#EF4444',
  emergency_make_safe: '#DC2626',
  general_labourer:    '#6B7280',
  other:               '#9CA3AF',
}

const SKILL_COLORS: Record<string, string> = {
  junior:     '#10B981',
  senior:     '#3B82F6',
  specialist: '#8B5CF6',
}


function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  accent = 'blue',
}: {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
  accent?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'gray'
}) {
  const accents: Record<string, string> = {
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-green-50 text-green-600',
    amber:  'bg-amber-50 text-amber-600',
    red:    'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
    gray:   'bg-gray-100 text-gray-500',
  }
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3">
      <div className={`p-2 rounded-lg ${accents[accent]} shrink-0`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 leading-none mb-1">{label}</p>
        <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
        {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function EngineBadge({ engine }: { engine: 'gemini' | 'rule_based' | 'placeholder' }) {
  return engine === 'gemini'
    ? <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-700"><BrainCircuit className="w-2.5 h-2.5" /> Gemini</span>
    : <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-600">Rule-Based</span>
}

export default function AiAnalyticsPage() {
  const [stats, setStats]       = useState<StatsResponse | null>(null)
  const [logs, setLogs]         = useState<AiLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod]     = useState('30d')

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [statsRes, logsRes] = await Promise.all([
        api.get<StatsResponse>(`/api/admin/ai-logs/stats?period=${period}`),
        api.getPaginated<AiLog>(`/api/admin/ai-logs?period=${period}&limit=10`),
      ])
      setStats(statsRes.data)
      setLogs(logsRes.data)
    } catch {
    } finally {
      setIsLoading(false)
    }
  }, [period])

  useEffect(() => { fetchData() }, [fetchData])

  const kpis = stats?.kpis

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-600" />
            AI Analytics
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Monitor Gemini pricing engine performance</p>
        </div>

        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                period === opt.value
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 text-[#2563EB] animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-5">
            <KpiCard
              icon={Bot}
              label="Total AI Calls"
              value={(kpis?.totalCalls ?? 0).toLocaleString()}
              sub={`${kpis?.successCount ?? 0} succeeded`}
              accent="blue"
            />
            <KpiCard
              icon={ShieldCheck}
              label="Success Rate"
              value={`${kpis?.successRate ?? 0}%`}
              sub="Gemini vs fallback"
              accent="green"
            />
            <KpiCard
              icon={Clock}
              label="Avg Latency"
              value={kpis?.avgLatencyMs ? `${(kpis.avgLatencyMs / 1000).toFixed(1)}s` : '—'}
              sub={kpis?.p95LatencyMs ? `p95: ${(kpis.p95LatencyMs / 1000).toFixed(1)}s` : undefined}
              accent="amber"
            />
            <KpiCard
              icon={Coins}
              label="Est. Cost (AUD)"
              value={kpis?.totalCostAud != null ? `$${kpis.totalCostAud.toFixed(2)}` : '—'}
              sub={kpis?.totalTokensUsed ? `${kpis.totalTokensUsed.toLocaleString()} tokens` : undefined}
              accent="purple"
            />
            <KpiCard
              icon={TrendingUp}
              label="Avg Confidence"
              value={kpis?.avgConfidence ? `${Math.round(kpis.avgConfidence * 100)}%` : '—'}
              sub="Model self-rating"
              accent="blue"
            />
            <KpiCard
              icon={AlertTriangle}
              label="Fallbacks"
              value={(kpis?.fallbackCount ?? 0).toLocaleString()}
              sub="Times rule-based engine fired"
              accent={kpis?.fallbackCount ? 'red' : 'gray'}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">AI Calls Over Time</h2>
              {(stats?.callsByDay ?? []).length === 0 ? (
                <div className="flex items-center justify-center h-48 text-sm text-gray-400">No data for this period</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={stats?.callsByDay} margin={{ top: 0, right: 8, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={(d) => d.slice(5)} />
                    <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E5E7EB' }}
                      labelFormatter={(l) => `Date: ${l}`}
                    />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="gemini"     name="Gemini"      stroke="#7C3AED" strokeWidth={2}   dot={false} />
                    <Line type="monotone" dataKey="rule_based" name="Rule-Based"   stroke="#F59E0B" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Calls by Category</h2>
              {(stats?.callsByCategory ?? []).length === 0 ? (
                <div className="flex items-center justify-center h-48 text-sm text-gray-400">No data</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={stats?.callsByCategory}
                      dataKey="count"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {stats?.callsByCategory.map((entry) => (
                        <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category] ?? '#9CA3AF'} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E5E7EB' }}
                      formatter={(val, name) => [val, CATEGORY_LABELS[name as JobCategory] ?? name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
              <div className="flex flex-col gap-1 mt-2">
                {(stats?.callsByCategory ?? []).slice(0, 5).map((e) => (
                  <div key={e.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: CATEGORY_COLORS[e.category] ?? '#9CA3AF' }} />
                      <span className="text-[10px] text-gray-500 truncate">{CATEGORY_LABELS[e.category as JobCategory] ?? e.category}</span>
                    </div>
                    <span className="text-[10px] font-medium text-gray-700">{e.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Avg Quoted Price by Category (AUD)</h2>
              {(stats?.avgPriceByCategory ?? []).length === 0 ? (
                <div className="flex items-center justify-center h-44 text-sm text-gray-400">No data</div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={stats?.avgPriceByCategory} margin={{ top: 0, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="category" tick={{ fontSize: 9, fill: '#9CA3AF' }} tickFormatter={(c) => CATEGORY_LABELS[c as JobCategory]?.split(' ')[0] ?? c} />
                    <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E5E7EB' }}
                      formatter={(v, _n, p) => [`$${v} avg (${p.payload.count} calls)`, 'Fixed price']}
                      labelFormatter={(l) => CATEGORY_LABELS[l as JobCategory] ?? l}
                    />
                    <Bar dataKey="avgFixed" radius={[4, 4, 0, 0]}>
                      {stats?.avgPriceByCategory.map((entry) => (
                        <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category] ?? '#3B82F6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Skill Level Distribution</h2>
              {(stats?.skillLevelDistribution ?? []).length === 0 ? (
                <div className="flex items-center justify-center h-44 text-sm text-gray-400">No data</div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={stats?.skillLevelDistribution} margin={{ top: 0, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="level" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={(l) => l.charAt(0).toUpperCase() + l.slice(1)} />
                    <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} allowDecimals={false} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E5E7EB' }} />
                    <Bar dataKey="count" name="Calls" radius={[4, 4, 0, 0]}>
                      {stats?.skillLevelDistribution.map((entry) => (
                        <Cell key={entry.level} fill={SKILL_COLORS[entry.level] ?? '#9CA3AF'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700">Recent AI Calls</h2>
              <Link href="/admin/ai-analytics/logs" className="text-xs text-[#2563EB] hover:underline">
                View all logs →
              </Link>
            </div>

            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Bot className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-sm text-gray-400">No AI calls recorded yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {['Job Title', 'Category', 'Engine', 'Fixed Price', 'Confidence', 'Latency', 'Date', ''].map((h) => (
                        <th key={h} className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {logs.map((log) => (
                      <tr key={log._id} className="hover:bg-purple-50/40 transition-colors">
                        <td className="px-4 py-3 max-w-45">
                          <p className="text-xs font-medium text-gray-800 truncate">{log.inputTitle || '—'}</p>
                          <p className="text-[10px] text-gray-400 truncate">{log.outputCategory ?? log.inputCategory}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] text-gray-500">
                            {CATEGORY_LABELS[log.outputCategory as JobCategory] ?? log.outputCategory ?? '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <EngineBadge engine={log.engine} />
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-gray-700 font-medium">
                            {log.outputFixedPrice != null ? `$${log.outputFixedPrice}` : '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {log.outputConfidence != null ? (
                            <div className="flex items-center gap-1.5">
                              <div className="w-14 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-green-500"
                                  style={{ width: `${Math.round(log.outputConfidence * 100)}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-gray-500">{Math.round(log.outputConfidence * 100)}%</span>
                            </div>
                          ) : <span className="text-[10px] text-gray-400">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          {log.latencyMs != null ? (
                            <span className={`text-[10px] font-medium ${
                              log.latencyMs < 3000 ? 'text-green-600' :
                              log.latencyMs < 8000 ? 'text-amber-600' : 'text-red-600'
                            }`}>
                              {(log.latencyMs / 1000).toFixed(1)}s
                            </span>
                          ) : <span className="text-[10px] text-gray-400">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] text-gray-400">
                            {new Date(log.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/admin/ai-analytics/${log._id}`}>
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
