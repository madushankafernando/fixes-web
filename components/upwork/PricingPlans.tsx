import { Check, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const homeOwnerFeatures = [
  "Post jobs for free — no upfront cost",
  "Get matched with nearby, top-rated tradies",
  "View tradie profiles, ratings and reviews",
  "Message and book directly in the app",
  "Secure payment — only released when job is approved",
]

const businessFeatures = [
  "Unlimited job postings across multiple sites",
  "Priority matching with vetted, experienced tradies",
  "Team access — manage hiring with roles and permissions",
  "Centralised billing — track all job spend in one place",
  "Dedicated account support for your business",
]

export function PricingPlans() {
  return (
    <section className="py-16 lg:py-24 bg-[#f5f7f2]">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <h2 className="text-3xl lg:text-4xl font-bold text-(--upwork-navy) text-center mb-2">
          Choose how you want to hire
        </h2>
        <p className="text-gray-500 text-center mb-12">
          Flexible options designed to fit your hiring needs
        </p>

        <div className="grid md:grid-cols-2 gap-6 max-w-200 mx-auto">
          <div className="bg-white rounded-2xl p-8 border border-[#dde8d4] flex flex-col relative shadow-sm">
            <h3 className="text-2xl font-semibold text-(--upwork-navy) mb-1">
              Home Owner
            </h3>
            <p className="text-[15px] text-gray-500 mb-6">
              For one-off home repairs and projects
            </p>
            
            <p className="text-(--upwork-navy) text-[15px] leading-relaxed mb-6 font-medium pb-6 border-b border-gray-100">
              Book a tradie for any job around the home — no subscription, no lock-in. Just post, hire, and pay when the work is done.
            </p>

            <div className="mb-6">
              <p className="text-2xl font-semibold text-[#3B6D11] mb-1">
                Free to join
              </p>
              <p className="text-sm text-gray-500">
                Only pay for the job you book
              </p>
            </div>

            <p className="text-[15px] font-semibold text-(--upwork-navy) mb-4">
              Includes:
            </p>
            <ul className="space-y-4 mb-8 flex-1">
              {homeOwnerFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-4.5 h-4.5 text-[#3B6D11] shrink-0 mt-0.5" />
                  <span className="text-[14px] text-gray-600 leading-snug">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              variant="outline"
              asChild
              className="w-full bg-transparent border-2 border-[#3B6D11] text-[#3B6D11] hover:bg-[#3B6D11]/5 hover:text-[#3B6D11] rounded-full py-6 text-[15px] font-semibold transition-colors mt-auto"
            >
              <Link href="/register">Get started for free</Link>
            </Button>
          </div>

          <div className="bg-white rounded-2xl p-8 border-2 border-[#3B6D11] flex flex-col relative shadow-sm">
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1 bg-[#3B6D11] text-[#EAF3DE] text-sm font-semibold rounded-full shadow-sm">
              Popular
            </span>

            <h3 className="text-2xl font-semibold text-(--upwork-navy) mb-1 mt-1">
              Business
            </h3>
            <p className="text-[15px] text-gray-500 mb-6">
              For ongoing work, teams and job sites
            </p>
            
            <p className="text-(--upwork-navy) text-[15px] leading-relaxed mb-6 font-medium pb-6 border-b border-gray-100">
              Hire multiple tradies across your work sites with premium tools, priority matching and centralised billing — all in one place.
            </p>

            <div className="mb-6 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-(--upwork-navy)">$299</span>
              <span className="text-sm text-gray-500">/ month + job costs</span>
            </div>

            <p className="text-[15px] font-semibold text-(--upwork-navy) mb-4">
              Everything in Home Owner, plus:
            </p>
            <ul className="space-y-4 mb-8 flex-1">
              {businessFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-4.5 h-4.5 text-[#3B6D11] shrink-0 mt-0.5" />
                  <span className="text-[14px] text-gray-600 leading-snug">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              asChild
              className="w-full bg-[#3B6D11] border-none text-white hover:bg-[#3B6D11]/90 rounded-full py-6 text-[15px] font-semibold transition-colors mt-auto"
            >
              <Link href="/register?plan=business">Get started today</Link>
            </Button>
          </div>
        </div>

        {/* Compare Features Link */}
        <div className="flex justify-center mt-8">
          <Link href="/pricing" className="flex items-center gap-1 text-[#3B6D11] text-[15px] font-medium hover:underline transition-all">
            Compare features across plans
            <ChevronRight className="w-4 h-4 mt-0.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
