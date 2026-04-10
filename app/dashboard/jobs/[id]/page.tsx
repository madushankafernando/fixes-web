'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  Send,
  Star,
  User as UserIcon,
  CheckCircle2,
  XCircle,
  Truck,
  Wrench,
  Search,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { api, ApiError } from '@/lib/api'
import { JOB_STATUS_LABELS, JOB_STATUS_COLORS, CATEGORY_LABELS } from '@/lib/constants'
import { getSocket, joinJobRoom, leaveJobRoom } from '@/lib/socket'
import type {
  Job,
  Quote,
  Message,
  User,
  JobStatus,
  JobCategory,
  MessageNewPayload,
  JobStatusUpdatePayload,
} from '@/lib/types'

// ─── Status Timeline ────────────────────────────────────────────────────────────

const STATUS_STEPS: { status: JobStatus; label: string; icon: React.ElementType }[] = [
  { status: 'quoted', label: 'Quoted', icon: DollarSign },
  { status: 'dispatching', label: 'Finding Tradie', icon: Search },
  { status: 'accepted', label: 'Accepted', icon: CheckCircle2 },
  { status: 'on_the_way', label: 'On the Way', icon: Truck },
  { status: 'in_progress', label: 'In Progress', icon: Wrench },
  { status: 'completed', label: 'Completed', icon: CheckCircle2 },
]

