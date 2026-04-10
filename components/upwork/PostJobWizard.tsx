'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  Check,
  Upload,
  X,
  Loader2,
  MapPin,
  Clock,
  DollarSign,
  Sparkles,
  AlertCircle,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { api, ApiError } from '@/lib/api'
import { VALID_CATEGORIES, CATEGORY_LABELS, AUSTRALIAN_STATES } from '@/lib/constants'
import type {
  Job,
  Quote,
  TradieCategory,
  PreferredTime,
  SignedUploadResponse,
  JobImage,
} from '@/lib/types'

interface PostJobWizardProps {
  searchQuery: string
  preselectedCategory: string
}


function StepCategory({
  selectedCategory,
  onSelectCategory,
}: {
  selectedCategory: TradieCategory | ''
  onSelectCategory: (cat: TradieCategory) => void
}) {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold text-(--upwork-navy) text-center mb-3">
        What type of work do you need?
      </h1>
      <p className="text-(--upwork-gray) text-center mb-10">
        Select a category to get started.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {VALID_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`px-4 py-3.5 rounded-xl border text-sm font-medium transition-all text-left ${
              selectedCategory === cat
                ? 'bg-(--upwork-navy) text-white border-(--upwork-navy)'
                : 'bg-white text-(--upwork-navy) border-gray-300 hover:border-(--upwork-navy)'
            }`}
          >
            <span className="flex items-center justify-between">
              {CATEGORY_LABELS[cat]}
              {selectedCategory === cat && <Check className="w-4 h-4" />}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}


function StepDescription({
  description,
  onDescriptionChange,
  title,
  onTitleChange,
  categoryLabel,
  onNext,
}: {
  description: string
  onDescriptionChange: (val: string) => void
  title: string
  onTitleChange: (val: string) => void
  categoryLabel: string
  onNext: () => void
}) {
  return (
    <div className="max-w-2xl mx-auto">
      {categoryLabel && (
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-(--upwork-green) text-sm font-medium rounded-full">
            <Check className="w-3.5 h-3.5" />
            {categoryLabel}
          </span>
        </div>
      )}

      <h1 className="text-3xl md:text-4xl font-bold text-(--upwork-navy) text-center mb-3">
        Tell us about the job
      </h1>
      <p className="text-(--upwork-gray) text-center mb-8">
        A clear title and detailed description help our AI generate a better quote.
      </p>

      <div className="mb-5">
        <label htmlFor="step2-title" className="block text-sm font-medium text-(--upwork-navy) mb-1.5">
          Job Title
        </label>
        <input
          id="step2-title"
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="e.g. Fix leaking kitchen tap"
          maxLength={150}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-(--upwork-navy) placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-(--upwork-green) focus:border-transparent"
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{title.length}/150</p>
      </div>

      <div className="mb-5">
        <label htmlFor="step2-desc" className="block text-sm font-medium text-(--upwork-navy) mb-1.5">
          Description
        </label>
        <textarea
          id="step2-desc"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Describe what needs to be done, any issues you've noticed, access details, etc."
          maxLength={2000}
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-(--upwork-navy) placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-(--upwork-green) focus:border-transparent resize-none"
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{description.length}/2000</p>
      </div>

      <button
        onClick={onNext}
        disabled={!title.trim() || !description.trim()}
        className="w-full max-w-sm mx-auto block bg-(--upwork-green) hover:bg-(--upwork-green-dark) disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-colors"
      >
        Next
      </button>
    </div>
  )
}


