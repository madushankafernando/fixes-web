'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Loader2, MapPin, Clock, DollarSign, User, AlertCircle,
  Check, Camera, ChevronDown, ChevronRight,
} from 'lucide-react'
import { api, ApiError } from '@/lib/api'
import { CLEANING_TYPE_LABELS, JOB_STATUS_LABELS, JOB_STATUS_COLORS } from '@/lib/constants'
import type { Job } from '@/lib/types'

interface Cleaner {
  _id: string
  userId: { _id: string; name: string; email: string; phone?: string }
  rating: { average: number; count: number }
  isOnline: boolean
}

export default function CleaningJobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string

  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [availableCleaners, setAvailableCleaners] = useState<Cleaner[]>([])
  const [selectedCleaner, setSelectedCleaner] = useState('')
  const [isAssigning, setIsAssigning] = useState(false)
  const [isAutoAssigning, setIsAutoAssigning] = useState(false)
  const [assignError, setAssignError] = useState('')

  const [editingQuote, setEditingQuote] = useState(false)
  const [quoteHours, setQuoteHours] = useState('')
  const [quoteRate, setQuoteRate] = useState('')
  const [isSavingQuote, setIsSavingQuote] = useState(false)

  const fetchJob = useCallback(async () => {
    try {
      const res = await api.get<Job>(`/api/cleaning-admin/jobs/${jobId}`)
      const jobData = res.data as Job
      setJob(jobData)
      const pricing = (jobData as any).cleaningPricing
      if (pricing) {
        setQuoteHours(String(pricing.estimatedHours || ''))
        setQuoteRate(String(pricing.ratePerHour || ''))
      }
    } catch {
    } finally {
      setIsLoading(false)
    }
  }, [jobId])

  useEffect(() => { fetchJob() }, [fetchJob])

  useEffect(() => {
    if (!job || job.assignedTradieId) return
    api.get<Array<{
      userId: string
      name: string
      email: string
      rating: { average: number; count: number }
      isOnline: boolean
    }>>(`/api/cleaning-admin/jobs/${jobId}/available-cleaners`)
      .then((res) => {
        const list = (res.data ?? []).map((c) => ({
          _id: String(c.userId),
          userId: { _id: String(c.userId), name: c.name, email: c.email },
          rating: c.rating,
          isOnline: c.isOnline,
        }))
        setAvailableCleaners(list)
      })
      .catch(() => setAvailableCleaners([]))
  }, [job, jobId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAssign = async () => {
    if (!selectedCleaner) return
    setIsAssigning(true)
    setAssignError('')
    try {
      await api.post(`/api/cleaning-admin/jobs/${jobId}/assign`, { tradieId: selectedCleaner })
      fetchJob()
    } catch (err) {
      setAssignError(err instanceof ApiError ? err.message : 'Failed to assign')
    } finally {
      setIsAssigning(false)
    }
  }

  const handleAutoAssign = async () => {
    setIsAutoAssigning(true)
    setAssignError('')
    try {
      await api.post(`/api/cleaning-admin/jobs/${jobId}/auto-assign`)
      fetchJob()
    } catch (err) {
      setAssignError(err instanceof ApiError ? err.message : 'No cleaner available for auto-assign')
    } finally {
      setIsAutoAssigning(false)
    }
  }

  const handleSaveQuote = async () => {
    setIsSavingQuote(true)
    try {
      await api.patch(`/api/cleaning-admin/jobs/${jobId}/quote`, {
        estimatedHours: Number(quoteHours),
        ratePerHour: Number(quoteRate),
      })
      setEditingQuote(false)
      fetchJob()
    } catch {
    } finally {
      setIsSavingQuote(false)
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-teal-600 animate-spin" /></div>
  }

  if (!job) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">Job not found</p>
        <button onClick={() => router.push('/cleaning-admin/jobs')} className="text-teal-600 text-sm mt-2 hover:underline">Back to jobs</button>
      </div>
    )
  }

  const pricing = (job as any).cleaningPricing || {}
  const tasks = (job as any).cleaningTasks || []
  const cleaningType = (job as any).cleaningType || ''
  const completedTasks = tasks.filter((t: any) => t.status === 'completed').length
  const client = typeof job.clientId === 'object' && job.clientId ? job.clientId : null
  const assignedTradie = typeof job.assignedTradieId === 'object' && job.assignedTradieId ? job.assignedTradieId : null

  return (
    <div>
      <button onClick={() => router.push('/cleaning-admin/jobs')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Job Queue
      </button>

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-bold text-gray-800 truncate">{job.title}</h1>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${JOB_STATUS_COLORS[job.status]}`}>
          {JOB_STATUS_LABELS[job.status]}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Job Details</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-400">Code:</span> <span className="font-medium">{job.jobCode}</span></div>
              <div><span className="text-gray-400">Type:</span> <span className="font-medium text-teal-600">{CLEANING_TYPE_LABELS[cleaningType] || cleaningType}</span></div>
              <div><span className="text-gray-400">Category:</span> <span className="font-medium capitalize">{job.category}</span></div>
              {client && <div><span className="text-gray-400">Client:</span> <span className="font-medium">{(client as any).name}</span></div>}
              <div className="col-span-2"><span className="text-gray-400">Location:</span> <span className="font-medium">{job.location?.address}, {job.location?.suburb} {job.location?.state}</span></div>
            </div>
            {job.description && (
              <p className="text-sm text-gray-500 mt-3 leading-relaxed">{job.description}</p>
            )}
          </div>

          {tasks.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-800">Tasks ({completedTasks}/{tasks.length})</h3>
                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full" style={{ width: `${(completedTasks / tasks.length) * 100}%` }} />
                </div>
              </div>
              <div className="space-y-2">
                {tasks.map((task: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      task.status === 'completed' ? 'bg-green-500' : task.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-200'
                    }`}>
                      {task.status === 'completed' && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`text-sm flex-1 ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                      {task.title}
                    </span>
                    <span className="text-xs text-gray-400 capitalize">{task.status}</span>
                    {task.photos?.length > 0 && (
                      <span className="flex items-center gap-0.5 text-xs text-gray-400"><Camera className="w-3 h-3" />{task.photos.length}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-800">Quote</h3>
              {!editingQuote && (
                <button 
                  onClick={() => setEditingQuote(true)} 
                  disabled={['completed', 'cancelled', 'disputed'].includes(job.status)}
                  className={`text-xs ${['completed', 'cancelled', 'disputed'].includes(job.status) ? 'text-gray-400 cursor-not-allowed' : 'text-teal-600 hover:underline'}`}
                  title={['completed', 'cancelled', 'disputed'].includes(job.status) ? 'Cannot edit quote for closed jobs' : ''}
                >
                  Edit
                </button>
              )}
            </div>
            {editingQuote ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500">Rate/hr ($)</label>
                  <input type="number" value={quoteRate} onChange={(e) => setQuoteRate(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Estimated Hours</label>
                  <input type="number" value={quoteHours} onChange={(e) => setQuoteHours(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <p className="text-xs text-gray-400">Total: ${(Number(quoteRate) * Number(quoteHours)).toFixed(2)}</p>
                <div className="flex gap-2">
                  <button onClick={handleSaveQuote} disabled={isSavingQuote}
                    className="flex-1 bg-teal-600 text-white text-sm py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50">
                    {isSavingQuote ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={() => setEditingQuote(false)} className="flex-1 border border-gray-300 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-50">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Rate</span><span className="font-medium">${pricing.ratePerHour?.toFixed(2) || '0.00'}/hr</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Est. Hours</span><span className="font-medium">{pricing.estimatedHours || 0}h</span></div>
                <div className="flex justify-between border-t border-gray-100 pt-2"><span className="font-semibold">Total</span><span className="font-bold text-teal-600">${pricing.totalEstimate?.toFixed(2) || '0.00'}</span></div>
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              {assignedTradie ? 'Assigned Cleaner' : 'Assign Cleaner'}
            </h3>
            {assignedTradie ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center text-white text-sm font-semibold">
                  {(assignedTradie as any).name?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{(assignedTradie as any).name}</p>
                  <p className="text-xs text-gray-400">{(assignedTradie as any).phone || (assignedTradie as any).email}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <select
                  value={selectedCleaner}
                  onChange={(e) => setSelectedCleaner(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select a cleaner...</option>
                  {availableCleaners.map((c) => (
                    <option key={c._id} value={c.userId._id}>
                      {c.userId.name} {c.isOnline ? '(Online)' : ''} — {c.rating.average.toFixed(1)}★
                    </option>
                  ))}
                </select>
                {assignError && <p className="text-xs text-red-500">{assignError}</p>}
                <div className="flex gap-2">
                  <button onClick={handleAssign} disabled={!selectedCleaner || isAssigning}
                    className="flex-1 bg-teal-600 text-white text-sm py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50">
                    {isAssigning ? 'Assigning...' : 'Assign'}
                  </button>
                  <button onClick={handleAutoAssign} disabled={isAutoAssigning}
                    className="flex-1 border border-teal-300 text-teal-600 text-sm py-2 rounded-lg hover:bg-teal-50 disabled:opacity-50">
                    {isAutoAssigning ? 'Finding...' : 'Auto-Assign'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-gray-400" /> Location
            </h3>
            <p className="text-sm text-gray-600">{job.location?.address}</p>
            <p className="text-sm text-gray-600">{job.location?.suburb}, {job.location?.state} {job.location?.postcode}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
