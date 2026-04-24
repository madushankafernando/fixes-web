import { MapPin, Star, ShieldCheck, MessageSquare, Plus, DollarSign, Clock, Calendar, Briefcase, Settings } from 'lucide-react'

// Layout Skeletons
export function SkeletonDashboardLayout() {
  return (
    <div className="flex h-screen bg-[#f9faf9] overflow-hidden">
      {/* Sidebar Skeleton */}
      <div className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 animate-pulse">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="w-24 h-8 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="flex-1 py-6 px-4 space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2">
              <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
              <div className="w-24 h-4 bg-gray-200 rounded-full"></div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="space-y-2 flex-1">
              <div className="w-20 h-4 bg-gray-200 rounded-full"></div>
              <div className="w-16 h-3 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header Skeleton */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 shrink-0 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="lg:hidden w-6 h-6 bg-gray-200 rounded-md"></div>
            <div className="w-32 h-6 bg-gray-200 rounded-full"></div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="w-24 h-8 bg-gray-200 rounded-lg hidden sm:block"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-full lg:hidden"></div>
          </div>
        </header>

        {/* Content Shimmer */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="w-48 h-8 bg-gray-200 rounded-lg animate-pulse mb-8"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-full h-32 bg-gray-100 rounded-xl animate-pulse"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

// Stats Cards
export function SkeletonStatCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-100"></div>
            <div className="space-y-2 flex-1">
              <div className="h-8 bg-gray-200 rounded-lg w-16"></div>
              <div className="h-4 bg-gray-100 rounded-full w-24"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Single Job Row
export function SkeletonJobRow() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 hover:bg-gray-50 border-b border-gray-100 last:border-0 animate-pulse">
      <div className="space-y-3 flex-1 mb-4 sm:mb-0">
        <div className="flex items-center gap-3">
          <div className="h-5 bg-gray-200 rounded-full w-48"></div>
          <div className="h-5 bg-gray-100 rounded-full w-20"></div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="h-4 bg-gray-100 rounded-full w-24"></div>
          <div className="h-4 bg-gray-100 rounded-full w-32"></div>
        </div>
      </div>
      <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between">
        <div className="h-5 bg-gray-200 rounded-lg w-16 mb-2"></div>
        <div className="h-8 bg-gray-100 rounded-lg w-28"></div>
      </div>
    </div>
  )
}

// Job List Container
export function SkeletonJobList() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
      {[...Array(5)].map((_, i) => (
        <SkeletonJobRow key={i} />
      ))}
    </div>
  )
}

// Chat Messages Skeleton
export function SkeletonChatMessages() {
  return (
    <div className="flex-1 p-4 space-y-4 animate-pulse">
      <div className="flex flex-col items-start gap-1 max-w-[85%]">
        <div className="px-4 py-3 bg-gray-100 rounded-2xl rounded-tl-sm w-48 h-12"></div>
        <div className="w-16 h-3 bg-gray-100 rounded-full"></div>
      </div>
      <div className="flex flex-col items-end gap-1 max-w-[85%] ml-auto">
        <div className="px-4 py-3 bg-green-50 rounded-2xl rounded-tr-sm w-64 h-16"></div>
        <div className="w-16 h-3 bg-gray-100 rounded-full"></div>
      </div>
      <div className="flex flex-col items-start gap-1 max-w-[85%]">
        <div className="px-4 py-3 bg-gray-100 rounded-2xl rounded-tl-sm w-56 h-12"></div>
        <div className="w-16 h-3 bg-gray-100 rounded-full"></div>
      </div>
    </div>
  )
}

// Tradie Card
export function SkeletonTradieCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm animate-pulse flex flex-col h-full">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-gray-200 shrink-0"></div>
        <div className="flex-1 space-y-2 py-1">
          <div className="h-5 bg-gray-200 rounded-full w-3/4"></div>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-gray-100 rounded-full"></div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="h-6 w-20 bg-gray-100 rounded-full"></div>
        <div className="h-6 w-24 bg-gray-100 rounded-full"></div>
      </div>
      <div className="mt-auto space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gray-100"></div>
          <div className="h-4 bg-gray-100 rounded-full w-32"></div>
        </div>
        <div className="w-full h-10 bg-gray-100 rounded-lg"></div>
      </div>
    </div>
  )
}

