"use client"

import { useState } from "react"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const popularSkills = [
  "Carpenter",
  "Electrician",
  "Plumber",
  "Bricklayer",
  "Concreter",
  "Roofer",
  "Plasterer",
  "Tiler",
  "Painter",
  "Welder",
  "Diesel Mechanic",
  "HVAC Technician",
  "Landscaper",
  "Cabinet Maker",
  "Glazier",
  "Boilermaker",
]

export function SkillsSearch() {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [searchValue, setSearchValue] = useState("")

  const addSkill = (skill: string) => {
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill])
    }
  }

  const removeSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter((s) => s !== skill))
  }

  return (
    <section className="py-16 lg:py-24 bg-[var(--upwork-light-gray)]">
      <div className="max-w-4xl mx-auto px-4 lg:px-6">
        <h2 className="text-3xl lg:text-4xl font-bold text-[var(--upwork-navy)] text-center mb-4">
          Find tradies by relevant skills
        </h2>
        <p className="text-[var(--upwork-gray)] text-center mb-10">
          Search for trade skills or select from popular options below
        </p>

        {/* Search Input */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search trade skills"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full pl-12 pr-32 py-4 text-base border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-[var(--upwork-green)] focus:ring-2 focus:ring-[var(--upwork-green)]/20"
          />
          <Button className="absolute right-2 top-1/2 -translate-y-1/2 bg-[var(--upwork-green)] hover:bg-[var(--upwork-green-dark)] text-white rounded-lg px-6">
            Continue
          </Button>
        </div>

        {/* Selected Skills */}
        {selectedSkills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedSkills.map((skill) => (
              <span
                key={skill}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--upwork-green)] text-white rounded-full text-sm font-medium"
              >
                {skill}
                <button
                  onClick={() => removeSkill(skill)}
                  className="hover:bg-white/20 rounded-full p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Popular Skills */}
        <div className="flex flex-wrap justify-center gap-2">
          {popularSkills
            .filter((skill) => !selectedSkills.includes(skill))
            .map((skill) => (
              <button
                key={skill}
                onClick={() => addSkill(skill)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium text-[var(--upwork-navy)] hover:border-[var(--upwork-green)] hover:text-[var(--upwork-green)] transition-colors"
              >
                {skill}
              </button>
            ))}
        </div>
      </div>
    </section>
  )
}
