'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff, Loader2, Info } from 'lucide-react'
import { api, setTokens, ApiError } from '@/lib/api'
import { VALID_CATEGORIES, CATEGORY_LABELS } from '@/lib/constants'
import type { RegisterTradieResponse, TradieCategory } from '@/lib/types'

export default function RegisterTradiePage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [category, setCategory] = useState<TradieCategory | ''>('')
  const [skills, setSkills] = useState('')
  const [bio, setBio] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name || !email || !password || !category) {
      setError('Name, email, password and trade category are required')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await api.post<RegisterTradieResponse>(
        '/api/auth/register/tradie',
        {
          name,
          email,
          password,
          phone: phone || undefined,
          category,
          skills: skills
            ? skills.split(',').map((s) => s.trim()).filter(Boolean)
            : [],
          bio: bio || undefined,
        },
        true
      )

      setTokens(res.data.accessToken, res.data.refreshToken)
      router.push('/dashboard')
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
      {/* Header */}
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

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {/* Temporary notice */}
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-6">
            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">
              Tradie registration will move to the <strong>Fixes mobile app</strong> soon.
              This is a temporary web registration.
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h1 className="text-2xl font-bold text-(--upwork-navy) text-center mb-2">
              Join as a Tradie
            </h1>
            <p className="text-sm text-(--upwork-gray) text-center mb-8">
              Create your account and start receiving job offers.
            </p>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label
                  htmlFor="tradie-name"
                  className="block text-sm font-medium text-(--upwork-navy) mb-1.5"
                >
                  Full Name
                </label>
                <input
                  id="tradie-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Smith"
                  autoComplete="name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-(--upwork-navy) placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-(--upwork-green) focus:border-transparent transition-shadow"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="tradie-email"
                  className="block text-sm font-medium text-(--upwork-navy) mb-1.5"
                >
                  Email
                </label>
                <input
                  id="tradie-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-(--upwork-navy) placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-(--upwork-green) focus:border-transparent transition-shadow"
                />
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="tradie-phone"
                  className="block text-sm font-medium text-(--upwork-navy) mb-1.5"
                >
                  Phone <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  id="tradie-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="04XX XXX XXX"
                  autoComplete="tel"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-(--upwork-navy) placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-(--upwork-green) focus:border-transparent transition-shadow"
                />
              </div>

              {/* Trade Category */}
              <div>
                <label
                  htmlFor="tradie-category"
                  className="block text-sm font-medium text-(--upwork-navy) mb-1.5"
                >
                  Primary Trade Category
                </label>
                <select
                  id="tradie-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TradieCategory)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-(--upwork-navy) bg-white focus:outline-none focus:ring-2 focus:ring-(--upwork-green) focus:border-transparent transition-shadow"
                >
                  <option value="" disabled>
                    Select your trade...
                  </option>
                  {VALID_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {CATEGORY_LABELS[cat]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Skills */}
              <div>
                <label
                  htmlFor="tradie-skills"
                  className="block text-sm font-medium text-(--upwork-navy) mb-1.5"
                >
                  Skills <span className="text-gray-400 font-normal">(comma-separated, optional)</span>
                </label>
                <input
                  id="tradie-skills"
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="Rewiring, Switchboard, LED Installation"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-(--upwork-navy) placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-(--upwork-green) focus:border-transparent transition-shadow"
                />
              </div>

              {/* Bio */}
              <div>
                <label
                  htmlFor="tradie-bio"
                  className="block text-sm font-medium text-(--upwork-navy) mb-1.5"
                >
                  Bio <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  id="tradie-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell clients about your experience and expertise..."
                  maxLength={1000}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-(--upwork-navy) placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-(--upwork-green) focus:border-transparent transition-shadow resize-none"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">
                  {bio.length}/1000
                </p>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="tradie-password"
                  className="block text-sm font-medium text-(--upwork-navy) mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="tradie-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-(--upwork-navy) placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-(--upwork-green) focus:border-transparent transition-shadow"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="tradie-confirm-password"
                  className="block text-sm font-medium text-(--upwork-navy) mb-1.5"
                >
                  Confirm Password
                </label>
                <input
                  id="tradie-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-(--upwork-navy) placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-(--upwork-green) focus:border-transparent transition-shadow"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-(--upwork-green) hover:bg-(--upwork-green-dark) disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Tradie Account'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-sm text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Links */}
            <p className="text-center text-sm text-(--upwork-gray)">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-(--upwork-green) font-medium hover:underline"
              >
                Log in
              </Link>
            </p>
            <p className="text-center text-sm text-(--upwork-gray) mt-2">
              Looking to hire?{' '}
              <Link
                href="/register"
                className="text-(--upwork-green) font-medium hover:underline"
              >
                Sign up as a client
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
