'use client'

import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { io } from 'socket.io-client'
import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api'
import { Truck, MapPin, Clock, User as UserIcon, CheckCircle2, Loader2 } from 'lucide-react'
import { API_BASE_URL } from '@/lib/constants'


interface TrackingData {
  status: 'active' | 'not_started'
  jobStatus?: string
  message?: string
  job?: {
    _id: string
    jobCode: string
    title: string
    status: string
    location: {
      suburb: string
      state: string
      coordinates: { lat: number; lng: number }
    }
    scheduledFor?: string | null
  }
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

  useEffect(() => {
    const fetchTracking = async () => {
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
    }
    fetchTracking()
  }, [jobCode])

  useEffect(() => {
    if (!data?.trackingToken || !data.job?._id) return

    const socket = io(API_BASE_URL, {
      auth: { token: data.trackingToken },
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => {
      console.log('[Track Socket] Connected:', socket.id)
    })

    socket.on('tradie:location_update', (payload: { lat: number; lng: number; updatedAt: number }) => {
      setTradiePos({ lat: payload.lat, lng: payload.lng })
    })

    socket.on('job:status_update', (payload: { status: string }) => {
      setData((prev) => prev ? { ...prev, job: prev.job ? { ...prev.job, status: payload.status } : prev.job } : prev)
    })

    return () => { socket.disconnect() }
  }, [data?.trackingToken, data?.job?._id])

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
    fetchRoute(tradiePos, dest)
  }, [tradiePos, isLoaded, fetchRoute, data?.job?.location?.coordinates])


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
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
            {data?.message ?? 'The tradie hasn\'t started travelling yet.'}
          </p>
          {data?.job && (
            <div className="bg-gray-50 rounded-xl p-4 text-left">
              <p className="text-xs text-gray-500 mb-1">Job Reference</p>
              <p className="text-sm font-semibold text-gray-900">{data.job.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">{data.job.jobCode}</p>
            </div>
          )}
        </div>
      </div>
    )
  }


  const { job, tradie } = data
  const jobLoc = job?.location?.coordinates
  const isArrived = job?.status === 'in_progress'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3">
        <Image src="/logo.svg" alt="Fixes" width={100} height={32} className="h-7 w-auto" priority />
        <span className="text-xs text-gray-400">Live Job Tracking</span>
      </div>

      <div className="px-4 pt-4 pb-2 max-w-2xl mx-auto w-full">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex items-start gap-3">
          {tradie?.avatarUrl ? (
            <Image
              src={tradie.avatarUrl}
              alt={tradie.name}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <UserIcon className="w-6 h-6 text-gray-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm">{tradie?.name ?? 'Your Tradie'}</p>
            <p className="text-xs text-gray-500 truncate mt-0.5">{job?.title}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{job?.jobCode}</p>
          </div>
          <div className="text-right shrink-0">
            {isArrived ? (
              <div className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Arrived
              </div>
            ) : eta ? (
              <div>
                <p className="text-xs text-gray-400">ETA</p>
                <p className="text-sm font-bold text-green-600">~{eta}</p>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-green-600 text-xs">
                <Truck className="w-4 h-4" />
                On the way
              </div>
            )}
          </div>
        </div>
      </div>

      {isArrived && (
        <div className="px-4 pb-2 max-w-2xl mx-auto w-full">
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            <p className="text-sm text-green-700 font-medium">Your tradie has arrived and work has begun!</p>
          </div>
        </div>
      )}

      <div className="flex-1 px-4 pb-4 max-w-2xl mx-auto w-full">
        {!isLoaded || !jobLoc ? (
          <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 h-80 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '420px' }}
              center={tradiePos ?? jobLoc}
              zoom={14}
              options={{ disableDefaultUI: true, zoomControl: true }}
            >
              <Marker
                position={jobLoc}
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
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> Tradie
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Job Location
              </span>
              {!tradiePos && (
                <span className="flex items-center gap-1.5 text-amber-500 italic">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Waiting for location...
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="text-center pb-6 text-xs text-gray-400">
        <MapPin className="w-3.5 h-3.5 inline mr-1" />
        Powered by <strong>Fixes</strong> — Live Job Tracking
      </div>
    </div>
  )
}
