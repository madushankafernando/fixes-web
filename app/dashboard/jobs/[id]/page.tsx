// app/dashboard/jobs/[id]/page.tsx

'use client'

import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
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
  Camera,
  ShieldCheck,
  UploadCloud,
  X,
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { api, ApiError } from '@/lib/api'
import { JOB_STATUS_LABELS, JOB_STATUS_COLORS, CATEGORY_LABELS, TIER_LABELS } from '@/lib/constants'
import { SkeletonJobDetail, SkeletonChatMessages } from '../../_components/skeletons'
import { connectSocket, joinJobRoom, leaveJobRoom } from '@/lib/socket'
import { GoogleMap, useJsApiLoader, Polyline, Marker } from '@react-google-maps/api'
import type {
  Job,
  Quote,
  Message,
  User,
  JobStatus,
  JobCategory,
  MessageNewPayload,
  JobStatusUpdatePayload,
  TradieLocationUpdatePayload,
} from '@/lib/types'


function AutoRefresh({ onRefresh, intervalMs }: { onRefresh: () => void; intervalMs: number }) {
  useEffect(() => {
    const id = setInterval(onRefresh, intervalMs)
    return () => clearInterval(id)
  }, [onRefresh, intervalMs])
  return null
}


const STATUS_STEPS: { status: JobStatus; label: string; icon: React.ElementType }[] = [
  { status: 'quoted', label: 'Quoted', icon: DollarSign },
  { status: 'payment_pending', label: 'Payment', icon: DollarSign },
  { status: 'dispatching', label: 'Finding Tradie', icon: Search },
  { status: 'accepted', label: 'Accepted', icon: CheckCircle2 },
  { status: 'on_the_way', label: 'On the Way', icon: Truck },
  { status: 'in_progress', label: 'In Progress', icon: Wrench },
  { status: 'completed', label: 'Completed', icon: CheckCircle2 },
]