// Tradie Grid
export function SkeletonTradieGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <SkeletonTradieCard key={i} />
      ))}
    </div>
  )
}

// Job Detail Full Skeleton
export function SkeletonJobDetail() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8 animate-pulse">
      {/* Header + Back */}
      <div className="space-y-4">
        <div className="w-24 h-5 bg-gray-200 rounded-full"></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="w-3/4 max-w-sm h-8 bg-gray-200 rounded-lg"></div>
            <div className="flex gap-4">
              <div className="w-20 h-4 bg-gray-100 rounded-full"></div>
              <div className="w-32 h-4 bg-gray-100 rounded-full"></div>
            </div>
          </div>
          <div className="w-24 h-8 bg-gray-200 rounded-full shrink-0"></div>
        </div>
      </div>

      {/* Timeline Strip */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 overflow-hidden hidden sm:block">
        <div className="flex items-center justify-between">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex-1 flex items-center">
              <div className="flex flex-col items-center gap-2 relative z-10 w-full">
                <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                <div className="w-16 h-3 bg-gray-100 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="w-40 h-6 bg-gray-200 rounded-lg mb-4"></div>
            <div className="space-y-3">
              <div className="w-full h-4 bg-gray-100 rounded-full"></div>
              <div className="w-full h-4 bg-gray-100 rounded-full"></div>
              <div className="w-3/4 h-4 bg-gray-100 rounded-full"></div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="w-32 h-6 bg-gray-200 rounded-lg mb-4"></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="aspect-square bg-gray-100 rounded-xl"></div>
              <div className="aspect-square bg-gray-100 rounded-xl"></div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-100 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="w-24 h-4 bg-gray-200 rounded-full"></div>
                <div className="w-32 h-3 bg-gray-100 rounded-full"></div>
              </div>
            </div>
            <div className="w-full h-12 bg-gray-100 rounded-xl"></div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <div className="w-32 h-5 bg-gray-200 rounded-lg"></div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100"></div>
                <div className="space-y-2 flex-1 pt-1">
                  <div className="w-20 h-4 bg-gray-100 rounded-full"></div>
                  <div className="w-full h-3 bg-gray-50 rounded-full"></div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100"></div>
                <div className="space-y-2 flex-1 pt-1">
                  <div className="w-24 h-4 bg-gray-100 rounded-full"></div>
                  <div className="w-2/3 h-3 bg-gray-50 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Tradie Profile Full Skeleton
export function SkeletonTradieProfile() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8 animate-pulse">
      <div className="w-24 h-5 bg-gray-200 rounded-full mb-6"></div>

      {/* Header Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-200 shrink-0"></div>
          <div className="flex-1 space-y-4 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="w-48 h-8 bg-gray-200 rounded-lg"></div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-5 bg-gray-100 rounded-full"></div>
                  <div className="w-24 h-5 bg-gray-100 rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-24 h-8 bg-gray-100 rounded-full"></div>
              <div className="w-32 h-8 bg-gray-100 rounded-full"></div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
              <div className="w-32 h-10 bg-gray-200 rounded-xl"></div>
              <div className="w-40 h-10 bg-gray-100 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <div className="w-32 h-6 bg-gray-200 rounded-lg mb-2"></div>
            <div className="w-full h-4 bg-gray-100 rounded-full"></div>
            <div className="w-full h-4 bg-gray-100 rounded-full"></div>
            <div className="w-2/3 h-4 bg-gray-100 rounded-full"></div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
            <div className="w-32 h-6 bg-gray-200 rounded-lg"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-3 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                    <div className="w-24 h-4 bg-gray-100 rounded-full"></div>
                  </div>
                  <div className="w-16 h-4 bg-gray-100 rounded-full"></div>
                </div>
                <div className="w-full h-3 bg-gray-50 rounded-full"></div>
                <div className="w-3/4 h-3 bg-gray-50 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <div className="w-40 h-5 bg-gray-200 rounded-lg"></div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="w-24 h-4 bg-gray-100 rounded-full"></div>
                  <div className="w-12 h-4 bg-gray-100 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <div className="w-40 h-5 bg-gray-200 rounded-lg"></div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100"></div>
              <div className="w-32 h-4 bg-gray-100 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