function StepPhotos({
  images,
  onImagesChange,
  onNext,
  isUploading,
  onUploadFiles,
}: {
  images: JobImage[]
  onImagesChange: (imgs: JobImage[]) => void
  onNext: () => void
  isUploading: boolean
  onUploadFiles: (files: FileList) => void
}) {
  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index))
  }

  return (
    <div className="max-w-2xl mx-auto text-center">
      <h1 className="text-3xl md:text-4xl font-bold text-(--upwork-navy) mb-3">
        Add photos
      </h1>
      <p className="text-(--upwork-gray) mb-8">
        Photos help our AI provide a more accurate quote. Optional but recommended.
      </p>

      <label
        htmlFor="photo-upload"
        className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-colors mb-6 ${
          isUploading
            ? 'border-(--upwork-green) bg-green-50'
            : 'border-gray-300 hover:border-(--upwork-green) bg-gray-50 hover:bg-green-50'
        }`}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-(--upwork-green) animate-spin" />
            <span className="text-sm text-(--upwork-green) font-medium">Uploading...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-gray-400" />
            <span className="text-sm text-(--upwork-gray)">Click to upload or drag and drop</span>
            <span className="text-xs text-gray-400">PNG, JPG up to 10MB</span>
          </div>
        )}
        <input
          id="photo-upload"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && onUploadFiles(e.target.files)}
          disabled={isUploading}
        />
      </label>

      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">
          {images.map((img, index) => (
            <div key={img.publicId} className="relative group rounded-xl overflow-hidden aspect-square">
              <Image
                src={img.url}
                alt={`Upload ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 33vw, 25vw"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onNext}
        className="w-full max-w-sm mx-auto block bg-(--upwork-green) hover:bg-(--upwork-green-dark) text-white font-medium py-3 px-6 rounded-xl transition-colors"
      >
        {images.length > 0 ? 'Next' : 'Skip — no photos'}
      </button>
    </div>
  )
}


