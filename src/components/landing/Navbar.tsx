'use client'

import { useState } from 'react'
import Link from 'next/link'

const NAV_LINKS = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'For Hotels', href: '#for-hotels' },
  { label: 'For Airlines', href: '#for-airlines' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid #E2E8F0',
      }}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        <Link href="/" className="flex items-center gap-1.5">
          <span style={{ color: '#0EA5E9', fontSize: 20, fontWeight: 700 }}>✦</span>
          <span style={{ color: '#0369A1', fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em' }}>
            AeroStay
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium transition-colors duration-200"
              style={{ color: '#475569' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#0EA5E9')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200"
            style={{
              color: '#0EA5E9',
              border: '1.5px solid #0EA5E9',
              background: 'transparent',
            }}
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-5 py-2 text-sm font-semibold rounded-lg text-white transition-all duration-200"
            style={{ background: '#0EA5E9' }}
          >
            Get Started
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2">
            {mobileOpen ? (
              <path d="M6 6l12 12M6 18L18 6" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#E2E8F0] bg-white/95 backdrop-blur-xl px-6 py-4 space-y-3">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block text-sm font-medium py-2"
              style={{ color: '#475569' }}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="flex gap-3 pt-3 border-t border-[#E2E8F0]">
            <Link
              href="/login"
              className="flex-1 text-center px-4 py-2 text-sm font-semibold rounded-lg"
              style={{ color: '#0EA5E9', border: '1.5px solid #0EA5E9' }}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="flex-1 text-center px-4 py-2 text-sm font-semibold rounded-lg text-white"
              style={{ background: '#0EA5E9' }}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
