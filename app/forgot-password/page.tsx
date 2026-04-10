// fixes-web/app/forgot-password/page.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'
import { api, ApiError } from '@/lib/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('Email is required')
      return
    }

    setIsSubmitting(true)

    try {
      await api.post('/api/auth/forgot-password', { email }, true)
      setIsSent(true)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-white via-[#f2f7f2] to-white flex flex-col">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
          <Link href="/" className="inline-block">
            <Image
              src="/logo.svg"
              alt="Fixes"
              width={120}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            {isSent ? (
              <div className="text-center">
                <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-7 h-7 text-(--upwork-green)" />
                </div>
                <h1 className="text-2xl font-bold text-(--upwork-navy) mb-2">
                  Check your email
                </h1>
                <p className="text-sm text-(--upwork-gray) mb-6">
                  If an account exists for <strong>{email}</strong>, we&apos;ve sent a
                  password reset link. Please check your inbox.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm text-(--upwork-green) font-medium hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </Link>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-(--upwork-navy) text-center mb-2">
                  Forgot your password?
                </h1>
                <p className="text-sm text-(--upwork-gray) text-center mb-8">
                  Enter your email and we&apos;ll send you a reset link.
                </p>

                {error && (
                  <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label
                      htmlFor="forgot-email"
                      className="block text-sm font-medium text-(--upwork-navy) mb-1.5"
                    >
                      Email
                    </label>
                    <input
                      id="forgot-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-(--upwork-navy) placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-(--upwork-green) focus:border-transparent transition-shadow"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-(--upwork-green) hover:bg-(--upwork-green-dark) disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-sm text-(--upwork-green) font-medium hover:underline"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to login
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
