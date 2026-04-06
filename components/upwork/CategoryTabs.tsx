"use client"

import { useState } from "react"
import { 
  Hammer, 
  Zap, 
  Droplets, 
  Wrench, 
  Car,
  Flame,
  TreeDeciduous,
  Home,
  HardHat,
  Paintbrush,
  ChevronRight
} from "lucide-react"

const categories = [
  { id: "building", label: "Building & Construction", icon: Hammer },
  { id: "electrical", label: "Electrical", icon: Zap },
  { id: "plumbing", label: "Plumbing & Gas", icon: Droplets },
  { id: "mechanical", label: "Mechanical & Fitting", icon: Wrench },
  { id: "automotive", label: "Automotive", icon: Car },
  { id: "hvac", label: "HVAC & Refrigeration", icon: Flame },
  { id: "landscaping", label: "Landscaping & Civil", icon: TreeDeciduous },
  { id: "finishing", label: "Finishing Trades", icon: Home },
  { id: "metal", label: "Metal & Welding", icon: HardHat },
  { id: "painting", label: "Painting & Decorating", icon: Paintbrush },
]

export function CategoryTabs() {
  const [activeCategory, setActiveCategory] = useState("building")

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <h2 className="text-3xl lg:text-4xl font-bold text-[var(--upwork-navy)] text-center mb-12">
          Find tradies for every type of work
        </h2>

        {/* Category Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map((category) => {
            const Icon = category.icon
            const isActive = activeCategory === category.id
            
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${
                  isActive
                    ? "border-[var(--upwork-green)] bg-[var(--upwork-green)]/5"
                    : "border-gray-200 hover:border-[var(--upwork-green)]/50 bg-white"
                }`}
              >
                <div className={`p-3 rounded-lg ${
                  isActive
                    ? "bg-[var(--upwork-green)] text-white"
                    : "bg-[var(--upwork-light-gray)] text-[var(--upwork-gray)]"
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className={`text-sm font-medium text-center ${
                  isActive ? "text-[var(--upwork-green)]" : "text-[var(--upwork-navy)]"
                }`}>
                  {category.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* View More Link */}
        <div className="flex justify-center mt-8">
          <button className="flex items-center gap-2 text-[var(--upwork-green)] font-medium hover:underline">
            View all trade categories
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  )
}
