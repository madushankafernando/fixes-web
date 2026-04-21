'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'


// Since this is a next.js page, we use lucide-react, not lucide-react-native
import { ArrowLeft as ArrowLeftWeb, Loader2 as Loader2Web, AlertTriangle as AlertTriangleWeb, UploadCloud as UploadCloudWeb } from 'lucide-react'

const REASONS = [
  { value: '', label: 'Select a reason' },
  { value: 'poor_quality', label: 'Poor quality / Job unfinished' },
  { value: 'overcharged', label: 'Overcharged or unexpected fees' },
  { value: 'no_show', label: 'Tradie never showed up' },
  { value: 'other', label: 'Other' }
]

export default function ClientDisputePage() {
  const { id } = useParams()
  const router = useRouter()
  
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

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
        evidence: [] // mock evidence for now
      })
      router.push(`/dashboard/jobs/${id}`)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to submit dispute')
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
          <ArrowLeftWeb className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-(--upwork-navy)">Raise a Dispute</h1>
          <p className="text-sm text-(--upwork-gray)">Report an issue to our mediation team.</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5 flex items-start gap-3">
        <AlertTriangleWeb className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
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
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm min-h-[150px] resize-y focus:outline-none focus:ring-2 focus:ring-(--upwork-green) focus:border-transparent text-(--upwork-navy)"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-(--upwork-navy)">
            Evidence (Photos/Documents)
          </label>
          <div className="border-2 border-dashed border-gray-200 hover:border-(--upwork-green) hover:bg-green-50 transition-colors rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer text-center">
            <UploadCloudWeb className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm font-medium text-(--upwork-navy)">Click to upload</p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG or PDF (max 5MB)</p>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={!reason || !description || isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isSubmitting ? <Loader2Web className="w-4 h-4 animate-spin inline mr-2" /> : null}
            Submit Dispute
          </button>
        </div>
      </form>
    </div>
  )
}
