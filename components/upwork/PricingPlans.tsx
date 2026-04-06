import { Check, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const basicFeatures = [
  "Marketplace access - skilled freelancers across thousands of skills",
  "Talent profiles - portfolios, ratings, and work history",
  "Hiring tools - proposals and terms in one place",
  "Project workspace - messages, files, and status in one view",
  "Protected payments - escrow-backed pay tied to approved work",
]

const businessFeatures = [
  "Curated shortlists - we surface top matches so you can hire faster",
  "Expert-Vetted talent - access to the top 1% of Upwork freelancers",
  "Team workspace - shared hiring with roles and permissions",
  "Centralized billing - keep team spend in one place",
  "Priority support - faster help to keep projects moving",
]

export function PricingPlans() {
  return (
    <section className="py-16 lg:py-24 bg-[var(--upwork-light-gray)]">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <h2 className="text-3xl lg:text-4xl font-bold text-[var(--upwork-navy)] text-center mb-4">
          Choose how you want to hire
        </h2>
        <p className="text-[var(--upwork-gray)] text-center mb-12">
          Flexible options designed to fit your hiring needs
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Basic Plan */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200">
            <h3 className="text-2xl font-bold text-[var(--upwork-navy)] mb-2">
              Basic
            </h3>
            <p className="text-sm text-[var(--upwork-gray)] mb-6">
              For occasional hiring and one-off projects
            </p>
            
            <p className="text-[var(--upwork-navy)] mb-6">
              Hire skilled freelancers fast – without long-term commitments or extra overhead.
            </p>

            <div className="border-t border-gray-200 pt-6 mb-6">
              <p className="text-sm font-semibold text-[var(--upwork-navy)] mb-4">
                Basic includes:
              </p>
              <ul className="space-y-3">
                {basicFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[var(--upwork-green)] shrink-0 mt-0.5" />
                    <span className="text-sm text-[var(--upwork-gray)]">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              variant="outline"
              className="w-full border-[var(--upwork-green)] text-[var(--upwork-green)] hover:bg-[var(--upwork-green)] hover:text-white rounded-full py-6"
            >
              Get started for free
            </Button>
          </div>

          {/* Business Plus Plan */}
          <div className="bg-white rounded-2xl p-8 border-2 border-[var(--upwork-green)] relative">
            {/* Popular Badge */}
            <span className="absolute -top-3 left-8 px-3 py-1 bg-[var(--upwork-green)] text-white text-xs font-semibold rounded-full">
              Popular
            </span>

            <h3 className="text-2xl font-bold text-[var(--upwork-navy)] mb-2">
              Business Plus
            </h3>
            <p className="text-sm text-[var(--upwork-gray)] mb-6">
              For ongoing work, repeat hiring, and teams
            </p>
            
            <p className="text-[var(--upwork-navy)] mb-6">
              Premium tools, vetted talent, and team controls for running freelance work at scale.
            </p>

            <div className="border-t border-gray-200 pt-6 mb-6">
              <p className="text-sm font-semibold text-[var(--upwork-navy)] mb-4">
                Everything in Basic, plus:
              </p>
              <ul className="space-y-3">
                {businessFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[var(--upwork-green)] shrink-0 mt-0.5" />
                    <span className="text-sm text-[var(--upwork-gray)]">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button className="w-full bg-[var(--upwork-green)] hover:bg-[var(--upwork-green-dark)] text-white rounded-full py-6">
              Get started for free
            </Button>
          </div>
        </div>

        {/* Compare Features Link */}
        <div className="flex justify-center mt-8">
          <button className="flex items-center gap-2 text-[var(--upwork-green)] font-medium hover:underline">
            Compare features across plans
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  )
}
