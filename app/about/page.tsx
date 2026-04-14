// fixes-web/app/about/page.tsx

import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Header, Footer } from '@/components/upwork'
import {
  Zap,
  ShieldCheck,
  Users,
  Star,
  MapPin,
  ArrowRight,
  Wrench,
  Brain,
  Handshake,
  TrendingUp,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Us | Fixes — Hire Trusted Tradies Instantly',
  description:
    'Learn about Fixes — Australia\'s AI-powered tradie marketplace. Our story, mission, values, and the team building the future of home services.',
}

// ─── Data ────────────────────────────────────────────────────────────────────

const STATS = [
  { value: '50,000+', label: 'Jobs Completed' },
  { value: '8,500+', label: 'Verified Tradies' },
  { value: '4.9★', label: 'Average Rating' },
  { value: '35 min', label: 'Avg. Response Time' },
]

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Trust First',
    description:
      'Every tradie on Fixes is background-checked, licensed, and insured before they can take a job. Your safety is non-negotiable.',
    color: 'bg-emerald-50 text-emerald-700',
  },
  {
    icon: Brain,
    title: 'AI-Powered Fairness',
    description:
      'Our AI quoting engine gives clients transparent, market-accurate pricing — no haggling, no hidden fees, no surprises.',
    color: 'bg-blue-50 text-blue-700',
  },
  {
    icon: Handshake,
    title: 'Tradies Deserve Better',
    description:
      'We take a fair 15% platform fee and pay out weekly. Tradies keep what they earn and build their reputation on their own terms.',
    color: 'bg-amber-50 text-amber-700',
  },
  {
    icon: TrendingUp,
    title: 'Built for Scale',
    description:
      'From a single leaky tap to a full commercial fit-out — Fixes handles every job size with the same speed and reliability.',
    color: 'bg-purple-50 text-purple-700',
  },
]

const TEAM = [
  { name: 'Madushan Fernando', role: 'Co-Founder & CEO', avatar: 'https://i.pravatar.cc/200?img=11' },
  { name: 'Kavinu Jayasinghe', role: 'Co-Founder & CTO', avatar: 'https://i.pravatar.cc/200?img=12' },
  { name: 'Parth Joshi', role: 'Lead Engineer', avatar: 'https://i.pravatar.cc/200?img=13' },
  { name: 'Anika Sharma', role: 'Head of Operations', avatar: 'https://i.pravatar.cc/200?img=47' },
  { name: 'Liam Walsh', role: 'Head of Growth', avatar: 'https://i.pravatar.cc/200?img=15' },
  { name: 'Sophie Chen', role: 'Head of Design', avatar: 'https://i.pravatar.cc/200?img=49' },
]

