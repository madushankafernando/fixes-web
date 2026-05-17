'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Loader2, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react'
import { api } from '@/lib/api'

export default function ClientWaitlistPage() {
  const [step, setStep] = useState<1 | 2>(1)
  
  const [formData, setFormData] = useState({ name: '', email: '', suburb: '', postcode: '' })
  
  const [questionnaire, setQuestionnaire] = useState({
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    q5: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setStep(2) 
  }

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    const formattedQuestionnaire = [
      { question: "How often do you currently hire tradespeople for jobs?", answer: questionnaire.q1 },
      { question: "How do you usually find a tradie when you need one?", answer: questionnaire.q2 },
      { question: "What is your biggest frustration when hiring a tradie today?", answer: questionnaire.q3 },
      { question: "Have you ever felt overcharged or experienced unexpected hidden fees?", answer: questionnaire.q4 },
      { question: "How likely are you to use an app that provides instant, transparent AI-generated quotes?", answer: questionnaire.q5 }
    ]

    try {
      await api.post('/api/auth/join-waitlist', { 
        ...formData, 
        type: 'client',
        questionnaire: formattedQuestionnaire
      }, true)
      setIsSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to join waitlist')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white font-sans">
      
      <div className="w-full md:w-1/2 lg:w-5/12 xl:w-1/3 flex flex-col justify-center items-center px-6 py-12 md:py-8 lg:px-12 z-10 bg-white shadow-[20px_0_40px_rgba(0,0,0,0.05)] relative overflow-y-auto">
        
        <div className="w-full max-w-md my-auto">
          
          <div className="mb-8 md:mb-10">
            <Link href="/">
              <Image
                src="/logo.svg"
                alt="Fixes"
                width={160}
                height={50}
                className="h-10 md:h-12 w-auto"
                priority
              />
            </Link>
          </div>

          {isSuccess ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 ring-8 ring-green-50/50">
                <CheckCircle2 className="w-8 h-8 text-(--upwork-green)" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-[#001e00] tracking-tight">
                You're on the list!
              </h1>
              <p className="text-lg text-gray-500 leading-relaxed">
                Thank you for your valuable feedback! We will send you an exclusive invitation as soon as we launch in your area.
              </p>
              <div className="pt-8">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-(--upwork-green) font-bold hover:text-green-700 transition-colors"
                >
                  Return to Home <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : step === 1 ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div>
                <h1 className="text-3xl lg:text-4xl font-black text-[#001e00] tracking-tight leading-tight mb-3">
                  Find trusted tradies instantly.
                </h1>
                <p className="text-base text-gray-500 leading-relaxed">
                  Join our waitlist to be the first to access AI-powered quoting and verified Australian tradespeople.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-100 flex items-start gap-3">
                   <div className="mt-0.5">⚠️</div>
                   <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleStep1Submit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-[#001e00] mb-1.5">
                    Full Name
                  </label>
                  <input
                    id="name"
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#001e00] placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-(--upwork-green) focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-[#001e00] mb-1.5">
                    Email Address
                  </label>
                  <input
                    id="email"
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#001e00] placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-(--upwork-green) focus:border-transparent transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="suburb" className="block text-sm font-bold text-[#001e00] mb-1.5">
                      Suburb
                    </label>
                    <input
                      id="suburb"
                      required
                      type="text"
                      value={formData.suburb}
                      onChange={(e) => setFormData({ ...formData, suburb: e.target.value })}
                      placeholder="Richmond"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#001e00] placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-(--upwork-green) focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="postcode" className="block text-sm font-bold text-[#001e00] mb-1.5">
                      Postcode
                    </label>
                    <input
                      id="postcode"
                      required
                      type="text"
                      value={formData.postcode}
                      onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                      placeholder="3121"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#001e00] placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-(--upwork-green) focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-[#001e00] hover:bg-gray-800 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] flex items-center justify-center gap-2"
                  >
                    Continue to Step 2 <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </form>
              <div className="flex justify-center mt-4">
                <div className="flex gap-2">
                  <div className="w-8 h-1.5 rounded-full bg-(--upwork-green)"></div>
                  <div className="w-8 h-1.5 rounded-full bg-gray-200"></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div>
                <button onClick={() => setStep(1)} className="text-sm font-bold text-gray-400 hover:text-gray-700 mb-4 flex items-center gap-1 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <h1 className="text-2xl font-black text-[#001e00] tracking-tight leading-tight mb-2">
                  Help us build the perfect app.
                </h1>
                <p className="text-sm text-gray-500 leading-relaxed">
                  We want to solve the actual problems you face. Answer 5 quick questions to secure your spot.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-100 flex items-start gap-3">
                   <div className="mt-0.5">⚠️</div>
                   <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleFinalSubmit} className="space-y-6">
                
                <div>
                  <label className="block text-sm font-bold text-[#001e00] mb-2">1. How often do you hire tradespeople?</label>
                  <select
                    required
                    value={questionnaire.q1}
                    onChange={(e) => setQuestionnaire({ ...questionnaire, q1: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#001e00] focus:bg-white focus:outline-none focus:ring-2 focus:ring-(--upwork-green) transition-all appearance-none"
                  >
                    <option value="" disabled>Select an option</option>
                    <option value="Rarely">Rarely</option>
                    <option value="1-2 times a year">1-2 times a year</option>
                    <option value="Frequently">Frequently</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#001e00] mb-2">2. How do you usually find a tradie?</label>
                  <select
                    required
                    value={questionnaire.q2}
                    onChange={(e) => setQuestionnaire({ ...questionnaire, q2: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#001e00] focus:bg-white focus:outline-none focus:ring-2 focus:ring-(--upwork-green) transition-all appearance-none"
                  >
                    <option value="" disabled>Select an option</option>
                    <option value="Word of mouth">Word of mouth</option>
                    <option value="Google Search">Google Search</option>
                    <option value="Facebook Groups">Facebook Groups / Social Media</option>
                    <option value="Other Platforms">Other Platforms</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#001e00] mb-2">3. What is your biggest frustration when hiring a tradie?</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="e.g. They never call back, quotes take too long..."
                    value={questionnaire.q3}
                    onChange={(e) => setQuestionnaire({ ...questionnaire, q3: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#001e00] focus:bg-white focus:outline-none focus:ring-2 focus:ring-(--upwork-green) transition-all resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#001e00] mb-2">4. Have you ever felt overcharged or experienced hidden fees?</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="q4" value="Yes" required checked={questionnaire.q4 === 'Yes'} onChange={(e) => setQuestionnaire({ ...questionnaire, q4: e.target.value })} className="w-4 h-4 text-(--upwork-green) focus:ring-(--upwork-green)" />
                      <span className="text-sm font-medium">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="q4" value="No" checked={questionnaire.q4 === 'No'} onChange={(e) => setQuestionnaire({ ...questionnaire, q4: e.target.value })} className="w-4 h-4 text-(--upwork-green) focus:ring-(--upwork-green)" />
                      <span className="text-sm font-medium">No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#001e00] mb-2">5. How likely are you to use an app providing instant, AI-generated quotes?</label>
                  <select
                    required
                    value={questionnaire.q5}
                    onChange={(e) => setQuestionnaire({ ...questionnaire, q5: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#001e00] focus:bg-white focus:outline-none focus:ring-2 focus:ring-(--upwork-green) transition-all appearance-none"
                  >
                    <option value="" disabled>Select an option</option>
                    <option value="Not likely">Not likely</option>
                    <option value="Somewhat likely">Somewhat likely</option>
                    <option value="Very likely">Very likely</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-(--upwork-green) hover:bg-[#108a00] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(20,168,0,0.39)] hover:shadow-[0_6px_20px_rgba(20,168,0,0.23)] hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      'Join the waitlist'
                    )}
                  </button>
                </div>
              </form>
              <div className="flex justify-center mt-4 pb-12 md:pb-0">
                <div className="flex gap-2">
                  <div className="w-8 h-1.5 rounded-full bg-gray-200"></div>
                  <div className="w-8 h-1.5 rounded-full bg-(--upwork-green)"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="hidden md:block flex-1 relative bg-[#001e00]">
        <div className="absolute inset-0">
          <img
            src="/waitlist-client.png"
            alt="Modern Australian Home Renovation"
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-linear-to-tr from-[#001e00]/80 via-[#001e00]/20 to-transparent mix-blend-multiply pointer-events-none" />
        </div>
      </div>

    </div>
  )
}
