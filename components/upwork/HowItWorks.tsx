"use client"

import { useState } from "react"
import { FileText, Users, CreditCard, UserCircle, Send, DollarSign, ChevronRight } from "lucide-react"

const hiringSteps = [
  {
    icon: FileText,
    title: "Posting jobs is always free",
    description: "Generate a job post with AI or create your own and filter talent matches.",
    cta: "Create a job",
  },
  {
    icon: Users,
    title: "Get proposals and hire",
    description: "Screen, interview, or book a consult with an expert before hiring.",
    cta: "Explore experts",
  },
  {
    icon: CreditCard,
    title: "Pay when work is done",
    description: "Release payments after approving work, by milestone or upon project completion.",
    cta: "View pricing",
  },
]

const workingSteps = [
  {
    icon: UserCircle,
    title: "Find clients and remote jobs",
    description: "Create your profile to highlight your best work and attract top clients.",
    cta: "Create a profile",
  },
  {
    icon: Send,
    title: "Submit proposals for work",
    description: "Negotiate rates for the projects you want or reply to invites from clients.",
    cta: "Search jobs",
  },
  {
    icon: DollarSign,
    title: "Get paid as you deliver work",
    description: "Land a contract, do the work you love, and get paid on time.",
    cta: "Estimate earnings",
  },
]

export function HowItWorks() {
  const [activeTab, setActiveTab] = useState<"hiring" | "working">("hiring")
  const steps = activeTab === "hiring" ? hiringSteps : workingSteps

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <h2 className="text-3xl lg:text-4xl font-bold text-(--upwork-navy) text-center mb-8">
          How it works
        </h2>

        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-(--upwork-light-gray) rounded-full p-1">
            <button
              onClick={() => setActiveTab("hiring")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === "hiring"
                  ? "bg-(--upwork-navy) text-white"
                  : "text-(--upwork-navy) hover:text-(--upwork-green)"
              }`}
            >
              For hiring
            </button>
            <button
              onClick={() => setActiveTab("working")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === "working"
                  ? "bg-(--upwork-navy) text-white"
                  : "text-(--upwork-navy) hover:text-(--upwork-green)"
              }`}
            >
              For finding work
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-(--upwork-border)" />
                )}
                
                <div className="relative flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-full bg-(--upwork-light-gray) flex items-center justify-center">
                      <Icon className="w-10 h-10 text-(--upwork-green)" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-8 h-8 bg-(--upwork-navy) text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-(--upwork-navy) mb-3">
                    {step.title}
                  </h3>
                  <p className="text-(--upwork-gray) mb-4 max-w-xs">
                    {step.description}
                  </p>
                  <button className="flex items-center gap-1 text-(--upwork-green) font-medium hover:underline">
                    {step.cta}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-16 p-8 bg-(--upwork-light-gray) rounded-2xl text-center">
          <h3 className="text-xl font-bold text-(--upwork-navy) mb-2">
            Get insights into freelancer pricing
          </h3>
          <p className="text-(--upwork-gray) mb-6">
            {"We'll calculate the average cost for freelancers with the skills you need."}
          </p>
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-(--upwork-green) hover:bg-(--upwork-green-dark) text-white font-medium rounded-full transition-colors">
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  )
}
