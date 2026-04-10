// fixes-web/app/verify-email/[token]/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react'
import { api } from '@/lib/api'

type State = 'loading' | 'success' | 'error' | 'already_verified'

export default function VerifyEmailPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  const [state, setState] = useState<State>('loading')
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    async function verify() {
      try {
        const res = await api.get<{ message: string }>(`/api/auth/verify-email/${token}`, true)
        if (res.data.message === 'Email already verified') {
          setState('already_verified')
        } else {
          setState('success')
        }
      } catch {
        setState('error')
      }
    }
    verify()
  }, [token])

  useEffect(() => {
    if (state !== 'success') return
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval)
          router.push('/dashboard')
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [state, router])

  return (
    <div className="min-h-screen bg-[#f9faf9] flex items-center justify-center px-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 sm:p-10 w-full max-w-md text-center shadow-sm">

        {state === 'loading' && (
          <>
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <Loader2 className="w-8 h-8 text-(--upwork-green) animate-spin" />
            </div>
            <h1 className="text-xl font-bold text-(--upwork-navy) mb-2">Verifying your email…</h1>
            <p className="text-sm text-gray-400">Please wait a moment.</p>
          </>
        )}

        {state === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-(--upwork-navy) mb-2">Email verified!</h1>
            <p className="text-sm text-gray-400 mb-6">
              Your email address has been verified. Redirecting to your dashboard in{' '}
              <span className="font-semibold text-(--upwork-navy)">{countdown}s</span>…
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-6 rounded-xl bg-(--upwork-green) hover:bg-(--upwork-green-dark) text-white text-sm font-medium transition-colors"
            >
              Go to Dashboard
            </Link>
          </>
        )}

        {state === 'already_verified' && (
          <>
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-blue-500" />
            </div>
            <h1 className="text-xl font-bold text-(--upwork-navy) mb-2">Already verified</h1>
            <p className="text-sm text-gray-400 mb-6">
              Your email is already verified. You're all set!
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-6 rounded-xl bg-(--upwork-green) hover:bg-(--upwork-green-dark) text-white text-sm font-medium transition-colors"
            >
              Go to Dashboard
            </Link>
          </>
        )}

        {state === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-(--upwork-navy) mb-2">Link expired or invalid</h1>
            <p className="text-sm text-gray-400 mb-6">
              This verification link has expired or is invalid. You can request a fresh one from your profile.
            </p>
            <Link
              href="/dashboard/profile"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-6 rounded-xl bg-(--upwork-green) hover:bg-(--upwork-green-dark) text-white text-sm font-medium transition-colors"
            >
              <Mail className="w-4 h-4" />
              Go to Profile to Resend
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
