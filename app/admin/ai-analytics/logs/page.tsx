// fixes-web/app/admin/ai-analytics/logs/page.tsx

'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  Bot, BrainCircuit, ChevronRight, Loader2, Filter, Search,
  CheckCircle2, XCircle,
} from 'lucide-react'
import { api } from '@/lib/api'
import { CATEGORY_LABELS } from '@/lib/constants'
import type { JobCategory } from '@/lib/types'

interface AiLog {
  _id: string
  jobId: string | null
  inputTitle: string
  inputCategory: string
  outputCategory: string | null
  outputFixedPrice: number | null
  outputConfidence: number | null
  engine: 'gemini' | 'placeholder'
  success: boolean
  latencyMs: number | null
  tokensIn: number | null
  tokensOut: number | null
  tokensTotal: number | null
  createdAt: string
}


const USD_PER_INPUT_TOKEN  = 0.10 / 1_000_000
const USD_PER_OUTPUT_TOKEN = 0.40 / 1_000_000
const AUD_PER_USD          = 1.55

function calcCostAud(tokensIn: number | null, tokensOut: number | null): number | null {
  if (tokensIn == null && tokensOut == null) return null
  const usd = ((tokensIn ?? 0) * USD_PER_INPUT_TOKEN) + ((tokensOut ?? 0) * USD_PER_OUTPUT_TOKEN)
  return Math.round(usd * AUD_PER_USD * 10000) / 10000 
}

const PERIOD_OPTIONS = [
  { label: '7d',     value: '7d'  },
  { label: '30d',    value: '30d' },
  { label: '90d',    value: '90d' },
  { label: 'All',    value: 'all' },
]

const ENGINE_OPTIONS = [
  { label: 'All',         value: 'all'         },
  { label: 'Gemini',      value: 'gemini'      },
  { label: 'Placeholder', value: 'placeholder' },
]

export default function AiLogsPage() {
  const [logs, setLogs]         = useState<AiLog[]>([])
  const [total, setTotal]       = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage]         = useState(1)
  const [period, setPeriod]     = useState('30d')
  const [engine, setEngine]     = useState('all')
  const [success, setSuccess]   = useState<'all' | 'true' | 'false'>('all')

  const fetchLogs = useCallback(async () => {
    setIsLoading(true)
    try {
      const qs = new URLSearchParams()
      qs.set('page',   String(page))
      qs.set('limit',  '20')
      qs.set('period', period)
      if (engine  !== 'all') qs.set('engine',  engine)
      if (success !== 'all') qs.set('success', success)
      const res = await api.getPaginated<AiLog>(`/api/admin/ai-logs?${qs.toString()}`)
      setLogs(res.data)
      setTotal(res.pagination.total)
    } catch { /* silent */ } finally { setIsLoading(false) }
  }, [page, period, engine, success])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Link href="/admin/ai-analytics" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
              AI Analytics
            </Link>
            <span className="text-gray-300">/</span>
            <h1 className="text-lg font-bold text-gray-900">All Logs</h1>
          </div>
          {!isLoading && (
            <p className="text-xs text-gray-400">{total.toLocaleString()} entries</p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs text-gray-400">Period:</span>
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setPeriod(opt.value); setPage(1) }}
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

        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-400">Engine:</span>
          {ENGINE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setEngine(opt.value); setPage(1) }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                engine === opt.value
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-400">Status:</span>
          {(['all', 'true', 'false'] as const).map((val) => (
            <button
              key={val}
              onClick={() => { setSuccess(val); setPage(1) }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                success === val
                  ? 'bg-gray-800 text-white'
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {val === 'all' ? 'All' : val === 'true' ? 'Success' : 'Fallback'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 text-[#2563EB] animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Bot className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">No AI logs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['', 'Job Title', 'Category', 'Engine', 'Fixed Price', 'Cost (AUD)', 'Confidence', 'Latency', 'Tokens', 'Date', ''].map((h, i) => (
                    <th key={i} className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => {
                  const costAud = calcCostAud(log.tokensIn, log.tokensOut)
                  return (
                    <tr key={log._id} className="hover:bg-purple-50/40 transition-colors">
                      {/* Status icon */}
                      <td className="pl-4 pr-1 py-3">
                        {log.success
                          ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                          : <XCircle className="w-3.5 h-3.5 text-red-400" />}
                      </td>

                      {/* Title */}
                      <td className="px-3 py-3 max-w-45">
                        <p className="text-xs font-medium text-gray-800 truncate">{log.inputTitle || '—'}</p>
                      </td>

                      {/* Category */}
                      <td className="px-3 py-3">
                        <span className="text-[10px] text-gray-500">
                          {CATEGORY_LABELS[(log.outputCategory ?? log.inputCategory) as JobCategory] ?? log.outputCategory ?? '—'}
                        </span>
                      </td>

                      {/* Engine */}
                      <td className="px-3 py-3">
                        {log.engine === 'gemini'
                          ? <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-700"><BrainCircuit className="w-2.5 h-2.5" /> Gemini</span>
                          : <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-500">Fallback</span>}
                      </td>

                      {/* Fixed price */}
                      <td className="px-3 py-3">
                        <span className="text-xs text-gray-700 font-medium">
                          {log.outputFixedPrice != null ? `$${log.outputFixedPrice}` : '—'}
                        </span>
                      </td>

                      {/* Cost AUD */}
                      <td className="px-3 py-3">
                        {costAud != null ? (
                          <span className="text-xs font-medium text-emerald-700">
                            A${costAud.toFixed(4)}
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400">—</span>
                        )}
                      </td>

                      {/* Confidence bar */}
                      <td className="px-3 py-3">
                        {log.outputConfidence != null ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-10 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-green-500"
                                style={{ width: `${Math.round(log.outputConfidence * 100)}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-gray-500">{Math.round(log.outputConfidence * 100)}%</span>
                          </div>
                        ) : <span className="text-[10px] text-gray-400">—</span>}
                      </td>

                      {/* Latency */}
                      <td className="px-3 py-3">
                        {log.latencyMs != null ? (
                          <span className={`text-[10px] font-medium ${
                            log.latencyMs < 3000 ? 'text-green-600' :
                            log.latencyMs < 8000 ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            {(log.latencyMs / 1000).toFixed(1)}s
                          </span>
                        ) : <span className="text-[10px] text-gray-400">—</span>}
                      </td>

                      {/* Tokens */}
                      <td className="px-3 py-3">
                        <span className="text-[10px] text-gray-500">
                          {log.tokensTotal != null ? log.tokensTotal.toLocaleString() : '—'}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className="text-[10px] text-gray-400">
                          {new Date(log.createdAt).toLocaleDateString('en-AU', {
                            day: 'numeric', month: 'short',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </span>
                      </td>

                      {/* Chevron */}
                      <td className="px-3 py-3">
                        <Link href={`/admin/ai-analytics/${log._id}`}>
                          <ChevronRight className="w-4 h-4 text-gray-300" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex justify-center gap-2 mt-5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-500 disabled:opacity-30 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-3 py-1.5 text-xs text-gray-400">
            Page {page} of {Math.ceil(total / 20)}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(total / 20)}
            className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-500 disabled:opacity-30 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Pricing footnote */}
      <p className="text-[10px] text-gray-400 text-center mt-4">
        Cost estimate based on gemini-2.5-flash-lite pricing: $0.10/1M input tokens · $0.40/1M output tokens (USD) · converted at ~1.55 AUD/USD
      </p>
    </div>
  )
}