const MILESTONES = [
  { year: '2023', event: 'Fixes founded in Melbourne, Australia' },
  { year: 'Q2 2024', event: 'First 1,000 verified tradies onboarded across Victoria' },
  { year: 'Q4 2024', event: 'AI quoting engine launched — instant job estimates in under 3 seconds' },
  { year: 'Q1 2025', event: 'Expanded to NSW and QLD — 10,000 jobs completed milestone' },
  { year: 'Q3 2025', event: 'Stripe escrow payments launched — full trust & safety flow live' },
  { year: '2026', event: 'Mobile tradie app launched — Fixer iOS & Android now in early access' },
]

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-(--upwork-navy) text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
        />
        <div className="absolute top-0 right-0 w-96 h-96 bg-(--upwork-green) rounded-full blur-[120px] opacity-10 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 lg:px-6 pt-24 pb-20 lg:pt-32 lg:pb-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-(--upwork-green)/10 border border-(--upwork-green)/20 rounded-full text-sm text-(--upwork-green-light) font-medium mb-8">
              <MapPin className="w-4 h-4" />
              Built in Melbourne · Trusted across Australia
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              We're rebuilding how{' '}
              <span className="text-(--upwork-green)">Australia gets</span>{' '}
              trade work done.
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed max-w-2xl">
              Fixes connects homeowners and businesses with verified, trusted tradies — instantly.
              No phone tag, no dodgy quotes, no upfront payment risk. Just fast, fair, transparent service.
            </p>
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────────── */}
      <section className="bg-(--upwork-green) text-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl lg:text-4xl font-extrabold">{stat.value}</p>
                <p className="text-sm text-green-100 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Story ────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs font-semibold tracking-widest text-(--upwork-green) uppercase mb-4">Our Story</p>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-(--upwork-navy) mb-6 leading-tight">
                Started from a frustrating Saturday afternoon
              </h2>
              <div className="space-y-4 text-(--upwork-gray) leading-relaxed">
                <p>
                  It started with a leaking pipe. Our co-founder spent a full weekend calling tradies, 
                  chasing quotes, and eventually paying double what he expected — for a job that took 40 minutes.
                </p>
                <p>
                  That frustration became Fixes. We set out to build a platform where getting a tradie is as easy 
                  as ordering food — instant, transparent, and reliable.
                </p>
                <p>
                  We built an AI that reads job descriptions and photos to generate accurate market-rate quotes 
                  in seconds. We verify every tradie's license, insurance, and identity before they take a single job. 
                  And we hold payment in escrow so clients only pay when the work is done right.
                </p>
              </div>
            </div>

            {/* Visual */}
            <div className="relative">
              <div className="bg-(--upwork-light-gray) rounded-3xl p-8 lg:p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-(--upwork-green) rounded-full blur-[80px] opacity-10" />
                <div className="grid grid-cols-2 gap-4 relative z-10">
                  {[
                    { icon: Zap, label: 'Instant Dispatch', sub: 'Job matched in seconds' },
                    { icon: ShieldCheck, label: 'Verified Tradies', sub: 'License & insured' },
                    { icon: Brain, label: 'AI Quoting', sub: 'Accurate estimates' },
                    { icon: Wrench, label: 'All Trades', sub: '20+ categories' },
                  ].map((item) => {
                    const Icon = item.icon
                    return (
                      <div key={item.label} className="bg-white rounded-2xl p-5 shadow-sm border border-(--upwork-border)">
                        <div className="w-10 h-10 rounded-xl bg-(--upwork-green)/10 flex items-center justify-center mb-3">
                          <Icon className="w-5 h-5 text-(--upwork-green)" />
                        </div>
                        <p className="font-semibold text-(--upwork-navy) text-sm">{item.label}</p>
                        <p className="text-xs text-(--upwork-gray) mt-0.5">{item.sub}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mission ──────────────────────────────────────────────────────── */}
      <section className="bg-(--upwork-light-gray) py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-4 lg:px-6 text-center">
          <p className="text-xs font-semibold tracking-widest text-(--upwork-green) uppercase mb-4">Our Mission</p>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-(--upwork-navy) leading-tight mb-6">
            "Make trade work trustworthy — for everyone."
          </h2>
          <p className="text-lg text-(--upwork-gray) leading-relaxed">
            For clients, that means no more anxiety about dodgy quotes or no-shows.
            For tradies, that means a steady stream of quality jobs, guaranteed payment, 
            and a platform that treats them like the skilled professionals they are.
          </p>
        </div>
      </section>

      {/* ── Values ───────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-widest text-(--upwork-green) uppercase mb-4">What We Stand For</p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-(--upwork-navy)">Our values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v) => {
              const Icon = v.icon
              return (
                <div key={v.title} className="bg-white border border-(--upwork-border) rounded-2xl p-6 hover:shadow-md transition-shadow">
                  <div className={`w-11 h-11 rounded-xl ${v.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-(--upwork-navy) mb-2">{v.title}</h3>
                  <p className="text-sm text-(--upwork-gray) leading-relaxed">{v.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Timeline ─────────────────────────────────────────────────────── */}
      <section className="bg-(--upwork-navy) text-white py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-widest text-(--upwork-green) uppercase mb-4">Our Journey</p>
            <h2 className="text-3xl lg:text-4xl font-extrabold">From idea to platform</h2>
          </div>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-700 hidden sm:block" />
            <div className="space-y-8">
              {MILESTONES.map((m, i) => (
                <div key={i} className="flex gap-6 items-start">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full bg-(--upwork-green)/10 border border-(--upwork-green)/30 flex items-center justify-center z-10 relative">
                      <div className="w-3 h-3 rounded-full bg-(--upwork-green)" />
                    </div>
                  </div>
                  <div className="pt-2.5">
                    <span className="text-xs font-bold tracking-wider text-(--upwork-green) uppercase">{m.year}</span>
                    <p className="text-base text-gray-200 mt-1 leading-relaxed">{m.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Team ─────────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-widest text-(--upwork-green) uppercase mb-4">The Team</p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-(--upwork-navy)">The people behind Fixes</h2>
            <p className="text-(--upwork-gray) mt-4 max-w-xl mx-auto">
              A small team of engineers, operators, and builders obsessed with making trade work work.
            </p>
          </div>
          
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="bg-(--upwork-light-gray) py-20">
        <div className="max-w-4xl mx-auto px-4 lg:px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-(--upwork-navy) mb-4">
            Ready to experience the difference?
          </h2>
          <p className="text-(--upwork-gray) mb-10 text-lg">
            Post a job in 60 seconds and get an AI quote instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/post-job"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-(--upwork-green) hover:bg-(--upwork-green-dark) text-white font-bold rounded-xl transition-colors text-base"
            >
              Post a Job
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/i-want-to-work"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-(--upwork-navy) text-(--upwork-navy) font-bold rounded-xl hover:bg-(--upwork-navy) hover:text-white transition-colors text-base"
            >
              <Wrench className="w-5 h-5" />
              Become a Fixer
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
