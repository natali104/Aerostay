'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const ROLES = [
  { value: 'hotel', label: 'Hotel' },
  { value: 'airline', label: 'Airline' },
] as const

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'hotel' | 'airline'>('hotel')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      setSuccess(true)
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center py-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
          <CheckCircle className="h-7 w-7 text-success" />
        </div>
        <h2 className="mt-5 text-xl font-semibold text-white">
          Check your email
        </h2>
        <p className="mt-2 text-sm text-white/50 max-w-xs">
          We&apos;ve sent a confirmation link to{' '}
          <span className="font-medium text-white/70">{email}</span>. Click it
          to activate your account.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent-light transition-colors"
        >
          Go to Login
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-white text-center">
        Create your account
      </h1>
      <p className="mt-1 text-center text-sm text-white/40">
        Join AeroStay as a hotel or airline partner
      </p>

      <form onSubmit={handleSignup} className="mt-8 space-y-5">
        {error && (
          <div className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-white/70"
          >
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Doe"
            className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none transition-colors focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-white/70"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none transition-colors focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-white/70"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none transition-colors focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
          />
          <p className="mt-1 text-xs text-white/30">Minimum 6 characters</p>
        </div>

        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-white/70"
          >
            I am a…
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as 'hotel' | 'airline')}
            className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-accent/50 focus:ring-1 focus:ring-accent/30 appearance-none"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value} className="bg-primary text-white">
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={cn(
            'btn-primary w-full justify-center py-3 text-sm',
            loading && 'opacity-60 cursor-not-allowed'
          )}
        >
          {loading ? 'Creating account...' : 'Create Account'}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-white/40">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-medium text-accent hover:text-accent-light transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
