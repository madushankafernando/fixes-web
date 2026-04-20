// fixes-web/app/admin/ai-analytics/[id]/page.tsx 

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Bot, BrainCircuit, Clock, Coins, CheckCircle2, XCircle,
  AlertTriangle, ChevronDown, ChevronUp, Loader2, ExternalLink, ShieldCheck,
} from 'lucide-react'
import { api } from '@/lib/api'
import { CATEGORY_LABELS } from '@/lib/constants'
import type { JobCategory } from '@/lib/types'

interface AiLogDetail {
  _id: string
  jobId: string | null
  inputTitle: string
  inputCategory: string
  inputLocation: { suburb: string; state: string }
  imageCount: number
  success: boolean
  engine: 'gemini' | 'placeholder'
  outputCategory: string | null
  outputPriceMin: number | null
  outputPriceMax: number | null
  outputFixedPrice: number | null
  outputConfidence: number | null
  outputReasoning: string | null
  modelVersion: string | null
  latencyMs: number | null
  finishReason: string | null
  tokensIn: number | null
  tokensOut: number | null
  tokensTotal: number | null
  safetyRatings: { category: string; probability: string }[]
  rawOutputPreview: string | null
  thinkingSteps: string[]
  errorMessage: string | null
  createdAt: string
}

function LatencyBadge({ ms }: { ms: number | null }) {
  if (ms == null) return <span className="text-gray-400 text-sm">—</span>
  const secs = (ms / 1000).toFixed(2)
  const color = ms < 3000 ? 'text-green-700 bg-green-50 border-green-200'
    : ms < 8000 ? 'text-amber-700 bg-amber-50 border-amber-200'
    : 'text-red-700 bg-red-50 border-red-200'
  return (
    <span className={`inline-block px-2 py-0.5 rounded-md border text-xs font-mono font-medium ${color}`}>
      {secs}s
    </span>
  )
}

function FinishBadge({ reason }: { reason: string | null }) {
  if (!reason) return <span className="text-gray-400 text-sm">—</span>
  const color = reason === 'STOP' ? 'bg-green-100 text-green-700'
    : reason === 'MAX_TOKENS' ? 'bg-amber-100 text-amber-700'
    : reason === 'SAFETY' ? 'bg-red-100 text-red-700'
    : 'bg-gray-100 text-gray-500'
  return <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${color}`}>{reason}</span>
}

function SkillBadge({ level }: { level: string | null }) {
  if (!level) return <span className="text-gray-400">—</span>
  const color = level === 'junior' ? 'bg-emerald-100 text-emerald-700'
    : level === 'senior' ? 'bg-blue-100 text-blue-700'
    : 'bg-purple-100 text-purple-700'
  return <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${color}`}>{level}</span>
}

const USD_PER_INPUT_TOKEN  = 0.10 / 1_000_000
const USD_PER_OUTPUT_TOKEN = 0.40 / 1_000_000
const AUD_PER_USD          = 1.55

function calcCostAud(tokensIn: number | null, tokensOut: number | null): number | null {
  if (tokensIn == null && tokensOut == null) return null
  const usd = ((tokensIn ?? 0) * USD_PER_INPUT_TOKEN) + ((tokensOut ?? 0) * USD_PER_OUTPUT_TOKEN)
  return Math.round(usd * AUD_PER_USD * 10000) / 10000 
}

