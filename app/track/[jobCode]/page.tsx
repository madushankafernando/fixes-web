'use client'

import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { io, Socket } from 'socket.io-client'
import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api'
import { MapPin, Clock, User as UserIcon, Loader2, DollarSign } from 'lucide-react'
import { API_BASE_URL, JOB_STATUS_LABELS, JOB_STATUS_COLORS, CATEGORY_LABELS, TIER_LABELS } from '@/lib/constants'
import {
  ReadOnlyStatusTimeline,
  ReadOnlyScopeChangeBanner,
  ReadOnlyRescheduleBanner,
  ReadOnlyCompletionPhotos,
  ReadOnlyPhotoGallery
} from './_components/ReadOnlyComponents'

interface TrackingJob {
  _id: string
  jobCode: string
  title: string
  description: string
  status: string
  category: string
  images: { url: string; publicId: string }[]
  completionPhotos: { url: string; publicId: string }[]
  location: {
    address: string
    suburb: string
    state: string
    postcode: string
    coordinates: { lat: number; lng: number }
  }
  scheduledFor?: string | null
  preferredTime: string
  isAfterHours: boolean
  isWeekend: boolean
  completedAt?: string | null
  createdAt: string
  rescheduleFor?: string | null
  rescheduleReason?: string | null
  rescheduleRequestedAt?: string | null
  rescheduleApprovedAt?: string | null
  rescheduleDeclinedAt?: string | null
  quote?: {
    selectedTier: string | null
    engine: string
    option: {
      tier: string
      estimatedHours: { min: number; max: number }
      price: { min: number; max: number }
      suggestedFixedPrice: number
      confidence: number
      reasoning: string
    } | null
  } | null
  activeScopeChange?: any | null
}

interface TrackingData {
  status: 'active' | 'not_started'
  jobStatus?: string
  message?: string
  job?: TrackingJob
  tradie?: {
    name: string
    avatarUrl: string | null
  } | null
  tradieLocation?: { lat: number; lng: number; updatedAt?: number } | null
  trackingToken?: string
}

const LIBRARIES: ('geometry')[] = ['geometry']
const MIN_MOVE_METRES = 30

