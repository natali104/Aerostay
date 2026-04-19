import Link from 'next/link'

export default function PricingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="text-center max-w-md">
        <Link href="/" className="inline-flex items-center gap-1.5 mb-8">
          <span style={{ color: '#0EA5E9', fontSize: 24, fontWeight: 700 }}>✦</span>
          <span style={{ color: '#0369A1', fontSize: 24, fontWeight: 700 }}>AeroStay</span>
        </Link>
        <h1 className="text-3xl font-bold" style={{ color: '#0F172A' }}>Pricing</h1>
        <p className="mt-4 text-base" style={{ color: '#64748B' }}>This page is coming soon.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 mt-8 text-sm font-medium transition-colors"
          style={{ color: '#0EA5E9' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          Back to home
        </Link>
      </div>
    </div>
  )
}
