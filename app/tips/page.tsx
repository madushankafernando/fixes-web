// fixes-web/app/tips/page.tsx

import type { Metadata } from 'next'
import Link from 'next/link'
import { Header, Footer } from '@/components/upwork'
import {
  Zap,
  ShieldCheck,
  Wallet,
  Star,
  Clock,
  FileText,
  MapPin,
  Wrench,
  AlertTriangle,
  BadgeCheck,
  Brain,
  CircleDollarSign,
  PhoneCall,
  ChevronDown,
  ArrowRight,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Tips & Info | Fixes — Tradie Knowledge Hub',
  description:
    'Everything a Fixes tradie needs to know — how to earn more, stay verified, understand payments, boost your rating, and get the most from the platform.',
}


const QUICK_STATS = [
  { value: '15%',      label: 'Platform fee — you keep 85%' },
  { value: '< 35 min', label: 'Average job dispatch time' },
  { value: '7 days',   label: 'Payout settlement window' },
  { value: '20 km',    label: 'Default service radius' },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Client posts a job',
    body: 'A homeowner or business describes the problem, uploads photos, and enters their address. Our AI analyses the images and description to generate a fair, market-rate quote in seconds — no haggling needed.',
    icon: Brain,
  },
  {
    step: '02',
    title: 'You get dispatched',
    body: "Fixes finds the closest online, verified tradie matching the job's category. You'll receive a push notification with the job details, the AI quote, and the client's location. You have 60 seconds to accept or decline.",
    icon: Zap,
  },
  {
    step: '03',
    title: 'Payment is held in escrow',
    body: "The client's card is charged the moment they post the job. Funds are held securely in Stripe escrow — you're guaranteed to be paid once the job is marked complete. No chasing invoices.",
    icon: Wallet,
  },
  {
    step: '04',
    title: 'Complete the job & get paid',
    body: "Mark the job complete in the app. Payment is released to your Stripe payout account within 7 days. Fixes takes a 15% platform fee — you keep 85% of the quoted amount.",
    icon: CircleDollarSign,
  },
]

const EARNING_TIPS = [
  {
    icon: MapPin,
    title: 'Stay in high-demand suburbs',
    body: 'Jobs are dispatched to the nearest available tradie. Positioning yourself in busy inner-city or growth suburbs during peak hours (7am–11am, 3pm–7pm) dramatically increases your dispatch rate.',
    color: '#0d6651',
    bg: '#031f18',
  },
  {
    icon: Star,
    title: 'A 4.8+ rating unlocks more jobs',
    body: 'Our dispatch algorithm prioritises higher-rated tradies when multiple qualified fixers are online nearby. Introduce yourself, explain what you\'re doing, and leave the space clean — clients rate on professionalism as much as the work itself.',
    color: '#d97706',
    bg: '#1c130a',
  },
  {
    icon: Clock,
    title: 'Accept fast, arrive faster',
    body: 'You have 60 seconds to accept a dispatched job. Tradies who respond quickly and arrive on time have a significantly higher re-dispatch rate. If you\'re running late, message the client through the app immediately.',
    color: '#0891b2',
    bg: '#041820',
  },
  {
    icon: Wrench,
    title: 'Add more trade categories',
    body: 'Each additional verified category makes you eligible for more job types. An electrician who is also HVAC-licensed can receive both electrical and air-con jobs — doubling their receiving surface without extra effort.',
    color: '#7c3aed',
    bg: '#140d1f',
  },
  {
    icon: BadgeCheck,
    title: 'Full verification = priority dispatch',
    body: 'Tradies with all documents verified (ABN, Insurance, Licence, White Card) are flagged as "Fully Verified" in our system. They appear first in the dispatch queue before partially-verified tradies — even if they\'re slightly further away.',
    color: '#22C55E',
    bg: '#0d1f12',
  },
  {
    icon: PhoneCall,
    title: 'Keep communication in-app',
    body: "Every message in the Fixes chat is timestamped and dispute-protected. If a client claims you didn't show up or the work was incomplete, your in-app messages are your evidence. Never take a job off-platform.",
    color: '#e11d48',
    bg: '#1f0810',
  },
]

const DOCUMENT_GUIDE = [
  {
    trade: 'Electrician',
    docs: ['A-Grade Electrical License', 'Electrical Contractor License (REC)', 'White Card', 'ABN', 'Public Liability Insurance'],
  },
  {
    trade: 'Plumber',
    docs: ['Plumbing Registration', 'Plumbing License', 'White Card', 'ABN', 'Public Liability Insurance'],
  },
  {
    trade: 'HVAC / Refrigeration',
    docs: ['Plumbing License – Mechanical', 'Electrical License – HVAC', 'ARCtick License', 'White Card', 'ABN', 'Public Liability Insurance'],
  },
  {
    trade: 'Carpenter',
    docs: ['Carpentry Certificate', 'White Card', 'ABN', 'Public Liability Insurance'],
  },
  {
    trade: 'Painter / Plasterer / Flooring',
    docs: ['White Card', 'ABN', 'Public Liability Insurance'],
  },
  {
    trade: 'Emergency Make Safe',
    docs: ['Builders License (CBU)', 'White Card', 'ABN', 'Public Liability Insurance'],
  },
  {
    trade: 'General Labourer',
    docs: ['White Card', 'ABN'],
  },
]