function haversineMetres(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6_371_000
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

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

export default function TrackJobPage() {
  const params = useParams()
  const jobCode = params.jobCode as string

  const [data, setData] = useState<TrackingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [tradiePos, setTradiePos] = useState<{ lat: number; lng: number } | null>(null)
  const [routePath, setRoutePath] = useState<{ lat: number; lng: number }[]>([])
  const [routeKey, setRouteKey] = useState(0)
  const [eta, setEta] = useState<string | null>(null)
  const lastCalcPos = useRef<{ lat: number; lng: number } | null>(null)

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? '',
    libraries: LIBRARIES,
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

  const fetchTrackingData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/track/${jobCode}`)
      const json = await res.json()
      if (json.success) {
        setData(json.data)
        if (json.data.tradieLocation) {
          setTradiePos({ lat: json.data.tradieLocation.lat, lng: json.data.tradieLocation.lng })
        }
      }
    } catch (err) {
      console.error('[Track] Failed to load tracking data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [jobCode])

  useEffect(() => {
    fetchTrackingData()
  }, [fetchTrackingData])

  useEffect(() => {
    if (!data?.job || data.status === 'not_started') return
    const activeStatuses = ['accepted', 'on_the_way', 'in_progress', 'in_scope_review']
    if (!activeStatuses.includes(data.job.status)) return
    
    const id = setInterval(fetchTrackingData, 30000)
    return () => clearInterval(id)
  }, [data?.job?.status, data?.status, fetchTrackingData])

  useEffect(() => {
    if (!data?.trackingToken || !data.job?._id) return

    const socket: Socket = io(API_BASE_URL, {
      auth: { token: data.trackingToken },
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => {
      console.log('[Track Socket] Connected:', socket.id)
    })

    socket.on('tradie:location_update', (payload: { lat: number; lng: number; updatedAt: number }) => {
      setTradiePos({ lat: payload.lat, lng: payload.lng })
    })

    socket.on('tradie:arrived', () => {
      fetchTrackingData()
    })

    socket.on('job:status_update', (payload: { status: string }) => {
      const needsFullRefetch = ['in_scope_review', 'completed', 'disputed', 'cancelled'].includes(payload.status)
      if (needsFullRefetch) {
        fetchTrackingData()
      } else {
        setData((prev) => prev ? { ...prev, job: prev.job ? { ...prev.job, status: payload.status } : prev.job } : prev)
      }
    })

    return () => { socket.disconnect() }
  }, [data?.trackingToken, data?.job?._id, fetchTrackingData])

  const fetchRoute = useCallback(async (origin: { lat: number; lng: number }, dest: { lat: number; lng: number }) => {
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
          origin:      { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } },
          destination: { location: { latLng: { latitude: dest.lat,   longitude: dest.lng   } } },
          travelMode: 'DRIVE',
          routingPreference: 'TRAFFIC_AWARE',
        }),
      })
      const json = await res.json()
      const route = json.routes?.[0]
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
  }, [])

  useEffect(() => {
    if (!isLoaded || !tradiePos || !data?.job?.location?.coordinates) return
    const dest = data.job.location.coordinates
    
    if (lastCalcPos.current && haversineMetres(lastCalcPos.current, tradiePos) < MIN_MOVE_METRES) {
      return
    }
    fetchRoute(tradiePos, dest)
  }, [tradiePos, isLoaded, fetchRoute, data?.job?.location?.coordinates])


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600 mb-4" />
        <p className="text-gray-500 text-sm">Loading job tracking...</p>
      </div>
    )
  }

  if (!data || data.status === 'not_started') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-sm w-full text-center">
          <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-7 h-7 text-amber-500" />
          </div>
          <h1 className="text-lg font-bold text-gray-900 mb-2">Tracking not available yet</h1>
          <p className="text-sm text-gray-500 mb-4">
            {data?.message ?? 'The tradie hasn\'t started travelling yet or the job is not yet accepted.'}
          </p>
          {data?.job && (
            <div className="bg-gray-50 rounded-xl p-4 text-left">
              <p className="text-xs text-gray-500 mb-1">Job Reference</p>
              <p className="text-sm font-semibold text-gray-900">{data.job.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">{data.job.jobCode}</p>
              <div className="mt-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${JOB_STATUS_COLORS[data.job.status as keyof typeof JOB_STATUS_COLORS] || 'bg-gray-100 text-gray-700'}`}>
                  {JOB_STATUS_LABELS[data.job.status as keyof typeof JOB_STATUS_LABELS] || data.job.status}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  const { job, tradie } = data
  if (!job) return null
  
  const jobLoc = job.location.coordinates
  
  const showMap = job.status === 'on_the_way' || job.status === 'in_progress'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Image src="/logo.svg" alt="Fixes" width={100} height={32} className="h-7 w-auto" priority />
          <span className="hidden sm:inline text-xs text-gray-400">Live Job Tracking</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-full border border-gray-200 text-[10px] font-medium text-gray-500 uppercase tracking-wide">
          <Clock className="w-3 h-3" /> Read Only
        </div>
      </div>

      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full space-y-6 lg:space-y-8">
        
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">{job.title}</h1>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${JOB_STATUS_COLORS[job.status as keyof typeof JOB_STATUS_COLORS]}`}>
              {JOB_STATUS_LABELS[job.status as keyof typeof JOB_STATUS_LABELS] || job.status}
            </span>
          </div>
          <p className="text-xs text-gray-400">
            {job.jobCode} • {CATEGORY_LABELS[job.category as keyof typeof CATEGORY_LABELS] || job.category} • 
            Posted {new Date(job.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>

        <ReadOnlyStatusTimeline currentStatus={job.status} />

        {job.status === 'in_scope_review' && job.activeScopeChange && (
          <ReadOnlyScopeChangeBanner scopeChange={job.activeScopeChange} />
        )}
        
        {job.status === 'rescheduled' && (
          <ReadOnlyRescheduleBanner job={job} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-6">
            {showMap && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 flex items-center gap-3 z-10 bg-white">
              {tradie?.avatarUrl ? (
                <Image src={tradie.avatarUrl} alt={tradie.name} width={48} height={48} className="w-12 h-12 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <UserIcon className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{tradie?.name ?? 'Your Tradie'}</p>
                <p className="text-xs text-gray-500">
                  {job.status === 'in_progress' ? 'Work is in progress' : 'Is on their way'}
                </p>
              </div>
              <div className="text-right shrink-0">
                {job.status === 'in_progress' ? (
                  <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 animate-pulse">
                    Arrived
                  </div>
                ) : eta ? (
                  <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200">
                    <p className="text-[10px] text-green-600/70 uppercase font-bold leading-tight">ETA</p>
                    <p className="text-sm font-bold leading-tight">~{eta}</p>
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Locating...
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 min-h-75 sm:min-h-100 relative bg-gray-100">
              {!isLoaded || !jobLoc ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : (
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%', position: 'absolute', left: 0, top: 0 }}
                  center={tradiePos ?? jobLoc}
                  zoom={14}
                  options={{ disableDefaultUI: true, zoomControl: true }}
                >
                  <Marker position={jobLoc} icon={jobIcon} title="Job location" />
                  {tradiePos && <Marker position={tradiePos} icon={tradieIcon} title="Tradie" />}
                  {routePath.length > 0 && job.status !== 'in_progress' && (
                    <Polyline
                      key={routeKey}
                      path={routePath}
                      options={{ strokeColor: '#16a34a', strokeWeight: 5, strokeOpacity: 0.85 }}
                    />
                  )}
                </GoogleMap>
              )}
            </div>
            <div className="flex items-center gap-4 px-4 py-2.5 bg-white border-t border-gray-100 text-xs text-gray-500 z-10">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> Tradie
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Job Location
              </span>
            </div>
          </div>
            )}

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {job.description}
              </p>
            </div>
            
            {job.images?.length > 0 && <ReadOnlyPhotoGallery images={job.images} />}
            
            {job.status === 'completed' && <ReadOnlyCompletionPhotos photos={job.completionPhotos} completedAt={job.completedAt} />}
          </div>

          <div className="space-y-6">
            {!showMap && tradie && (
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Assigned Tradie</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white overflow-hidden shrink-0">
                    {tradie.avatarUrl ? (
                      <Image src={tradie.avatarUrl} alt={tradie.name} width={40} height={40} className="object-cover w-full h-full" />
                    ) : (
                      <UserIcon className="w-5 h-5" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-900">{tradie.name}</p>
                </div>
              </div>
            )}

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gray-400" /> Location
              </h3>
              <p className="text-sm text-gray-600">{job.location.address}</p>
              <p className="text-sm text-gray-600">
                {job.location.suburb}, {job.location.state} {job.location.postcode}
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-gray-400" /> Timing
              </h3>
              {job.scheduledFor ? (
                <p className="text-sm text-gray-600">
                  Scheduled: <strong>
                    {new Date(job.scheduledFor).toLocaleString('en-AU', {
                      weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </strong>
                </p>
              ) : (
                <p className="text-sm text-gray-600 capitalize">
                  {job.preferredTime === '1-2weeks' ? 'In 1–2 Weeks' : job.preferredTime === 'no-rush' ? 'No Rush' : 'Now'}
                </p>
              )}
            </div>

            {job.quote?.option && (
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-gray-400" /> Quote Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Fixed Price</span>
                    <span className="font-semibold text-green-600">
                      ${job.quote.option.suggestedFixedPrice?.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Est. Hours</span>
                    <span className="text-gray-900">
                      {job.quote.option.estimatedHours?.min}–{job.quote.option.estimatedHours?.max}h
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Skill Level</span>
                    <span className="text-gray-900 capitalize">
                      {job.quote.selectedTier ? TIER_LABELS[job.quote.selectedTier] || job.quote.selectedTier : 'Standard'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="text-center pb-8 pt-4 text-xs text-gray-400">
        <MapPin className="w-3.5 h-3.5 inline mr-1" />
        Powered by <strong>Fixes</strong> — Live Job Tracking
      </div>
    </div>
  )
}
