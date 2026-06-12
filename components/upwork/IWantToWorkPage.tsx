"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, ArrowRight, CheckCircle2, Zap, ShieldCheck, Banknote, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "./Header"
import { Footer } from "./Footer"

const fixesBenefits = [
  {
    id: "ai-quoting",
    icon: <Zap className="w-10 h-10 text-(--upwork-green)" />,
    title: "Instant AI Quoting",
    description: "Stop wasting your evenings driving around doing free quotes. Our AI engine generates upfront, accurate pricing based on client photos before you even see the job.",
    cta: "Download the App",
  },
  {
    id: "dispatch",
    icon: <Navigation className="w-10 h-10 text-(--upwork-green)" />,
    title: "Smart Dispatching",
    description: "Go online when you want to work. Jobs within your specified radius are dispatched directly to your phone. The first tradie to accept secures the job—no bidding wars.",
    cta: "Download the App",
  },
  {
    id: "escrow",
    icon: <ShieldCheck className="w-10 h-10 text-(--upwork-green)" />,
    title: "Guaranteed Escrow Payments",
    description: "Clients pre-authorise payment when they request the job. The funds are held securely in escrow by Stripe and released automatically when you mark the job as complete.",
    cta: "Download the App",
  },
  {
    id: "zero-fees",
    icon: <Banknote className="w-10 h-10 text-(--upwork-green)" />,
    title: "Zero Lead Fees",
    description: "We don't charge you to look at leads. There are no monthly subscriptions. We only make a commission when you successfully complete a job and get paid.",
    cta: "Download the App",
  },
]

const testimonials = [
  {
    logo: "MT",
    logoColor: "bg-orange-500",
    quote: "I used to spend my weekends doing quotes that went nowhere. Now, I just turn on the Fixes app, accept a job that's already priced, and the money is guaranteed.",
    author: "Mike Thompson",
    role: "Licensed Electrician, Melbourne",
  },
  {
    logo: "SB",
    logoColor: "bg-blue-500",
    quote: "The scope change feature is brilliant. If a job is bigger than expected, I add it in the app, the client approves the extra funds instantly, and I keep working.",
    author: "Sarah Blake",
    role: "Plumber & Gas Fitter, Sydney",
  },
  {
    logo: "JW",
    logoColor: "bg-(--upwork-green)",
    quote: "No bidding wars, no lead fees. If the notification pops up and I want it, I just tap accept. It's totally transformed how I run my week.",
    author: "James Wilson",
    role: "Carpenter, Brisbane",
  },
]

