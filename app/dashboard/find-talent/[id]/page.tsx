// fixes-web/app/dashboard/find-talent/[id]/page.tsx

'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  Star,
  MapPin,
  ShieldCheck,
  Clock,
  User as UserIcon,
  Loader2,
  Briefcase,
  ChevronDown,
} from 'lucide-react'
import { api } from '@/lib/api'
import { CATEGORY_LABELS } from '@/lib/constants'
import type { TradieProfile, User, TradieCategory, Review, ReviewStats } from '@/lib/types'

interface ReviewsApiResponse {
  data: Review[]
  pagination: { total: number; page: number; limit: number; totalPages: number }
  stats?: ReviewStats
}

interface PublicProfileResponse {
  user: Pick<User, '_id' | 'fixId' | 'name' | 'avatarUrl' | 'role' | 'createdAt'>
  profile: TradieProfile
}

export default function DashboardTradieProfilePage() {
  const params = useParams()
  const tradieId = params.id as string

  const [user, setUser] = useState<PublicProfileResponse['user'] | null>(null)
  const [profile, setProfile] = useState<TradieProfile | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAllReviews, setShowAllReviews] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<PublicProfileResponse>(`/api/tradie/${tradieId}`, true)
        setUser(res.data.user)
        setProfile(res.data.profile)
      } catch {
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [tradieId])

  const fetchReviews = useCallback(async () => {
    try {
      const res = await api.getPaginated<Review>(`/api/reviews/tradie/${tradieId}?limit=50`)
      setReviews(res.data)
      const raw = res as ReviewsApiResponse
      if (raw.stats) setStats(raw.stats)
    } catch {
    }
  }, [tradieId])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 text-(--upwork-green) animate-spin" />
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4">
        <UserIcon className="w-12 h-12 text-gray-300 mb-4" />
        <p className="text-(--upwork-navy) font-medium mb-1">Tradie not found</p>
        <Link href="/dashboard/find-talent" className="text-sm text-(--upwork-green) hover:underline mt-2">
          Browse all tradies
        </Link>
      </div>
    )
  }

  const memberSince = new Date(user.createdAt).toLocaleDateString('en-AU', {
    month: 'long',
    year: 'numeric',
  })

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 5)

  return (
    <div>
      <Link
        href="/dashboard/find-talent"
        className="flex items-center gap-1.5 text-sm text-(--upwork-gray) hover:text-(--upwork-navy) transition-colors w-fit mb-5"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to tradies
      </Link>

      <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-(--upwork-green) flex items-center justify-center text-white overflow-hidden shrink-0">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.name}
                width={80}
                height={80}
                className="object-cover w-full h-full"
              />
            ) : (
              <UserIcon className="w-8 h-8 sm:w-10 sm:h-10" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-bold text-(--upwork-navy)">
                {user.name}
              </h1>
              {profile.isFullyVerified && (
                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </span>
              )}
              {profile.isOnline && (
                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Online
                </span>
              )}
            </div>

            <p className="text-xs text-gray-400 mb-3">{user.fixId}</p>

            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(profile.rating.average)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-(--upwork-navy)">
                {profile.rating.average.toFixed(1)}
              </span>
              <span className="text-xs text-gray-400">
                ({profile.rating.count} review{profile.rating.count !== 1 ? 's' : ''})
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {profile.categories.map((cat) => (
                <span
                  key={cat}
                  className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-(--upwork-green) font-medium"
                >
                  {CATEGORY_LABELS[cat as TradieCategory] || cat}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {profile.serviceRadiusKm}km service radius
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Member since {memberSince}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="w-3 h-3" />
                {Math.round(profile.jobSuccessRate)}% success rate
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-5 border-t border-gray-100">
          <Link
            href={`/post-job?category=${profile.categories[0] || ''}`}
            className="inline-flex items-center gap-2 bg-(--upwork-green) hover:bg-(--upwork-green-dark) text-white text-sm font-medium py-2.5 px-6 rounded-xl transition-colors"
          >
            Request This Tradie
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {profile.bio && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-(--upwork-navy) mb-3">About</h2>
              <p className="text-sm text-(--upwork-gray) leading-relaxed whitespace-pre-wrap">
                {profile.bio}
              </p>
            </div>
          )}

          {profile.skills.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-(--upwork-navy) mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 text-(--upwork-navy) font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-(--upwork-navy) mb-4">
              Reviews {stats && `(${stats.total})`}
            </h2>

            {reviews.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {displayedReviews.map((review) => {
                  const reviewer =
                    typeof review.reviewerId === 'object' ? review.reviewerId : null

                  return (
                    <div key={review._id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                          {reviewer && (reviewer as User).avatarUrl ? (
                            <Image
                              src={(reviewer as User).avatarUrl!}
                              alt={(reviewer as User).name}
                              width={28}
                              height={28}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                          )}
                        </div>
                        <span className="text-xs font-medium text-(--upwork-navy)">
                          {reviewer ? (reviewer as User).name : 'Client'}
                        </span>
                        <div className="flex items-center gap-0.5 ml-auto">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${
                                s <= review.rating
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-xs text-(--upwork-gray) leading-relaxed ml-9">
                          {review.comment}
                        </p>
                      )}
                      <p className="text-[10px] text-gray-400 ml-9 mt-1">
                        {new Date(review.createdAt).toLocaleDateString('en-AU', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  )
                })}

                {reviews.length > 5 && !showAllReviews && (
                  <button
                    onClick={() => setShowAllReviews(true)}
                    className="flex items-center gap-1 text-xs font-medium text-(--upwork-green) hover:underline mx-auto"
                  >
                    Show all {reviews.length} reviews
                    <ChevronDown className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {stats && stats.total > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-(--upwork-navy) mb-4">
                Rating Breakdown
              </h3>
              <div className="text-center mb-4">
                <p className="text-3xl font-bold text-(--upwork-navy)">
                  {stats.average.toFixed(1)}
                </p>
                <div className="flex justify-center gap-0.5 my-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= Math.round(stats.average)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-400">{stats.total} reviews</p>
              </div>

              <div className="space-y-1.5">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = stats.breakdown[star] || 0
                  const pct = stats.total > 0 ? (count / stats.total) * 100 : 0
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-3 text-right">{star}</span>
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-400 w-6 text-right">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-(--upwork-navy) mb-3">
              Verification
            </h3>
            <div className="space-y-2">
              {profile.documents.map((doc) => (
                <div key={doc.type} className="flex items-center justify-between text-xs">
                  <span className="text-(--upwork-gray)">{doc.label}</span>
                  {doc.isVerified ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </span>
                  ) : (
                    <span className="text-gray-400">Pending</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
