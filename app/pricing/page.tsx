import { Check, Minus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/upwork/Header"
import { Footer } from "@/components/upwork/Footer"

const features = [
  {
    category: "Job Management & Dispatch",
    items: [
      { name: "Post Jobs", homeOwner: "Standard", business: "Unlimited across multiple sites" },
      { name: "AI-Powered Quotes", homeOwner: true, business: true },
      { name: "Tradie Matching", homeOwner: "Standard algorithm", business: "Priority matching with top 1% vetted" },
      { name: "Automated Job Dispatch", homeOwner: true, business: true },
      { name: "Recurring Job Schedules", homeOwner: true, business: true },
      { name: "Cleaning Task Templates", homeOwner: "Standard Templates", business: "Custom Templates" },
    ]
  },
  {
    category: "Team & Agency Tools",
    items: [
      { name: "Team Members", homeOwner: "1 (Account Owner)", business: "Unlimited" },
      { name: "Roles & Permissions", homeOwner: false, business: "Custom granular access" },
      { name: "Multi-site Management", homeOwner: false, business: true },
      { name: "Agency Dispatch Control", homeOwner: false, business: true },
      { name: "Waitlist & Lead Management", homeOwner: false, business: true },
    ]
  },
  {
    category: "Analytics & Reporting",
    items: [
      { name: "Basic Dashboards", homeOwner: true, business: true },
      { name: "Real-time AI Analytics", homeOwner: false, business: true },
      { name: "Custom Revenue Reports", homeOwner: false, business: true },
      { name: "Tradie Performance Metrics", homeOwner: true, business: true },
    ]
  },
  {
    category: "Trust & Security",
    items: [
      { name: "Secure Escrow Payments", homeOwner: true, business: true },
      { name: "Vetted Tradies", homeOwner: "Standard Verification", business: "Premium Background Checks" },
      { name: "Dispute Mediation", homeOwner: "Standard queue", business: "Priority resolution" },
      { name: "View profiles & ratings", homeOwner: true, business: true },
    ]
  },
  {
    category: "Billing & Invoicing",
    items: [
      { name: "Billing Method", homeOwner: "Pay per job", business: "Centralised monthly billing" },
      { name: "Automated Invoicing", homeOwner: "Basic receipts", business: "Custom branded invoices" },
      { name: "Bulk Payments", homeOwner: false, business: true },
      { name: "Custom Commission Rules", homeOwner: false, business: true },
    ]
  },
  {
    category: "Communication & Support",
    items: [
      { name: "In-app Messaging", homeOwner: true, business: true },
      { name: "Email & Push Notifications", homeOwner: true, business: true },
      { name: "SMS Alerts", homeOwner: "Standard SMS", business: "Custom SMS Workflows" },
      { name: "Live Location Tracking", homeOwner: true, business: true },
      { name: "Support Level", homeOwner: "Standard Support", business: "Dedicated Account Manager" },
    ]
  }
]

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 bg-[#f5f7f2] py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold text-(--upwork-navy) mb-4">
              Compare our plans
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find the perfect plan for your needs. Whether you're a home owner fixing up the house, or a business managing multiple work sites.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-[#dde8d4] overflow-hidden">
            <div className="grid grid-cols-3 border-b border-[#dde8d4] bg-[#fdfdfc]">
              <div className="p-6 lg:p-8 flex items-end">
                <h2 className="text-xl font-bold text-(--upwork-navy)">Features</h2>
              </div>
              <div className="p-6 lg:p-8 pt-10 text-center border-l border-[#dde8d4]">
                <h3 className="text-2xl font-bold text-(--upwork-navy) mb-2">Home Owner</h3>
                <p className="text-[#3B6D11] font-semibold text-lg mb-6">Free</p>
                <Button asChild className="w-full bg-transparent border-2 border-[#3B6D11] text-[#3B6D11] hover:bg-[#3B6D11]/5 rounded-full">
                  <Link href="/register">Get started</Link>
                </Button>
              </div>
              <div className="p-6 lg:p-8 pt-10 text-center border-l border-[#dde8d4] bg-[#f4f9ef] relative">
                <span className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#3B6D11] text-[#EAF3DE] text-[11px] uppercase tracking-wider font-bold rounded-full">
                  Popular
                </span>
                <h3 className="text-2xl font-bold text-(--upwork-navy) mb-2">Business</h3>
                <p className="text-(--upwork-navy) font-semibold text-lg mb-6">$299 <span className="text-sm text-gray-500 font-normal">/ mo</span></p>

                <Button asChild className="w-full bg-[#3B6D11] border-none text-white hover:bg-[#3B6D11]/90 rounded-full">
                  <Link href="/register?plan=business">Get started</Link>
                </Button>
              </div>
            </div>

            <div className="divide-y divide-[#dde8d4]">
              {features.map((section, idx) => (
                <div key={idx}>
                  <div className="bg-gray-50/50 py-3 px-6 lg:px-8 border-b border-[#dde8d4]">
                    <h4 className="font-semibold text-(--upwork-navy)">{section.category}</h4>
                  </div>
                  {section.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="grid grid-cols-3 divide-x divide-[#dde8d4]">
                      <div className="p-6 flex items-center">
                        <span className="text-sm font-medium text-gray-700">{item.name}</span>
                      </div>
                      <div className="p-6 flex items-center justify-center text-center">
                        {typeof item.homeOwner === "boolean" ? (
                          item.homeOwner ? <Check className="w-5 h-5 text-[#3B6D11]" /> : <Minus className="w-5 h-5 text-gray-300" />
                        ) : (
                          <span className="text-sm text-gray-600">{item.homeOwner}</span>
                        )}
                      </div>
                      <div className="p-6 flex items-center justify-center text-center bg-[#fdfaf5] bg-opacity-30">
                        {typeof item.business === "boolean" ? (
                          item.business ? <Check className="w-5 h-5 text-[#3B6D11]" /> : <Minus className="w-5 h-5 text-gray-300" />
                        ) : (
                          <span className="text-sm text-gray-600 font-medium">{item.business}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
