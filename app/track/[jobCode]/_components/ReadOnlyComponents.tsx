'use client'

import Image from 'next/image'
import {
  DollarSign, Calendar, Search, CheckCircle2, Truck, Wrench,
  XCircle, AlertCircle, Camera, ShieldCheck, Clock, ImageIcon,
} from 'lucide-react'


const STATUS_STEPS: { status: string; label: string; icon: React.ElementType }[] = [
  { status: 'accepted', label: 'Accepted', icon: CheckCircle2 },
  { status: 'on_the_way', label: 'On the Way', icon: Truck },
  { status: 'in_progress', label: 'In Progress', icon: Wrench },
  { status: 'completed', label: 'Completed', icon: CheckCircle2 },
]

export function ReadOnlyStatusTimeline({ currentStatus }: { currentStatus: string }) {
  if (currentStatus === 'cancelled' || currentStatus === 'no_tradie_found' || currentStatus === 'disputed') {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
        {currentStatus === 'disputed'
          ? <AlertCircle className="w-5 h-5 text-red-500" />
          : <XCircle className="w-5 h-5 text-red-500" />}
        <span className="text-sm font-medium text-red-700">
          {currentStatus === 'cancelled' ? 'Job Cancelled'
            : currentStatus === 'disputed' ? 'Job Under Review'
            : 'No Tradie Found'}
        </span>
      </div>
    )
  }

  if (currentStatus === 'in_scope_review') {
    return <TimelineBar activeStatus="in_progress" />
  }
  if (currentStatus === 'rescheduled') {
    return <TimelineBar activeStatus="accepted" />
  }

  return <TimelineBar activeStatus={currentStatus} />
}

