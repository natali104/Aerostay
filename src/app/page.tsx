import Link from 'next/link'
import HeroSection from '@/components/HeroSection'
import Navbar from '@/components/landing/Navbar'
import LiveActivityStrip from '@/components/landing/LiveActivityStrip'
import ShimmerButton from '@/components/ui/ShimmerButton'

/* ─── Data ────────────────────────────────────────────────── */

const STATS = [
  { value: '50+', label: 'Partner Hotels' },
  { value: '24/7', label: 'Availability' },
  { value: '< 2min', label: 'Avg. Booking' },
]

const STEPS = [
  {
    num: 1,
    title: 'Layover Detected',
    description:
      'Our system monitors flight data in real time and detects delays, diversions, and extended layovers the moment they happen.',
  },
  {
    num: 2,
    title: 'Hotels Notified',
    description:
      'Instant availability requests go out to verified partner hotels near the airport — with live pricing and room counts.',
  },
  {
    num: 3,
    title: 'Booking Confirmed',
    description:
      'Airlines pick the best option and confirm with one click. Passengers receive booking details automatically via email.',
  },
]

const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: 'Real-time Monitoring',
    description:
      'Automatically detect layovers and delays that require hotel accommodation for passengers and crew.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    title: 'Instant Availability',
    description:
      'Get live pricing and room availability from partner hotels the moment a layover is detected.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    title: 'Smart Matching',
    description:
      'Intelligently connect airlines with the best-fit hotels based on proximity, price, and rating.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    title: 'Price Negotiation',
    description:
      'Built-in negotiation flow lets airlines and hotels agree on the best rates before confirming.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: 'Commission Tracking',
    description:
      'Automated billing and commission calculations for every confirmed booking. Full transparency.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    title: 'Email Notifications',
    description:
      'Instant email alerts keep airlines, hotels, and guests informed at every stage of the booking.',
  },
]

const HOTEL_BENEFITS = [
  'Fill empty rooms during off-peak hours with guaranteed airline bookings',
  'Receive instant notifications when airlines need accommodation nearby',
  'Negotiate rates directly through the platform — no middlemen',
  'Automated invoicing and commission tracking for every booking',
  'Build long-term partnerships with major airline operators',
]

const AIRLINE_BENEFITS = [
  'Eliminate the chaos of phone calls and last-minute scrambling',
  'Access real-time availability from verified partner hotels',
  'One-click booking confirmation for passengers and crew',
  'Full audit trail and reporting for every layover event',
  'Reduce layover costs with competitive, pre-negotiated rates',
]

const HOTEL_DASHBOARD_ROWS = [
  { status: 'Confirmed', flight: 'LZ481', rooms: 26, revenue: '€2,314' },
  { status: 'Pending', flight: 'TK1029', rooms: 18, revenue: '€1,710' },
  { status: 'Confirmed', flight: 'W64455', rooms: 31, revenue: '€2,449' },
]

const AIRLINE_EVENTS = [
  { time: '14:32', flight: 'LZ481', status: 'Confirmed', hotel: 'Hyatt Regency', pax: 52 },
  { time: '13:18', flight: 'FB402', status: 'Pending', hotel: 'Hilton Sofia', pax: 38 },
  { time: '12:05', flight: 'W64455', status: 'Confirmed', hotel: 'Radisson Blu', pax: 61 },
]

