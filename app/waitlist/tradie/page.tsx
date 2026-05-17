'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Loader2, CheckCircle2, ArrowRight } from 'lucide-react'
import { api } from '@/lib/api'

export default function TradieWaitlistPage() {
  const [formData, setFormData] = useState({ name: '', email: '', suburb: '', postcode: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await api.post('/api/auth/join-waitlist', { ...formData, type: 'tradie' }, true)
      setIsSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to join waitlist')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white font-sans">
      
      <div className="w-full md:w-1/2 lg:w-5/12 xl:w-1/3 flex flex-col justify-center items-center px-6 py-8 md:py-4 lg:px-12 z-10 bg-white shadow-[20px_0_40px_rgba(0,0,0,0.05)] relative">
        
        <div className="w-full max-w-md">
          
          <div className="mb-5 md:mb-6">
            <Link href="/">
              <img
                src="/fixer-logo.svg"
                alt="Fixer"
                className="w-14 md:w-16 h-auto object-contain shadow-sm rounded-xl md:rounded-2xl"
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
                Thanks for joining the Fixer waitlist. We will notify you the moment we start onboarding tradies in your area.
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
          ) : (
            <div className="space-y-4 animate-in fade-in duration-500">
              <div>
                <div className="inline-block px-3 py-1 bg-green-50 border border-green-200 text-(--upwork-green-dark) text-[10px] font-black uppercase tracking-widest rounded-full mb-2">
                  For Tradespeople
                </div>
                <h1 className="text-3xl lg:text-4xl font-black text-[#001e00] tracking-tight leading-tight mb-2">
                  Get more jobs, zero lead fees.
                </h1>
                <p className="text-base text-gray-500 leading-relaxed">
                  Join our waitlist to be one of the first tradies on Fixer. Guaranteed payments and AI-powered quoting.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-100 flex items-start gap-3">
                   <div className="mt-0.5">⚠️</div>
                   <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                
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
              
              <p className="text-[11px] text-center text-gray-400 mt-4">
                By joining, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="hidden md:block flex-1 relative bg-[#001e00]">
        <div className="absolute inset-0">
          <img
            src="/waitlist-tradie.png"
            alt="Professional Australian Tradie"
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-linear-to-tr from-[#001e00]/80 via-[#001e00]/20 to-transparent mix-blend-multiply pointer-events-none" />
        </div>
      </div>

    </div>
  )
}
