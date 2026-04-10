"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

const trustedByLogos = [
  { name: "Bunnings", text: "Bunnings" },
  { name: "Mitre 10", text: "Mitre 10" },
  { name: "Reece", text: "Reece" },
  { name: "Total Tools", text: "Total Tools" },
]

const partnershipTypes = [
  {
    id: "managed",
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
        <rect x="8" y="8" width="32" height="32" rx="4" stroke="#14a800" strokeWidth="2" />
        <path d="M16 24L22 30L32 18" stroke="#14a800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Get matched with quality jobs on demand",
    description: "We connect you directly with clients looking for skilled tradies. Our platform handles the matching process, ensuring you get jobs that fit your expertise and availability.",
    cta1: "Browse available jobs",
    cta2: "Join as a tradie",
  },
  {
    id: "experts",
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="16" r="8" stroke="#14a800" strokeWidth="2" />
        <path d="M12 40c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="#14a800" strokeWidth="2" strokeLinecap="round" />
        <circle cx="36" cy="12" r="4" fill="#14a800" />
      </svg>
    ),
    title: "Showcase your expertise and build your reputation",
    description: "Create a professional profile that highlights your skills, certifications, and past work. Build trust with clients through verified reviews and ratings.",
    cta1: "Create your profile",
    cta2: "Join as a tradie",
  },
  {
    id: "tools",
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
        <rect x="6" y="22" width="16" height="20" rx="2" stroke="#14a800" strokeWidth="2" />
        <rect x="26" y="14" width="16" height="28" rx="2" stroke="#14a800" strokeWidth="2" />
        <path d="M10 28h8M30 20h8M30 26h8" stroke="#14a800" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    title: "Access tools to grow your trade business",
    description: "Get access to invoicing, scheduling, and client management tools. Everything you need to run your trade business efficiently in one place.",
    cta1: "Explore business tools",
    cta2: "Join as a tradie",
  },
  {
    id: "rewards",
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
        <path d="M24 4l6 12h12l-9 9 3 13-12-7-12 7 3-13-9-9h12l6-12z" stroke="#14a800" strokeWidth="2" fill="none" />
      </svg>
    ),
    title: "Earn rewards and unlock premium benefits",
    description: "Top-rated tradies get access to premium job listings, priority support, and exclusive partner discounts on tools and materials.",
    cta1: "See rewards program",
    cta2: "Join as a tradie",
  },
  {
    id: "enterprise",
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
        <rect x="8" y="20" width="12" height="20" stroke="#14a800" strokeWidth="2" />
        <rect x="18" y="12" width="12" height="28" stroke="#14a800" strokeWidth="2" />
        <rect x="28" y="16" width="12" height="24" stroke="#14a800" strokeWidth="2" />
        <path d="M14 8v8M24 4v8M34 8v8" stroke="#14a800" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    title: "Partner with commercial and enterprise clients",
    description: "Access larger commercial projects and ongoing contracts. We connect experienced tradies with property managers, builders, and enterprise clients.",
    cta1: "View enterprise opportunities",
    cta2: "Join as a tradie",
  },
]