const FOOTER_LINKS = {
  Platform: [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Pricing', href: '/pricing' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: 'mailto:contact@aerostay.app' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
}

/* ─── Inline SVG icons ──────────────────────────────────── */

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill="#0EA5E9" fillOpacity="0.12" />
      <path d="M6 10.5l2.5 2.5 5.5-5.5" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ─── Page ────────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* ───── Navbar ───── */}
      <Navbar />

      {/* ───── Hero ───── */}
      <HeroSection />

      {/* ───── Stats Row ───── */}
      <section className="relative z-10 -mt-12 pb-8">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl p-6 text-center"
                style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}
              >
                <p style={{ fontSize: 36, fontWeight: 700, color: '#0369A1', lineHeight: 1.1 }}>
                  {stat.value}
                </p>
                <p className="mt-2 text-sm" style={{ color: '#64748B' }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── How It Works ───── */}
      <section id="how-it-works" className="py-24 bg-white scroll-mt-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#0EA5E9' }}>
              How It Works
            </p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl" style={{ color: '#0F172A' }}>
              Three simple steps
            </h2>
            <p className="mt-3 max-w-xl mx-auto" style={{ color: '#64748B' }}>
              From layover detection to confirmed booking — fully automated so your team can focus on what matters.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting lines (desktop) */}
            <div className="hidden md:block absolute top-[22px] left-[calc(16.67%+22px)] right-[calc(16.67%+22px)] h-[2px]" style={{ background: '#E2E8F0' }} />

            {STEPS.map((step) => (
              <div key={step.num} className="flex flex-col items-center text-center">
                <div
                  className="relative z-10 flex items-center justify-center rounded-full text-white font-bold"
                  style={{ width: 44, height: 44, background: '#0EA5E9', fontSize: 16 }}
                >
                  {step.num}
                </div>
                <h3 className="mt-5 text-lg font-semibold" style={{ color: '#0F172A' }}>
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: '#64748B', maxWidth: 280 }}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Features Grid ───── */}
      <section id="features" className="py-24 scroll-mt-20" style={{ background: '#F8FAFC' }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#0EA5E9' }}>
              Features
            </p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl" style={{ color: '#0F172A' }}>
              Everything you need to manage layovers
            </h2>
            <p className="mt-3 max-w-xl mx-auto" style={{ color: '#64748B' }}>
              Purpose-built tools for airlines and hotels to collaborate effortlessly.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-xl p-7 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}
              >
                <div
                  className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg"
                  style={{ background: 'rgba(14,165,233,0.08)' }}
                >
                  {f.icon}
                </div>
                <h3 className="text-base font-semibold" style={{ color: '#0F172A' }}>
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: '#64748B' }}>
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── For Hotels ───── */}
      <section id="for-hotels" className="py-24 bg-white scroll-mt-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left: Dark dashboard card */}
            <div className="rounded-2xl p-8 lg:p-10" style={{ background: '#0D1426' }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#64748B' }}>
                    Hotel Dashboard
                  </p>
                  <p className="mt-1 text-lg font-bold text-white">Today&apos;s Bookings</p>
                </div>
                <div className="flex items-center gap-2 rounded-full px-3 py-1" style={{ background: 'rgba(16,185,129,0.15)' }}>
                  <span className="h-2 w-2 rounded-full" style={{ background: '#10B981' }} />
                  <span className="text-xs font-medium" style={{ color: '#10B981' }}>Live</span>
                </div>
              </div>

              <div className="space-y-3">
                {HOTEL_DASHBOARD_ROWS.map((row) => (
                  <div
                    key={row.flight}
                    className="flex items-center justify-between rounded-lg px-4 py-3"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold"
                        style={{
                          background: row.status === 'Confirmed' ? 'rgba(16,185,129,0.15)' : 'rgba(245,166,35,0.15)',
                          color: row.status === 'Confirmed' ? '#10B981' : '#F5A623',
                        }}
                      >
                        {row.status}
                      </span>
                      <span className="text-sm font-medium text-white" style={{ fontFamily: "'Space Mono', monospace" }}>
                        {row.flight}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs" style={{ color: '#64748B' }}>{row.rooms} rooms</span>
                      <span className="text-sm font-semibold" style={{ color: '#0EA5E9' }}>{row.revenue}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: '#64748B' }}>Total Revenue Today</span>
                  <span className="text-sm font-bold text-white">€6,473</span>
                </div>
              </div>
            </div>

            {/* Right: Text + benefits */}
            <div>
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium"
                style={{ background: 'rgba(14,165,233,0.08)', color: '#0EA5E9' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                For Hotels
              </div>
              <h2 className="mt-4 text-3xl font-bold sm:text-4xl" style={{ color: '#0F172A' }}>
                Turn empty rooms into guaranteed revenue
              </h2>
              <p className="mt-4 leading-relaxed" style={{ color: '#64748B' }}>
                Partner with airlines to fill rooms during off-peak hours. AeroStay brings bookings directly to you — no OTA commissions, no uncertainty.
              </p>
              <ul className="mt-8 space-y-4">
                {HOTEL_BENEFITS.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <span className="mt-0.5 shrink-0"><CheckIcon /></span>
                    <span className="text-sm" style={{ color: '#475569' }}>{b}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <ShimmerButton href="/signup" color="blue" size="lg">
                  Register Your Hotel
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </ShimmerButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── For Airlines ───── */}
      <section id="for-airlines" className="py-24 scroll-mt-20" style={{ background: '#F8FAFC' }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left: Text + benefits */}
            <div className="order-2 lg:order-1">
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium"
                style={{ background: 'rgba(14,165,233,0.08)', color: '#0EA5E9' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
                </svg>
                For Airlines
              </div>
              <h2 className="mt-4 text-3xl font-bold sm:text-4xl" style={{ color: '#0F172A' }}>
                Handle every layover with confidence
              </h2>
              <p className="mt-4 leading-relaxed" style={{ color: '#64748B' }}>
                No more phone trees or spreadsheet chaos. AeroStay gives your operations team a single dashboard to manage every layover event.
              </p>
              <ul className="mt-8 space-y-4">
                {AIRLINE_BENEFITS.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <span className="mt-0.5 shrink-0"><CheckIcon /></span>
                    <span className="text-sm" style={{ color: '#475569' }}>{b}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <ShimmerButton href="/signup" color="blue" size="lg">
                  Register Your Airline
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </ShimmerButton>
              </div>
            </div>

            {/* Right: Dark event list card */}
            <div className="order-1 lg:order-2 rounded-2xl p-8 lg:p-10" style={{ background: '#0D1426' }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#64748B' }}>
                    Operations Panel
                  </p>
                  <p className="mt-1 text-lg font-bold text-white">Layover Events</p>
                </div>
                <div className="flex items-center gap-2 rounded-full px-3 py-1" style={{ background: 'rgba(14,165,233,0.12)' }}>
                  <span className="text-xs font-medium" style={{ color: '#0EA5E9' }}>3 active</span>
                </div>
              </div>

              <div className="space-y-3">
                {AIRLINE_EVENTS.map((ev) => (
                  <div
                    key={ev.flight}
                    className="rounded-lg px-4 py-3"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xs" style={{ color: '#64748B', fontFamily: "'Space Mono', monospace" }}>{ev.time}</span>
                        <span className="text-sm font-semibold text-white" style={{ fontFamily: "'Space Mono', monospace" }}>{ev.flight}</span>
                        <span
                          className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold"
                          style={{
                            background: ev.status === 'Confirmed' ? 'rgba(16,185,129,0.15)' : 'rgba(245,166,35,0.15)',
                            color: ev.status === 'Confirmed' ? '#10B981' : '#F5A623',
                          }}
                        >
                          {ev.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs" style={{ color: '#94A3B8' }}>{ev.hotel}</span>
                      <span className="text-xs" style={{ color: '#64748B' }}>{ev.pax} passengers</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <span className="text-xs" style={{ color: '#64748B' }}>Avg. resolution time</span>
                <span className="text-sm font-bold" style={{ color: '#0EA5E9' }}>1m 47s</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── Live Activity Strip ───── */}
      <LiveActivityStrip />

      {/* ───── Footer ───── */}
      <footer style={{ background: '#0D1426' }}>
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
            {/* Brand */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-1.5">
                <span style={{ color: '#0EA5E9', fontSize: 20, fontWeight: 700 }}>✦</span>
                <span className="text-lg font-bold text-white">AeroStay</span>
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-relaxed" style={{ color: '#94A3B8' }}>
                The B2B platform connecting airlines with airport hotels for seamless layover accommodation management.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs" style={{ color: 'rgba(14,165,233,0.7)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
                Starting with Sofia Airport — Expanding globally
              </div>
            </div>

            {/* Link groups */}
            {Object.entries(FOOTER_LINKS).map(([group, links]) => (
              <div key={group}>
                <p className="text-sm font-semibold text-white">{group}</p>
                <ul className="mt-4 space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      {link.href.startsWith('mailto:') || link.href.startsWith('#') ? (
                        <a
                          href={link.href}
                          className="text-sm transition-colors hover:text-white"
                          style={{ color: '#94A3B8' }}
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-sm transition-colors hover:text-white"
                          style={{ color: '#94A3B8' }}
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-14 flex flex-col items-center justify-between gap-4 pt-8 sm:flex-row" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs" style={{ color: '#64748B' }}>
              &copy; {new Date().getFullYear()} AeroStay. All rights reserved.
            </p>
            <a
              href="mailto:contact@aerostay.app"
              className="flex items-center gap-1.5 text-xs transition-colors hover:text-white"
              style={{ color: '#94A3B8' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
              </svg>
              contact@aerostay.app
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