function StatusTimeline({ currentStatus }: { currentStatus: JobStatus }) {
  if (currentStatus === 'cancelled' || currentStatus === 'no_tradie_found') {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
        <XCircle className="w-5 h-5 text-red-500" />
        <span className="text-sm font-medium text-red-700">
          {currentStatus === 'cancelled' ? 'Job Cancelled' : 'No Tradie Found'}
        </span>
      </div>
    )
  }

  const currentIndex = STATUS_STEPS.findIndex((s) => s.status === currentStatus)

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2 pt-1 pl-1">
      {STATUS_STEPS.map((step, index) => {
        const Icon = step.icon
        const isCompleted = index <= currentIndex
        const isCurrent = index === currentIndex

        return (
          <div key={step.status} className="flex items-center shrink-0">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  isCompleted
                    ? 'bg-(--upwork-green) text-white'
                    : 'bg-gray-100 text-gray-400'
                } ${isCurrent ? 'ring-2 ring-(--upwork-green) ring-offset-2' : ''}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={`text-[10px] mt-1 font-medium whitespace-nowrap ${
                  isCompleted ? 'text-(--upwork-navy)' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < STATUS_STEPS.length - 1 && (
              <div
                className={`w-6 sm:w-10 h-0.5 mx-1 -mt-3.5 ${
                  index < currentIndex ? 'bg-(--upwork-green)' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Chat Widget ────────────────────────────────────────────────────────────────

function ChatWidget({ jobId, currentUserId }: { jobId: string; currentUserId: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Load messages
  useEffect(() => {
    async function loadMessages() {
      try {
        const res = await api.getPaginated<Message>(`/api/messages/${jobId}?limit=100`)
        setMessages(res.data)
      } catch {
        // Silent
      } finally {
        setIsLoadingMessages(false)
      }
    }
    loadMessages()
  }, [jobId])

  // Mark as read
  useEffect(() => {
    if (messages.length > 0) {
      api.patch(`/api/messages/${jobId}/read`).catch(() => {})
    }
  }, [jobId, messages.length])

  // Socket.io listener
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    joinJobRoom(jobId)

    const handleNewMessage = (payload: MessageNewPayload) => {
      if (payload.jobId === jobId) {
        const incoming: Message = {
          _id: payload._id,
          jobId: payload.jobId,
          senderId: payload.senderId,
          receiverId: null,
          content: payload.content,
          type: payload.type,
          imageUrl: null,
          isRead: false,
          readAt: null,
          createdAt: payload.createdAt,
          updatedAt: payload.createdAt,
        }
        setMessages((prev) => [...prev, incoming])
        // Mark as read immediately
        api.patch(`/api/messages/${jobId}/read`).catch(() => {})
      }
    }

    socket.on('message:new', handleNewMessage)

    return () => {
      socket.off('message:new', handleNewMessage)
      leaveJobRoom(jobId)
    }
  }, [jobId])

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return
    setIsSending(true)
    try {
      await api.post(`/api/messages/${jobId}`, { content: newMessage.trim() })
      setNewMessage('')
    } catch {
      // Silent
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl flex flex-col h-75 sm:h-100">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-(--upwork-navy)">Chat</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {isLoadingMessages ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 text-gray-300 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-xs text-gray-400 py-8">
            No messages yet. Start the conversation.
          </p>
        ) : (
          messages.map((msg) => {
            const senderId =
              typeof msg.senderId === 'object' ? msg.senderId._id : msg.senderId
            const senderName =
              typeof msg.senderId === 'object' ? msg.senderId.name : 'User'
            const isOwn = senderId === currentUserId

            return (
              <div
                key={msg._id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-xl px-3 py-2 ${
                    isOwn
                      ? 'bg-(--upwork-green) text-white'
                      : 'bg-gray-100 text-(--upwork-navy)'
                  }`}
                >
                  {!isOwn && (
                    <p className="text-[10px] font-medium mb-0.5 opacity-70">
                      {senderName}
                    </p>
                  )}
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p
                    className={`text-[10px] mt-1 ${
                      isOwn ? 'text-white/60' : 'text-gray-400'
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString('en-AU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-2 border-t border-gray-100 flex items-center gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-(--upwork-green) text-(--upwork-navy) placeholder:text-gray-400"
        />
        <button
          onClick={handleSend}
          disabled={!newMessage.trim() || isSending}
          className="w-9 h-9 rounded-lg bg-(--upwork-green) hover:bg-(--upwork-green-dark) disabled:opacity-40 text-white flex items-center justify-center transition-colors shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ─── Review Form ────────────────────────────────────────────────────────────────

function ReviewForm({ jobId, onSubmitted }: { jobId: string; onSubmitted: () => void }) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating')
      return
    }
    setIsSubmitting(true)
    setError('')
    try {
      await api.post(`/api/reviews/${jobId}`, { rating, comment: comment.trim() || undefined })
      onSubmitted()
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to submit review')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-(--upwork-navy) mb-4">Leave a Review</h3>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 text-red-600 text-xs px-3 py-2 rounded-lg mb-4">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-0.5"
          >
            <Star
              className={`w-7 h-7 transition-colors ${
                star <= (hoverRating || rating)
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience (optional)..."
        rows={3}
        maxLength={500}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-(--upwork-navy) placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-(--upwork-green) resize-none mb-3"
      />

      <button
        onClick={handleSubmit}
        disabled={isSubmitting || rating === 0}
        className="bg-(--upwork-green) hover:bg-(--upwork-green-dark) disabled:opacity-40 text-white text-sm font-medium py-2 px-5 rounded-lg transition-colors flex items-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Review'
        )}
      </button>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════════════════════════════════════

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const jobId = params.id as string

  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reviewSubmitted, setReviewSubmitted] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [rejectError, setRejectError] = useState('')

  // Fetch job detail
  const fetchJob = useCallback(async () => {
    try {
      const res = await api.get<{ job: Job }>(`/api/jobs/${jobId}`)
      setJob(res.data.job)
    } catch {
      // Silent
    } finally {
      setIsLoading(false)
    }
  }, [jobId])

  useEffect(() => {
    fetchJob()
  }, [fetchJob])

  // Socket.io — live status updates
  useEffect(() => {
    const socket = getSocket()
    if (!socket || !job) return

    const mongoId = job._id
    joinJobRoom(mongoId)

    const handleStatusUpdate = (payload: JobStatusUpdatePayload) => {
      if (payload.jobId === mongoId) {
        setJob((prev) => (prev ? { ...prev, status: payload.status } : prev))
      }
    }

    socket.on('job:status_update', handleStatusUpdate)

    return () => {
      socket.off('job:status_update', handleStatusUpdate)
      leaveJobRoom(mongoId)
    }
  }, [job?._id])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-(--upwork-green) border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <XCircle className="w-12 h-12 text-gray-300 mb-4" />
        <p className="text-(--upwork-navy) font-medium mb-1">Job not found</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="text-sm text-(--upwork-green) hover:underline mt-2"
        >
          Back to dashboard
        </button>
      </div>
    )
  }

  const quote = typeof job.quote === 'object' ? (job.quote as Quote) : null
  const assignedTradie =
    typeof job.assignedTradieId === 'object' ? (job.assignedTradieId as User) : null
  const canChat = assignedTradie && !['cancelled', 'no_tradie_found'].includes(job.status)
  const canReview =
    job.status === 'completed' && !job.clientReview && !reviewSubmitted

  const handleRejectQuote = async () => {
    if (!window.confirm('Are you sure you want to reject this quote? The job will be cancelled.')) return
    setIsRejecting(true)
    setRejectError('')
    try {
      await api.post(`/api/jobs/${job._id}/reject-quote`)
      router.push('/dashboard/jobs')
    } catch (err) {
      if (err instanceof ApiError) {
        setRejectError(err.message)
      } else {
        setRejectError('Failed to reject quote. Please try again.')
      }
      setIsRejecting(false)
    }
  }

  return (
    <div>
      {/* Back + Title */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/dashboard/jobs')}
          className="flex items-center gap-1.5 text-sm text-(--upwork-gray) hover:text-(--upwork-navy) transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to jobs
        </button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-lg sm:text-xl font-bold text-(--upwork-navy)">{job.title}</h1>
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-medium ${JOB_STATUS_COLORS[job.status]}`}
          >
            {JOB_STATUS_LABELS[job.status]}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {job.jobCode} • {CATEGORY_LABELS[job.category as JobCategory] || job.category} •
          Posted {new Date(job.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>

      {/* Status Timeline */}
      <div className="mb-6">
        <StatusTimeline currentStatus={job.status} />
      </div>

      {/* Quote Action Banner — shown when job is awaiting client decision */}
      {job.status === 'quoted' && quote && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-amber-800 mb-0.5">Quote Ready — Your Decision</p>
              <p className="text-xs text-amber-600">
                Fixed price: <span className="font-bold">${quote.suggestedFixedPrice}</span> •
                Est. {quote.estimatedHours.min}–{quote.estimatedHours.max}h work
              </p>
              {rejectError && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{rejectError}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleRejectQuote}
                disabled={isRejecting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 bg-white text-red-600 text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {isRejecting
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <XCircle className="w-3.5 h-3.5" />
                }
                Reject
              </button>
              <button
                onClick={() => router.push(`/post-job?jobId=${job._id}`)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-(--upwork-green) hover:bg-(--upwork-green-dark) text-white text-sm font-medium transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-(--upwork-navy) mb-3">Description</h3>
            <p className="text-xs sm:text-sm text-(--upwork-gray) leading-relaxed whitespace-pre-wrap">
              {job.description}
            </p>
          </div>

          {/* Images */}
          {job.images.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-(--upwork-navy) mb-3">Photos</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {job.images.map((img, i) => (
                  <div key={img.publicId} className="aspect-square rounded-lg overflow-hidden relative">
                    <Image
                      src={img.url}
                      alt={`Photo ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 33vw, 25vw"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chat */}
          {canChat && user && (
            <ChatWidget jobId={job._id} currentUserId={user._id} />
          )}

          {/* Review */}
          {canReview && (
            <ReviewForm
              jobId={job._id}
              onSubmitted={() => {
                setReviewSubmitted(true)
                fetchJob() // Refresh job data
              }}
            />
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Location */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-(--upwork-navy) mb-3 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-gray-400" />
              Location
            </h3>
            <p className="text-sm text-(--upwork-gray)">{job.location.address}</p>
            <p className="text-sm text-(--upwork-gray)">
              {job.location.suburb}, {job.location.state} {job.location.postcode}
            </p>
          </div>

          {/* Quote Details */}
          {quote && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-(--upwork-navy) mb-3 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-gray-400" />
                Quote
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-(--upwork-gray)">Price Range</span>
                  <span className="font-medium text-(--upwork-navy)">
                    ${quote.price.min} – ${quote.price.max}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-(--upwork-gray)">Fixed Price</span>
                  <span className="font-semibold text-(--upwork-green)">
                    ${quote.suggestedFixedPrice}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-(--upwork-gray)">Est. Hours</span>
                  <span className="text-(--upwork-navy)">
                    {quote.estimatedHours.min}–{quote.estimatedHours.max}h
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-(--upwork-gray)">Skill Level</span>
                  <span className="text-(--upwork-navy) capitalize">
                    {quote.detectedSkillLevel}
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-500">
                    {quote.engine} • {Math.round(quote.confidence * 100)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Assigned Tradie */}
          {assignedTradie && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-(--upwork-navy) mb-3">
                Assigned Tradie
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-(--upwork-green) flex items-center justify-center text-white overflow-hidden shrink-0">
                  {assignedTradie.avatarUrl ? (
                    <Image
                      src={assignedTradie.avatarUrl}
                      alt={assignedTradie.name}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <UserIcon className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-(--upwork-navy)">
                    {assignedTradie.name}
                  </p>
                  {assignedTradie.phone && (
                    <p className="text-xs text-gray-400">{assignedTradie.phone}</p>
                  )}
                  {assignedTradie.fixId && (
                    <p className="text-xs text-gray-400">{assignedTradie.fixId}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Preferred Time */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-(--upwork-navy) mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-gray-400" />
              Timing
            </h3>
            <p className="text-sm text-(--upwork-gray) capitalize">
              {job.preferredTime === '1-2weeks' ? 'In 1–2 Weeks' : job.preferredTime === 'no-rush' ? 'No Rush' : 'Now'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
