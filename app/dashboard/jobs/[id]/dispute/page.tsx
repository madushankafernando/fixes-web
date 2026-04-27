// fixes-web/app/dashboard/jobs/[id]/dispute/page.tsx

'use client'

import React, { useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, AlertTriangle, UploadCloud, X, Image as ImageIcon } from 'lucide-react'
import { api } from '@/lib/api'

const REASONS = [
  { value: '', label: 'Select a reason' },
  { value: 'poor_quality', label: 'Poor quality / Job unfinished' },
  { value: 'incomplete', label: 'Work incomplete' },
  { value: 'overcharged', label: 'Overcharged or unexpected fees' },
  { value: 'no_show', label: 'Tradie never showed up' },
  { value: 'damage', label: 'Property damaged' },
  { value: 'abusive_client', label: 'Abusive or unsafe behaviour' },
  { value: 'payment_withheld', label: 'Payment withheld unfairly' },
  { value: 'other', label: 'Other' },
]

interface EvidenceFile {
  localUri: string
  url: string
  publicId: string
}

async function uploadFileToCloudinary(file: File): Promise<{ url: string; publicId: string }> {
  const signRes = await api.post<any>('/api/uploads/sign', { folder: 'dispute_evidence' })
  const { signature, timestamp, cloudName, apiKey, folder } = signRes.data.data

  const form = new FormData()
  form.append('file', file)
  form.append('api_key', apiKey)
  form.append('timestamp', String(timestamp))
  form.append('signature', signature)
  form.append('folder', folder)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: form,
  })
  if (!res.ok) throw new Error(`Upload failed: ${await res.text()}`)
  const { secure_url, public_id } = await res.json()
  return { url: secure_url, publicId: public_id }
}

export default function ClientDisputePage() {
  const { id } = useParams()
  const router = useRouter()

  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [evidence, setEvidence] = useState<EvidenceFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    if (evidence.length + files.length > 5) {
      setError('Maximum 5 evidence photos allowed.')
      return
    }
    setUploading(true)
    setError('')
    try {
      for (let i = 0; i < files.length; i++) {
        setUploadingIdx(evidence.length + i)
        const localUri = URL.createObjectURL(files[i])
        const { url, publicId } = await uploadFileToCloudinary(files[i])
        setEvidence(prev => [...prev, { localUri, url, publicId }])
      }
    } catch {
      setError('One or more uploads failed. Please try again.')
    } finally {
      setUploading(false)
      setUploadingIdx(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeEvidence = (idx: number) => {
    setEvidence(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason || !description) return
    setIsSubmitting(true)
    setError('')
    try {
      await api.post('/api/disputes', {
        jobId: id,
        reason,
        description,
        evidence: evidence.map(e => ({ url: e.url, publicId: e.publicId })),
      })
      router.push(`/dashboard/jobs/${id}`)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to submit dispute. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/dashboard/jobs/${id}`}
          className="p-2 -ml-2 rounded-xl text-gray-400 hover:text-(--upwork-navy) hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-(--upwork-navy)">Raise a Dispute</h1>
          <p className="text-sm text-(--upwork-gray)">Report an issue to our mediation team.</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-sm text-amber-800 leading-relaxed">
          Opening a dispute will freeze any pending payment to the tradie while our admin team investigates.
          Please be as detailed as possible to help us reach a fair resolution.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-5 space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-(--upwork-navy)">
            Reason for Dispute
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-(--upwork-green) focus:border-transparent text-(--upwork-navy)"
            required
          >
            {REASONS.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-(--upwork-navy)">
            Detailed Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain exactly what happened..."
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm min-h-37.5 resize-y focus:outline-none focus:ring-2 focus:ring-(--upwork-green) focus:border-transparent text-(--upwork-navy)"
            required
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-semibold text-(--upwork-navy)">
            Evidence Photos <span className="font-normal text-gray-400">(optional, max 5)</span>
          </label>

          {evidence.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {evidence.map((ev, idx) => (
                <div key={ev.publicId} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200">
                  <img src={ev.url} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeEvidence(idx)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
              {uploading && (
                <div className="w-24 h-24 rounded-xl border border-gray-200 flex items-center justify-center bg-gray-50">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              )}
            </div>
          )}

          {evidence.length < 5 && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
                disabled={uploading}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full border-2 border-dashed border-gray-200 hover:border-(--upwork-green) hover:bg-green-50 transition-colors rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer text-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-8 h-8 text-gray-400 animate-spin mb-2" />
                    <p className="text-sm font-medium text-(--upwork-navy)">Uploading…</p>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm font-medium text-(--upwork-navy)">
                      {evidence.length === 0 ? 'Click to upload photos' : 'Add more photos'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG (max 5MB each)</p>
                  </>
                )}
              </button>
            </>
          )}
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={!reason || !description || isSubmitting || uploading}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Submit Dispute
          </button>
        </div>
      </form>
    </div>
  )
}
