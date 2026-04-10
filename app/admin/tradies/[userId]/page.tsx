// fixes-web/app/admin/tradies/[userId]/page.tsx

'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, ShieldCheck, ShieldX, FileText, ExternalLink,
  Loader2, CheckCircle2, XCircle, AlertCircle, Clock,
} from 'lucide-react'
import { api, ApiError } from '@/lib/api'
import { CATEGORY_LABELS } from '@/lib/constants'
import type { TradieCategory } from '@/lib/types'

interface TradieDoc {
  type: string; label: string; url: string | null; publicId: string | null
  isVerified: boolean; verifiedAt: string | null; uploadedAt: string | null
}

interface TradieUser { _id: string; name: string; email: string; fixId: string }

interface TradieDocsResponse {
  tradie: TradieUser; categories: string[]; isFullyVerified: boolean; documents: TradieDoc[]
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
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000)
  }

  const fetchDocs = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await api.get<TradieDocsResponse>(`/api/admin/tradies/${userId}/documents`)
      setData(res.data)
    } catch { /* silent */ } finally { setIsLoading(false) }
  }, [userId])

  useEffect(() => { fetchDocs() }, [fetchDocs])

  const handleVerify = async (docType: string) => {
    setActionLoading(docType)
    try {
      await api.patch(`/api/admin/tradies/${userId}/documents/${docType}/verify`)
      showToast('Document verified ✓', 'success'); fetchDocs()
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to verify', 'error')
    } finally { setActionLoading(null) }
  }

  const handleReject = async (docType: string) => {
    setActionLoading(docType)
    try {
      await api.patch(`/api/admin/tradies/${userId}/documents/${docType}/reject`, { reason: rejectReason[docType] || '' })
      showToast('Document rejected', 'success')
      setShowRejectInput(null)
      setRejectReason((prev) => { const n = { ...prev }; delete n[docType]; return n })
      fetchDocs()
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to reject', 'error')
    } finally { setActionLoading(null) }
  }

  if (isLoading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="w-6 h-6 text-[#2563EB] animate-spin" />
    </div>
  )

  if (!data) return (
    <div className="flex flex-col items-center justify-center py-24">
      <XCircle className="w-10 h-10 text-gray-300 mb-3" />
      <p className="text-sm text-gray-400">Tradie not found</p>
      <button onClick={() => router.push('/admin/tradies')} className="text-xs text-[#2563EB] hover:underline mt-2">Back to queue</button>
    </div>
  )

  const { tradie, categories, isFullyVerified, documents } = data
  const uploaded = documents.filter((d) => d.url)
  const verified = documents.filter((d) => d.isVerified)
  const pending = documents.filter((d) => d.url && !d.isVerified)
  const pct = documents.length > 0 ? (verified.length / documents.length) * 100 : 0

  return (
    <div>
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      <button onClick={() => router.push('/admin/tradies')}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors mb-5">
        <ArrowLeft className="w-3.5 h-3.5" />Back to queue
      </button>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#2563EB] flex items-center justify-center text-white font-bold text-lg shrink-0">
              {tradie.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-lg font-bold text-gray-900">{tradie.name}</h1>
                {isFullyVerified ? (
                  <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-600">
                    <ShieldCheck className="w-3 h-3" />Fully Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-50 text-amber-600">
                    <Clock className="w-3 h-3" />Pending
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">{tradie.email}</p>
              <p className="text-[10px] text-gray-400 font-mono">{tradie.fixId}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-center">
            <div><p className="text-xl font-bold text-gray-800">{uploaded.length}</p><p className="text-[10px] text-gray-400">Uploaded</p></div>
            <div><p className="text-xl font-bold text-emerald-600">{verified.length}</p><p className="text-[10px] text-gray-400">Verified</p></div>
            <div><p className="text-xl font-bold text-amber-600">{pending.length}</p><p className="text-[10px] text-gray-400">Pending</p></div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-4">
          {categories.map((cat) => (
            <span key={cat} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
              {CATEGORY_LABELS[cat as TradieCategory] || cat}
            </span>
          ))}
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-[10px] text-gray-400 mb-1">
            <span>Verification progress</span><span>{verified.length}/{documents.length}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#2563EB] rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {documents.map((doc) => {
          const isProcessing = actionLoading === doc.type
          const showingReject = showRejectInput === doc.type

          return (
            <div
              key={doc.type}
              className={`bg-white rounded-xl border p-5 transition-all ${
                doc.isVerified ? 'border-emerald-200' : doc.url ? 'border-amber-200' : 'border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    doc.isVerified ? 'bg-emerald-50 text-emerald-600' : doc.url ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{doc.label}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{doc.type}</p>
                  </div>
                </div>

                {doc.isVerified ? (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />Verified
                  </span>
                ) : doc.url ? (
                  <span className="flex items-center gap-1 text-[10px] text-amber-600 font-medium shrink-0">
                    <Clock className="w-3.5 h-3.5" />Pending
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-400 shrink-0">Not uploaded</span>
                )}
              </div>

              {doc.uploadedAt && (
                <p className="text-[10px] text-gray-400 mb-1">
                  Uploaded {new Date(doc.uploadedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              )}
              {doc.verifiedAt && (
                <p className="text-[10px] text-emerald-600 mb-2">
                  Verified {new Date(doc.verifiedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              )}

              {doc.url && (
                <a href={doc.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-[#2563EB] hover:text-[#1D4ED8] hover:underline mb-4 w-fit">
                  <ExternalLink className="w-3 h-3" />View Document
                </a>
              )}

              {doc.url && !doc.isVerified && (
                <div className="space-y-2">
                  {showingReject ? (
                    <>
                      <input
                        type="text"
                        value={rejectReason[doc.type] || ''}
                        onChange={(e) => setRejectReason((prev) => ({ ...prev, [doc.type]: e.target.value }))}
                        placeholder="Rejection reason (optional)..."
                        className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleReject(doc.type)} disabled={isProcessing}
                          className="flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-40">
                          {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldX className="w-3 h-3" />}Confirm Reject
                        </button>
                        <button onClick={() => setShowRejectInput(null)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">Cancel</button>
                      </div>
                    </>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => handleVerify(doc.type)} disabled={isProcessing}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors disabled:opacity-40">
                        {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}Verify
                      </button>
                      <button onClick={() => setShowRejectInput(doc.type)} disabled={isProcessing}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-40">
                        <ShieldX className="w-3 h-3" />Reject
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
