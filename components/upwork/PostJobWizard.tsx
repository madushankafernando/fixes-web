"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, Plus, Info, Star } from "lucide-react"
import Image from "next/image"

interface PostJobWizardProps {
  searchQuery: string
}

// Step components
function StepTimeline({ 
  selected, 
  onSelect, 
  searchQuery 
}: { 
  selected: string | null
  onSelect: (value: string) => void 
  searchQuery: string
}) {
  const options = ["Now", "In 1-2 weeks", "No Rush"]
  
  return (
    <div className="text-center">
      <h1 className="text-3xl md:text-4xl font-bold text-[var(--upwork-navy)] mb-4">
        How soon do you need help?
      </h1>
      <p className="text-gray-600 mb-10">
        We&apos;ll prioritize {searchQuery || "tradie"} pros that can start immediately, if needed.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onSelect(option)}
            className={`px-10 py-3 rounded-full border text-sm font-medium transition-all ${
              selected === option
                ? "bg-[var(--upwork-navy)] text-white border-[var(--upwork-navy)]"
                : "bg-white text-[var(--upwork-navy)] border-gray-300 hover:border-[var(--upwork-navy)]"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

function StepLocation({ 
  selected, 
  onSelect 
}: { 
  selected: string | null
  onSelect: (value: string) => void 
}) {
  const options = ["Australia only", "Near my timezone", "Anywhere in the world"]
  
  return (
    <div className="text-center">
      <h1 className="text-3xl md:text-4xl font-bold text-[var(--upwork-navy)] mb-4">
        Does tradie location matter?
      </h1>
      <p className="text-gray-600 mb-10">
        We&apos;ll filter from thousands of tradies across Australia.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onSelect(option)}
            className={`px-8 py-3 rounded-full border text-sm font-medium transition-all ${
              selected === option
                ? "bg-[var(--upwork-navy)] text-white border-[var(--upwork-navy)]"
                : "bg-white text-[var(--upwork-navy)] border-gray-300 hover:border-[var(--upwork-navy)]"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

function StepBudget({ 
  budgetType, 
  setBudgetType,
  hourlyRate,
  setHourlyRate,
  onNext 
}: { 
  budgetType: "hourly" | "fixed"
  setBudgetType: (type: "hourly" | "fixed") => void
  hourlyRate: number
  setHourlyRate: (rate: number) => void
  onNext: () => void
}) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold text-[var(--upwork-navy)] mb-4">
        Do you have a budget in mind?
      </h1>
      <p className="text-gray-600 mb-8">
        This helps prioritize tradies within your range.
      </p>
      
      {/* Toggle */}
      <div className="inline-flex rounded-full border border-gray-300 p-1 mb-10">
        <button
          onClick={() => setBudgetType("hourly")}
          className={`px-8 py-2 rounded-full text-sm font-medium transition-all ${
            budgetType === "hourly"
              ? "bg-white shadow-sm text-[var(--upwork-navy)]"
              : "text-gray-500"
          }`}
        >
          Hourly
        </button>
        <button
          onClick={() => setBudgetType("fixed")}
          className={`px-8 py-2 rounded-full text-sm font-medium transition-all ${
            budgetType === "fixed"
              ? "bg-white shadow-sm text-[var(--upwork-navy)]"
              : "text-gray-500"
          }`}
        >
          Fixed price
        </button>
      </div>
      
      {/* Bell Curve Visualization */}
      <div className="relative mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-2 px-4">
          <span></span>
          <span className="flex items-center gap-1">
            Typical <Info className="w-3 h-3" />
          </span>
          <span></span>
        </div>
        
        {/* Curve SVG */}
        <div className="relative h-24 mb-2">
          <svg viewBox="0 0 400 100" className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="curveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e8f4fd" />
                <stop offset="100%" stopColor="#f8fcff" />
              </linearGradient>
            </defs>
            <path
              d="M 0,100 Q 100,100 150,50 Q 200,0 250,50 Q 300,100 400,100 Z"
              fill="url(#curveGradient)"
              stroke="#d1e3ed"
              strokeWidth="1"
            />
          </svg>
          <div className="absolute left-4 bottom-2 text-sm text-gray-400">Affordable</div>
          <div className="absolute right-4 bottom-2 text-sm text-gray-400">Expert</div>
          
          {/* Rate tooltip */}
          <div 
            className="absolute bg-white border border-gray-200 rounded-lg px-3 py-1 text-sm font-medium shadow-sm"
            style={{ 
              left: `${((hourlyRate - 20) / 180) * 100}%`, 
              top: '30%',
              transform: 'translateX(-50%)'
            }}
          >
            ${hourlyRate}/hour
          </div>
        </div>
        
        {/* Slider */}
        <input
          type="range"
          min="20"
          max="200"
          value={hourlyRate}
          onChange={(e) => setHourlyRate(Number(e.target.value))}
          className="w-full h-2 bg-[var(--upwork-navy)] rounded-lg appearance-none cursor-pointer accent-[var(--upwork-navy)]"
          style={{
            background: `linear-gradient(to right, #001e00 0%, #001e00 ${((hourlyRate - 20) / 180) * 100}%, #e5e7eb ${((hourlyRate - 20) / 180) * 100}%, #e5e7eb 100%)`
          }}
        />
      </div>
      
      <button
        onClick={onNext}
        className="w-full max-w-sm mx-auto bg-[var(--upwork-green)] hover:bg-[var(--upwork-green-dark)] text-white font-medium py-3 px-6 rounded-lg transition-colors"
      >
        Next
      </button>
    </div>
  )
}

function StepDetails({ 
  details, 
  setDetails,
  searchQuery,
  onNext 
}: { 
  details: string
  setDetails: (details: string) => void
  searchQuery: string
  onNext: () => void
}) {
  const [showExample, setShowExample] = useState(false)
  
  return (
    <div className="text-center max-w-2xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold text-[var(--upwork-navy)] mb-4">
        Any job details to share?
      </h1>
      <p className="text-gray-600 mb-8">
        We&apos;ll search for tradies who have relevant experience.
      </p>
      
      <textarea
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        placeholder={searchQuery || "Describe your job requirements..."}
        className="w-full h-32 p-4 border border-gray-300 rounded-xl text-[var(--upwork-navy)] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--upwork-green)] focus:border-transparent resize-none mb-4"
      />
      
      <button
        onClick={() => setShowExample(!showExample)}
        className="flex items-center justify-between w-full py-3 text-[var(--upwork-navy)] font-medium border-b border-gray-200"
      >
        <span>See an example</span>
        <svg 
          className={`w-5 h-5 transition-transform ${showExample ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {showExample && (
        <div className="mt-4 p-4 bg-gray-50 rounded-xl text-left text-sm text-gray-600">
          <p>Looking for an experienced electrician to rewire a 3-bedroom house. The job includes:</p>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>Full rewiring of all rooms</li>
            <li>New switchboard installation</li>
            <li>LED downlight installation throughout</li>
            <li>Safety inspection and certification</li>
          </ul>
        </div>
      )}
      
      <button
        onClick={onNext}
        className="w-full max-w-sm mx-auto mt-8 bg-[var(--upwork-green)] hover:bg-[var(--upwork-green-dark)] text-white font-medium py-3 px-6 rounded-lg transition-colors"
      >
        Next
      </button>
    </div>
  )
}

function StepSkills({ 
  selectedSkills, 
  toggleSkill,
  searchQuery,
  onFinish 
}: { 
  selectedSkills: string[]
  toggleSkill: (skill: string) => void
  searchQuery: string
  onFinish: () => void
}) {
  const suggestedSkills = [
    { name: `${searchQuery} Tools`, selected: true },
    { name: `${searchQuery} Skills`, selected: true },
    { name: `${searchQuery} Deliverables`, selected: true },
    { name: "Licensed Tradie", selected: false },
    { name: "Emergency Services", selected: false },
    { name: "Residential Work", selected: false },
    { name: "Commercial Work", selected: false },
    { name: "Renovation Expert", selected: false },
    { name: "New Construction", selected: false },
    { name: "Safety Certified", selected: false },
  ]
  
  return (
    <div className="text-center max-w-2xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold text-[var(--upwork-navy)] mb-4">
        Any specific skills required?
      </h1>
      <p className="text-gray-600 mb-10">
        You can add more custom skills later, if you decide to post your job.
      </p>
      
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {suggestedSkills.map((skill) => {
          const isSelected = selectedSkills.includes(skill.name) || skill.selected
          return (
            <button
              key={skill.name}
              onClick={() => toggleSkill(skill.name)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                isSelected
                  ? "bg-[var(--upwork-navy)] text-white border-[var(--upwork-navy)]"
                  : "bg-white text-[var(--upwork-navy)] border-gray-300 hover:border-[var(--upwork-navy)]"
              }`}
            >
              {skill.name}
              {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
          )
        })}
      </div>
      
      <button
        onClick={onFinish}
        className="w-full max-w-sm mx-auto bg-[var(--upwork-green)] hover:bg-[var(--upwork-green-dark)] text-white font-medium py-3 px-6 rounded-lg transition-colors"
      >
        Finish and view tradies
      </button>
    </div>
  )
}