export function IWantToWorkPage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <section className="py-12 md:py-16 lg:py-20 px-4 lg:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
            <div className="flex-1 lg:max-w-120 pt-4 lg:pt-8">
              <h1 className="text-4xl md:text-5xl lg:text-[52px] font-bold text-(--upwork-navy) leading-[1.08] mb-5">
                The smart way to run your trade business
              </h1>
              <p className="text-base md:text-lg text-(--upwork-gray) mb-8 leading-relaxed max-w-md">
                Stop chasing leads and doing free quotes. Let our AI handle the pricing, and our smart dispatch system bring guaranteed work directly to your phone.
              </p>
              <Button asChild className="bg-[#A4FF43] hover:opacity-90 text-(--upwork-navy) font-extrabold rounded-full px-8 py-6 text-base h-auto transition-opacity shadow-lg">
                <Link href="/app/fixer">Download the Fixer App</Link>
              </Button>
            </div>

            <div className="flex-1 w-full lg:w-auto lg:max-w-[55%]">
              <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80"
                  alt="Professional tradie working"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 55vw, 600px"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 lg:px-6">
        <div className="max-w-6xl mx-auto">
          {fixesBenefits.map((benefit, index) => (
            <div
              key={benefit.id}
              className={`flex flex-col lg:flex-row items-center gap-10 lg:gap-16 py-16 ${
                index !== fixesBenefits.length - 1 ? "border-b border-gray-200" : ""
              } ${index % 2 === 1 ? "lg:flex-row-reverse" : ""}`}
            >
              <div className="shrink-0 w-24 h-24 bg-[#f0fdf4] rounded-3xl flex items-center justify-center shadow-inner">
                {benefit.icon}
              </div>

              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-2xl md:text-3xl font-extrabold text-(--upwork-navy) mb-4">
                  {benefit.title}
                </h2>
                <p className="text-(--upwork-gray) mb-8 max-w-xl text-lg leading-relaxed">
                  {benefit.description}
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                  <Button asChild className="bg-(--upwork-navy) hover:bg-gray-800 text-white rounded-full px-8 py-5">
                    <Link href="/app/fixer">{benefit.cta}</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#f6f6f6] py-20 px-4 lg:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={prevTestimonial}
              className="p-3 rounded-full bg-white shadow-sm border border-gray-200 hover:border-gray-400 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5 text-gray-800" />
            </button>
            <button
              onClick={nextTestimonial}
              className="p-3 rounded-full bg-white shadow-sm border border-gray-200 hover:border-gray-400 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5 text-gray-800" />
            </button>
          </div>

          <div className="bg-white rounded-3xl p-8 md:p-14 shadow-lg border border-gray-100">
            <div className={`w-14 h-14 ${testimonials[currentTestimonial].logoColor} rounded-xl flex items-center justify-center text-white font-bold text-xl mb-8`}>
              {testimonials[currentTestimonial].logo}
            </div>

            <blockquote className="text-xl md:text-2xl text-(--upwork-navy) mb-8 leading-relaxed font-medium">
              &ldquo;{testimonials[currentTestimonial].quote}&rdquo;
            </blockquote>

            <div>
              <p className="font-bold text-(--upwork-navy) text-lg">
                {testimonials[currentTestimonial].author}
              </p>
              <p className="text-sm text-(--upwork-gray) mt-1">
                {testimonials[currentTestimonial].role}
              </p>
            </div>
          </div>

          <div className="flex justify-center gap-3 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === currentTestimonial ? "bg-(--upwork-green) w-6" : "bg-gray-300"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-(--upwork-navy) text-white py-24 px-4 lg:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold text-center mb-16">
            Why Tradies Choose Fixes
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              {
                title: "Zero Lead Fees",
                description: "Stop paying for leads that don't convert. We only make money when you complete a job.",
              },
              {
                title: "Stripe Escrow",
                description: "Funds are locked in escrow before you even start the engine. Guaranteed payments.",
              },
              {
                title: "In-App Scope Changes",
                description: "Job bigger than expected? Add extra charges in the app for instant client approval.",
              },
              {
                title: "Smart Routing",
                description: "Integrated maps navigate you directly to the job site using the fastest route.",
              },
              {
                title: "Automated Invoicing",
                description: "Tax-compliant invoices are generated and sent automatically upon completion.",
              },
              {
                title: "Local Support",
                description: "Our dedicated support team in Australia is always available to resolve disputes.",
              },
            ].map((benefit, index) => (
              <div key={index} className="flex gap-4">
                <CheckCircle2 className="w-8 h-8 text-[#A4FF43] shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-xl mb-2">{benefit.title}</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 lg:px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-(--upwork-navy) mb-6">
            Ready to revolutionise your week?
          </h2>
          <p className="text-(--upwork-gray) mb-10 max-w-xl mx-auto text-lg leading-relaxed">
            Download the Fixer app, submit your compliance documents, and start receiving AI-quoted jobs in your area.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button asChild className="bg-[#A4FF43] hover:opacity-90 text-(--upwork-navy) rounded-full px-10 py-7 text-lg font-extrabold shadow-lg">
              <Link href="/app/fixer">
                Download for iOS
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button asChild className="bg-(--upwork-navy) hover:bg-gray-800 text-white rounded-full px-10 py-7 text-lg font-extrabold shadow-lg">
              <Link href="/app/fixer">
                Download for Android
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
