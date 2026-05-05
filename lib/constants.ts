import type { TradieCategory, JobCategory, JobStatus, DocumentType } from './types'

// ─── API Base URL ───────────────────────────────────────────────────────────────

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'


export const VALID_CATEGORIES: TradieCategory[] = [
  'electrical',
  'plumbing',
  'hvac',
  'plastering',
  'painting',
  'flooring',
  'carpentry',
  'emergency_make_safe',
  'general_labourer',
]

export const CATEGORY_LABELS: Record<JobCategory, string> = {
  electrical: 'Electrician',
  plumbing: 'Plumber',
  hvac: 'HVAC / Refrigeration',
  plastering: 'Plasterer',
  painting: 'Painter',
  flooring: 'Flooring',
  carpentry: 'Carpenter',
  emergency_make_safe: 'Emergency Make Safe',
  general_labourer: 'General Labourer',
  other: 'Other',
}


export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  analyzing: 'Analyzing',
  quoted: 'Quote Ready',
  payment_pending: 'Awaiting Payment',
  dispatching: 'Finding Tradie',
  no_tradie_found: 'No Tradie Found',
  accepted: 'Tradie Assigned',
  on_the_way: 'On The Way',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  disputed: 'Disputed',
  in_scope_review: 'In Scope Review',
}

export const JOB_STATUS_COLORS: Record<JobStatus, string> = {
  analyzing: 'bg-blue-100 text-blue-700',
  quoted: 'bg-amber-100 text-amber-700',
  payment_pending: 'bg-purple-100 text-purple-700',
  dispatching: 'bg-indigo-100 text-indigo-700',
  no_tradie_found: 'bg-red-100 text-red-700',
  accepted: 'bg-emerald-100 text-emerald-700',
  on_the_way: 'bg-cyan-100 text-cyan-700',
  in_progress: 'bg-orange-100 text-orange-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
  disputed: 'bg-red-100 text-red-700',
  in_scope_review: 'bg-orange-100 text-orange-700',
}


export const TIER_LABELS: Record<string, string> = {
  junior: 'Standard',
  senior: 'Premium',
  specialist: 'Expert',
}


export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  abn: 'ABN',
  insurance: 'Public Liability Insurance',
  white_card: 'White Card',
  a_grade_license: 'A-Grade Electrical License',
  rec_license: 'Electrical Contractor License (REC)',
  plumbing_registration: 'Plumbing Registration',
  plumbing_license: 'Plumbing License',
  mechanical_license: 'Plumbing License – Mechanical',
  electrical_license_hvac: 'Electrical License – HVAC',
  arctick_license: 'ARCtick License',
  carpentry_certificate: 'Carpentry Certificate',
  builders_license_cbu: 'Builders License (CBU)',
}


export const PREFERRED_TIME_LABELS: Record<string, string> = {
  now: 'Now',
  scheduled: 'Scheduled',
  '1-2weeks': 'In 1–2 Weeks',
  'no-rush': 'No Rush',
}


export const AUSTRALIAN_STATES = [
  { value: 'NSW', label: 'New South Wales' },
  { value: 'VIC', label: 'Victoria' },
  { value: 'QLD', label: 'Queensland' },
  { value: 'WA', label: 'Western Australia' },
  { value: 'SA', label: 'South Australia' },
  { value: 'TAS', label: 'Tasmania' },
  { value: 'ACT', label: 'Australian Capital Territory' },
  { value: 'NT', label: 'Northern Territory' },
] as const
