"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, ArrowRight, ChevronRight } from "lucide-react"

const categoryTags = [
  { label: "Electrician", value: "electrical" },
  { label: "Plumber", value: "plumbing" },
  { label: "Carpenter", value: "carpentry" },
  { label: "HVAC Technician", value: "hvac" },
]

export function HeroSection() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"hire" | "work">("hire")
  const [searchQuery, setSearchQuery] = useState("")
  
  const handleSearch = () => {
    if (searchQuery.trim() || activeTab === "hire") {
      router.push(`/post-job?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }
  
  const handleTagClick = (categoryValue: string) => {
    router.push(`/post-job?category=${categoryValue}`)
  }

  return (
    <section className="pt-4 pb-12 px-4 lg:px-6">
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-[#d4f7dc] rounded-full py-4 px-6 flex items-center justify-between">
          <p className="text-(--upwork-navy) font-medium text-sm md:text-base">
            Stop doing everything. Hire the top 1% of talent on Business Plus.
          </p>
          <a
            href="#"
            className="flex items-center gap-1 text-(--upwork-navy) font-semibold text-sm hover:underline whitespace-nowrap"
          >
            Get started
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden min-h-137.5 lg:min-h-150">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source
              src="https://www.pexels.com/download/video/8964929/"
              type="video/mp4"
            />
          </video>

          <div className="absolute inset-0 bg-black/40" />

          <div className="relative z-10 flex flex-col justify-center h-full min-h-137.5 lg:min-h-150 px-6 md:px-12 lg:px-16 py-12">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 text-balance">
                Hire the experts as your needs
              </h1>

              <p className="text-lg md:text-xl text-white/90 mb-10 max-w-xl text-pretty">
                Access skilled tradies ready to help you build and scale — without the full-time commitment
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <button
                  onClick={() => setActiveTab("hire")}
                  className={`px-8 py-3 rounded-full text-sm font-medium transition-all ${
                    activeTab === "hire"
                      ? "bg-white text-(--upwork-navy)"
                      : "bg-transparent text-white border border-white/50 hover:border-white"
                  }`}
                >
                  I want to hire
                </button>
                <button
                  onClick={() => router.push("/i-want-to-work")}
                  className="px-8 py-3 rounded-full text-sm font-medium transition-all bg-transparent text-white border border-white/50 hover:border-white"
                >
                  I want to work
                </button>
              </div>

              <div className="relative mb-8 max-w-xl">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    activeTab === "hire"
                      ? "Describe what you need to hire for..."
                      : "Describe the work you want to find..."
                  }
                  className="w-full pl-5 pr-32 py-4 text-base border-0 rounded-full bg-white text-(--upwork-navy) placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-(--upwork-green)"
                />
                <button 
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-(--upwork-navy) hover:bg-black text-white rounded-full px-5 py-2 flex items-center gap-2 font-medium transition-colors"
                >
                  <Search className="w-4 h-4" />
                  Search
                </button>
              </div>

              <div className="flex flex-wrap gap-3">
                {categoryTags.map((tag) => (
                  <button
                    key={tag.value}
                    onClick={() => handleTagClick(tag.value)}
                    className="flex items-center gap-1 px-4 py-2 bg-transparent border border-white/50 rounded-full text-sm font-medium text-white hover:bg-white/10 transition-colors"
                  >
                    {tag.label}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
