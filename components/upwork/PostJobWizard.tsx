'use client'

import { useState, useCallback, useEffect } from 'react'
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
  ShieldCheck,
  Award,
  Star,
  Zap,
  Moon,
  Sunrise,
  Calendar,
  HelpCircle,
  CreditCard,
} from 'lucide-react'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useAuth } from '@/contexts/auth-context'
import { api, ApiError } from '@/lib/api'
import AddressAutocomplete from '@/components/upwork/AddressAutocomplete'

import { VALID_CATEGORIES, CATEGORY_LABELS, AUSTRALIAN_STATES } from '@/lib/constants'
import type {
  Job,
  Quote,
  QuoteOption,
  SkillLevel,
  TradieCategory,
  PreferredTime,
  SignedUploadResponse,
  JobImage,
  DiagnosticQuestion,
  PreflightQuestionsResponse,
} from '@/lib/types'

interface PostJobWizardProps {
  searchQuery: string
  preselectedCategory: string
  existingJobId?: string
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
            className={`px-4 py-3.5 rounded-xl border text-sm font-medium transition-all text-left ${selectedCategory === cat
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
  classifySuggestion,
  onSwitchCategory,
  onDismissClassify,
}: {
  description: string
  onDescriptionChange: (val: string) => void
  title: string
  onTitleChange: (val: string) => void
  categoryLabel: string
  onNext: () => void
  classifySuggestion?: { suggestedCategory: TradieCategory; confidence: number; reason: string } | null
  onSwitchCategory?: (cat: TradieCategory) => void
  onDismissClassify?: () => void
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

      {classifySuggestion && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-amber-800">
              This sounds like a <strong>{CATEGORY_LABELS[classifySuggestion.suggestedCategory]}</strong> job. Switch category?
            </p>
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => onSwitchCategory?.(classifySuggestion.suggestedCategory)}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors"
              >
                Switch to {CATEGORY_LABELS[classifySuggestion.suggestedCategory]}
              </button>
              <button
                type="button"
                onClick={onDismissClassify}
                className="text-xs font-medium px-3 py-1.5 rounded-lg border border-amber-300 text-amber-700 hover:bg-amber-100 transition-colors"
              >
                Keep {categoryLabel || 'current'}
              </button>
            </div>
          </div>
        </div>
      )}

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

function StepDiagnosticQuestions({
  questions,
  answers,
  onAnswerChange,
  onNext,
  isLoading,
  categoryLabel,
}: {
  questions: DiagnosticQuestion[]
  answers: Record<string, string>
  onAnswerChange: (questionId: string, answer: string) => void
  onNext: () => void
  isLoading: boolean
  categoryLabel: string
}) {
  const answeredCount = Object.keys(answers).length
  const totalQuestions = questions.length
  const canProceed = !isLoading

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-7 h-7 text-(--upwork-green)" />
        </div>
        {categoryLabel && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-(--upwork-green) text-sm font-medium rounded-full mb-3">
            <Check className="w-3.5 h-3.5" />
            {categoryLabel}
          </span>
        )}
        <h1 className="text-3xl md:text-4xl font-bold text-(--upwork-navy) mb-2">
          A few quick questions
        </h1>
        <p className="text-[var(--upwork-gray)] text-sm">
          These help our AI give you a more accurate price estimate.
          All questions are optional — answer what you can.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center gap-4 py-16">
          <Loader2 className="w-8 h-8 text-[var(--upwork-green)] animate-spin" />
          <p className="text-sm text-[var(--upwork-gray)]">Analysing your photos and preparing questions…</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[var(--upwork-gray)] text-sm mb-6">No additional questions needed for this job.</p>
          <button
            onClick={onNext}
            className="inline-flex items-center gap-2 bg-[var(--upwork-green)] hover:bg-[var(--upwork-green-dark)] text-white font-medium py-3 px-8 rounded-xl transition-colors"
          >
            Continue <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between text-xs text-[var(--upwork-gray)] mb-6">
            <span>{answeredCount} of {totalQuestions} answered</span>
            <span className="text-[var(--upwork-green)] font-medium">All optional</span>
          </div>

          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div
                key={q.id}
                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm"
              >
                <p className="text-sm font-semibold text-[var(--upwork-navy)] mb-3">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--upwork-green)] text-white text-xs font-bold mr-2">
                    {idx + 1}
                  </span>
                  {q.text}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt) => {
                    const selected = answers[q.id] === opt
                    return (
                      <button
                        key={opt}
                        onClick={() => onAnswerChange(q.id, selected ? '' : opt)}
                        className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all text-left ${selected
                          ? 'bg-[var(--upwork-green)] border-[var(--upwork-green)] text-white shadow-sm'
                          : 'bg-gray-50 border-gray-200 text-[var(--upwork-navy)] hover:border-[var(--upwork-green)] hover:bg-green-50'
                          }`}
                      >
                        {selected && <Check className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />}
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center gap-3">
            <button
              onClick={onNext}
              disabled={!canProceed}
              className="w-full max-w-sm bg-[var(--upwork-green)] hover:bg-[var(--upwork-green-dark)] disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              Continue to Location
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={onNext}
              className="text-sm text-[var(--upwork-gray)] hover:text-[var(--upwork-navy)] underline underline-offset-2 transition-colors"
            >
              Skip all questions
            </button>
          </div>
        </>
      )}
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
      <h1 className="text-3xl md:text-4xl font-bold text-[var(--upwork-navy)] mb-3">
        Add photos
      </h1>
      <p className="text-[var(--upwork-gray)] mb-8">
        Photos help our AI provide a more accurate quote. Optional but recommended.
      </p>

      <label
        htmlFor="photo-upload"
        className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-colors mb-6 ${isUploading
          ? 'border-[var(--upwork-green)] bg-green-50'
          : 'border-gray-300 hover:border-[var(--upwork-green)] bg-gray-50 hover:bg-green-50'
          }`}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-[var(--upwork-green)] animate-spin" />
            <span className="text-sm text-[var(--upwork-green)] font-medium">Uploading...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-gray-400" />
            <span className="text-sm text-[var(--upwork-gray)]">Click to upload or drag and drop</span>
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
        className="w-full max-w-sm mx-auto block bg-[var(--upwork-green)] hover:bg-[var(--upwork-green-dark)] text-white font-medium py-3 px-6 rounded-xl transition-colors"
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
  onAutocompleteFill,
  onNext,
  isGeocoding = false,
  geocodeError = '',
}: {
  address: string
  suburb: string
  postcode: string
  state: string
  onFieldChange: (field: string, value: string) => void
  onAutocompleteFill: (fields: { address: string; suburb: string; postcode: string; state: string; lat: number; lng: number }) => void
  onNext: () => void
  isGeocoding?: boolean
  geocodeError?: string
}) {
  const [isManualMode, setIsManualMode] = useState(false)
  const [autoFilled, setAutoFilled] = useState(false)
  const isValid = address && suburb && postcode && state

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold text-[var(--upwork-navy)] text-center mb-3">
        Where is the job?
      </h1>
      <p className="text-[var(--upwork-gray)] text-center mb-8">
        We&apos;ll find tradies near this location.
      </p>

      <div className="space-y-4">
        {!isManualMode && (
          <AddressAutocomplete
            defaultValue={address}
            onSelect={(components) => {
              onAutocompleteFill(components)
              setAutoFilled(true)
            }}
            onManualMode={() => setIsManualMode(true)}
          />
        )}

        {isManualMode && (
          <button
            type="button"
            onClick={() => setIsManualMode(false)}
            className="flex items-center gap-1.5 text-xs text-[var(--upwork-gray)] hover:text-[var(--upwork-green)] transition-colors mb-2"
          >
            <MapPin className="w-3.5 h-3.5" />
            Search address instead
          </button>
        )}

        {(isManualMode || autoFilled) && (
          <>
            <div>
              <label htmlFor="loc-address" className="block text-sm font-medium text-[var(--upwork-navy)] mb-1.5">
                Street Address
              </label>
              <input
                id="loc-address"
                type="text"
                value={address}
                onChange={(e) => onFieldChange('address', e.target.value)}
                placeholder="123 Example Street"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-[var(--upwork-navy)] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--upwork-green)] focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="loc-suburb" className="block text-sm font-medium text-[var(--upwork-navy)] mb-1.5">
                  Suburb
                </label>
                <input
                  id="loc-suburb"
                  type="text"
                  value={suburb}
                  onChange={(e) => onFieldChange('suburb', e.target.value)}
                  placeholder="Richmond"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-[var(--upwork-navy)] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--upwork-green)] focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="loc-postcode" className="block text-sm font-medium text-[var(--upwork-navy)] mb-1.5">
                  Postcode
                </label>
                <input
                  id="loc-postcode"
                  type="text"
                  value={postcode}
                  onChange={(e) => onFieldChange('postcode', e.target.value)}
                  placeholder="3121"
                  maxLength={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-[var(--upwork-navy)] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--upwork-green)] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="loc-state" className="block text-sm font-medium text-[var(--upwork-navy)] mb-1.5">
                State
              </label>
              <select
                id="loc-state"
                value={state}
                onChange={(e) => onFieldChange('state', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-[var(--upwork-navy)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--upwork-green)] focus:border-transparent"
              >
                <option value="" disabled>Select state...</option>
                {AUSTRALIAN_STATES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      {geocodeError && (
        <div className="flex items-start gap-2 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">{geocodeError}</p>
        </div>
      )}

      <button
        onClick={onNext}
        disabled={!isValid || isGeocoding}
        className="w-full max-w-sm mx-auto flex items-center justify-center gap-2 mt-8 bg-[var(--upwork-green)] hover:bg-[var(--upwork-green-dark)] disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-colors"
      >
        {isGeocoding ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Locating address…
          </>
        ) : (
          'Next'
        )}
      </button>
    </div>
  )
}


function StepTime({
  selected,
  onSelect,
  scheduledFor,
  onScheduledForChange,
  onScheduledSubmit,
}: {
  selected: PreferredTime | ''
  onSelect: (val: PreferredTime) => void
  scheduledFor: string
  onScheduledForChange: (val: string) => void
  onScheduledSubmit: () => void
}) {
  const now = new Date()
  const minDt = new Date(now.getTime() + 5 * 60 * 1000)
  const maxDt = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const toDatetimeLocal = (d: Date) =>
    new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)

  const options: { value: PreferredTime; label: string; desc: string; icon: string }[] = [
    { value: 'now', label: 'Now', desc: 'Dispatch a tradie immediately', icon: '⚡' },
    { value: 'scheduled', label: 'Schedule for Later', desc: 'Choose a time (up to 24h ahead)', icon: '🗓️' },
    { value: '1-2weeks', label: 'In 1–2 Weeks', desc: 'Flexible timing', icon: '📅' },
    { value: 'no-rush', label: 'No Rush', desc: 'Whenever available', icon: '😌' },
  ]

  const scheduledValid = selected !== 'scheduled' || (
    scheduledFor &&
    new Date(scheduledFor).getTime() > minDt.getTime() &&
    new Date(scheduledFor).getTime() <= maxDt.getTime()
  )

  return (
    <div className="max-w-2xl mx-auto text-center">
      <h1 className="text-3xl md:text-4xl font-bold text-[var(--upwork-navy)] mb-3">
        When do you need this done?
      </h1>
      <p className="text-[var(--upwork-gray)] mb-10">
        We&apos;ll dispatch a tradie based on your timing preference.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className={`px-5 py-4 rounded-xl border text-left transition-all ${selected === opt.value
              ? 'bg-[var(--upwork-navy)] text-white border-[var(--upwork-navy)]'
              : 'bg-white text-[var(--upwork-navy)] border-gray-300 hover:border-[var(--upwork-navy)]'
              }`}
          >
            <div className="text-xl mb-1">{opt.icon}</div>
            <div className="font-semibold text-sm">{opt.label}</div>
            <div className={`text-xs mt-0.5 ${selected === opt.value ? 'text-white/70' : 'text-gray-400'}`}>
              {opt.desc}
            </div>
          </button>
        ))}
      </div>

      {selected === 'scheduled' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-left">
          <label htmlFor="scheduled-time" className="block text-sm font-medium text-[var(--upwork-navy)] mb-2">
            🕐 Choose dispatch time
          </label>
          <input
            id="scheduled-time"
            type="datetime-local"
            value={scheduledFor}
            min={toDatetimeLocal(minDt)}
            max={toDatetimeLocal(maxDt)}
            onChange={(e) => onScheduledForChange(e.target.value)}
            className="w-full px-4 py-3 border border-blue-300 rounded-xl text-[var(--upwork-navy)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--upwork-green)] focus:border-transparent"
          />
          <p className="text-xs text-blue-600 mt-2">
            ⚡ Tradies will receive the dispatch at your chosen time. Max 24 hours ahead.
          </p>
          {scheduledFor && !scheduledValid && (
            <p className="text-xs text-red-600 mt-1">
              Please choose a time at least 5 minutes from now and within 24 hours.
            </p>
          )}
          <button
            onClick={onScheduledSubmit}
            disabled={!scheduledFor || !scheduledValid}
            className="mt-4 w-full bg-[var(--upwork-green)] hover:bg-[var(--upwork-green-dark)] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            📅 Schedule Job
          </button>
        </div>
      )}
    </div>
  )
}


function StepAnalyzing() {
  return (
    <div className="max-w-md mx-auto text-center py-16">
      <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <Sparkles className="w-10 h-10 text-[var(--upwork-green)] animate-pulse" />
      </div>
      <h1 className="text-2xl font-bold text-[var(--upwork-navy)] mb-3">
        Analyzing your job...
      </h1>
      <p className="text-[var(--upwork-gray)] mb-6">
        Our AI is reviewing your description and photos to generate an accurate quote.
      </p>
      <div className="flex justify-center">
        <Loader2 className="w-6 h-6 text-[var(--upwork-green)] animate-spin" />
      </div>
    </div>
  )
}


const TIER_CONFIG: Record<string, { label: string; icon: React.ElementType; colorClass: string; bgClass: string; borderClass: string }> = {
  junior: { label: 'Standard', icon: Zap, colorClass: 'text-blue-600', bgClass: 'bg-blue-50', borderClass: 'border-blue-200' },
  senior: { label: 'Premium', icon: Star, colorClass: 'text-amber-600', bgClass: 'bg-amber-50', borderClass: 'border-amber-200' },
  specialist: { label: 'Expert', icon: Award, colorClass: 'text-purple-600', bgClass: 'bg-purple-50', borderClass: 'border-purple-200' },
  premium: { label: 'Premium Service', icon: Star, colorClass: 'text-emerald-600', bgClass: 'bg-emerald-50', borderClass: 'border-emerald-200' },
}

function PremiumQuoteCard({ option }: { option: QuoteOption }) {
  return (
    <div className="w-full text-left rounded-2xl border-2 border-[var(--upwork-green)] bg-green-50 shadow-md p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100">
          <Star className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-semibold text-emerald-600">Premium Service</span>
        </div>
        <div className="w-6 h-6 rounded-full bg-[var(--upwork-green)] flex items-center justify-center">
          <Check className="w-3.5 h-3.5 text-white" />
        </div>
      </div>

      <div className="mb-3">
        <div className="text-2xl font-bold text-[var(--upwork-navy)]">
          ${option.suggestedFixedPrice}
          <span className="text-sm font-normal text-gray-400 ml-1">AUD</span>
        </div>
        <div className="text-xs text-gray-400 mt-0.5">
          Range: ${option.price.min} – ${option.price.max}
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-sm text-[var(--upwork-gray)] mb-3">
        <Clock className="w-3.5 h-3.5" />
        <span>{option.estimatedHours.min}–{option.estimatedHours.max} hours estimated</span>
      </div>

      {option.reasoning && (
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-3">{option.reasoning}</p>
      )}

      <div className="flex items-center gap-1.5">
        <div className="flex-1 h-1 bg-gray-100 rounded-full">
          <div
            className="h-1 rounded-full bg-[var(--upwork-green)]"
            style={{ width: `${Math.round(option.confidence * 100)}%` }}
          />
        </div>
        <span className="text-[10px] text-gray-400">{Math.round(option.confidence * 100)}% confidence</span>
      </div>

      {(() => {
        const pct = Math.round(option.confidence * 100)
        if (pct >= 85) return (
          <p className="text-[10px] text-green-600 mt-1.5 flex items-center gap-1">
            <span>✅</span> High confidence — clear job details allow an accurate quote.
          </p>
        )
        if (pct >= 70) return (
          <p className="text-[10px] text-blue-500 mt-1.5 flex items-center gap-1">
            <span>ℹ️</span> Good estimate — final price may vary slightly after inspection.
          </p>
        )
        if (pct >= 50) return (
          <p className="text-[10px] text-amber-500 mt-1.5 flex items-center gap-1">
            <span>⚠️</span> Estimate only — price may change after your tradie visits.
          </p>
        )
        return (
          <p className="text-[10px] text-orange-500 mt-1.5 flex items-center gap-1">
            <span>🔶</span> Rough estimate — we recommend an on-site inspection first.
          </p>
        )
      })()}
    </div>
  )
}

const STATE_TZ: Record<string, string> = {
  NSW: 'Australia/Sydney', ACT: 'Australia/Sydney',
  VIC: 'Australia/Melbourne', TAS: 'Australia/Hobart',
  QLD: 'Australia/Brisbane', SA: 'Australia/Adelaide',
  WA: 'Australia/Perth', NT: 'Australia/Darwin',
}


function datetimeLocalToAuISO(localStr: string, tz: string): string {
  const provisional = new Date(localStr + 'Z')

  const dtf = new Intl.DateTimeFormat('en-AU', {
    timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false,
  })
  const [auH, auM] = dtf.format(provisional).split(':').map(Number)

  const [, timePart] = localStr.split('T')
  const [wantH, wantM] = timePart.split(':').map(Number)
  let diffMinutes = (wantH * 60 + wantM) - (auH * 60 + auM)

  if (diffMinutes > 12 * 60) diffMinutes -= 24 * 60
  if (diffMinutes < -12 * 60) diffMinutes += 24 * 60

  return new Date(provisional.getTime() + diffMinutes * 60_000).toISOString()
}

function StepQuote({
  quote,
  job,
  selectedTier,
  onSelectTier,
  onAccept,
  onCancel,
  onReschedule,
  isAccepting,
  isRescheduling,
  acceptError,
}: {
  quote: Quote
  job: Job
  selectedTier: SkillLevel | null
  onSelectTier: (tier: SkillLevel | null) => void
  onAccept: () => void
  onCancel: () => void
  onReschedule: (isoTime: string, tier: SkillLevel | null, price: number) => void
  isAccepting: boolean
  isRescheduling: boolean
  acceptError: string
}) {
  const [showSchedulePicker, setShowSchedulePicker] = useState(false)
  const [selectedMorningTier, setSelectedMorningTier] = useState<SkillLevel | null>(null)
  const [selectedWeekdayTier, setSelectedWeekdayTier] = useState<SkillLevel | null>(null)

  const handleSelectMainTier = (tier: SkillLevel) => {
    setSelectedMorningTier(null)
    onSelectTier(tier)
  }

  const getTomorrowNineAM = () => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    d.setHours(9, 0, 0, 0)
    return d.toISOString().slice(0, 16)
  }
  const [pickedTime, setPickedTime] = useState(getTomorrowNineAM)

  
  const isPickedTimeAfterHours = (isoTime: string): boolean => {
    try {
      const hour = parseInt(isoTime.split('T')[1]?.split(':')[0] ?? '12', 10)
      return hour >= 18 || hour < 6
    } catch { return false }
  }

  const pickedIsAfterHours = isPickedTimeAfterHours(pickedTime)
  const morningOptions = quote.morningOptions || []
  const showRescheduleSection = job.isAfterHours && morningOptions.length > 0

  const maxSavingsPct = morningOptions.length > 0
    ? Math.max(...morningOptions.map((mo, i) => {
      const ev = quote.options[i]?.suggestedFixedPrice
      if (!ev) return 0
      return Math.round(((ev - mo.suggestedFixedPrice) / ev) * 100)
    }))
    : 0

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-7 h-7 text-[var(--upwork-green)]" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--upwork-navy)] mb-2">Your quote is ready</h1>
        <p className="text-sm text-[var(--upwork-gray)]">
          Job: <strong>{job.title}</strong> — {job.jobCode}
        </p>
      </div>

      {job.isAfterHours && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
          <Moon className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">
            After-hours pricing applied — tradies working after 6pm receive a surcharge for evening availability.
          </p>
        </div>
      )}

      {job.isWeekend && !job.isAfterHours && (
        <div className="flex items-start gap-3 bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 mb-5">
          <Calendar className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
          <p className="text-sm text-purple-700">
            Weekend pricing applied — tradies working on weekends receive a surcharge for weekend availability.
          </p>
        </div>
      )}

      {quote.isLargeProject && (
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-5">
          <HelpCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800 mb-0.5">Large project — includes materials &amp; equipment</p>
            <p className="text-xs text-blue-600">
              This estimate includes estimated equipment and material costs. The final price may be adjusted after your tradie completes an on-site inspection.
            </p>
          </div>
        </div>
      )}

      {showRescheduleSection && morningOptions[0] ? (
        (() => {
          const mo = morningOptions[0]
          const eveningPrice = quote.options[0]?.suggestedFixedPrice ?? 0
          const savings = Math.round(((eveningPrice - mo.suggestedFixedPrice) / eveningPrice) * 100)
          return (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <button
                  onClick={() => { onSelectTier('premium'); setSelectedMorningTier(null) }}
                  className={`w-full text-left rounded-2xl border-2 p-5 transition-all ${
                    selectedTier === 'premium' && !selectedMorningTier
                      ? 'border-[var(--upwork-green)] bg-green-50 shadow-md'
                      : 'border-amber-200 bg-white hover:border-[var(--upwork-green)] hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100">
                      <Moon className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-xs font-semibold text-amber-600">Tonight</span>
                    </div>
                    {selectedTier === 'premium' && !selectedMorningTier && (
                      <div className="w-6 h-6 rounded-full bg-[var(--upwork-green)] flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="mb-2">
                    <div className="text-2xl font-bold text-[var(--upwork-navy)]">
                      ${quote.options[0]?.suggestedFixedPrice}
                      <span className="text-sm font-normal text-gray-400 ml-1">AUD</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Range: ${quote.options[0]?.price.min} – ${quote.options[0]?.price.max}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-amber-600 mb-2">
                    <Moon className="w-3 h-3" />
                    <span>After-hours rate · Available now</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-[var(--upwork-gray)]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{quote.options[0]?.estimatedHours.min}–{quote.options[0]?.estimatedHours.max} hours</span>
                  </div>
                  {quote.options[0]?.reasoning && (
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mt-2">{quote.options[0].reasoning}</p>
                  )}
                </button>

                <button
                  onClick={() => { setSelectedMorningTier(mo.tier as SkillLevel); onSelectTier(null) }}
                  className={`w-full text-left rounded-2xl border-2 p-5 transition-all ${
                    selectedMorningTier
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-blue-200 bg-white hover:border-blue-500 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100">
                      <Sunrise className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-xs font-semibold text-blue-600">Next Morning</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                        Save {savings}%
                      </span>
                      {selectedMorningTier && (
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-blue-900">
                        ${mo.suggestedFixedPrice}
                        <span className="text-sm font-normal text-gray-400 ml-1">AUD</span>
                      </span>
                      <span className="text-sm text-gray-400 line-through">${eveningPrice}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Range: ${mo.price.min} – ${mo.price.max}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-blue-600 mb-2">
                    <Sunrise className="w-3 h-3" />
                    <span>Standard rate · No surcharge</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-[var(--upwork-gray)]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{mo.estimatedHours.min}–{mo.estimatedHours.max} hours</span>
                  </div>
                  {mo.reasoning && (
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mt-2">{mo.reasoning}</p>
                  )}
                </button>
              </div>

              <div className="flex justify-center mb-5">
                <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-500 font-medium">
                  {quote.engine === 'gemini' ? 'AI-Powered Estimate' : 'Market Rate Estimate'}
                </span>
              </div>

              {acceptError && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-700">{acceptError}</p>
                </div>
              )}

              {selectedMorningTier ? (
                <div className="space-y-3 mb-6">
                  <label className="block text-sm font-medium text-gray-700">
                    📅 Select your preferred morning time:
                  </label>
                  <input
                    type="datetime-local"
                    value={pickedTime}
                    min={new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)}
                    onChange={(e) => setPickedTime(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  {pickedIsAfterHours && (
                    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                      <Moon className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700">
                        <strong>After-hours rates still apply</strong> for this time slot.
                        Choose a daytime slot (before 6 PM) to unlock savings.
                      </p>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => {
                        onReschedule(pickedTime, mo.tier as SkillLevel ?? 'premium', mo.suggestedFixedPrice)
                      }}
                      disabled={isRescheduling || !pickedTime}
                      className="flex-1 font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-white"
                      style={{ backgroundColor: pickedIsAfterHours ? '#f59e0b' : '#3b82f6' }}
                    >
                      {isRescheduling ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Rescheduling...</>
                      ) : pickedIsAfterHours ? (
                        <><Moon className="w-4 h-4" /> Book at After-Hours Rate</>
                      ) : (
                        <><Sunrise className="w-4 h-4" /> Book Morning at ${mo.suggestedFixedPrice}</>
                      )}
                    </button>
                    <button
                      onClick={onCancel}
                      disabled={isAccepting}
                      className="flex-1 border border-gray-300 text-[var(--upwork-navy)] font-medium py-3 px-6 rounded-xl hover:border-gray-400 transition-colors"
                    >
                      Cancel Job
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <button
                    onClick={onAccept}
                    disabled={isAccepting}
                    className="flex-1 bg-[var(--upwork-green)] hover:bg-[var(--upwork-green-dark)] disabled:opacity-50 text-white font-medium py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {isAccepting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Accepting...</>
                    ) : (
                      <>Accept Tonight at ${eveningPrice} <ChevronRight className="w-4 h-4" /></>
                    )}
                  </button>
                  <button
                    onClick={onCancel}
                    disabled={isAccepting}
                    className="flex-1 border border-gray-300 text-[var(--upwork-navy)] font-medium py-3 px-6 rounded-xl hover:border-gray-400 transition-colors"
                  >
                    Cancel Job
                  </button>
                </div>
              )}
            </>
          )
        })()
      ) : job.isWeekend && !job.isAfterHours && (quote.weekdayOptions?.length ?? 0) > 0 ? (
        null
      ) : (
        <>
          <div className="space-y-3 mb-5">
            {quote.options[0] && (
              <PremiumQuoteCard option={quote.options[0]} />
            )}
          </div>

          <div className="flex justify-center mb-5">
            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-500 font-medium">
              {quote.engine === 'gemini' ? 'AI-Powered Estimate' : 'Market Rate Estimate'}
            </span>
          </div>

          {acceptError && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700">{acceptError}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <button
              onClick={onAccept}
              disabled={isAccepting}
              className="flex-1 bg-[var(--upwork-green)] hover:bg-[var(--upwork-green-dark)] disabled:opacity-50 text-white font-medium py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {isAccepting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Accepting...
                </>
              ) : (
                <>
                  Accept Premium Quote
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
            <button
              onClick={onCancel}
              disabled={isAccepting}
              className="flex-1 border border-gray-300 text-[var(--upwork-navy)] font-medium py-3 px-6 rounded-xl hover:border-gray-400 transition-colors"
            >
              Cancel Job
            </button>
          </div>
        </>
      )}

      {job.isWeekend && !job.isAfterHours && (quote.weekdayOptions?.length ?? 0) > 0 && (() => {
        const weekdayOpts = quote.weekdayOptions || []
        const wo = weekdayOpts[0]
        if (!wo) return null
        const weekendPrice = quote.options[0]?.suggestedFixedPrice ?? wo.suggestedFixedPrice
        const savings = Math.round(((weekendPrice - wo.suggestedFixedPrice) / weekendPrice) * 100)
        const isWeekdaySelected = !!selectedWeekdayTier
        return (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <button
                onClick={() => { onSelectTier('premium'); setSelectedWeekdayTier(null) }}
                className={`w-full text-left rounded-2xl border-2 p-5 transition-all ${
                  selectedTier === 'premium' && !isWeekdaySelected
                    ? 'border-[var(--upwork-green)] bg-green-50 shadow-md'
                    : 'border-purple-200 bg-white hover:border-[var(--upwork-green)] hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100">
                    <Calendar className="w-3.5 h-3.5 text-purple-600" />
                    <span className="text-xs font-semibold text-purple-600">This Weekend</span>
                  </div>
                  {selectedTier === 'premium' && !isWeekdaySelected && (
                    <div className="w-6 h-6 rounded-full bg-[var(--upwork-green)] flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>
                <div className="mb-2">
                  <div className="text-2xl font-bold text-[var(--upwork-navy)]">
                    ${weekendPrice}
                    <span className="text-sm font-normal text-gray-400 ml-1">AUD</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-purple-600 mb-2">
                  <Calendar className="w-3 h-3" />
                  <span>Weekend rate · Available now</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-[var(--upwork-gray)]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{quote.options[0]?.estimatedHours.min}–{quote.options[0]?.estimatedHours.max} hours</span>
                </div>
              </button>

              <button
                onClick={() => { setSelectedWeekdayTier(wo.tier as SkillLevel); onSelectTier(null) }}
                className={`w-full text-left rounded-2xl border-2 p-5 transition-all ${
                  isWeekdaySelected
                    ? 'border-purple-500 bg-purple-50 shadow-md'
                    : 'border-purple-200 bg-white hover:border-purple-500 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100">
                    <Calendar className="w-3.5 h-3.5 text-purple-600" />
                    <span className="text-xs font-semibold text-purple-600">Weekday</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                      Save {savings}%
                    </span>
                    {isWeekdaySelected && (
                      <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-purple-900">
                      ${wo.suggestedFixedPrice}
                      <span className="text-sm font-normal text-gray-400 ml-1">AUD</span>
                    </span>
                    <span className="text-sm text-gray-400 line-through">${weekendPrice}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-purple-600 mb-2">
                  <Calendar className="w-3 h-3" />
                  <span>Standard rate · No surcharge</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-[var(--upwork-gray)]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{wo.estimatedHours.min}–{wo.estimatedHours.max} hours</span>
                </div>
              </button>
            </div>

            <div className="flex justify-center mb-5">
              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-500 font-medium">
                {quote.engine === 'gemini' ? 'AI-Powered Estimate' : 'Market Rate Estimate'}
              </span>
            </div>

            {acceptError && (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700">{acceptError}</p>
              </div>
            )}

            {isWeekdaySelected && (
              <div className="space-y-3 mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  📅 Select your preferred weekday:
                </label>
                <input
                  type="datetime-local"
                  value={pickedTime}
                  min={new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)}
                  onChange={(e) => setPickedTime(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              {isWeekdaySelected ? (
                <button
                  onClick={() => {
                    onReschedule(pickedTime, wo.tier as SkillLevel ?? 'premium', wo.suggestedFixedPrice)
                  }}
                  disabled={isRescheduling || !pickedTime}
                  className="flex-1 font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-white bg-purple-600 hover:bg-purple-700"
                >
                  {isRescheduling ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Rescheduling...</>
                  ) : (
                    <><Calendar className="w-4 h-4" /> Book Weekday at ${wo.suggestedFixedPrice}</>
                  )}
                </button>
              ) : (
                <button
                  onClick={onAccept}
                  disabled={isAccepting}
                  className="flex-1 bg-[var(--upwork-green)] hover:bg-[var(--upwork-green-dark)] disabled:opacity-50 text-white font-medium py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {isAccepting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Accepting...</>
                  ) : (
                    <>Accept Weekend at ${weekendPrice} <ChevronRight className="w-4 h-4" /></>
                  )}
                </button>
              )}
              <button
                onClick={onCancel}
                disabled={isAccepting}
                className="flex-1 border border-gray-300 text-[var(--upwork-navy)] font-medium py-3 px-6 rounded-xl hover:border-gray-400 transition-colors"
              >
                Cancel Job
              </button>
            </div>
            <p className="text-xs text-center text-gray-400">
              Standard weekday rates apply Mon–Fri · No weekend surcharge
            </p>
          </div>
        )
      })()}
    </div>
  )
}




function PaymentForm({
  amount,
  onSuccess,
  onCancel,
}: {
  amount: number
  onSuccess: () => void
  onCancel: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isConfirming, setIsConfirming] = useState(false)
  const [payError, setPayError] = useState('')

  const handleConfirm = async () => {
    if (!stripe || !elements) return
    setIsConfirming(true)
    setPayError('')

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard`,
      },
      redirect: 'if_required', 
    })

    if (error) {
      setPayError(error.message || 'Payment failed. Please try again.')
      setIsConfirming(false)
    } else {
      onSuccess()
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <PaymentElement
        options={{ layout: 'accordion' }}
        onLoadError={(err) => {
          console.error('PaymentElement load error:', err)
          setPayError('Failed to load payment form. Please refresh and try again.')
        }}
      />

      {payError && (
        <div className="flex items-start gap-2 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{payError}</p>
        </div>
      )}

      <div className="flex flex-col gap-3 mt-6">
        <button
          onClick={handleConfirm}
          disabled={!stripe || !elements || isConfirming}
          className="w-full bg-[var(--upwork-green)] hover:bg-[var(--upwork-green-dark)] disabled:opacity-50 text-white font-semibold py-3.5 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {isConfirming ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Confirming…
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              Pay ${amount} AUD
            </>
          )}
        </button>
        <button
          onClick={onCancel}
          disabled={isConfirming}
          className="w-full border border-gray-200 text-[var(--upwork-gray)] font-medium py-3 px-6 rounded-xl hover:border-gray-300 transition-colors"
        >
          Cancel Job
        </button>
      </div>
    </div>
  )
}



export function PostJobWizard({ searchQuery, preselectedCategory, existingJobId }: PostJobWizardProps) {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()

  const [isResuming, setIsResuming] = useState(!!existingJobId)
  const [resumeError, setResumeError] = useState('')

  const hasPreselectedCategory = VALID_CATEGORIES.includes(preselectedCategory as TradieCategory)
  const [currentStep, setCurrentStep] = useState(existingJobId ? 7 : (hasPreselectedCategory ? 2 : 1))
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
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [geocodeError, setGeocodeError] = useState('')
  const [preferredTime, setPreferredTime] = useState<PreferredTime | ''>('')
  const [scheduledFor, setScheduledFor] = useState('')  

  const [diagnosticQuestions, setDiagnosticQuestions] = useState<DiagnosticQuestion[]>([])
  const [diagnosticAnswers, setDiagnosticAnswers] = useState<Record<string, string>>({})
  const [isDiagnosticLoading, setIsDiagnosticLoading] = useState(false)

  const [classifySuggestion, setClassifySuggestion] = useState<{
    suggestedCategory: TradieCategory
    confidence: number
    reason: string
  } | null>(null)
  const [classifyDismissed, setClassifyDismissed] = useState(false)

  const [isUploading, setIsUploading] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [createdJob, setCreatedJob] = useState<Job | null>(null)
  const [createdQuote, setCreatedQuote] = useState<Quote | null>(null)

 
  useEffect(() => {
    if (currentStep !== 2 || !title || title.trim().length < 5) return
    const timer = setTimeout(async () => {
      try {
        const res = await api.post<{ suggestedCategory: TradieCategory; confidence: number; reason: string }>(
          '/api/jobs/classify',
          { title, description }
        )
        const { suggestedCategory, confidence } = res.data
        if (confidence > 0.8 && suggestedCategory && suggestedCategory !== category) {
          setClassifySuggestion(res.data)
          setClassifyDismissed(false)
        } else {
          setClassifySuggestion(null)
        }
      } catch {
      }
    }, 1500)
    return () => clearTimeout(timer)
  }, [title, description, currentStep]) // eslint-disable-line

  const [selectedTier, setSelectedTier] = useState<SkillLevel | null>('premium')

  const [isAccepting, setIsAccepting] = useState(false)
  const [acceptError, setAcceptError] = useState('')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [acceptedPrice, setAcceptedPrice] = useState<number>(0)
  const [isRescheduling, setIsRescheduling] = useState(false)
  const [stripeInstance, setStripeInstance] = useState<any>(null)

  const [savedCards, setSavedCards] = useState<{ id: string; brand: string; last4: string; expMonth: number; expYear: number }[]>([])
  const [selectedSavedCard, setSelectedSavedCard] = useState<string | null>(null)
  const [useNewCard, setUseNewCard] = useState(false)
  const [isPayingWithSaved, setIsPayingWithSaved] = useState(false)

  useEffect(() => {
    import('@stripe/stripe-js').then(({ loadStripe }) => {
      setStripeInstance(
        loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '')
      )
    })
  }, [])

  useEffect(() => {
    if (currentStep === 8) {
      api.get<{ cards: typeof savedCards }>('/api/payments/saved-cards')
        .then(res => {
          setSavedCards(res.data.cards)
          if (res.data.cards.length === 0) setUseNewCard(true)
        })
        .catch(() => setUseNewCard(true))
    }
  }, [currentStep])

  useEffect(() => {
    if (existingJobId) {
      const loadExistingJob = async () => {
        try {
          const res = await api.get<{ job: Job }>(`/api/jobs/${existingJobId}`)
          setCreatedJob(res.data.job)
          if (res.data.job.quote) {
            setCreatedQuote(res.data.job.quote as Quote)
          } else {
            throw new Error('No quote found for this job')
          }
          setCurrentStep(7) 
        } catch (err) {
          setResumeError('Could not process job quote.')
          setCurrentStep(1) 
        } finally {
          setIsResuming(false)
        }
      }
      loadExistingJob()
    }
  }, [existingJobId])


  const progress = Math.min((currentStep / totalSteps) * 100, 100)


  const handleCategorySelect = (cat: TradieCategory) => {
    setCategory(cat)
    setCurrentStep(2)
  }


  const handleDescriptionNext = () => {
    setCurrentStep(3)  
  }


  const handlePhotosNext = async () => {
    setCurrentStep(25)   
    setIsDiagnosticLoading(true)
    setDiagnosticAnswers({})  
    try {
      const res = await api.post<{ questions: DiagnosticQuestion[] }>('/api/jobs/preflight-questions', {
        title,
        description,
        category: category || 'other',
        imageUrls: images.map(img => img.url),  
      })
      setDiagnosticQuestions(res.data.questions || [])
    } catch {
      setDiagnosticQuestions([])
    } finally {
      setIsDiagnosticLoading(false)
    }
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


  const handleSubmitJob = useCallback(async (timeValue: PreferredTime, scheduledForOverride?: string) => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    setIsSubmitting(true)
    setSubmitError('')
    setCurrentStep(6) 

    try {
      const lat = coords?.lat ?? -37.8136
      const lng = coords?.lng ?? 144.9631

      
      const resolvedScheduledFor = scheduledForOverride ?? scheduledFor

      
      const readableDiagnosticAnswers = Object.entries(diagnosticAnswers).reduce<Record<string, string>>(
        (acc, [qId, answer]) => {
          const question = diagnosticQuestions.find(q => q.id === qId)
          acc[question ? question.text : qId] = answer
          return acc
        },
        {}
      )

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
        diagnosticAnswers: readableDiagnosticAnswers,   
        ...(timeValue === 'scheduled' && resolvedScheduledFor
          ? { scheduledFor: new Date(resolvedScheduledFor).toISOString() }
          : {}),
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
  }, [isAuthenticated, router, title, description, category, images, address, suburb, postcode, locationState, coords, scheduledFor, diagnosticAnswers])


  const handleAcceptQuote = useCallback(async (paymentMethodId?: string) => {
    if (!createdJob || !selectedTier) return
    setIsAccepting(true)
    setAcceptError('')

    try {
      const body: Record<string, unknown> = { tier: selectedTier }
      if (paymentMethodId) body.paymentMethodId = paymentMethodId

      const res = await api.post<{ job: Job; payment: unknown; clientSecret: string }>(
        `/api/jobs/${createdJob._id}/accept-quote`,
        body
      )

      const selectedOption = createdQuote?.options.find(o => o.tier === selectedTier)
      setAcceptedPrice(selectedOption?.suggestedFixedPrice ?? 0)

      if (paymentMethodId) {
        router.push('/dashboard')
        return
      }

      const secret = res.data.clientSecret
      if (!secret) throw new Error('No client secret returned from server')

      setClientSecret(secret)
      setCurrentStep(8)
    } catch (err: any) {
      if (err instanceof ApiError) {
        setAcceptError(err.message)
      } else {
        setAcceptError(err?.response?.data?.message || err?.message || 'Failed to accept quote. Please try again.')
      }
    } finally {
      setIsAccepting(false)
    }
  }, [createdJob, selectedTier, router])



  const handleCancelJob = useCallback(async () => {
    if (!createdJob) return
    try {
      await api.patch(`/api/jobs/${createdJob._id}/cancel`)
    } catch {
    }
    router.back()
  }, [createdJob, router])

  

  const handleRescheduleToScheduled = useCallback(async (isoTime: string, tier: SkillLevel | null, price: number) => {
    console.log('[Reschedule] Calling handleRescheduleToScheduled:', { isoTime, tier, price })
    if (!createdJob || !tier || price <= 0) {
      console.warn('[Reschedule] Missing requirements:', { createdJob: !!createdJob, tier, price })
      return
    }
    setIsRescheduling(true)
    setAcceptError('')

    try {
      const auISO = datetimeLocalToAuISO(
        isoTime,
        STATE_TZ[(createdJob.location as any)?.state?.toUpperCase?.()] ?? 'Australia/Sydney'
      )

      
      const acceptRes = await api.post<{ clientSecret: string }>(
        `/api/jobs/${createdJob._id}/accept-quote`,
        { tier, scheduledFor: auISO, priceOverride: price }
      )
      const secret = acceptRes.data.clientSecret
      if (!secret) throw new Error('No client secret returned.')

      setSelectedTier(tier)
      setAcceptedPrice(price) 
      setClientSecret(secret)
      setCurrentStep(8) 

    } catch (err) {
      setAcceptError(err instanceof ApiError ? err.message : 'Failed to book at standard rates. Please try again.')
    } finally {
      setIsRescheduling(false)
    }
  }, [createdJob])


  const handleBack = () => {
    if (currentStep === 25) {
      setCurrentStep(3)  
    } else if (currentStep === 4) {
      setCurrentStep(25) 
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    } else {
      router.back()
    }
  }

  const handleTimeSelect = (val: PreferredTime) => {
    setPreferredTime(val)
    if (val !== 'scheduled') {
      handleSubmitJob(val)
    }
  }

  const handleScheduledSubmit = () => {
    if (preferredTime === 'scheduled' && scheduledFor) {
      handleSubmitJob('scheduled')
    }
  }

  const handleLocationFieldChange = (field: string, value: string) => {
    switch (field) {
      case 'address': setAddress(value); break
      case 'suburb': setSuburb(value); break
      case 'postcode': setPostcode(value); break
      case 'state': setLocationState(value); break
    }
    setCoords(null)
    setGeocodeError('')
  }

  const handleAutocompleteFill = (fields: { address: string; suburb: string; postcode: string; state: string; lat: number; lng: number }) => {
    setAddress(fields.address)
    setSuburb(fields.suburb)
    setPostcode(fields.postcode)
    setLocationState(fields.state)
    setCoords({ lat: fields.lat, lng: fields.lng })
    setGeocodeError('')
  }


  const handleLocationNext = async () => {
    if (coords) {
      setCurrentStep(5)
      return
    }

    setIsGeocoding(true)
    setGeocodeError('')
    try {
      const streetForGeocode = address
        .replace(/^(unit|apt|apartment|suite|lot|flat|shop|level)\s*\d+[a-z]?\s*[,/\\-]?\s*/i, '')
        .replace(/^\d+\s*[/\\-]\s*/, '') 
        .trim()

      const q = encodeURIComponent(`${streetForGeocode}, ${suburb} ${postcode} ${locationState}, Australia`)
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&countrycodes=au`,
        { headers: { 'User-Agent': 'FixesApp/1.0' } }
      )
      const data = await res.json()

      if (data.length > 0) {
        setCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) })
      } else {
        const structured = new URLSearchParams({
          street: streetForGeocode,
          city: suburb,
          state: locationState,
          postalcode: postcode,
          country: 'Australia',
          format: 'json',
          limit: '1',
        })
        const res2 = await fetch(
          `https://nominatim.openstreetmap.org/search?${structured}`,
          { headers: { 'User-Agent': 'FixesApp/1.0' } }
        )
        const data2 = await res2.json()

        if (data2.length > 0) {
          setCoords({ lat: parseFloat(data2[0].lat), lng: parseFloat(data2[0].lon) })
        } else {
          console.warn('[Geocode] Address not found after 2 attempts')
          setGeocodeError('Could not locate this address — please double-check the details.')
          setIsGeocoding(false)
          return
        }
      }
    } catch {
      console.warn('[Geocode] Nominatim unreachable, using fallback coords')
    } finally {
      setIsGeocoding(false)
    }
    setCurrentStep(5)
  }


  if (isAuthenticated && user?.role === 'client' && !user?.isEmailVerified) {
    return (
      <div className="min-h-screen bg-[#f9faf9] flex items-center justify-center px-4">
        <div className="bg-white border border-amber-200 rounded-2xl p-8 sm:p-10 w-full max-w-md text-center shadow-sm">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-[var(--upwork-navy)] mb-2">Verify your email first</h1>
          <p className="text-sm text-gray-400 mb-6">
            You need to verify your email address before you can post a job.
            Check your inbox for the verification link.
          </p>
          <div className="space-y-3">
            <a
              href="/dashboard/profile"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-6 rounded-xl bg-[var(--upwork-green)] hover:bg-[var(--upwork-green-dark)] text-white text-sm font-medium transition-colors"
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

  if (isResuming) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-[#f2f7f2] to-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[var(--upwork-green)] animate-spin" />
          <p className="text-[var(--upwork-navy)] font-medium">Preparing secure checkout...</p>
        </div>
      </div>
    )
  }

  if (resumeError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-[#f2f7f2] to-white flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-sm text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <p className="text-[var(--upwork-navy)] font-semibold mb-2">{resumeError}</p>
          <button onClick={() => router.push('/dashboard/jobs')} className="text-[var(--upwork-green)] text-sm underline hover:opacity-80">Back to Dashboard</button>
        </div>
      </div>
    )
  }


  if (currentStep === 6) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-[#f2f7f2] to-white flex items-center justify-center px-4">
        <StepAnalyzing />
      </div>
    )
  }


  if (currentStep === 7 && createdQuote && createdJob) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-[#f2f7f2] to-white">
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
            selectedTier={selectedTier}
            onSelectTier={setSelectedTier}
            onAccept={() => handleAcceptQuote()}
            onCancel={handleCancelJob}
            onReschedule={handleRescheduleToScheduled}
            isAccepting={isAccepting}
            isRescheduling={isRescheduling}
            acceptError={acceptError}
          />
        </main>
      </div>
    )
  }


  if (currentStep === 8 && clientSecret && createdQuote) {
    const brandIcon = (brand: string) => {
      const b = brand.toLowerCase()
      if (b === 'visa') return '💳 Visa'
      if (b === 'mastercard') return '💳 Mastercard'
      if (b === 'amex') return '💳 Amex'
      return `💳 ${brand.charAt(0).toUpperCase() + brand.slice(1)}`
    }

    const handlePayWithSaved = async () => {
      if (!selectedSavedCard || !clientSecret) return
      setIsPayingWithSaved(true)
      setAcceptError('')
      try {
        const { loadStripe } = await import('@stripe/stripe-js')
        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '')
        if (!stripe) throw new Error('Stripe failed to load')

        const { error } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: selectedSavedCard,
        })

        if (error) {
          setAcceptError(error.message || 'Payment failed. Please try again.')
          setIsPayingWithSaved(false)
        } else {
          router.push('/dashboard')
        }
      } catch (err) {
        setAcceptError(err instanceof ApiError ? err.message : 'Payment failed. Please try again.')
        setIsPayingWithSaved(false)
      }
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-[#f2f7f2] to-white">
        <header className="border-b border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
            <Link href="/" className="inline-block">
              <Image src="/logo.svg" alt="Fixes" width={120} height={40} className="h-8 w-auto" priority />
            </Link>
          </div>
        </header>
        <main className="max-w-lg mx-auto px-4 lg:px-6 py-12">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-7 h-7 text-[var(--upwork-green)]" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--upwork-navy)] mb-1">Secure Payment</h1>
            <p className="text-[var(--upwork-gray)] text-sm">
              Your payment of{' '}
              <span className="font-semibold text-[var(--upwork-navy)]">
                ${acceptedPrice} AUD
              </span>{' '}
              is held in escrow until your job is completed.
            </p>
          </div>

          {savedCards.length > 0 && !useNewCard && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
              <h3 className="text-sm font-semibold text-[var(--upwork-navy)] mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[var(--upwork-green)]" />
                Saved Payment Methods
              </h3>
              <div className="space-y-2">
                {savedCards.map(card => (
                  <button
                    key={card.id}
                    onClick={() => setSelectedSavedCard(card.id)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
                      selectedSavedCard === card.id
                        ? 'border-[var(--upwork-green)] bg-green-50 ring-1 ring-[var(--upwork-green)]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      selectedSavedCard === card.id ? 'border-[var(--upwork-green)]' : 'border-gray-300'
                    }`}>
                      {selectedSavedCard === card.id && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[var(--upwork-green)]" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-[var(--upwork-navy)]">
                      {brandIcon(card.brand)} •••• {card.last4}
                    </span>
                    <span className="text-xs text-gray-400 ml-auto">
                      {String(card.expMonth).padStart(2, '0')}/{String(card.expYear).slice(-2)}
                    </span>
                  </button>
                ))}
              </div>

              {acceptError && (
                <div className="flex items-start gap-2 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{acceptError}</p>
                </div>
              )}

              <div className="flex flex-col gap-3 mt-5">
                <button
                  onClick={handlePayWithSaved}
                  disabled={!selectedSavedCard || isPayingWithSaved}
                  className="w-full bg-[var(--upwork-green)] hover:bg-[var(--upwork-green-dark)] disabled:opacity-50 text-white font-semibold py-3.5 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {isPayingWithSaved ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Confirming…</>
                  ) : (
                    <><ShieldCheck className="w-4 h-4" /> Pay ${acceptedPrice} AUD</>
                  )}
                </button>
                <button
                  onClick={() => { setUseNewCard(true); setSelectedSavedCard(null) }}
                  className="w-full border border-gray-200 text-[var(--upwork-gray)] font-medium py-3 px-6 rounded-xl hover:border-gray-300 transition-colors text-sm"
                >
                  Use a new card
                </button>
                <button
                  onClick={handleCancelJob}
                  disabled={isPayingWithSaved}
                  className="w-full text-gray-400 font-medium py-2 px-6 rounded-xl hover:text-gray-500 transition-colors text-sm"
                >
                  Cancel Job
                </button>
              </div>
            </div>
          )}

          {(useNewCard || savedCards.length === 0) && (
            <>
              {savedCards.length > 0 && (
                <button
                  onClick={() => { setUseNewCard(false); setSelectedSavedCard(null) }}
                  className="flex items-center gap-1.5 text-sm text-[var(--upwork-green)] font-medium mb-4 hover:opacity-80 transition-opacity"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to saved cards
                </button>
              )}
              <Elements
                stripe={stripeInstance}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: '#14a800',
                      colorBackground: '#ffffff',
                      borderRadius: '12px',
                      fontFamily: 'Inter, system-ui, sans-serif',
                    },
                  },
                }}
              >
                <PaymentForm
                  amount={acceptedPrice}
                  onSuccess={() => router.push('/dashboard')}
                  onCancel={handleCancelJob}
                />
              </Elements>
            </>
          )}

          <p className="text-center text-xs text-gray-400 mt-6 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Payments secured by Stripe — your card details are never stored on our servers
          </p>
        </main>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#f2f7f2] to-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-[var(--upwork-navy)] font-medium hover:opacity-70 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <span className="text-sm text-[var(--upwork-gray)]">
            Step {currentStep === 25 ? '3.5' : currentStep} of {totalSteps}
          </span>
        </div>
        <div className="h-1 bg-gray-200">
          <div
            className="h-full bg-[var(--upwork-green)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {submitError && (
        <div className="max-w-4xl mx-auto px-4 lg:px-6 mt-6">
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
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
            onNext={handleDescriptionNext}
            classifySuggestion={!classifyDismissed ? classifySuggestion : null}
            onSwitchCategory={(cat) => {
              setCategory(cat)
              setClassifySuggestion(null)
              setClassifyDismissed(true)
            }}
            onDismissClassify={() => setClassifyDismissed(true)}
          />
        )}

        {currentStep === 3 && (
          <StepPhotos
            images={images}
            onImagesChange={setImages}
            onNext={handlePhotosNext}
            isUploading={isUploading}
            onUploadFiles={handleUploadFiles}
          />
        )}

        {currentStep === 25 && (
          <StepDiagnosticQuestions
            questions={diagnosticQuestions}
            answers={diagnosticAnswers}
            onAnswerChange={(qId, ans) => setDiagnosticAnswers(prev => ({ ...prev, [qId]: ans }))}
            onNext={() => setCurrentStep(4)}
            isLoading={isDiagnosticLoading}
            categoryLabel={category ? CATEGORY_LABELS[category] : ''}
          />
        )}

        {currentStep === 4 && (
          <StepLocation
            address={address}
            suburb={suburb}
            postcode={postcode}
            state={locationState}
            onFieldChange={handleLocationFieldChange}
            onAutocompleteFill={handleAutocompleteFill}
            onNext={handleLocationNext}
            isGeocoding={isGeocoding}
            geocodeError={geocodeError}
          />
        )}

        {currentStep === 5 && (
          <StepTime
            selected={preferredTime}
            onSelect={handleTimeSelect}
            scheduledFor={scheduledFor}
            onScheduledForChange={setScheduledFor}
            onScheduledSubmit={handleScheduledSubmit}
          />
        )}
      </main>
    </div>
  )
}