const PAYMENT_FACTS = [
  {
    q: 'How much does Fixes take?',
    a: 'Fixes charges a 15% platform fee on the job total. You keep 85%. This covers payment processing, insurance support, dispatch infrastructure, and platform maintenance.',
  },
  {
    q: 'When do I actually get paid?',
    a: 'Payment is released to your Stripe payout account within 7 days of job completion. Stripe then typically takes 2–3 business days to deposit to your nominated bank account.',
  },
  {
    q: 'What if the client disputes the work?',
    a: "If a client raises a dispute within 48 hours of job completion, payment is temporarily held. Our support team reviews the job chat, photos, and notes from both parties before making a decision. Keeping records in-app protects you.",
  },
  {
    q: 'Is the AI quote final?',
    a: "The AI generates a market-rate fixed quote based on the job description and photos. You're paid the quoted amount regardless of how long the job takes — so efficient tradies earn more per hour. If the job scope changes on-site, contact support before starting extra work.",
  },
  {
    q: 'Do I need to invoice clients myself?',
    a: 'No. Fixes generates a tax invoice automatically on job completion and sends it to both you and the client. Your earnings summary and YTD figures are available in the Tax Info section of the app.',
  },
  {
    q: 'What is the service radius?',
    a: 'Your default service radius is 20km from your current GPS location. You can update this in your profile settings. Jobs beyond your radius will not be dispatched to you.',
  },
]

const SUPPORT_LINKS = [
  { label: 'About Fixes', href: '/about' },
  { label: 'Post a Job (Client Portal)', href: '/post-job' },
  { label: 'Become a Fixer', href: '/i-want-to-work' },
]


function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold tracking-widest text-(--upwork-green) uppercase mb-4">
      {children}
    </p>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group border-b border-(--upwork-border) last:border-0">
      <summary className="flex items-center justify-between gap-4 py-5 cursor-pointer list-none">
        <span className="font-semibold text-(--upwork-navy) text-base">{q}</span>
        <ChevronDown className="w-5 h-5 text-(--upwork-gray) shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <p className="pb-5 text-(--upwork-gray) leading-relaxed text-sm pr-8">{a}</p>
    </details>
  )
}


