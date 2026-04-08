'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ShieldCheck,
  ShieldX,
  FileText,
  ExternalLink,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
} from 'lucide-react'
import { api, ApiError } from '@/lib/api'
import { CATEGORY_LABELS } from '@/lib/constants'
import type { TradieCategory } from '@/lib/types'

interface TradieDoc {
  type: string
  label: string
  url: string | null
  publicId: string | null
  isVerified: boolean
  verifiedAt: string | null
  uploadedAt: string | null
}

interface TradieUser {
  _id: string
  name: string
  email: string
  fixId: string
}

interface TradieDocsResponse {
  tradie: TradieUser
  categories: string[]
  isFullyVerified: boolean
  documents: TradieDoc[]
}

export default function AdminTradieDocumentsPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.userId as string

  const [data, setData] = useState<TradieDocsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({})
  const [showRejectInput, setShowRejectInput] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchDocs = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await api.get<TradieDocsResponse>(`/api/admin/tradies/${userId}/documents`)
      setData(res.data)
    } catch {
      // Silent
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchDocs()
  }, [fetchDocs])

  const handleVerify = async (docType: string) => {
    setActionLoading(docType)
    try {
      await api.patch(`/api/admin/tradies/${userId}/documents/${docType}/verify`)
      showToast('Document verified ✓', 'success')
      fetchDocs()
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to verify', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (docType: string) => {
    setActionLoading(docType)
    try {
      await api.patch(`/api/admin/tradies/${userId}/documents/${docType}/reject`, {
        reason: rejectReason[docType] || '',
      })
      showToast('Document rejected', 'success')
      setShowRejectInput(null)
      setRejectReason((prev) => { const n = { ...prev }; delete n[docType]; return n })
      fetchDocs()
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to reject', 'error')
    } finally {
      setActionLoading(null)
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
        <XCircle className="w-10 h-10 text-white/20 mb-3" />
        <p className="text-sm text-white/40">Tradie not found</p>
        <button onClick={() => router.push('/admin/tradies')} className="text-xs text-cyan-400 hover:underline mt-2">
          Back to queue
        </button>
      </div>
    )
  }

  const { tradie, categories, isFullyVerified, documents } = data
  const uploaded = documents.filter((d) => d.url)
  const verified = documents.filter((d) => d.isVerified)
  const pending = documents.filter((d) => d.url && !d.isVerified)

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg flex items-center gap-2 transition-all ${
          toast.type === 'success'
            ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
            : 'bg-red-500/20 border border-red-500/30 text-red-400'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Back */}
      <button
        onClick={() => router.push('/admin/tradies')}
        className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors mb-4"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to queue
      </button>

      {/* Header card */}
      <div className="bg-[#1e293b] rounded-xl border border-white/10 p-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-lg font-bold text-white">{tradie.name}</h1>
              {isFullyVerified ? (
                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-medium">
                  <ShieldCheck className="w-3 h-3" />
                  Fully Verified
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-medium">
                  <Clock className="w-3 h-3" />
                  Pending
                </span>
              )}
            </div>
            <p className="text-xs text-white/40">{tradie.email}</p>
            <p className="text-[10px] text-white/30 font-mono">{tradie.fixId}</p>
          </div>

          {/* Doc progress */}
          <div className="flex items-center gap-4 text-center">
            <div>
              <p className="text-xl font-bold text-white">{uploaded.length}</p>
              <p className="text-[10px] text-white/30">Uploaded</p>
            </div>
            <div>
              <p className="text-xl font-bold text-emerald-400">{verified.length}</p>
              <p className="text-[10px] text-white/30">Verified</p>
            </div>
            <div>
              <p className="text-xl font-bold text-amber-400">{pending.length}</p>
              <p className="text-[10px] text-white/30">Pending</p>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {categories.map((cat) => (
            <span key={cat} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
              {CATEGORY_LABELS[cat as TradieCategory] || cat}
            </span>
          ))}
        </div>

        {/* Overall progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-[10px] text-white/30 mb-1">
            <span>Verification progress</span>
            <span>{verified.length}/{documents.length}</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all"
              style={{ width: `${documents.length > 0 ? (verified.length / documents.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Documents grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {documents.map((doc) => {
          const isProcessing = actionLoading === doc.type
          const showingReject = showRejectInput === doc.type

          return (
            <div
              key={doc.type}
              className={`bg-[#1e293b] rounded-xl border p-4 sm:p-5 transition-colors ${
                doc.isVerified
                  ? 'border-emerald-500/20'
                  : doc.url
                  ? 'border-amber-500/20'
                  : 'border-white/10 opacity-60'
              }`}
            >
              {/* Doc header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    doc.isVerified
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : doc.url
                      ? 'bg-amber-500/15 text-amber-400'
                      : 'bg-white/5 text-white/20'
                  }`}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{doc.label}</p>
                    <p className="text-[10px] text-white/30 font-mono">{doc.type}</p>
                  </div>
                </div>

                {/* Status badge */}
                {doc.isVerified ? (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified
                  </span>
                ) : doc.url ? (
                  <span className="flex items-center gap-1 text-[10px] text-amber-400 shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                    Pending
                  </span>
                ) : (
                  <span className="text-[10px] text-white/20 shrink-0">Not uploaded</span>
                )}
              </div>

              {/* Upload date */}
              {doc.uploadedAt && (
                <p className="text-[10px] text-white/30 mb-3">
                  Uploaded {new Date(doc.uploadedAt).toLocaleDateString('en-AU', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </p>
              )}
              {doc.verifiedAt && (
                <p className="text-[10px] text-emerald-400/60 mb-3">
                  Verified {new Date(doc.verifiedAt).toLocaleDateString('en-AU', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </p>
              )}

              {/* View document link */}
              {doc.url && (
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 hover:underline mb-4 w-fit"
                >
                  <ExternalLink className="w-3 h-3" />
                  View Document
                </a>
              )}

              {/* Actions (only if uploaded and not yet verified) */}
              {doc.url && !doc.isVerified && (
                <div className="space-y-2">
                  {showingReject ? (
                    <>
                      <input
                        type="text"
                        value={rejectReason[doc.type] || ''}
                        onChange={(e) =>
                          setRejectReason((prev) => ({ ...prev, [doc.type]: e.target.value }))
                        }
                        placeholder="Rejection reason (optional)..."
                        className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReject(doc.type)}
                          disabled={isProcessing}
                          className="flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors disabled:opacity-40"
                        >
                          {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldX className="w-3 h-3" />}
                          Confirm Reject
                        </button>
                        <button
                          onClick={() => setShowRejectInput(null)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVerify(doc.type)}
                        disabled={isProcessing}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors disabled:opacity-40"
                      >
                        {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
                        Verify
                      </button>
                      <button
                        onClick={() => setShowRejectInput(doc.type)}
                        disabled={isProcessing}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors disabled:opacity-40"
                      >
                        <ShieldX className="w-3 h-3" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
