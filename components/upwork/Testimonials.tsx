"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"

const testimonials = [
  {
    quote: "We discovered CTO-level expertise on the platform—someone who had already served as a startup CTO—willing to contribute to our open-source project. That kind of talent brings tremendous value to us.",
    name: "Saswata Basu",
    title: "CEO",
    company: "Züs",
    avatar: "SB",
  },
  {
    quote: "Upwork isn't just a hiring platform for us—it's a strategic partner. It's helped us fill every technical gap, accelerate our delivery from months to weeks, and even bring on leaders who've become foundational to our business.",
    name: "David Wrench",
    title: "Co-Founder and CEO",
    company: "Datajoi",
    avatar: "DW",
  },
  {
    quote: "I found two awesome candidates and wound up hiring an AI freelancer based in Paris...I love the platform and the amount of talent I have access to. We really couldn't be this far along without help from the talent on Upwork.",
    name: "Matt See",
    title: "Co-Founder and CEO",
    company: "Lighthouse",
    avatar: "MS",
  },
  {
    quote: "Upwork is paramount to the success that we've had. We can't accomplish what we do without our Upwork staff. And like I said, to us, you know, it's awkward for me to say Upwork or freelancer staff, because we fully consider them part of our team.",
    name: "Bryan Goltzman",
    title: "CEO",
    company: "Liquid Screen Design",
    avatar: "BG",
  },
  {
    quote: "But in this early stage, we really need to be lean, targeted, and prove out all the things that we're doing...And being able to really find the right people, and be able to interview different people where you know they're really heart driven, but that yet they also have these immense talents, has been really awesome.",
    name: "Jen Libby",
    title: "Founder and CEO",
    company: "Promly",
    avatar: "JL",
  },
  {
    quote: "The safety features are nice, but what really builds our confidence in Upwork is how we consistently find experts who deliver on highly technical, complex projects...Upwork helped us build a community of incredible talent, which means we now spend even less time recruiting than before.",
    name: "Gabriel Richman",
    title: "Founder and CEO",
    company: "Omic",
    avatar: "GR",
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
        <h2 className="text-3xl lg:text-4xl font-bold text-[var(--upwork-navy)] text-center mb-12">
          Proven results on Upwork
        </h2>

        {/* Desktop Grid */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6">
          {testimonials.slice(0, 6).map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>

        {/* Mobile Carousel */}
        <div className="lg:hidden">
          <div className="relative">
            <TestimonialCard testimonial={testimonials[currentIndex]} />
            
            {/* Navigation */}
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                onClick={prevTestimonial}
                className="p-2 rounded-full border border-gray-300 hover:border-[var(--upwork-green)] hover:text-[var(--upwork-green)] transition-colors"
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
                        ? "bg-[var(--upwork-green)]"
                        : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextTestimonial}
                className="p-2 rounded-full border border-gray-300 hover:border-[var(--upwork-green)] hover:text-[var(--upwork-green)] transition-colors"
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
    <div className="bg-[var(--upwork-light-gray)] rounded-2xl p-6 h-full flex flex-col">
      <Quote className="w-8 h-8 text-[var(--upwork-green)] mb-4" />
      <p className="text-[var(--upwork-navy)] text-sm leading-relaxed mb-6 flex-1">
        &ldquo;{testimonial.quote}&rdquo;
      </p>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-[var(--upwork-green)] flex items-center justify-center text-white font-semibold">
          {testimonial.avatar}
        </div>
        <div>
          <p className="font-semibold text-[var(--upwork-navy)]">{testimonial.name}</p>
          <p className="text-sm text-[var(--upwork-gray)]">
            {testimonial.title}, {testimonial.company}
          </p>
        </div>
      </div>
    </div>
  )
}
