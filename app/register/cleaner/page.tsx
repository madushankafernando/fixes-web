'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff, Loader2, Sparkles, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { api, setTokens, ApiError } from '@/lib/api'
 
interface InvitePreview {
  category: 'cleaning' | 'waste_removal'
  email: string | null
  name: string | null
  expiresAt: string
}

interface RegisterAgencyResponse {
  accessToken: string
  refreshToken: string
  user: { name: string; email: string }
  requiredDocuments: { type: string; label: string }[]
}

const CATEGORY_META = {
  cleaning: {
    label: 'Cleaning Professional',
    icon: Sparkles,
    color: 'text-teal-600',
    bg: 'bg-teal-50 border-teal-200',
    docs: ['National Police Check', 'ABN', 'Public Liability Insurance'],
  },
  waste_removal: {
    label: 'Waste Removal Professional',
    icon: Trash2,
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
    docs: ['National Police Check', 'ABN', 'Public Liability Insurance'],
  },
}

function CleanerRegisterForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''

  const [invite, setInvite] = useState<InvitePreview | null>(null)
  const [inviteError, setInviteError] = useState('')
  const [isValidating, setIsValidating] = useState(true)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setInviteError('Missing invite token. Use the link from your invitation email.')
      setIsValidating(false)
      return
    }

    api.get<InvitePreview>(`/api/auth/register/cleaning/invite/${token}`, true)
      .then((res) => {
        setInvite(res.data)
        if (res.data.name) setName(res.data.name)
        if (res.data.email) setEmail(res.data.email)
      })
      .catch((err) => {
        setInviteError(err instanceof ApiError ? err.message : 'This invite link is invalid or expired.')
      })
      .finally(() => setIsValidating(false))
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name || !email || !phone || !password) {
      setError('Name, email, phone, and password are required')
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
      const res = await api.post<RegisterAgencyResponse>(
        '/api/auth/register/cleaning',
        { name, email, phone, password, inviteToken: token },
        true
      )
      setTokens(res.data.accessToken, res.data.refreshToken)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const meta = invite ? CATEGORY_META[invite.category] : null
  const Icon = meta?.icon ?? Sparkles

  return (
    <div className="min-h-screen bg-linear-to-br from-white via-teal-50/30 to-white flex flex-col">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
          <Link href="/" className="inline-block">
            <Image src="/logo.svg" alt="Fixes" width={120} height={40} className="h-8 w-auto" priority />
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {isValidating ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-teal-600 animate-spin mb-3" />
              <p className="text-sm text-gray-500">Verifying your invitation…</p>
            </div>
          ) : inviteError ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-gray-800 mb-2">Invalid invitation</h1>
              <p className="text-sm text-gray-500 mb-6">{inviteError}</p>
              <Link href="/login" className="text-sm text-teal-600 hover:underline font-medium">
                Back to login
              </Link>
            </div>
          ) : success ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
              <CheckCircle2 className="w-12 h-12 text-teal-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-800 mb-2">You&apos;re registered!</h1>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Your {meta?.label.toLowerCase()} account is ready. Download the <strong>Fixer</strong> mobile app,
                sign in with <strong>{email}</strong>, and upload your required documents to start receiving jobs.
              </p>
              <ul className="text-left text-sm text-gray-600 bg-gray-50 rounded-xl p-4 mb-6 space-y-1">
                {meta?.docs.map((d) => (
                  <li key={d}>• {d}</li>
                ))}
              </ul>
              <Link
                href="/login"
                className="inline-block w-full bg-teal-600 text-white font-semibold py-3 rounded-xl hover:bg-teal-700 transition-colors"
              >
                Go to login
              </Link>
            </div>
          ) : invite && meta ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 mb-6 ${meta.bg}`}>
                <Icon className={`w-6 h-6 shrink-0 ${meta.color}`} />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Invitation</p>
                  <p className={`text-sm font-semibold ${meta.color}`}>{meta.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Expires {new Date(invite.expiresAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">Create your account</h1>
              <p className="text-sm text-gray-500 text-center mb-6">
                Complete registration to join the Fixes agency team.
              </p>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="cleaner-name" className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
                  <input
                    id="cleaner-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Smith"
                    autoComplete="name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label htmlFor="cleaner-email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input
                    id="cleaner-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    readOnly={!!invite.email}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 ${invite.email ? 'bg-gray-50 text-gray-600' : ''}`}
                  />
                  {invite.email && (
                    <p className="text-xs text-gray-400 mt-1">Email is locked to your invitation.</p>
                  )}
                </div>
                <div>
                  <label htmlFor="cleaner-phone" className="block text-sm font-medium text-gray-700 mb-1.5">Mobile phone</label>
                  <input
                    id="cleaner-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="04XX XXX XXX"
                    autoComplete="tel"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label htmlFor="cleaner-password" className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      id="cleaner-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                      className="w-full px-4 py-3 pr-11 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="cleaner-confirm" className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
                  <input
                    id="cleaner-confirm"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">
                  After signup you will need to upload: {meta.docs.join(', ')}.
                </p>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-teal-600 text-white font-semibold py-3 rounded-xl hover:bg-teal-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating account…</> : 'Create account'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                Already have an account?{' '}
                <Link href="/login" className="text-teal-600 hover:underline font-medium">Sign in</Link>
              </p>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  )
}

export default function RegisterCleanerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
        </div>
      }
    >
      <CleanerRegisterForm />
    </Suspense>
  )
}