export default function TipsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      <section className="relative bg-(--upwork-navy) text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '28px 28px' }}
        />
        <div className="absolute top-0 right-0 w-80 h-80 bg-(--upwork-green) rounded-full blur-[120px] opacity-10 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 lg:px-6 pt-24 pb-20 lg:pt-32 lg:pb-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-(--upwork-green)/10 border border-(--upwork-green)/20 rounded-full text-sm text-(--upwork-green-light) font-medium mb-8">
              <Wrench className="w-4 h-4" />
              For verified Fixes tradies
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Tips &amp; Info for{' '}
              <span className="text-(--upwork-green)">Fixer tradies</span>
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed max-w-2xl">
              Everything you need to maximise your earnings, stay compliant, and get the most from the Fixes platform — in one place.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-(--upwork-green) text-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {QUICK_STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl lg:text-4xl font-extrabold">{s.value}</p>
                <p className="text-sm text-green-100 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-14">
            <SectionLabel>Platform Mechanics</SectionLabel>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-(--upwork-navy)">
              How a Fixes job works
            </h2>
            <p className="text-(--upwork-gray) mt-4 max-w-xl mx-auto">
              From post to payout — understanding each stage keeps you in control and protects your earnings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step) => {
              const Icon = step.icon
              return (
                <div
                  key={step.step}
                  className="relative bg-white border border-(--upwork-border) rounded-2xl p-6 hover:shadow-md transition-shadow"
                >
                  <span className="text-5xl font-extrabold text-(--upwork-green)/10 absolute top-4 right-5 select-none">
                    {step.step}
                  </span>
                  <div className="w-11 h-11 rounded-xl bg-(--upwork-green)/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-(--upwork-green)" />
                  </div>
                  <h3 className="font-bold text-(--upwork-navy) mb-2">{step.title}</h3>
                  <p className="text-sm text-(--upwork-gray) leading-relaxed">{step.body}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-(--upwork-light-gray) py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-14">
            <SectionLabel>Maximise Your Earnings</SectionLabel>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-(--upwork-navy)">
              Tips from top-rated tradies
            </h2>
            <p className="text-(--upwork-gray) mt-4 max-w-xl mx-auto">
              These are the habits that separate tradies earning $1k/week on Fixes from those getting 2 jobs a month.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {EARNING_TIPS.map((tip) => {
              const Icon = tip.icon
              return (
                <div
                  key={tip.title}
                  className="bg-white border border-(--upwork-border) rounded-2xl p-6 hover:shadow-md transition-shadow"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: tip.bg }}
                  >
                    <Icon className="w-5 h-5" style={{ color: tip.color }} />
                  </div>
                  <h3 className="font-bold text-(--upwork-navy) mb-2">{tip.title}</h3>
                  <p className="text-sm text-(--upwork-gray) leading-relaxed">{tip.body}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-14">
            <SectionLabel>Compliance</SectionLabel>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-(--upwork-navy)">
              Required documents by trade
            </h2>
            <p className="text-(--upwork-gray) mt-4 max-w-xl mx-auto">
              Australian licencing standards apply. Upload all required documents in the <strong>Documents</strong> screen in your app — admin review typically takes under 24 hours.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {DOCUMENT_GUIDE.map((entry) => (
              <div
                key={entry.trade}
                className="bg-white border border-(--upwork-border) rounded-2xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-(--upwork-green)/10 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-(--upwork-green)" />
                  </div>
                  <h3 className="font-bold text-(--upwork-navy) text-sm">{entry.trade}</h3>
                </div>
                <ul className="space-y-2">
                  {entry.docs.map((doc) => (
                    <li key={doc} className="flex items-start gap-2 text-sm text-(--upwork-gray)">
                      <ShieldCheck className="w-4 h-4 text-(--upwork-green) shrink-0 mt-0.5" />
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10 bg-amber-50 border border-amber-200 rounded-2xl p-6 flex gap-4 items-start max-w-3xl mx-auto">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 leading-relaxed">
              <strong>Expired or rejected documents</strong> will suspend your ability to go online until re-uploaded and re-verified. Keep an eye on your Documents screen for status updates — you&apos;ll also receive a push notification if any document is rejected.
            </p>
          </div>
        </div>
      </section>

      {/* ── Payment FAQ ───────────────────────────────────────────────────── */}
      <section className="bg-(--upwork-navy) text-white py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-14">
            <SectionLabel>Payments &amp; Fees</SectionLabel>
            <h2 className="text-3xl lg:text-4xl font-extrabold">
              Common questions about money
            </h2>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden px-6 divide-y divide-(--upwork-border)">
            {PAYMENT_FACTS.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-14">
            <SectionLabel>Safety &amp; Standards</SectionLabel>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-(--upwork-navy)">
              Staying safe on the job
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                icon: ShieldCheck,
                title: 'Never work off-platform',
                body: "If a client asks you to do extra work 'off the books', decline politely. Off-platform work is uninsured, unpaid via escrow, and grounds for account suspension.",
              },
              {
                icon: AlertTriangle,
                title: 'Report unsafe sites immediately',
                body: "If you arrive at a site that is unsafe to begin work, document it with photos in the app's chat and contact Fixes Support before leaving. Do not start work on an unsafe site.",
              },
              {
                icon: FileText,
                title: 'Photo evidence is your friend',
                body: 'Take before-and-after photos for every job and share them in the job chat. This protects you in any dispute and gives clients confidence in your work quality.',
              },
              {
                icon: Star,
                title: 'Respond to reviews',
                body: "You can't edit a client's review, but you can respond to it. A calm, professional response to a negative review shows other clients you take feedback seriously.",
              },
            ].map((card) => {
              const Icon = card.icon
              return (
                <div
                  key={card.title}
                  className="bg-white border border-(--upwork-border) rounded-2xl p-6 hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-xl bg-(--upwork-green)/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-(--upwork-green)" />
                  </div>
                  <h3 className="font-bold text-(--upwork-navy) mb-2">{card.title}</h3>
                  <p className="text-sm text-(--upwork-gray) leading-relaxed">{card.body}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-(--upwork-light-gray) py-20">
        <div className="max-w-4xl mx-auto px-4 lg:px-6 text-center">
          <SectionLabel>Explore More</SectionLabel>
          <h2 className="text-3xl font-extrabold text-(--upwork-navy) mb-4">
            More from Fixes
          </h2>
          <p className="text-(--upwork-gray) mb-10">
            Learn about the platform, how jobs are quoted, and who we are.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {SUPPORT_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-(--upwork-navy) text-(--upwork-navy) font-bold rounded-xl hover:bg-(--upwork-navy) hover:text-white transition-colors text-sm"
              >
                {link.label}
                <ArrowRight className="w-4 h-4" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
