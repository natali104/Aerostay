'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        return
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError('Unable to retrieve user information.')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      const role = profile?.role

      if (role === 'hotel') {
        router.push('/dashboard/hotel')
      } else if (role === 'airline') {
        router.push('/dashboard/airline')
      } else if (role === 'admin') {
        router.push('/dashboard/admin')
      } else {
        router.push('/dashboard')
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-white text-center">
        Welcome back
      </h1>
      <p className="mt-1 text-center text-sm text-white/40">
        Sign in to your AeroStay account
      </p>

      <form onSubmit={handleLogin} className="mt-8 space-y-5">
        {error && (
          <div className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
            {error}
          </div>
        )}

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
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-white/70"
            >
              Password
            </label>
            <a
              href="#"
              className="text-xs text-accent/70 hover:text-accent transition-colors"
            >
              Forgot password?
            </a>
          </div>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none transition-colors focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={cn(
            'btn-primary w-full justify-center py-3 text-sm',
            loading && 'opacity-60 cursor-not-allowed'
          )}
        >
          {loading ? 'Signing in...' : 'Sign In'}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-white/40">
        Don&apos;t have an account?{' '}
        <Link
          href="/signup"
          className="font-medium text-accent hover:text-accent-light transition-colors"
        >
          Create one
        </Link>
      </p>
    </div>
  )
}