function StatusTimeline({ currentStatus }: { currentStatus: JobStatus }) {
  if (currentStatus === 'cancelled' || currentStatus === 'no_tradie_found' || currentStatus === 'disputed') {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
        {currentStatus === 'disputed' ? <AlertCircle className="w-5 h-5 text-red-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
        <span className="text-sm font-medium text-red-700">
          {currentStatus === 'cancelled' ? 'Job Cancelled' : currentStatus === 'disputed' ? 'Job Disputed - Funds in Escrow' : 'No Tradie Found'}
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
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isCompleted
                    ? 'bg-(--upwork-green) text-white'
                    : 'bg-gray-100 text-gray-400'
                  } ${isCurrent ? 'ring-2 ring-(--upwork-green) ring-offset-2' : ''}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={`text-[10px] mt-1 font-medium whitespace-nowrap ${isCompleted ? 'text-(--upwork-navy)' : 'text-gray-400'
                  }`}
              >
                {step.label}
              </span>
            </div>
            {index < STATUS_STEPS.length - 1 && (
              <div
                className={`w-6 sm:w-10 h-0.5 mx-1 -mt-3.5 ${index < currentIndex ? 'bg-(--upwork-green)' : 'bg-gray-200'
                  }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}


function ChatWidget({ jobId, currentUserId }: { jobId: string; currentUserId: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadMessages() {
      try {
        const res = await api.getPaginated<Message>(`/api/messages/${jobId}?limit=100`)
        setMessages(res.data)
      } catch {
      } finally {
        setIsLoadingMessages(false)
      }
    }
    loadMessages()
  }, [jobId])

  useEffect(() => {
    if (messages.length > 0) {
      api.patch(`/api/messages/${jobId}/read`).catch(() => { })
    }
  }, [jobId, messages.length])

  useEffect(() => {
    const socket = connectSocket()
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
        api.patch(`/api/messages/${jobId}/read`).catch(() => { })
      }
    }

    socket.on('message:new', handleNewMessage)

    return () => {
      socket.off('message:new', handleNewMessage)
      leaveJobRoom(jobId)
    }
  }, [jobId])

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

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {isLoadingMessages ? (
          <SkeletonChatMessages />
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
                  className={`max-w-[75%] rounded-xl px-3 py-2 ${isOwn
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
                    className={`text-[10px] mt-1 ${isOwn ? 'text-white/60' : 'text-gray-400'
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
              className={`w-7 h-7 transition-colors ${star <= (hoverRating || rating)
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


const GOOGLE_MAPS_LIBRARIES: ('geometry' | 'places')[] = ['geometry']
const MIN_MOVE_METRES = 30


const TRADIE_MARKER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="52" viewBox="0 0 40 52">
  <path d="M20 0C8.954 0 0 8.954 0 20c0 11.046 20 32 20 32S40 31.046 40 20C40 8.954 31.046 0 20 0z" fill="#16a34a"/>
  <circle cx="20" cy="20" r="12" fill="rgba(255,255,255,0.18)"/>
  <g transform="translate(8,8)" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </g>
</svg>`

const JOB_MARKER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="52" viewBox="0 0 40 52">
  <path d="M20 0C8.954 0 0 8.954 0 20c0 11.046 20 32 20 32S40 31.046 40 20C40 8.954 31.046 0 20 0z" fill="#3b82f6"/>
  <circle cx="20" cy="20" r="12" fill="rgba(255,255,255,0.18)"/>
  <g transform="translate(8,8)" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </g>
</svg>`

function haversineMetres(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6_371_000
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

interface LiveTrackingMapProps {
  jobId: string          
  jobCode: string
  jobLocation: { lat: number; lng: number }
  initialTradieLocation: { lat: number; lng: number } | null
}

function LiveTrackingMap({ jobId, jobCode, jobLocation, initialTradieLocation }: LiveTrackingMapProps) {
  const [tradiePos, setTradiePos] = useState<{ lat: number; lng: number } | null>(initialTradieLocation)
  const [routePath, setRoutePath] = useState<{ lat: number; lng: number }[]>([])
  const [routeKey, setRouteKey] = useState(0)   
  const [eta, setEta] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [arrived, setArrived] = useState(false)
  const lastCalcPos = useRef<{ lat: number; lng: number } | null>(null)

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? '',
    libraries: GOOGLE_MAPS_LIBRARIES,
  })

  const tradieIcon = useMemo(() => {
    if (!isLoaded || typeof window === 'undefined' || !window.google) return undefined
    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(TRADIE_MARKER_SVG)}`,
      scaledSize: new window.google.maps.Size(40, 52),
      anchor: new window.google.maps.Point(20, 52),
    }
  }, [isLoaded])

  const jobIcon = useMemo(() => {
    if (!isLoaded || typeof window === 'undefined' || !window.google) return undefined
    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(JOB_MARKER_SVG)}`,
      scaledSize: new window.google.maps.Size(40, 52),
      anchor: new window.google.maps.Point(20, 52),
    }
  }, [isLoaded])

  useEffect(() => {
    if (initialTradieLocation && !tradiePos) {
      setTradiePos(initialTradieLocation)
    }
  }, [initialTradieLocation]) // eslint-disable-line

  const fetchRoute = useCallback(async (origin: { lat: number; lng: number }) => {
    if (!window.google?.maps?.geometry) return
    try {
      const res = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? '',
          'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline',
        },
        body: JSON.stringify({
          origin: { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } },
          destination: { location: { latLng: { latitude: jobLocation.lat, longitude: jobLocation.lng } } },
          travelMode: 'DRIVE',
          routingPreference: 'TRAFFIC_AWARE',
        }),
      })
      const data = await res.json()
      const route = data.routes?.[0]
      if (!route?.polyline?.encodedPolyline) return

      const decoded = window.google.maps.geometry.encoding.decodePath(route.polyline.encodedPolyline)
      setRoutePath(decoded.map((p: google.maps.LatLng) => ({ lat: p.lat(), lng: p.lng() })))
      setRouteKey(k => k + 1)   

      const secs = parseInt((route.duration ?? '0s').replace('s', ''), 10)
      if (secs > 0) {
        const mins = Math.round(secs / 60)
        setEta(`${mins} min${mins !== 1 ? 's' : ''}`)
      }
      lastCalcPos.current = origin
    } catch (err) {
      console.warn('[Routes API] fetch failed:', err)
    }
  }, [jobLocation])

  useEffect(() => {
    if (isLoaded && tradiePos) fetchRoute(tradiePos)
  }, [isLoaded, tradiePos]) // eslint-disable-line


  const joinedRef = useRef(false)
  useEffect(() => {
    const socket = connectSocket()
    if (!socket || joinedRef.current) return

    const doJoin = () => {
      if (!joinedRef.current) {
        socket.emit('job:join', jobId)
        joinedRef.current = true
      }
    }
    if (socket.connected) {
      doJoin()
    } else {
      socket.once('connect', doJoin)
    }
    return () => {
      socket.emit('job:leave', jobId)
      joinedRef.current = false
    }
  }, [jobId]) // eslint-disable-line

  useEffect(() => {
    const socket = connectSocket()
    if (!socket) return

    const handleLocation = (payload: TradieLocationUpdatePayload) => {
      const newPos = { lat: payload.lat, lng: payload.lng }
      setTradiePos(newPos)
      if (isLoaded) {
        const prev = lastCalcPos.current
        if (!prev || haversineMetres(prev, newPos) > MIN_MOVE_METRES) {
          fetchRoute(newPos)
        }
      }
    }

    const handleArrived = () => {
      setArrived(true)
    }

    socket.on('tradie:location_update', handleLocation)
    socket.on('tradie:arrived', handleArrived)
    return () => {
      socket.off('tradie:location_update', handleLocation)
      socket.off('tradie:arrived', handleArrived)
    }
  }, [isLoaded, fetchRoute])

  const trackingUrl = typeof window !== 'undefined' ? `${window.location.origin}/track/${jobCode}` : ''

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(trackingUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  if (!isLoaded) {
    return (
      <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 h-64 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm mb-4">
      {arrived ? (
        <div className="flex items-center justify-between px-4 py-3 bg-linear-to-r from-emerald-500 to-green-400 text-white">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-semibold">Tradie has arrived! Please guide them in 🔧</span>
          </div>
          <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-medium animate-pulse">Arrived</span>
        </div>
      ) : (
        <div className="flex items-center justify-between px-4 py-3 bg-linear-to-r from-green-600 to-emerald-500 text-white">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            <span className="text-sm font-semibold">
              {eta ? `Arriving in ~${eta}` : 'Tradie is on the way'}
            </span>
          </div>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors font-medium"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Share Link'}
          </button>
        </div>
      )}

      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '320px' }}
        center={tradiePos ?? jobLocation}
        zoom={14}
        options={{ disableDefaultUI: true, zoomControl: true }}
      >
        <Marker
          position={jobLocation}
          icon={jobIcon}
          title="Job location"
        />
        {tradiePos && (
          <Marker
            position={tradiePos}
            icon={tradieIcon}
            title="Tradie"
          />
        )}
        {routePath.length > 0 && (
          <Polyline
            key={routeKey}
            path={routePath}
            options={{ strokeColor: '#16a34a', strokeWeight: 5, strokeOpacity: 0.85 }}
          />
        )}
      </GoogleMap>

      <div className="flex items-center gap-4 px-4 py-2.5 bg-white border-t border-gray-100 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> Tradie</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Job Location</span>
        {!tradiePos && <span className="text-amber-500 italic">Waiting for tradie location...</span>}
      </div>
    </div>
  )
}


async function signAndUpload(file: File): Promise<{ url: string; publicId: string }> {
  const signRes = await api.post<any>('/api/uploads/sign', { folder: 'dispute_evidence' })
  const { signature, timestamp, cloudName, apiKey, folder } = signRes.data.data
  const form = new FormData()
  form.append('file', file)
  form.append('api_key', apiKey)
  form.append('timestamp', String(timestamp))
  form.append('signature', signature)
  form.append('folder', folder)
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST', body: form,
  })
  if (!res.ok) throw new Error(`Upload failed: ${await res.text()}`)
  const { secure_url, public_id } = await res.json()
  return { url: secure_url, publicId: public_id }
}