function TimelineBar({ activeStatus }: { activeStatus: string }) {
  const currentIndex = STATUS_STEPS.findIndex(s => s.status === activeStatus)
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
                  isCompleted ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400'
                } ${isCurrent ? 'ring-2 ring-green-600 ring-offset-2' : ''}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-[10px] mt-1 font-medium whitespace-nowrap ${
                isCompleted ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {step.label}
              </span>
            </div>
            {index < STATUS_STEPS.length - 1 && (
              <div className={`w-6 sm:w-10 h-0.5 mx-1 -mt-3.5 ${
                index < currentIndex ? 'bg-green-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}



interface ScopeChangeData {
  _id: string
  status: string
  description: string
  photos: { url: string; publicId: string }[]
  originalPrice: number
  newPrice: number
  priceDifference: number
  newQuoteOptions: { tier: string; suggestedFixedPrice: number; estimatedHours: { min: number; max: number }; reasoning?: string }[]
  proofPhotos: { url: string; publicId: string }[]
  proofDescription: string | null
  createdAt: string
}

export function ReadOnlyScopeChangeBanner({ scopeChange }: { scopeChange: ScopeChangeData }) {
  const sc = scopeChange
  const priceDiff = sc.priceDifference ?? (sc.newPrice - sc.originalPrice)
  const isIncrease = priceDiff > 0

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0 space-y-3">
          <div>
            <p className="text-sm font-semibold text-orange-800 mb-1">Scope Change Requested</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              sc.status === 'pending' ? 'bg-amber-100 text-amber-700'
                : sc.status === 'accepted' ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {sc.status === 'pending' ? 'Pending' : sc.status === 'accepted' ? 'Accepted' : 'Declined'}
            </span>
          </div>

          <p className="text-sm text-orange-700">{sc.description}</p>

          {sc.photos?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {sc.photos.map((p, i) => (
                <a key={p.publicId || i} href={p.url} target="_blank" rel="noopener noreferrer"
                  className="w-16 h-16 rounded-lg overflow-hidden border border-orange-200 block">
                  <img src={p.url} alt={`Scope photo ${i + 1}`} className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
          )}

          <div className="rounded-lg border border-orange-200 overflow-hidden text-sm">
            <div className="flex justify-between px-3 py-2 bg-white">
              <span className="text-gray-500">Original Price</span>
              <span className="font-medium text-gray-900">${sc.originalPrice?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between px-3 py-2 bg-orange-100/50 border-t border-orange-100">
              <span className="text-orange-700">New Price</span>
              <span className="font-bold text-orange-800">${sc.newPrice?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between px-3 py-2 bg-white border-t border-orange-100">
              <span className="text-gray-500">Difference</span>
              <span className={`font-semibold ${isIncrease ? 'text-red-600' : 'text-green-600'}`}>
                {isIncrease ? '+' : '-'}${Math.abs(priceDiff).toFixed(2)}
              </span>
            </div>
          </div>

          {sc.proofPhotos?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-orange-600 mb-1.5">Proof Photos</p>
              <div className="flex flex-wrap gap-2">
                {sc.proofPhotos.map((p, i) => (
                  <a key={p.publicId || i} href={p.url} target="_blank" rel="noopener noreferrer"
                    className="w-16 h-16 rounded-lg overflow-hidden border border-orange-200 block">
                    <img src={p.url} alt={`Proof ${i + 1}`} className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {sc.status === 'pending' && (
            <p className="text-xs text-orange-500 italic flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Waiting for the homeowner&apos;s decision
            </p>
          )}
        </div>
      </div>
    </div>
  )
}



export function ReadOnlyRescheduleBanner({ job }: { job: any }) {
  const rescheduleDate = job.rescheduleFor ? new Date(job.rescheduleFor) : null
  const isApproved = !!job.rescheduleApprovedAt
  const isDeclined = !!job.rescheduleDeclinedAt

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <Calendar className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-blue-800 mb-1">Reschedule Requested</p>
          {rescheduleDate && (
            <p className="text-sm text-blue-700 mb-1">
              New requested time:{' '}
              <strong>
                {rescheduleDate.toLocaleString('en-AU', {
                  weekday: 'long', day: 'numeric', month: 'short',
                  year: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
              </strong>
            </p>
          )}
          {job.rescheduleReason && (
            <p className="text-xs text-blue-600 bg-blue-100 rounded-lg px-3 py-2 mb-2">
              <strong>Reason:</strong> {job.rescheduleReason}
            </p>
          )}
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            isApproved ? 'bg-green-100 text-green-700'
              : isDeclined ? 'bg-red-100 text-red-700'
              : 'bg-amber-100 text-amber-700'
          }`}>
            {isApproved ? 'Approved' : isDeclined ? 'Declined' : 'Pending Approval'}
          </span>
          {!isApproved && !isDeclined && (
            <p className="text-xs text-blue-500 italic mt-2 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Waiting for the homeowner to respond
            </p>
          )}
        </div>
      </div>
    </div>
  )
}



export function ReadOnlyCompletionPhotos({ photos, completedAt }: {
  photos: { url: string; publicId: string }[]
  completedAt?: string | null
}) {
  if (!photos || photos.length === 0) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
          <Camera className="w-4 h-4 text-gray-400" />
          Proof of Work
        </h3>
        <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-full font-medium">
          <ShieldCheck className="w-3 h-3" />
          {photos.length} verified photo{photos.length !== 1 ? 's' : ''}
        </span>
      </div>
      <p className="text-xs text-gray-400 mb-3">
        GPS-tagged, timestamped photos taken by the tradie as proof of completed work.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {photos.map((photo, i) => (
          <a key={photo.publicId || i} href={photo.url} target="_blank" rel="noopener noreferrer"
            className="aspect-square rounded-lg overflow-hidden relative block group">
            <img src={photo.url} alt={`Work photo ${i + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
          </a>
        ))}
      </div>
      {completedAt && (
        <p className="text-xs text-gray-400 mt-3">
          Completed {new Date(completedAt).toLocaleString('en-AU', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })}
        </p>
      )}
    </div>
  )
}



export function ReadOnlyPhotoGallery({ images }: { images: { url: string; publicId: string }[] }) {
  if (!images || images.length === 0) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
        <ImageIcon className="w-4 h-4 text-gray-400" />
        Job Photos
      </h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {images.map((img, i) => (
          <a key={img.publicId || i} href={img.url} target="_blank" rel="noopener noreferrer"
            className="aspect-square rounded-lg overflow-hidden relative block">
            <img src={img.url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
          </a>
        ))}
      </div>
    </div>
  )
}
