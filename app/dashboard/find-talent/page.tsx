'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Star, MapPin, Filter, User as UserIcon, Loader2, ChevronRight } from 'lucide-react'
import { api } from '@/lib/api'
import { VALID_CATEGORIES, CATEGORY_LABELS } from '@/lib/constants'
import type { TradieProfile, TradieCategory, User } from '@/lib/types'

interface TradieSearchResult extends Omit<TradieProfile, 'userId'> {
  userId: Pick<User, '_id' | 'name' | 'avatarUrl' | 'fixId' | 'createdAt'>
}

interface SearchResponse {
  tradies: TradieSearchResult[]
  total: number
  page: number
  limit: number
}

export default function DashboardFindTalentPage() {
  const searchParams = useSearchParams()
  const preCategory = searchParams.get('category') as TradieCategory | null

  const [tradies, setTradies] = useState<TradieSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [category, setCategory] = useState<TradieCategory | 'all'>(preCategory || 'all')

  const fetchTradies = useCallback(async () => {
    setIsLoading(true)
    try {
      const qs = new URLSearchParams()
      if (category !== 'all') qs.set('category', category)
      qs.set('page', String(page))
      qs.set('limit', '20')

      const res = await api.get<SearchResponse>(`/api/tradie/search?${qs.toString()}`, true)
      setTradies(res.data.tradies)
      setTotal(res.data.total)
    } catch {
      // Silent
    } finally {
      setIsLoading(false)
    }
  }, [category, page])

  useEffect(() => {
    fetchTradies()
  }, [fetchTradies])

  const handleCategoryChange = (cat: TradieCategory | 'all') => {
    setCategory(cat)
    setPage(1)
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-(--upwork-navy)">Find Tradies</h1>
        <p className="text-sm text-gray-400 mt-0.5">Browse verified professionals for your next project</p>
      </div>

      {/* Category filter pills */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-gray-400 shrink-0" />
        <button
          onClick={() => handleCategoryChange('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
            category === 'all'
              ? 'bg-(--upwork-navy) text-white'
              : 'bg-white text-(--upwork-gray) border border-gray-200 hover:bg-gray-50'
          }`}
        >
          All Categories
        </button>
        {VALID_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              category === cat
                ? 'bg-(--upwork-green) text-white'
                : 'bg-white text-(--upwork-gray) border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Results count */}
      {!isLoading && (
        <p className="text-xs text-gray-400 mb-4">
          {total} tradie{total !== 1 ? 's' : ''} found
          {category !== 'all' && ` in ${CATEGORY_LABELS[category]}`}
        </p>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-(--upwork-green) animate-spin" />
        </div>
      ) : tradies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-(--upwork-navy) font-medium mb-1">No tradies found</p>
          <p className="text-sm text-gray-400 text-center">
            {category !== 'all'
              ? 'Try a different category or check back later.'
              : 'No verified tradies are currently online.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tradies.map((tradie) => {
            const user = tradie.userId
            return (
              <Link
                key={tradie._id}
                href={`/dashboard/find-talent/${user.fixId}`}
                className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 hover:shadow-md hover:border-gray-300 transition-all group"
              >
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-(--upwork-green) flex items-center justify-center text-white overflow-hidden shrink-0">
                    {user.avatarUrl ? (
                      <Image
                        src={user.avatarUrl}
                        alt={user.name}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <UserIcon className="w-6 h-6" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-(--upwork-navy) truncate group-hover:text-(--upwork-green) transition-colors">
                        {user.name}
                      </h3>
                      {tradie.isOnline && (
                        <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" title="Online" />
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400">{user.fixId}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-(--upwork-green) transition-colors shrink-0 mt-1" />
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1.5 mb-3">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= Math.round(tradie.rating.average)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-(--upwork-navy)">
                    {tradie.rating.average.toFixed(1)}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    ({tradie.rating.count} review{tradie.rating.count !== 1 ? 's' : ''})
                  </span>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {tradie.categories.slice(0, 3).map((cat) => (
                    <span
                      key={cat}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-(--upwork-green) font-medium"
                    >
                      {CATEGORY_LABELS[cat] || cat}
                    </span>
                  ))}
                  {tradie.categories.length > 3 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                      +{tradie.categories.length - 3} more
                    </span>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    <MapPin className="w-3 h-3" />
                    <span>{tradie.serviceRadiusKm}km radius</span>
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {Math.round(tradie.jobSuccessRate)}% success
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm text-(--upwork-navy) disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-400">
            Page {page} of {Math.ceil(total / 20)}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(total / 20)}
            className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm text-(--upwork-navy) disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