const testimonials = [
  {
    logo: "MT",
    logoColor: "bg-orange-500",
    quote: "Finding consistent work used to be my biggest challenge. Now I have more quality jobs than I can handle, and the platform makes everything from quoting to getting paid seamless.",
    author: "Mike Thompson",
    role: "Licensed Electrician, Melbourne",
  },
  {
    logo: "SB",
    logoColor: "bg-blue-500",
    quote: "The quality of clients on this platform is excellent. They understand the value of skilled trade work and are willing to pay fair rates for quality craftsmanship.",
    author: "Sarah Blake",
    role: "Plumber & Gas Fitter, Sydney",
  },
  {
    logo: "JW",
    logoColor: "bg-green-600",
    quote: "As a sole trader, having access to business tools and a steady stream of jobs has transformed my business. My income has grown 40% since joining.",
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
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-[#FFFCE9] border-b border-(--upwork-border)">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.svg"
                alt="Logo"
                width={120}
                height={40}
                className="h-8 w-auto"
                priority
              />
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-(--upwork-navy) hover:underline">
                Log in
              </Link>
              <Button className="bg-(--upwork-green) hover:bg-(--upwork-green-dark) text-white rounded-full px-6">
                Sign up
              </Button>
            </div>
          </div>
        </div>
      </header>

      <section className="py-12 md:py-16 lg:py-20 px-4 lg:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
            <div className="flex-1 lg:max-w-120 pt-4 lg:pt-8">
              <h1 className="text-4xl md:text-5xl lg:text-[52px] font-bold text-(--upwork-navy) leading-[1.08] mb-5">
                Join Australia&apos;s largest tradie marketplace
              </h1>
              <p className="text-base md:text-lg text-(--upwork-gray) mb-8 leading-relaxed max-w-md">
                Empower your trade career with tailored job matching, business tools, and opportunities from Australia&apos;s largest tradie marketplace.
              </p>
              <Button className="bg-(--upwork-green) hover:bg-(--upwork-green-dark) text-white rounded-full px-7 py-3 text-sm font-medium h-auto">
                Partner with us
              </Button>
            </div>

            <div className="flex-1 w-full lg:w-auto lg:max-w-[55%]">
              <div className="relative w-full aspect-4/3 rounded-xl overflow-hidden">
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
          {partnershipTypes.map((type, index) => (
            <div
              key={type.id}
              className={`flex flex-col lg:flex-row items-center gap-10 lg:gap-16 py-16 ${
                index !== partnershipTypes.length - 1 ? "border-b border-gray-200" : ""
              } ${index % 2 === 1 ? "lg:flex-row-reverse" : ""}`}
            >
              <div className="shrink-0 w-24 h-24 bg-(--upwork-light-gray) rounded-2xl flex items-center justify-center">
                {type.icon}
              </div>

              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-2xl md:text-3xl font-bold text-(--upwork-navy) mb-4">
                  {type.title}
                </h2>
                <p className="text-(--upwork-gray) mb-6 max-w-xl">
                  {type.description}
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                  <Button variant="outline" className="rounded-full px-6 border-(--upwork-green) text-(--upwork-green) hover:bg-(--upwork-green) hover:text-white">
                    {type.cta1}
                  </Button>
                  <Button className="bg-(--upwork-green) hover:bg-(--upwork-green-dark) text-white rounded-full px-6">
                    {type.cta2}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#f2f7f2] py-20 px-4 lg:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={prevTestimonial}
              className="p-2 rounded-full border border-gray-300 hover:border-gray-400 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={nextTestimonial}
              className="p-2 rounded-full border border-gray-300 hover:border-gray-400 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm">
            <div className={`w-12 h-12 ${testimonials[currentTestimonial].logoColor} rounded-lg flex items-center justify-center text-white font-bold text-lg mb-6`}>
              {testimonials[currentTestimonial].logo}
            </div>

            <blockquote className="text-lg md:text-xl text-(--upwork-navy) mb-6 leading-relaxed">
              &ldquo;{testimonials[currentTestimonial].quote}&rdquo;
            </blockquote>

            <div>
              <p className="font-semibold text-(--upwork-navy)">
                - {testimonials[currentTestimonial].author}
              </p>
              <p className="text-sm text-(--upwork-gray)">
                {testimonials[currentTestimonial].role}
              </p>
            </div>
          </div>

          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentTestimonial ? "bg-(--upwork-green)" : "bg-gray-300"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 lg:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-(--upwork-navy) mb-4">
            Ready to grow your trade business?
          </h2>
          <p className="text-(--upwork-gray) mb-8 max-w-xl mx-auto">
            Join thousands of tradies who are already finding quality work and growing their businesses on our platform.
          </p>
          <Button className="bg-(--upwork-green) hover:bg-(--upwork-green-dark) text-white rounded-full px-8 py-6 text-lg font-semibold">
            Join as a tradie
          </Button>
        </div>
      </section>

      <section className="bg-(--upwork-navy) text-white py-20 px-4 lg:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why tradies choose us
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Verified clients",
                description: "All clients are verified before they can post jobs, ensuring you work with serious customers.",
              },
              {
                title: "Fair pay guarantee",
                description: "Our secure payment system ensures you get paid on time for every completed job.",
              },
              {
                title: "Flexible schedule",
                description: "Choose the jobs that fit your schedule. Work when you want, where you want.",
              },
              {
                title: "Business tools",
                description: "Access invoicing, scheduling, and client management tools at no extra cost.",
              },
              {
                title: "Insurance support",
                description: "We help you stay compliant with insurance and licensing requirements.",
              },
              {
                title: "24/7 support",
                description: "Our support team is always available to help you resolve any issues.",
              },
            ].map((benefit, index) => (
              <div key={index} className="flex gap-4">
                <CheckCircle2 className="w-6 h-6 text-(--upwork-green) shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-white/70 text-sm">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 lg:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-(--upwork-light-gray) rounded-2xl p-8">
              <h3 className="text-xl font-bold text-(--upwork-navy) mb-3">
                Ready to find work?
              </h3>
              <p className="text-(--upwork-gray) mb-6">
                Create your profile and start receiving job matches tailored to your skills and location.
              </p>
              <Button className="bg-(--upwork-green) hover:bg-(--upwork-green-dark) text-white rounded-full px-6">
                Join as a tradie
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="bg-(--upwork-light-gray) rounded-2xl p-8">
              <h3 className="text-xl font-bold text-(--upwork-navy) mb-3">
                Already a top tradie?
              </h3>
              <p className="text-(--upwork-gray) mb-6">
                Apply for our verified expert program to unlock premium jobs and exclusive benefits.
              </p>
              <Button variant="outline" className="rounded-full px-6 border-(--upwork-green) text-(--upwork-green) hover:bg-(--upwork-green) hover:text-white">
                Apply for expert status
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-8 px-4 lg:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={100}
            height={32}
            className="h-6 w-auto"
          />
          <p className="text-sm text-(--upwork-gray)">
            &copy; 2024 All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
