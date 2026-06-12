"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"

const testimonials = [
  {
    quote: "I needed an emergency plumber and didn't want to get ripped off. The AI quoting tool gave me an instant, fair price, and the tradie was at my door in 30 minutes. Paying securely through escrow gave me total peace of mind.",
    name: "Sarah Jenkins",
    title: "Home Owner",
    company: "Sydney, NSW",
    avatar: "SJ",
  },
  {
    quote: "Fixes isn't just a job board for me—it's how I run my entire business. The automated dispatch means jobs just pop up on my phone when I'm nearby. I've doubled my weekly revenue without spending a dime on marketing.",
    name: "Mike Davies",
    title: "Licensed Electrician",
    company: "Davies Electrical",
    avatar: "MD",
  },
  {
    quote: "Managing 15 cleaners across multiple commercial sites used to be a nightmare. With Fixes' agency tools, I can dispatch tasks, track my team's live location, and handle centralized billing all from one dashboard. It's a game-changer.",
    name: "Jessica Lin",
    title: "Operations Manager",
    company: "Sparkle Commercial Cleaning",
    avatar: "JL",
  },
  {
    quote: "The safety features are incredible. Knowing that every tradie on Fixes has gone through premium background checks builds instant trust. I hired a carpenter for a custom deck, and the quality of work was absolutely top-notch.",
    name: "Tom Richards",
    title: "Home Owner",
    company: "Brisbane, QLD",
    avatar: "TR",
  },
  {
    quote: "Before Fixes, I spent hours chasing up unpaid invoices every Friday. Now, the escrow system ensures the funds are locked in before I even start the job. Once the client approves, the money is in my wallet instantly. I love it.",
    name: "Ali Hassan",
    title: "Master Plumber",
    company: "Hassan Plumbing & Gas",
    avatar: "AH",
  },
  {
    quote: "In this industry, you need to be lean and targeted. The recurring schedule feature automates our ongoing contracts, and the real-time AI analytics show me exactly which sites are most profitable. We couldn't scale this fast without Fixes.",
    name: "Elena Rossi",
    title: "Founder",
    company: "Rossi Facilities Management",
    avatar: "ER",
  },
]

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <h2 className="text-3xl lg:text-4xl font-bold text-(--upwork-navy) text-center mb-12">
          Proven results on Fixes
        </h2>

        <div className="hidden lg:grid lg:grid-cols-3 gap-6">
          {testimonials.slice(0, 6).map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>

        <div className="lg:hidden">
          <div className="relative">
            <TestimonialCard testimonial={testimonials[currentIndex]} />
            
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                onClick={prevTestimonial}
                className="p-2 rounded-full border border-gray-300 hover:border-(--upwork-green) hover:text-(--upwork-green) transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentIndex
                        ? "bg-(--upwork-green)"
                        : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextTestimonial}
                className="p-2 rounded-full border border-gray-300 hover:border-(--upwork-green) hover:text-(--upwork-green) transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function TestimonialCard({ testimonial }: { testimonial: typeof testimonials[0] }) {
  return (
    <div className="bg-(--upwork-light-gray) rounded-2xl p-6 h-full flex flex-col">
      <Quote className="w-8 h-8 text-(--upwork-green) mb-4" />
      <p className="text-(--upwork-navy) text-sm leading-relaxed mb-6 flex-1">
        &ldquo;{testimonial.quote}&rdquo;
      </p>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-(--upwork-green) flex items-center justify-center text-white font-semibold">
          {testimonial.avatar}
        </div>
        <div>
          <p className="font-semibold text-(--upwork-navy)">{testimonial.name}</p>
          <p className="text-sm text-(--upwork-gray)">
            {testimonial.title}, {testimonial.company}
          </p>
        </div>
      </div>
    </div>
  )
}