function ResultsPage({ 
  searchQuery,
  onContinue,
  onExit
}: { 
  searchQuery: string
  onContinue: () => void
  onExit: () => void
}) {
  const tradies = [
    { name: "James T.", image: "https://randomuser.me/api/portraits/men/32.jpg", online: true },
    { name: "Michael R.", image: "https://randomuser.me/api/portraits/men/45.jpg", online: false },
    { name: "Sarah K.", image: "https://randomuser.me/api/portraits/women/44.jpg", online: true },
    { name: "David M.", image: "https://randomuser.me/api/portraits/men/22.jpg", online: false },
  ]
  
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Decorative dots pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 right-1/4 h-40">
          {[...Array(60)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: Math.random() * 8 + 4 + 'px',
                height: Math.random() * 8 + 4 + 'px',
                backgroundColor: Math.random() > 0.5 ? '#c5f542' : '#001e00',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                opacity: Math.random() * 0.8 + 0.2
              }}
            />
          ))}
        </div>
        <div className="absolute bottom-0 left-0 right-1/2 h-40">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: Math.random() * 8 + 4 + 'px',
                height: Math.random() * 8 + 4 + 'px',
                backgroundColor: Math.random() > 0.5 ? '#c5f542' : '#001e00',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                opacity: Math.random() * 0.8 + 0.2
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Exit button */}
      <div className="absolute top-6 left-6">
        <button
          onClick={onExit}
          className="px-6 py-2 border border-gray-300 rounded-full text-sm font-medium text-[var(--upwork-green)] hover:border-[var(--upwork-green)] transition-colors"
        >
          Exit
        </button>
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Text content */}
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--upwork-navy)] leading-tight mb-6">
              We found thousands of top-rated {searchQuery || "tradie"} pros
            </h1>
            
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-lg font-semibold text-[var(--upwork-navy)] mb-1">
              Rated 4.8 / 5 on avg.
            </p>
            <p className="text-gray-500 mb-8">From over 1k+ past clients</p>
            
            <button
              onClick={onContinue}
              className="w-full max-w-xs bg-[var(--upwork-green)] hover:bg-[var(--upwork-green-dark)] text-white font-medium py-3 px-6 rounded-lg transition-colors mb-6"
            >
              Continue
            </button>
            
            <div className="flex gap-6 mb-8">
              <a href="#" className="text-[var(--upwork-green)] font-medium hover:underline">
                How hiring works
              </a>
              <a href="#" className="text-[var(--upwork-green)] font-medium hover:underline">
                Platform pricing
              </a>
            </div>
            
            <p className="text-sm text-gray-500 flex items-center gap-1">
              We use AI to power this experience. <Info className="w-4 h-4" />
            </p>
          </div>
          
          {/* Right side - Tradie cards */}
          <div className="grid grid-cols-2 gap-4">
            {tradies.map((tradie, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col items-center"
              >
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-blue-100">
                    <Image
                      src={tradie.image}
                      alt={tradie.name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Online indicator */}
                  <div className={`absolute top-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                    tradie.online ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                  {/* Badge */}
                  <div className="absolute bottom-0 right-0 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center border-2 border-white">
                    <Star className="w-4 h-4 text-white fill-white" />
                  </div>
                </div>
                <p className="font-semibold text-[var(--upwork-navy)]">{tradie.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function PostJobWizard({ searchQuery }: PostJobWizardProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [timeline, setTimeline] = useState<string | null>(null)
  const [location, setLocation] = useState<string | null>(null)
  const [budgetType, setBudgetType] = useState<"hourly" | "fixed">("hourly")
  const [hourlyRate, setHourlyRate] = useState(48)
  const [details, setDetails] = useState(searchQuery)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  
  const totalSteps = 5
  const progress = (currentStep / totalSteps) * 100
  
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    } else {
      router.push("/")
    }
  }
  
  const handleSkip = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      setCurrentStep(6) // Go to results
    }
  }
  
  const handleTimelineSelect = (value: string) => {
    setTimeline(value)
    setCurrentStep(2)
  }
  
  const handleLocationSelect = (value: string) => {
    setLocation(value)
    setCurrentStep(3)
  }
  
  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    )
  }
  
  // Results page
  if (currentStep === 6) {
    return (
      <ResultsPage 
        searchQuery={searchQuery}
        onContinue={() => router.push("/")}
        onExit={() => router.push("/")}
      />
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#f2f7f2] to-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-[var(--upwork-navy)] font-medium hover:opacity-70 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          
          {currentStep < totalSteps && (
            <button
              onClick={handleSkip}
              className="px-6 py-2 border border-gray-300 rounded-full text-sm font-medium text-[var(--upwork-navy)] hover:border-[var(--upwork-navy)] transition-colors"
            >
              Skip
            </button>
          )}
        </div>
        
        {/* Progress bar */}
        <div className="h-1 bg-gray-200">
          <div 
            className="h-full bg-[var(--upwork-navy)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>
      
      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-20">
        {currentStep === 1 && (
          <StepTimeline 
            selected={timeline}
            onSelect={handleTimelineSelect}
            searchQuery={searchQuery}
          />
        )}
        
        {currentStep === 2 && (
          <StepLocation 
            selected={location}
            onSelect={handleLocationSelect}
          />
        )}
        
        {currentStep === 3 && (
          <StepBudget 
            budgetType={budgetType}
            setBudgetType={setBudgetType}
            hourlyRate={hourlyRate}
            setHourlyRate={setHourlyRate}
            onNext={() => setCurrentStep(4)}
          />
        )}
        
        {currentStep === 4 && (
          <StepDetails 
            details={details}
            setDetails={setDetails}
            searchQuery={searchQuery}
            onNext={() => setCurrentStep(5)}
          />
        )}
        
        {currentStep === 5 && (
          <StepSkills 
            selectedSkills={selectedSkills}
            toggleSkill={toggleSkill}
            searchQuery={searchQuery}
            onFinish={() => setCurrentStep(6)}
          />
        )}
      </main>
    </div>
  )
}