function DisputeEvidenceSection({ job, user }: { job: Job; user: any }) {
  const [dispute, setDispute] = useState<any | null>(null)
  const [loadingDispute, setLoadingDispute] = useState(true)
  const [newFiles, setNewFiles] = useState<{ localUri: string; url: string; publicId: string }[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!job.disputeId) return
    api.get<{ dispute: any }>(`/api/disputes/${job.disputeId}`)
      .then(res => setDispute(res.data.dispute))
      .catch(() => {})
      .finally(() => setLoadingDispute(false))
  }, [job.disputeId])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    if (newFiles.length + files.length > 5) {
      setError('Maximum 5 photos per submission.')
      return
    }
    setUploading(true)
    setError('')
    try {
      for (const file of files) {
        const localUri = URL.createObjectURL(file)
        const { url, publicId } = await signAndUpload(file)
        setNewFiles(prev => [...prev, { localUri, url, publicId }])
      }
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSubmitEvidence = async () => {
    if (!newFiles.length || !dispute) return
    setSubmitting(true)
    setError('')
    try {
      await api.post(`/api/disputes/${dispute._id}/evidence`, {
        evidence: newFiles.map(f => ({ url: f.url, publicId: f.publicId }))
      })
      setSuccess(true)
      setNewFiles([])
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to submit evidence.')
    } finally {
      setSubmitting(false)
    }
  }

  const canAddEvidence = dispute && (dispute.status === 'open' || dispute.status === 'under_review')
  const isInitiator = dispute && user && dispute.initiatorId?._id === user._id
  const myEvidence = dispute ? (isInitiator ? dispute.initiatorEvidence : dispute.againstEvidence) : []
  const theirEvidence = dispute ? (isInitiator ? dispute.againstEvidence : dispute.initiatorEvidence) : []

  return (
    <div className="mb-6 space-y-4">
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-5">
        <p className="text-sm font-semibold text-red-800 mb-1 flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4" /> Job is Disputed
        </p>
        <p className="text-xs text-red-700">
          Payment is frozen in escrow. Our admin team will mediate and reach a fair resolution.
        </p>
      </div>

      {loadingDispute ? (
        <div className="flex items-center gap-2 text-xs text-gray-400 px-1">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading dispute details…
        </div>
      ) : dispute ? (
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-5">
          <div>
            <p className="text-xs font-semibold text-(--upwork-gray) uppercase tracking-wider mb-2">Your Evidence</p>
            {myEvidence.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {myEvidence.map((ev: any, i: number) => (
                  <a key={i} href={ev.url} target="_blank" rel="noopener noreferrer"
                    className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 block">
                    <img src={ev.url} alt={`Evidence ${i + 1}`} className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No evidence submitted yet.</p>
            )}
          </div>

          {theirEvidence.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-(--upwork-gray) uppercase tracking-wider mb-2">Their Evidence</p>
              <div className="flex flex-wrap gap-2">
                {theirEvidence.map((ev: any, i: number) => (
                  <a key={i} href={ev.url} target="_blank" rel="noopener noreferrer"
                    className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 block">
                    <img src={ev.url} alt={`Their evidence ${i + 1}`} className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {canAddEvidence && (
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <p className="text-sm font-semibold text-(--upwork-navy)">Add More Evidence</p>

              {success && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Evidence submitted successfully.
                </p>
              )}
              {error && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {error}
                </p>
              )}

              {newFiles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {newFiles.map((f, i) => (
                    <div key={f.publicId} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                      <img src={f.url} alt={`New ${i + 1}`} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setNewFiles(p => p.filter((_, idx) => idx !== i))}
                        className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center">
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                  {uploading && (
                    <div className="w-20 h-20 rounded-lg border border-gray-200 flex items-center justify-center bg-gray-50">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    </div>
                  )}
                </div>
              )}

              {newFiles.length < 5 && (
                <>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                    onChange={handleFileChange} disabled={uploading} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                    className="flex items-center gap-2 text-sm text-(--upwork-green) hover:underline disabled:opacity-50">
                    <UploadCloud className="w-4 h-4" />
                    {uploading ? 'Uploading…' : 'Select photos'}
                  </button>
                </>
              )}

              {newFiles.length > 0 && !uploading && (
                <button onClick={handleSubmitEvidence} disabled={submitting}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Submit Evidence
                </button>
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}



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
  const [isCancelling, setIsCancelling] = useState(false)
  const [cancelError, setCancelError] = useState('')
  const [dispatchElapsedSecs, setDispatchElapsedSecs] = useState(0)

  const [dispute, setDispute] = useState<any | null>(null)
  const [evidenceFiles, setEvidenceFiles] = useState<{ localUri: string; url: string; publicId: string }[]>([])
  const [evidenceUploading, setEvidenceUploading] = useState(false)
  const [evidenceSubmitting, setEvidenceSubmitting] = useState(false)
  const [evidenceError, setEvidenceError] = useState('')
  const [evidenceSuccess, setEvidenceSuccess] = useState(false)
  const evidenceInputRef = useRef<HTMLInputElement>(null)

  const [tradieLocation, setTradieLocation] = useState<{ lat: number; lng: number } | null>(null)

  const [dispatchCycleAt, setDispatchCycleAt] = useState<string | null>(null)  // expiresAt for current cycle
  const [dispatchTotalMs, setDispatchTotalMs] = useState<number>(60_000)       // timeoutMs from server
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)  // null = not started yet

  const fetchJob = useCallback(async () => {
    try {
      const res = await api.get<{ job: Job }>(`/api/jobs/${jobId}`)
      setJob(res.data.job)
    } catch {
    } finally {
      setIsLoading(false)
    }
  }, [jobId])

  useEffect(() => {
    fetchJob()
  }, [fetchJob])

  useEffect(() => {
    if (!job) return
    const trackingStatuses = ['on_the_way', 'in_progress']
    if (trackingStatuses.includes(job.status) && job.assignedTradieId) {
      api.get<{ location: { lat: number; lng: number } | null }>(`/api/jobs/${jobId}/tradie-location`)
        .then((res) => {
          if (res.data.location) setTradieLocation(res.data.location)
        })
        .catch(() => { })
    }
  }, [job?.status, jobId]) // eslint-disable-line

  
  useEffect(() => {
    if (job?.status !== 'dispatching') {
      setDispatchElapsedSecs(0)
      return
    }
    setDispatchElapsedSecs(0)
    const id = setInterval(() => setDispatchElapsedSecs((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [job?.status])

  useEffect(() => {
    const socket = connectSocket()
    if (!socket || !job) return

    const mongoId = job._id
    joinJobRoom(mongoId)

    const handleStatusUpdate = (payload: JobStatusUpdatePayload) => {
      if (payload.jobId === mongoId) {
        setJob((prev) => (prev ? { ...prev, status: payload.status } : prev))
      }
    }

    const handleFindingTradie = (payload: {
      expiresAt: string
      timeoutMs: number
      message: string
    }) => {
      setDispatchCycleAt(payload.expiresAt)  
      setDispatchTotalMs(payload.timeoutMs)
      const secs = Math.ceil(
        (new Date(payload.expiresAt).getTime() - Date.now()) / 1000
      )
      setSecondsLeft(Math.max(0, secs))
    }

    socket.on('job:status_update', handleStatusUpdate)
    socket.on('dispatch:finding_tradie', handleFindingTradie)
    const handleOtpSent = () => fetchJob()
    socket.on('job:otp_sent', handleOtpSent)

    return () => {
      socket.off('job:status_update', handleStatusUpdate)
      socket.off('dispatch:finding_tradie', handleFindingTradie)
      socket.off('job:otp_sent', handleOtpSent)
      leaveJobRoom(mongoId)
    }
  }, [job?._id])

  useEffect(() => {
    if (!dispatchCycleAt) return

    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(id)
          return 0  
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(id)
  }, [dispatchCycleAt])  

  if (isLoading) {
    return <SkeletonJobDetail />
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


  const handleCancelJob = async () => {
    if (!window.confirm(
      'Are you sure you want to cancel this job?\n\nYour payment will be fully refunded — no charges apply.'
    )) return
    setIsCancelling(true)
    setCancelError('')
    try {
      await api.patch(`/api/jobs/${job!._id}/cancel`)
      router.push('/dashboard/jobs')
    } catch (err) {
      if (err instanceof ApiError) {
        setCancelError(err.message)
      } else {
        setCancelError('Failed to cancel job. Please try again or contact support.')
      }
      setIsCancelling(false)
    }
  }

  if (job.status === 'payment_pending' || job.status === 'dispatching') {
    const isSearching = job.status === 'dispatching'
    const totalSecs = Math.round(dispatchTotalMs / 1000)
    const progressRatio = secondsLeft !== null ? secondsLeft / totalSecs : 0
    const urgent = secondsLeft !== null && secondsLeft <= 10
    const mm = secondsLeft !== null ? String(Math.floor(secondsLeft / 60)).padStart(1, '0') : '0'
    const ss = secondsLeft !== null ? String(secondsLeft % 60).padStart(2, '0') : '00'

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-green-200 animate-ping opacity-40" />
          <div className="absolute inset-0 rounded-full border-4 border-green-300 animate-ping opacity-20" style={{ animationDelay: '0.5s' }} />
          <div className="w-24 h-24 rounded-full bg-linear-to-br from-green-50 to-emerald-100 flex items-center justify-center relative">
            {isSearching
              ? <Search className="w-10 h-10 text-(--upwork-green)" />
              : <DollarSign className="w-10 h-10 text-(--upwork-green)" />
            }
          </div>
        </div>

        <h1 className="text-2xl font-bold text-(--upwork-navy) mb-2">
          {isSearching ? 'Finding you a tradie\u2026' : 'Confirming payment\u2026'}
        </h1>
        <p className="text-(--upwork-gray) text-sm max-w-sm">
          {isSearching
            ? 'We\'re searching for the nearest available tradie in your area. This usually takes less than a minute.'
            : 'Your payment is being processed. Please wait a moment.'
          }
        </p>

        {isSearching && secondsLeft !== null && (
          <div className="mt-8 w-full max-w-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">
                {secondsLeft > 0 ? 'Tradie has' : 'Searching for next tradie\u2026'}
              </span>
              {secondsLeft > 0 && (
                <span className={`text-sm font-bold tabular-nums ${urgent ? 'text-red-500' : 'text-(--upwork-green)'
                  }`}>
                  {mm}:{ss}
                </span>
              )}
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${urgent ? 'bg-red-400' : 'bg-(--upwork-green)'
                  }`}
                style={{ width: `${Math.round(progressRatio * 100)}%` }}
              />
            </div>
            {secondsLeft > 0 && (
              <p className="text-xs text-gray-400 mt-1 text-center">
                to respond before we try the next tradie
              </p>
            )}
          </div>
        )}

        {isSearching && secondsLeft === null && (
          <div className="mt-8 flex items-center gap-2 text-xs text-gray-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Checking nearby tradies\u2026
          </div>
        )}

        {isSearching && dispatchElapsedSecs >= 120 && (
          <div className="mt-6 flex flex-col items-center gap-2">
            {cancelError && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {cancelError}
              </p>
            )}
            <button
              onClick={handleCancelJob}
              disabled={isCancelling}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium transition-all disabled:opacity-50 animate-in fade-in duration-500"
            >
              {isCancelling ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Cancelling...</>
              ) : (
                <><XCircle className="w-4 h-4" />Cancel Job &amp; Get Refund</>
              )}
            </button>
            <p className="text-[11px] text-gray-400">You will receive a full refund immediately.</p>
          </div>
        )}

        <button
          onClick={() => router.push('/dashboard/jobs')}
          className="mt-10 text-sm text-(--upwork-gray) hover:text-(--upwork-navy) transition-colors underline underline-offset-2"
        >
          View all my jobs
        </button>

        <AutoRefresh onRefresh={fetchJob} intervalMs={5000} />
      </div>
    )
  }

  const quote = typeof job.quote === 'object' ? (job.quote as Quote) : null
  const selectedQuoteOption = quote
    ? quote.options?.find((o) => o.tier === quote.selectedTier) || quote.options?.[0]
    : null
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

      <div className="mb-6">
        <StatusTimeline currentStatus={job.status} />
      </div>

      {job.preferredTime === 'scheduled' && job.scheduledFor && (
        <div className="mb-4 flex items-center gap-2 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
          <Clock className="w-4 h-4 text-blue-500 shrink-0" />
          <span>
            Scheduled for:{' '}
            <strong>
              {new Date(job.scheduledFor).toLocaleString('en-AU', {
                weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
              })}
            </strong>
          </span>
        </div>
      )}

      {(job.status === 'on_the_way' || job.status === 'in_progress') &&
        job.location?.coordinates?.lat && (
          <LiveTrackingMap
            jobId={job._id as string}
            jobCode={job.jobCode}
            jobLocation={{ lat: job.location.coordinates.lat, lng: job.location.coordinates.lng }}
            initialTradieLocation={tradieLocation}
          />
        )}

      {job.status === 'completed' && !(job as any).disputeId && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-amber-800 mb-0.5 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> Notice an issue?
              </p>
              <p className="text-xs text-amber-700 max-w-lg">
                Your payment is held in escrow for 48 hours. If the tradie did not complete the job properly or damaged something, you can raise a dispute to freeze the funds while our team investigates.
              </p>
            </div>
            <div className="shrink-0 flex items-center">
              <button
                onClick={() => router.push(`/dashboard/jobs/${job._id}/dispute`)}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors whitespace-nowrap"
              >
                Raise Dispute
              </button>
            </div>
          </div>
        </div>
      )}

      {job.status === 'disputed' && <DisputeEvidenceSection job={job} user={user} />}

      {job.status === 'quoted' && quote && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-amber-800 mb-0.5">Quote Ready — Your Decision</p>
              <p className="text-xs text-amber-600">
                Fixed price: <span className="font-bold">${selectedQuoteOption?.suggestedFixedPrice}</span> •
                Est. {selectedQuoteOption?.estimatedHours.min}–{selectedQuoteOption?.estimatedHours.max}h work
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
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-(--upwork-navy) mb-3">Description</h3>
            <p className="text-xs sm:text-sm text-(--upwork-gray) leading-relaxed whitespace-pre-wrap">
              {job.description}
            </p>
          </div>

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
          {(job.completionPhotos?.length > 0 || job.status === 'completed') && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-(--upwork-navy) flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-gray-400" />
                  Proof of Work
                </h3>
                {job.completionPhotos?.length > 0 && (
                  <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-full font-medium">
                    <ShieldCheck className="w-3 h-3" />
                    {job.completionPhotos.length} verified photo{job.completionPhotos.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {job.completionPhotos?.length > 0 ? (
                <>
                  <p className="text-xs text-gray-400 mb-3">
                    GPS-tagged, timestamped photos taken by your tradie as proof of completed work.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {job.completionPhotos.map((photo, i) => (
                      <a
                        key={photo.publicId}
                        href={photo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="aspect-square rounded-lg overflow-hidden relative block group"
                      >
                        <Image
                          src={photo.url}
                          alt={`Work photo ${i + 1}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                          sizes="(max-width: 640px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </a>
                    ))}
                  </div>
                  {job.completedAt && (
                    <p className="text-xs text-gray-400 mt-3">
                      Completed {new Date(job.completedAt).toLocaleString('en-AU', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2 py-6 justify-center text-center">
                  <div>
                    <Camera className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">Completion photos will appear here once your tradie submits them.</p>
                  </div>
                </div>
              )}
            </div>
          )}


          {canChat && user && (
            <ChatWidget jobId={job._id} currentUserId={user._id} />
          )}

          {canReview && (
            <ReviewForm
              jobId={job._id}
              onSubmitted={() => {
                setReviewSubmitted(true)
                fetchJob() 
              }}
            />
          )}
        </div>

        <div className="space-y-6">
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
                    ${selectedQuoteOption?.price.min} – ${selectedQuoteOption?.price.max}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-(--upwork-gray)">Fixed Price</span>
                  <span className="font-semibold text-(--upwork-green)">
                    ${selectedQuoteOption?.suggestedFixedPrice}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-(--upwork-gray)">Est. Hours</span>
                  <span className="text-(--upwork-navy)">
                    {selectedQuoteOption?.estimatedHours.min}–{selectedQuoteOption?.estimatedHours.max}h
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-(--upwork-gray)">Skill Level</span>
                  <span className="text-(--upwork-navy) capitalize">
                    {selectedQuoteOption?.tier ? TIER_LABELS[selectedQuoteOption.tier] || selectedQuoteOption.tier : 'Standard'}
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-500">
                    {quote.engine === 'gemini' ? '✨ AI-Powered Estimate' : '📊 Market Rate Estimate'} • {Math.round((selectedQuoteOption?.confidence ?? 0) * 100)}% confidence
                  </span>
                </div>
              </div>
            </div>
          )}

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