export default function AiLogDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()
  const [log, setLog]           = useState<AiLogDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [thinkingOpen, setThinkingOpen] = useState(true)
  const [rawOpen, setRawOpen]   = useState(false)

  useEffect(() => {
    async function fetchLog() {
      try {
        const res = await api.get<{ log: AiLogDetail }>(`/api/admin/ai-logs/${id}`)
        setLog(res.data.log)
      } catch {
      } finally {
        setIsLoading(false)
      }
    }
    fetchLog()
  }, [id])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 text-[#2563EB] animate-spin" />
      </div>
    )
  }

  if (!log) {
    return (
      <div className="text-center py-24">
        <p className="text-gray-500">AI log entry not found.</p>
        <button onClick={() => router.back()} className="mt-3 text-sm text-[#2563EB] hover:underline">
          ← Go back
        </button>
      </div>
    )
  }

  const confidencePct = log.outputConfidence != null ? Math.round(log.outputConfidence * 100) : null

  return (
    <div className="max-w-4xl mx-auto">

      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-5"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to AI Analytics
      </button>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {log.success
                ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                : <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
              <h1 className="text-lg font-bold text-gray-900 leading-tight">{log.inputTitle || 'Untitled Job'}</h1>
            </div>
            <p className="text-xs text-gray-400">
              {log.inputLocation.suburb && `${log.inputLocation.suburb}, `}
              {log.inputLocation.state}
              {log.imageCount > 0 && ` · ${log.imageCount} image${log.imageCount > 1 ? 's' : ''} uploaded`}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {log.engine === 'gemini'
              ? <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-purple-100 text-purple-700"><BrainCircuit className="w-3 h-3" /> Gemini</span>
              : <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-500">Placeholder</span>}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
          {log.jobId && (
            <Link
              href={`/admin/jobs/${log.jobId}`}
              className="inline-flex items-center gap-1 text-[#2563EB] hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              View linked job
            </Link>
          )}
          <span>
            {new Date(log.createdAt).toLocaleString('en-AU', {
              day: 'numeric', month: 'short', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </span>
          {log.modelVersion && <span className="font-mono text-gray-400">{log.modelVersion}</span>}
        </div>
      </div>

      {log.success && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Quote Generated</h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Category</p>
              <p className="text-sm font-medium text-gray-800">
                {CATEGORY_LABELS[log.outputCategory as JobCategory] ?? log.outputCategory ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Skill Level</p>
              <SkillBadge level={log.outputCategory} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Price Range</p>
              <p className="text-sm font-medium text-gray-800">
                {log.outputPriceMin != null && log.outputPriceMax != null
                  ? `$${log.outputPriceMin} – $${log.outputPriceMax} AUD`
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Fixed Price</p>
              <p className="text-lg font-bold text-gray-900">
                {log.outputFixedPrice != null ? `$${log.outputFixedPrice}` : '—'}
              </p>
            </div>
          </div>

          {confidencePct != null && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">AI Confidence</p>
                <p className="text-xs font-semibold text-gray-700">{confidencePct}%</p>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    confidencePct >= 80 ? 'bg-green-500' : confidencePct >= 60 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${confidencePct}%` }}
                />
              </div>
            </div>
          )}

          {log.outputReasoning && (
            <div className="bg-blue-50 rounded-lg px-4 py-3">
              <p className="text-[10px] text-blue-400 uppercase tracking-wider mb-1">AI Reasoning</p>
              <p className="text-sm text-blue-900 leading-relaxed">{log.outputReasoning}</p>
            </div>
          )}
        </div>
      )}

      {log.thinkingSteps?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 mb-4 overflow-hidden">
          <button
            onClick={() => setThinkingOpen((o) => !o)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-purple-500" />
              <h2 className="text-sm font-semibold text-gray-700">Thinking Steps</h2>
              <span className="text-[10px] text-gray-400">({log.thinkingSteps.length} steps)</span>
            </div>
            {thinkingOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </button>

          {thinkingOpen && (
            <div className="px-5 pb-5 border-t border-gray-100 space-y-3 pt-4">
              {log.thinkingSteps.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          Telemetry
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Latency</p>
            <LatencyBadge ms={log.latencyMs} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Finish Reason</p>
            <FinishBadge reason={log.finishReason} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Model</p>
            <span className="text-xs font-mono text-gray-600">{log.modelVersion ?? '—'}</span>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Tokens In</p>
            <span className="text-sm text-gray-700 font-medium">{log.tokensIn?.toLocaleString() ?? '—'}</span>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Tokens Out</p>
            <span className="text-sm text-gray-700 font-medium">{log.tokensOut?.toLocaleString() ?? '—'}</span>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Tokens Total</p>
            <span className="text-sm font-bold text-gray-900">{log.tokensTotal?.toLocaleString() ?? '—'}</span>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Est. Cost (AUD)</p>
            <span className="text-sm font-bold text-emerald-700">
              {calcCostAud(log.tokensIn, log.tokensOut) != null
                ? `A$${calcCostAud(log.tokensIn, log.tokensOut)?.toFixed(4)}`
                : '—'}
            </span>
          </div>
        </div>

        {log.safetyRatings?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Safety Ratings
            </p>
            <div className="flex flex-wrap gap-2">
              {log.safetyRatings.map((r) => (
                <span key={r.category} className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                  {r.category.replace('HARM_CATEGORY_', '')}: {r.probability}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {log.rawOutputPreview && (
        <div className="bg-white rounded-xl border border-gray-200 mb-4 overflow-hidden">
          <button
            onClick={() => setRawOpen((o) => !o)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-700">Raw Output Preview</h2>
              <span className="text-[10px] text-gray-400">(first 500 chars)</span>
            </div>
            {rawOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </button>

          {rawOpen && (
            <div className="border-t border-gray-100 px-5 pb-5 pt-4">
              <pre className="text-[11px] text-gray-600 bg-gray-50 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap leading-relaxed font-mono">
                {log.rawOutputPreview}
              </pre>
            </div>
          )}
        </div>
      )}

      {!log.success && log.errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <h2 className="text-sm font-semibold text-red-700">Fallback Triggered — Error Detail</h2>
          </div>
          <pre className="text-xs text-red-700 font-mono bg-red-100/60 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
            {log.errorMessage}
          </pre>
        </div>
      )}

    </div>
  )
}
