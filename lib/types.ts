// fixes-web/lib/types.ts

// ─── Base API Response Types ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  success: boolean
  message: string
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// ─── User ───────────────────────────────────────────────────────────────────────

export type UserRole = 'client' | 'tradie' | 'admin'

export interface User {
  _id: string
  name: string
  email: string
  phone?: string
  role: UserRole
  avatarUrl: string | null
  avatarPublicId: string | null
  isEmailVerified: boolean
  isActive: boolean
  stripeCustomerId: string | null
  fixId: string
  createdAt: string
  updatedAt: string
}

// ─── TradieProfile ──────────────────────────────────────────────────────────────

export type TradieCategory =
  | 'electrical'
  | 'plumbing'
  | 'hvac'
  | 'plastering'
  | 'painting'
  | 'flooring'
  | 'carpentry'
  | 'emergency_make_safe'
  | 'general_labourer'

export type DocumentType =
  | 'abn'
  | 'insurance'
  | 'white_card'
  | 'a_grade_license'
  | 'rec_license'
  | 'plumbing_registration'
  | 'plumbing_license'
  | 'mechanical_license'
  | 'electrical_license_hvac'
  | 'arctick_license'
  | 'carpentry_certificate'
  | 'builders_license_cbu'

export interface TradieDocument {
  type: DocumentType
  label: string
  url: string | null
  publicId: string | null
  isVerified: boolean
  uploadedAt: string | null
  verifiedAt: string | null
  verifiedBy: string | null
}

export interface TradieProfile {
  _id: string
  userId: string | User
  skills: string[]
  categories: TradieCategory[]
  bio: string
  rating: {
    average: number
    count: number
  }
  jobSuccessRate: number
  isOnline: boolean
  currentLocation: {
    lat: number | null
    lng: number | null
    updatedAt: string | null
  }
  location: {
    type: 'Point'
    coordinates: [number, number] // [lng, lat]
  }
  serviceRadiusKm: number
  stripeAccountId: string | null
  documents: TradieDocument[]
  isFullyVerified: boolean
  createdAt: string
  updatedAt: string
}

// ─── Job ────────────────────────────────────────────────────────────────────────

export type JobCategory = TradieCategory | 'other'

export type JobStatus =
  | 'analyzing'
  | 'quoted'
  | 'payment_pending'
  | 'dispatching'
  | 'no_tradie_found'
  | 'accepted'
  | 'on_the_way'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

export type PreferredTime = 'now' | '1-2weeks' | 'no-rush'

export interface JobImage {
  url: string
  publicId: string
  uploadedAt: string
}

export interface JobLocation {
  address: string
  suburb: string
  postcode: string
  state: string
  coordinates: {
    lat: number
    lng: number
  }
  geoLocation: {
    type: 'Point'
    coordinates: [number, number]
  }
}

export interface Job {
  _id: string
  jobCode: string
  clientId: string | User
  title: string
  description: string
  category: JobCategory
  images: JobImage[]
  location: JobLocation
  preferredTime: PreferredTime
  status: JobStatus
  quote: string | Quote | null
  assignedTradieId: string | User | null
  payment: string | null
  clientReview: string | Review | null
  tradieReview: string | Review | null
  createdAt: string
  updatedAt: string
}

// ─── Quote ──────────────────────────────────────────────────────────────────────

export type SkillLevel = 'junior' | 'senior' | 'specialist'
export type QuoteEngine = 'gemini' | 'gemini-custom-ml' | 'placeholder'

export interface Quote {
  _id: string
  jobId: string
  detectedCategory: string
  detectedSkillLevel: SkillLevel
  estimatedHours: {
    min: number
    max: number
  }
  price: {
    min: number
    max: number
    currency: string
  }
  suggestedFixedPrice: number
  engine: QuoteEngine
  confidence: number
  reasoning: string
  clientAccepted: boolean | null
  respondedAt: string | null
  createdAt: string
  updatedAt: string
}

// ─── Message ────────────────────────────────────────────────────────────────────

export type MessageType = 'text' | 'image' | 'system'

export interface Message {
  _id: string
  jobId: string
  senderId: string | User
  receiverId: string | null
  content: string
  type: MessageType
  imageUrl: string | null
  isRead: boolean
  readAt: string | null
  createdAt: string
  updatedAt: string
}

// ─── Review ─────────────────────────────────────────────────────────────────────

export type ReviewDirection = 'client_to_tradie' | 'tradie_to_client'

export interface Review {
  _id: string
  jobId: string
  reviewerId: string | User
  revieweeId: string | User
  direction: ReviewDirection
  rating: number
  comment: string
  createdAt: string
  updatedAt: string
}

export interface ReviewStats {
  average: number
  total: number
  breakdown: Record<number, number>
}

// ─── Auth Response Types ────────────────────────────────────────────────────────

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface RegisterClientResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface RegisterTradieResponse {
  accessToken: string
  refreshToken: string
  user: User
  profile: TradieProfile
  requiredDocuments: Array<{ type: DocumentType; label: string }>
}

export interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
}

export interface MeResponse {
  user: User
  profile: TradieProfile | null
}

// ─── Admin Types ────────────────────────────────────────────────────────────────

export interface AdminStats {
  users: { total: number; clients: number; tradies: number }
  jobs: { total: number; completed: number; cancelled: number; active: number }
  tradies: { pendingVerification: number; fullyVerified: number }
  revenue: {
    totalRevenue: number
    platformFee: number
    tradieEarnings: number
    completedPayments: number
  }
}

export interface AdminUserDetail {
  user: User
  profile: TradieProfile | null
  recentJobs: Job[]
}

export interface PendingTradieItem {
  userId: User
  categories: TradieCategory[]
  isFullyVerified: boolean
  rating: { average: number; count: number }
  docSummary: {
    total: number
    uploaded: number
    verified: number
    pending: number
  }
}

export interface TradieDocumentsResponse {
  tradie: User
  categories: TradieCategory[]
  isFullyVerified: boolean
  documents: TradieDocument[]
}

// ─── Upload Types ───────────────────────────────────────────────────────────────

export interface SignedUploadResponse {
  signature: string
  timestamp: number
  cloudName: string
  apiKey: string
  folder: string
  publicId: string
}

// ─── Socket Event Payloads ──────────────────────────────────────────────────────

export interface DispatchNewPayload {
  jobId: string
  jobCode: string
  title: string
  category: string
  price: { min: number; max: number }
  distance: number
  expiresAt: string
}

export interface JobStatusUpdatePayload {
  jobId: string
  status: JobStatus
  tradieId?: string
  tradieName?: string
}

export interface MessageNewPayload {
  _id: string
  jobId: string
  senderId: string
  content: string
  type: MessageType
  createdAt: string
}

// ─── Admin Types ────────────────────────────────────────────────────────────────

export interface AdminStats {
  users: { total: number; clients: number; tradies: number }
  jobs: { total: number; completed: number; cancelled: number; active: number }
  tradies: { pendingVerification: number; fullyVerified: number }
  revenue: {
    totalRevenue: number
    platformFee: number
    tradieEarnings: number
    completedPayments: number
  }
}

export interface AdminUserDetail {
  user: User
  profile: TradieProfile | null
  recentJobs: Job[]
}

// ─── Review Stats ───────────────────────────────────────────────────────────────

export interface ReviewStats {
  average: number
  total: number
  breakdown: Record<number, number>
}