function StepLocation({
  address,
  suburb,
  postcode,
  state,
  onFieldChange,
  onNext,
}: {
  address: string
  suburb: string
  postcode: string
  state: string
  onFieldChange: (field: string, value: string) => void
  onNext: () => void
}) {
  const isValid = address && suburb && postcode && state

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold text-(--upwork-navy) text-center mb-3">
        Where is the job?
      </h1>
      <p className="text-(--upwork-gray) text-center mb-8">
        We&apos;ll find tradies near this location.
      </p>

      <div className="space-y-4">
        <div>
          <label htmlFor="loc-address" className="block text-sm font-medium text-(--upwork-navy) mb-1.5">
            Street Address
          </label>
          <input
            id="loc-address"
            type="text"
            value={address}
            onChange={(e) => onFieldChange('address', e.target.value)}
            placeholder="123 Example Street"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-(--upwork-navy) placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-(--upwork-green) focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="loc-suburb" className="block text-sm font-medium text-(--upwork-navy) mb-1.5">
              Suburb
            </label>
            <input
              id="loc-suburb"
              type="text"
              value={suburb}
              onChange={(e) => onFieldChange('suburb', e.target.value)}
              placeholder="Richmond"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-(--upwork-navy) placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-(--upwork-green) focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="loc-postcode" className="block text-sm font-medium text-(--upwork-navy) mb-1.5">
              Postcode
            </label>
            <input
              id="loc-postcode"
              type="text"
              value={postcode}
              onChange={(e) => onFieldChange('postcode', e.target.value)}
              placeholder="3121"
              maxLength={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-(--upwork-navy) placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-(--upwork-green) focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label htmlFor="loc-state" className="block text-sm font-medium text-(--upwork-navy) mb-1.5">
            State
          </label>
          <select
            id="loc-state"
            value={state}
            onChange={(e) => onFieldChange('state', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-(--upwork-navy) bg-white focus:outline-none focus:ring-2 focus:ring-(--upwork-green) focus:border-transparent"
          >
            <option value="" disabled>Select state...</option>
            {AUSTRALIAN_STATES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!isValid}
        className="w-full max-w-sm mx-auto block mt-8 bg-(--upwork-green) hover:bg-(--upwork-green-dark) disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-colors"
      >
        Next
      </button>
    </div>
  )
}


function StepTime({
  selected,
  onSelect,
}: {
  selected: PreferredTime | ''
  onSelect: (val: PreferredTime) => void
}) {
  const options: { value: PreferredTime; label: string; desc: string }[] = [
    { value: 'now', label: 'Now', desc: 'As soon as possible' },
    { value: '1-2weeks', label: 'In 1–2 Weeks', desc: 'Flexible timing' },
    { value: 'no-rush', label: 'No Rush', desc: 'Whenever available' },
  ]

  return (
    <div className="max-w-2xl mx-auto text-center">
      <h1 className="text-3xl md:text-4xl font-bold text-(--upwork-navy) mb-3">
        How soon do you need this done?
      </h1>
      <p className="text-(--upwork-gray) mb-10">
        We&apos;ll prioritise tradies that match your timeline.
      </p>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className={`flex-1 px-6 py-4 rounded-xl border text-left transition-all ${
              selected === opt.value
                ? 'bg-(--upwork-navy) text-white border-(--upwork-navy)'
                : 'bg-white text-(--upwork-navy) border-gray-300 hover:border-(--upwork-navy)'
            }`}
          >
            <div className="font-semibold text-sm">{opt.label}</div>
            <div className={`text-xs mt-1 ${selected === opt.value ? 'text-white/70' : 'text-gray-400'}`}>
              {opt.desc}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}


function StepAnalyzing() {
  return (
    <div className="max-w-md mx-auto text-center py-16">
      <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <Sparkles className="w-10 h-10 text-(--upwork-green) animate-pulse" />
      </div>
      <h1 className="text-2xl font-bold text-(--upwork-navy) mb-3">
        Analyzing your job...
      </h1>
      <p className="text-(--upwork-gray) mb-6">
        Our AI is reviewing your description and photos to generate an accurate quote.
      </p>
      <div className="flex justify-center">
        <Loader2 className="w-6 h-6 text-(--upwork-green) animate-spin" />
      </div>
    </div>
  )
}


function StepQuote({
  quote,
  job,
  onAccept,
  onCancel,
  isAccepting,
  acceptError,
}: {
  quote: Quote
  job: Job
  onAccept: () => void
  onCancel: () => void
  isAccepting: boolean
  acceptError: string
}) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-7 h-7 text-(--upwork-green)" />
        </div>
        <h1 className="text-2xl font-bold text-(--upwork-navy) mb-2">
          Your quote is ready
        </h1>
        <p className="text-sm text-(--upwork-gray)">
          Job: <strong>{job.title}</strong> — {job.jobCode}
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 space-y-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5 text-(--upwork-green)" />
          </div>
          <div>
            <div className="text-sm text-(--upwork-gray)">Estimated Price Range</div>
            <div className="text-2xl font-bold text-(--upwork-navy)">
              ${quote.price.min} – ${quote.price.max}{' '}
              <span className="text-sm font-normal text-gray-400">{quote.price.currency}</span>
            </div>
            <div className="text-sm text-(--upwork-gray) mt-1">
              Suggested fixed price: <strong>${quote.suggestedFixedPrice}</strong>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="text-sm text-(--upwork-gray)">Estimated Duration</div>
            <div className="text-lg font-semibold text-(--upwork-navy)">
              {quote.estimatedHours.min} – {quote.estimatedHours.max} hours
            </div>
            <div className="text-sm text-(--upwork-gray)">
              Skill level: <span className="capitalize">{quote.detectedSkillLevel}</span>
            </div>
          </div>
        </div>

        {quote.reasoning && (
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-xs font-medium text-(--upwork-gray) mb-1 uppercase tracking-wide">
              AI Reasoning
            </div>
            <p className="text-sm text-(--upwork-navy) leading-relaxed">{quote.reasoning}</p>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-500 font-medium">
            Engine: {quote.engine}
          </span>
          <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-500 font-medium">
            Confidence: {Math.round(quote.confidence * 100)}%
          </span>
        </div>
      </div>

      {acceptError && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">{acceptError}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onAccept}
          disabled={isAccepting}
          className="flex-1 bg-(--upwork-green) hover:bg-(--upwork-green-dark) disabled:opacity-50 text-white font-medium py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {isAccepting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Accepting...
            </>
          ) : (
            <>
              Accept Quote
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
        <button
          onClick={onCancel}
          disabled={isAccepting}
          className="flex-1 border border-gray-300 text-(--upwork-navy) font-medium py-3 px-6 rounded-xl hover:border-gray-400 transition-colors"
        >
          Cancel Job
        </button>
      </div>
    </div>
  )
}


export function PostJobWizard({ searchQuery, preselectedCategory }: PostJobWizardProps) {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()

  const hasPreselectedCategory = VALID_CATEGORIES.includes(preselectedCategory as TradieCategory)
  const [currentStep, setCurrentStep] = useState(hasPreselectedCategory ? 2 : 1)
  const totalSteps = 5

  const [category, setCategory] = useState<TradieCategory | ''>(
    hasPreselectedCategory ? (preselectedCategory as TradieCategory) : ''
  )
  const [title, setTitle] = useState(searchQuery)
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<JobImage[]>([])
  const [address, setAddress] = useState('')
  const [suburb, setSuburb] = useState('')
  const [postcode, setPostcode] = useState('')
  const [locationState, setLocationState] = useState('')
  const [preferredTime, setPreferredTime] = useState<PreferredTime | ''>('')

  const [isUploading, setIsUploading] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [createdJob, setCreatedJob] = useState<Job | null>(null)
  const [createdQuote, setCreatedQuote] = useState<Quote | null>(null)

  const [isAccepting, setIsAccepting] = useState(false)

  if (isAuthenticated && user?.role === 'client' && !user?.isEmailVerified) {
    return (
      <div className="min-h-screen bg-[#f9faf9] flex items-center justify-center px-4">
        <div className="bg-white border border-amber-200 rounded-2xl p-8 sm:p-10 w-full max-w-md text-center shadow-sm">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-(--upwork-navy) mb-2">Verify your email first</h1>
          <p className="text-sm text-gray-400 mb-6">
            You need to verify your email address before you can post a job.
            Check your inbox for the verification link.
          </p>
          <div className="space-y-3">
            <a
              href="/dashboard/profile"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-6 rounded-xl bg-(--upwork-green) hover:bg-(--upwork-green-dark) text-white text-sm font-medium transition-colors"
            >
              Go to Profile to Resend
            </a>
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-6 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }
  const [acceptError, setAcceptError] = useState('')

  const progress = Math.min((currentStep / totalSteps) * 100, 100)


  const handleCategorySelect = (cat: TradieCategory) => {
    setCategory(cat)
    setCurrentStep(2)
  }


  const handleUploadFiles = useCallback(async (files: FileList) => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    setIsUploading(true)

    try {
      const uploaded: JobImage[] = []

      for (const file of Array.from(files)) {
        const signRes = await api.post<SignedUploadResponse>('/api/uploads/sign', { folder: 'jobs' })
        const signed = signRes.data

        const formData = new FormData()
        formData.append('file', file)
        formData.append('api_key', signed.apiKey)
        formData.append('timestamp', String(signed.timestamp))
        formData.append('signature', signed.signature)
        formData.append('folder', signed.folder)

        const cloudRes = await fetch(
          `https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`,
          { method: 'POST', body: formData }
        )

        if (!cloudRes.ok) throw new Error('Upload to Cloudinary failed')

        const cloudData = await cloudRes.json()

        await api.post('/api/uploads/confirm', {
          publicId: cloudData.public_id,
          url: cloudData.secure_url,
        })

        uploaded.push({
          url: cloudData.secure_url,
          publicId: cloudData.public_id,
          uploadedAt: new Date().toISOString(),
        })
      }

      setImages((prev) => [...prev, ...uploaded])
    } catch (err) {
      console.error('Upload error:', err)
    } finally {
      setIsUploading(false)
    }
  }, [isAuthenticated, router])


  const handleSubmitJob = useCallback(async (timeValue: PreferredTime) => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    setIsSubmitting(true)
    setSubmitError('')
    setCurrentStep(6) 

    try {
      const lat = -37.8136
      const lng = 144.9631

      const res = await api.post<{ job: Job; quote: Quote }>('/api/jobs', {
        title,
        description,
        category: category || 'other',
        images,
        location: {
          address,
          suburb,
          postcode,
          state: locationState,
          coordinates: { lat, lng },
        },
        preferredTime: timeValue,
      })

      setCreatedJob(res.data.job)
      setCreatedQuote(res.data.quote)
      setCurrentStep(7) 
    } catch (err) {
      setCurrentStep(5) 
      if (err instanceof ApiError) {
        setSubmitError(err.message)
      } else {
        setSubmitError('Failed to create job. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [isAuthenticated, router, title, description, category, images, address, suburb, postcode, locationState])


  const handleAcceptQuote = useCallback(async () => {
    if (!createdJob) return
    setIsAccepting(true)
    setAcceptError('')

    try {
      await api.post(`/api/jobs/${createdJob._id}/accept-quote`)
      router.push('/dashboard')
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.message.includes('STRIPE_SECRET_KEY')) {
          setAcceptError('Payment system is not configured yet. Your quote has been saved — you can accept it later from your dashboard once payments are live.')
        } else {
          setAcceptError(err.message)
        }
      } else {
        setAcceptError('Failed to accept quote. Please try again.')
      }
    } finally {
      setIsAccepting(false)
    }
  }, [createdJob, router])


  const handleCancelJob = useCallback(async () => {
    if (!createdJob) return
    try {
      await api.patch(`/api/jobs/${createdJob._id}/cancel`)
    } catch {
    }
    router.push('/')
  }, [createdJob, router])


  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    } else {
      router.push('/')
    }
  }

  const handleTimeSelect = (val: PreferredTime) => {
    setPreferredTime(val)
    handleSubmitJob(val)
  }

  const handleLocationFieldChange = (field: string, value: string) => {
    switch (field) {
      case 'address': setAddress(value); break
      case 'suburb': setSuburb(value); break
      case 'postcode': setPostcode(value); break
      case 'state': setLocationState(value); break
    }
  }


  if (currentStep === 6) {
    return (
      <div className="min-h-screen bg-linear-to-br from-white via-[#f2f7f2] to-white flex items-center justify-center px-4">
        <StepAnalyzing />
      </div>
    )
  }


  if (currentStep === 7 && createdQuote && createdJob) {
    return (
      <div className="min-h-screen bg-linear-to-br from-white via-[#f2f7f2] to-white">
        <header className="border-b border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
            <Link href="/" className="inline-block">
              <Image src="/logo.svg" alt="Fixes" width={120} height={40} className="h-8 w-auto" priority />
            </Link>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 lg:px-6 py-12">
          <StepQuote
            quote={createdQuote}
            job={createdJob}
            onAccept={handleAcceptQuote}
            onCancel={handleCancelJob}
            isAccepting={isAccepting}
            acceptError={acceptError}
          />
        </main>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-linear-to-br from-white via-[#f2f7f2] to-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-(--upwork-navy) font-medium hover:opacity-70 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <span className="text-sm text-(--upwork-gray)">
            Step {currentStep} of {totalSteps}
          </span>
        </div>
        <div className="h-1 bg-gray-200">
          <div
            className="h-full bg-(--upwork-green) transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {submitError && (
        <div className="max-w-4xl mx-auto px-4 lg:px-6 mt-6">
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{submitError}</p>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 lg:px-6 py-12 md:py-20">
        {currentStep === 1 && (
          <StepCategory
            selectedCategory={category}
            onSelectCategory={handleCategorySelect}
          />
        )}

        {currentStep === 2 && (
          <StepDescription
            description={description}
            onDescriptionChange={setDescription}
            title={title}
            onTitleChange={setTitle}
            categoryLabel={category ? CATEGORY_LABELS[category] : ''}
            onNext={() => setCurrentStep(3)}
          />
        )}

        {currentStep === 3 && (
          <StepPhotos
            images={images}
            onImagesChange={setImages}
            onNext={() => setCurrentStep(4)}
            isUploading={isUploading}
            onUploadFiles={handleUploadFiles}
          />
        )}

        {currentStep === 4 && (
          <StepLocation
            address={address}
            suburb={suburb}
            postcode={postcode}
            state={locationState}
            onFieldChange={handleLocationFieldChange}
            onNext={() => setCurrentStep(5)}
          />
        )}

        {currentStep === 5 && (
          <StepTime
            selected={preferredTime}
            onSelect={handleTimeSelect}
          />
        )}
      </main>
    </div>
  )
}
