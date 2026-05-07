'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

/* ─── Animation Variants ─────────────────────────────────── */

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as const } },
}

const fadeInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as const } },
}

const fadeInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as const } },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

/* ─── Data ────────────────────────────────────────────────── */

const PAIN_POINTS = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
      </svg>
    ),
    title: 'Phone Tag',
    description: 'Airlines call 10+ hotels. Average response time: 47 minutes.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="3" y1="15" x2="21" y2="15" />
        <line x1="9" y1="3" x2="9" y2="21" />
        <line x1="15" y1="3" x2="15" y2="21" />
      </svg>
    ),
    title: 'Manual Spreadsheets',
    description: 'Tracking bookings across Excel sheets. Error rate: 23%.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
    title: 'Lost Revenue',
    description: 'Hotels miss 60% of layover booking opportunities.',
  },
]

const SOLUTIONS = [
  {
    title: 'Auto-Detection',
    description: 'System monitors airports 24/7. Layovers detected in under 5 minutes.',
  },
  {
    title: 'Instant Matching',
    description: 'Hotels get notified instantly. Response time: under 2 minutes.',
  },
  {
    title: 'One-Click Booking',
    description: 'Complete booking in 90 seconds. Zero phone calls needed.',
  },
]

const TIMELINE_STEPS = [
  { icon: '✈', label: 'Flight LZ481 delayed at SOF', delay: 0 },
  { icon: '🏨', label: '5 hotels notified instantly', delay: 2 },
  { icon: '📋', label: 'Hyatt confirms 26 rooms at €89/night', delay: 4 },
  { icon: '📄', label: '52 passenger vouchers generated', delay: 6 },
  { icon: '✅', label: 'Total time: 1 minute 47 seconds', delay: 8 },
]

const TECH_STACK = ['Next.js', 'Supabase', 'Vercel', 'TypeScript', 'Tailwind CSS', 'Resend']

const HOTEL_NAMES = ['Hyatt Regency', 'Hilton Sofia', 'Radisson Blu', 'Novotel Airport', 'Best Western']

/* ─── Room Grid Colors ────────────────────────────────────── */

const ROOM_GRID: string[] = [
  '#10B981','#10B981','#3B82F6','#10B981','#10B981',
  '#10B981','#EF4444','#10B981','#3B82F6','#10B981',
  '#3B82F6','#10B981','#10B981','#10B981','#EF4444',
  '#10B981','#10B981','#EF4444','#10B981','#10B981',
]

/* ─── Section Wrapper ─────────────────────────────────────── */

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={staggerContainer}
      className={`relative px-6 py-24 md:py-32 ${className}`}
    >
      {children}
    </motion.section>
  )
}

/* ─── Typewriter Hook ─────────────────────────────────────── */

function useTypewriter(text: string, speed: number = 80) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    let i = 0
    setDisplayed('')
    setDone(false)
    const interval = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(interval)
        setDone(true)
      }
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed])

  return { displayed, done }
}

/* ─── Live Demo Timeline ──────────────────────────────────── */

function LiveTimeline() {
  const [activeStep, setActiveStep] = useState(-1)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: false, margin: '-100px' })

  useEffect(() => {
    if (!isInView) {
      setActiveStep(-1)
      return
    }

    let timeout: NodeJS.Timeout
    let step = 0

    function advance() {
      setActiveStep(step)
      step++
      if (step <= TIMELINE_STEPS.length) {
        timeout = setTimeout(advance, 2000)
      } else {
        timeout = setTimeout(() => {
          step = 0
          setActiveStep(-1)
          timeout = setTimeout(advance, 1000)
        }, 4000)
      }
    }

    timeout = setTimeout(advance, 500)
    return () => clearTimeout(timeout)
  }, [isInView])

  return (
    <div ref={ref} className="max-w-2xl mx-auto mt-16">
      <div className="relative">
        {/* Vertical line */}
        <div
          className="absolute left-6 top-0 bottom-0 w-px"
          style={{ background: 'rgba(14,165,233,0.15)' }}
        />

        {TIMELINE_STEPS.map((step, i) => (
          <div key={i} className="relative flex items-start gap-6 mb-8 last:mb-0">
            {/* Dot */}
            <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-12 h-12">
              <AnimatePresence>
                {activeStep >= i && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="flex items-center justify-center w-12 h-12 rounded-full text-xl"
                    style={{
                      background: i === TIMELINE_STEPS.length - 1
                        ? 'rgba(16,185,129,0.15)'
                        : 'rgba(14,165,233,0.12)',
                      border: `1px solid ${i === TIMELINE_STEPS.length - 1 ? 'rgba(16,185,129,0.3)' : 'rgba(14,165,233,0.25)'}`,
                    }}
                  >
                    {step.icon}
                  </motion.div>
                )}
              </AnimatePresence>
              {activeStep < i && (
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
              )}
            </div>

            {/* Content */}
            <div className="pt-3 flex-1 min-h-[48px]">
              <AnimatePresence>
                {activeStep >= i && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <p
                      className="text-sm md:text-base font-medium"
                      style={{
                        color: i === TIMELINE_STEPS.length - 1 ? '#10B981' : '#fff',
                        fontFamily: "'Space Mono', monospace",
                      }}
                    >
                      {step.label}
                    </p>
                    {i === 1 && activeStep >= 1 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-2 flex flex-wrap gap-2"
                      >
                        {HOTEL_NAMES.map((h) => (
                          <span
                            key={h}
                            className="text-[10px] px-2 py-0.5 rounded-full"
                            style={{
                              background: 'rgba(14,165,233,0.1)',
                              border: '1px solid rgba(14,165,233,0.2)',
                              color: '#0EA5E9',
                            }}
                          >
                            {h}
                          </span>
                        ))}
                      </motion.div>
                    )}
                    {i === 2 && activeStep >= 2 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-[11px] font-bold"
                        style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981' }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Confirmed
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Mock Dashboard Component ────────────────────────────── */

function MockBrowser({
  url,
  children,
  className = '',
}: {
  url: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-xl overflow-hidden ${className}`}
      style={{
        background: '#0D1426',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
      }}
    >
      {/* Browser chrome */}
      <div
        className="flex items-center gap-2 px-4 py-2.5"
        style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#EF4444' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#F5A623' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#10B981' }} />
        </div>
        <div
          className="flex-1 ml-3 px-3 py-1 rounded-md text-[11px]"
          style={{
            background: 'rgba(255,255,255,0.05)',
            color: 'rgba(255,255,255,0.4)',
            fontFamily: "'Space Mono', monospace",
          }}
        >
          {url}
        </div>
      </div>
      {/* Content */}
      <div className="p-5">{children}</div>
    </div>
  )
}

/* ─── Page ────────────────────────────────────────────────── */

export default function DemoPage() {
  const { displayed: title, done: titleDone } = useTypewriter('✦ AEROSTAY', 80)
  const [showSubtitle, setShowSubtitle] = useState(false)
  const [showScroll, setShowScroll] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [comparisonWidth, setComparisonWidth] = useState(0)
  const comparisonRef = useRef<HTMLDivElement>(null)
  const comparisonInView = useInView(comparisonRef, { once: true, margin: '-100px' })

  useEffect(() => {
    if (titleDone) {
      const t1 = setTimeout(() => setShowSubtitle(true), 400)
      const t2 = setTimeout(() => setShowScroll(true), 1400)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
  }, [titleDone])

  useEffect(() => {
    if (comparisonInView) {
      const t = setTimeout(() => setComparisonWidth(100), 300)
      return () => clearTimeout(t)
    }
  }, [comparisonInView])

  useEffect(() => {
    function handleScroll() {
      setShowBackToTop(window.scrollY > window.innerHeight * 0.8)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <div
      className="relative min-h-screen"
      style={{
        background: '#070B14',
        color: '#fff',
      }}
    >
      {/* ═══════ Section 0 — Cinematic Opening ═══════ */}
      <section
        className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      >
        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(14,165,233,0.06) 0%, transparent 70%)',
          }}
        />

        <h1
          className="relative text-center"
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 'clamp(32px, 6vw, 48px)',
            fontWeight: 700,
            letterSpacing: '0.05em',
            minHeight: '1.2em',
          }}
        >
          {title}
          {!titleDone && (
            <span
              className="inline-block w-[3px] ml-1 align-middle"
              style={{
                height: '1em',
                background: '#0EA5E9',
                animation: 'blink 0.8s step-end infinite',
              }}
            />
          )}
        </h1>

        <AnimatePresence>
          {showSubtitle && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mt-6 text-center px-4"
              style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)' }}
            >
              The Future of Airline Layover Management
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showScroll && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="absolute bottom-12 text-center"
              style={{
                fontSize: 13,
                color: '#0EA5E9',
                animation: 'pulse-text 2s ease-in-out infinite',
              }}
            >
              Scroll to explore ↓
            </motion.p>
          )}
        </AnimatePresence>
      </section>

      {/* ═══════ Section 1 — The Problem ═══════ */}
      <Section>
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">The Old Way</h2>
            <div className="mt-3 mx-auto w-16 h-1 rounded-full" style={{ background: '#EF4444' }} />
          </motion.div>

          <motion.div variants={staggerContainer} className="grid md:grid-cols-3 gap-6">
            {PAIN_POINTS.map((p) => (
              <motion.div
                key={p.title}
                variants={fadeInLeft}
                className="rounded-xl p-7 relative overflow-hidden"
                style={{
                  background: '#111827',
                  border: '1px solid rgba(239,68,68,0.2)',
                }}
              >
                {/* Red accent strip */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                  style={{ background: '#EF4444' }}
                />
                <div className="mb-4">{p.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{p.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  {p.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ═══════ Comparison Bar ═══════ */}
      <div ref={comparisonRef} className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium shrink-0" style={{ color: '#EF4444', fontFamily: "'Space Mono', monospace" }}>
            47 min
          </span>
          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${comparisonWidth}%`,
                background: 'linear-gradient(90deg, #EF4444, #0EA5E9)',
                transition: 'width 1.5s ease-out',
              }}
            />
          </div>
          <span className="text-sm font-medium shrink-0" style={{ color: '#0EA5E9', fontFamily: "'Space Mono', monospace" }}>
            2 min
          </span>
        </div>
      </div>

      {/* ═══════ Section 2 — The Solution ═══════ */}
      <Section>
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">The AeroStay Way</h2>
            <div className="mt-3 mx-auto w-16 h-1 rounded-full" style={{ background: '#0EA5E9' }} />
          </motion.div>

          <motion.div variants={staggerContainer} className="grid md:grid-cols-3 gap-6">
            {SOLUTIONS.map((s) => (
              <motion.div
                key={s.title}
                variants={fadeInRight}
                className="rounded-xl p-7 relative overflow-hidden"
                style={{
                  background: '#111827',
                  border: '1px solid rgba(14,165,233,0.2)',
                }}
              >
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                  style={{ background: '#0EA5E9' }}
                />
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  {s.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ═══════ Section 3 — Hotel Dashboard Preview ═══════ */}
      <Section>
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <span
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-4"
              style={{ background: 'rgba(14,165,233,0.08)', color: '#0EA5E9' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              For Hotels
            </span>
            <h2 className="text-3xl md:text-4xl font-bold">Complete property management from one dashboard</h2>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            style={{ perspective: '1200px' }}
          >
            <motion.div
              whileInView={{ rotateX: 2, rotateY: -1 }}
              transition={{ duration: 0.8 }}
            >
              <MockBrowser url="aerostay.app/dashboard/hotel">
                {/* Stat cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                  {[
                    { label: 'Available', value: '47', color: '#10B981' },
                    { label: 'Pending', value: '3', color: '#F5A623' },
                    { label: 'Revenue', value: '€4.9k', color: '#0EA5E9' },
                    { label: 'Occupancy', value: '61%', color: '#8B5CF6' },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="rounded-lg p-3"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <p className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {s.label}
                      </p>
                      <p className="text-lg font-bold mt-1" style={{ color: s.color, fontFamily: "'Space Mono', monospace" }}>
                        {s.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="grid md:grid-cols-[1fr_200px] gap-4">
                  {/* Room grid */}
                  <div>
                    <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Room Map
                    </p>
                    <div className="grid grid-cols-5 gap-1.5">
                      {ROOM_GRID.map((color, i) => (
                        <div
                          key={i}
                          className="aspect-square rounded-sm"
                          style={{ background: color, opacity: 0.7 }}
                        />
                      ))}
                    </div>
                    <div className="flex gap-4 mt-2">
                      {[
                        { color: '#10B981', label: 'Available' },
                        { color: '#3B82F6', label: 'Booked' },
                        { color: '#EF4444', label: 'Maintenance' },
                      ].map((l) => (
                        <div key={l.label} className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-sm" style={{ background: l.color, opacity: 0.7 }} />
                          <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{l.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Event list */}
                  <div>
                    <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Active Events
                    </p>
                    <div className="space-y-2">
                      {[
                        { flight: 'LZ481', status: 'confirmed' },
                        { flight: 'TK1029', status: 'pending' },
                        { flight: 'W64455', status: 'confirmed' },
                      ].map((e) => (
                        <div
                          key={e.flight}
                          className="flex items-center gap-2 rounded-md px-2.5 py-1.5"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: e.status === 'confirmed' ? '#10B981' : '#F5A623' }}
                          />
                          <span
                            className="text-[11px] font-medium"
                            style={{ color: 'rgba(255,255,255,0.7)', fontFamily: "'Space Mono', monospace" }}
                          >
                            {e.flight}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </MockBrowser>
            </motion.div>
          </motion.div>

          {/* Feature chips */}
          <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-3 mt-8">
            {['Real-time Radar', 'Room Calendar', 'Commission Tracking'].map((f) => (
              <span
                key={f}
                className="rounded-full px-4 py-1.5 text-xs font-medium"
                style={{
                  background: 'rgba(14,165,233,0.08)',
                  border: '1px solid rgba(14,165,233,0.15)',
                  color: '#0EA5E9',
                }}
              >
                {f}
              </span>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ═══════ Section 4 — Airline Dashboard Preview ═══════ */}
      <Section>
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <span
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-4"
              style={{ background: 'rgba(14,165,233,0.08)', color: '#0EA5E9' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
              </svg>
              For Airlines
            </span>
            <h2 className="text-3xl md:text-4xl font-bold">Monitor every layover across your network</h2>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            style={{ perspective: '1200px' }}
          >
            <motion.div
              whileInView={{ rotateX: 2, rotateY: 1 }}
              transition={{ duration: 0.8 }}
            >
              <MockBrowser url="aerostay.app/dashboard/airline">
                <div className="grid md:grid-cols-[1fr_1fr] gap-5">
                  {/* Globe placeholder */}
                  <div className="flex flex-col items-center justify-center">
                    <div
                      className="relative w-40 h-40 rounded-full flex items-center justify-center"
                      style={{
                        background: 'radial-gradient(circle at 40% 40%, rgba(14,165,233,0.15), rgba(14,165,233,0.02))',
                        border: '1px solid rgba(14,165,233,0.15)',
                      }}
                    >
                      {/* Equator line */}
                      <div
                        className="absolute w-full h-px"
                        style={{ background: 'rgba(14,165,233,0.15)' }}
                      />
                      {/* Meridian */}
                      <div
                        className="absolute w-px h-full"
                        style={{ background: 'rgba(14,165,233,0.1)' }}
                      />
                      {/* Airport dots */}
                      {[
                        { top: '30%', left: '55%' },
                        { top: '45%', left: '35%' },
                        { top: '50%', left: '65%' },
                        { top: '60%', left: '45%' },
                        { top: '35%', left: '70%' },
                      ].map((pos, i) => (
                        <span
                          key={i}
                          className="absolute w-2 h-2 rounded-full"
                          style={{
                            background: '#0EA5E9',
                            top: pos.top,
                            left: pos.left,
                            boxShadow: '0 0 6px rgba(14,165,233,0.5)',
                          }}
                        />
                      ))}
                    </div>
                    <p className="mt-3 text-[10px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      Network Overview
                    </p>
                  </div>

                  {/* Right: events + stats */}
                  <div>
                    {/* Mini stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {[
                        { label: 'Active Layovers', value: '3', color: '#F5A623' },
                        { label: 'Rooms Booked', value: '56', color: '#0EA5E9' },
                      ].map((s) => (
                        <div
                          key={s.label}
                          className="rounded-lg p-3"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                          <p className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
                            {s.label}
                          </p>
                          <p className="text-xl font-bold mt-1" style={{ color: s.color, fontFamily: "'Space Mono', monospace" }}>
                            {s.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Event list */}
                    <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Layover Events
                    </p>
                    <div className="space-y-2">
                      {[
                        { flight: 'LZ481', route: 'SOF → FRA', status: 'Confirmed', color: '#10B981' },
                        { flight: 'FB402', route: 'SOF → CDG', status: 'Pending', color: '#F5A623' },
                        { flight: 'W64455', route: 'SOF → LHR', status: 'Confirmed', color: '#10B981' },
                      ].map((e) => (
                        <div
                          key={e.flight}
                          className="flex items-center justify-between rounded-md px-3 py-2"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="text-[11px] font-medium"
                              style={{ color: 'rgba(255,255,255,0.7)', fontFamily: "'Space Mono', monospace" }}
                            >
                              {e.flight}
                            </span>
                            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                              {e.route}
                            </span>
                          </div>
                          <span
                            className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                            style={{ background: `${e.color}20`, color: e.color }}
                          >
                            {e.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </MockBrowser>
            </motion.div>
          </motion.div>

          {/* Feature chips */}
          <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-3 mt-8">
            {['Live Detection', 'Passenger Manifests', 'PDF Vouchers'].map((f) => (
              <span
                key={f}
                className="rounded-full px-4 py-1.5 text-xs font-medium"
                style={{
                  background: 'rgba(14,165,233,0.08)',
                  border: '1px solid rgba(14,165,233,0.15)',
                  color: '#0EA5E9',
                }}
              >
                {f}
              </span>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ═══════ Section 5 — Live Demo Simulation ═══════ */}
      <Section>
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeInUp} className="text-center mb-4">
            <h2 className="text-3xl md:text-4xl font-bold">Watch It Happen</h2>
            <p className="mt-3 text-base" style={{ color: 'rgba(255,255,255,0.5)' }}>
              A layover event in real time
            </p>
            <div className="mt-3 mx-auto w-16 h-1 rounded-full" style={{ background: '#0EA5E9' }} />
          </motion.div>

          <LiveTimeline />
        </div>
      </Section>

      {/* ═══════ Section 6 — Tech Stack ═══════ */}
      <Section>
        <div className="max-w-4xl mx-auto">
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Built With</h2>
            <div className="mt-3 mx-auto w-16 h-1 rounded-full" style={{ background: '#0EA5E9' }} />
          </motion.div>

          <motion.div variants={staggerContainer} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {TECH_STACK.map((tech) => (
              <motion.div
                key={tech}
                variants={fadeInUp}
                className="rounded-xl p-4 flex items-center justify-center text-center"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <span
                  className="text-sm font-semibold"
                  style={{ color: 'rgba(255,255,255,0.7)', fontFamily: "'Space Mono', monospace" }}
                >
                  {tech}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ═══════ Section 7 — CTA ═══════ */}
      <Section className="pb-32">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-5xl font-bold leading-tight"
          >
            Ready to eliminate
            <br />
            <span style={{ color: '#0EA5E9' }}>layover chaos?</span>
          </motion.h2>

          <motion.div variants={fadeInUp} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="relative inline-flex items-center justify-center gap-2 font-semibold text-white overflow-hidden transition-all duration-200 bg-[#0EA5E9] hover:bg-[#0284C7] px-8 py-3 text-base rounded-xl"
            >
              <span
                className="pointer-events-none absolute inset-0"
                style={{
                  background: 'linear-gradient(110deg, transparent 33%, rgba(255,255,255,0.25) 50%, transparent 67%)',
                  backgroundSize: '250% 100%',
                  animation: 'shimmerSlide 3s ease-in-out infinite',
                }}
              />
              <span className="relative z-10 flex items-center gap-2">
                Get Started Free
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </span>
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 font-semibold text-white overflow-hidden transition-all duration-200 px-8 py-3 text-base rounded-xl"
              style={{ border: '1px solid rgba(255,255,255,0.2)' }}
            >
              View Source on GitHub
            </a>
          </motion.div>

          <motion.div variants={fadeInUp} className="mt-10">
            <p className="flex items-center justify-center gap-1.5 text-xs" style={{ color: 'rgba(14,165,233,0.7)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
              Starting with Sofia Airport · Expanding globally
            </p>
          </motion.div>

          <motion.p
            variants={fadeInUp}
            className="mt-6"
            style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}
          >
            Built by Nataliya Nikolova
          </motion.p>
        </div>
      </Section>

      {/* ═══════ Back to Top Button ═══════ */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-medium cursor-pointer"
            style={{
              background: 'rgba(14,165,233,0.15)',
              border: '1px solid rgba(14,165,233,0.25)',
              color: '#0EA5E9',
              backdropFilter: 'blur(12px)',
            }}
          >
            Back to top ↑
          </motion.button>
        )}
      </AnimatePresence>

      {/* ═══════ CSS Keyframes ═══════ */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes pulse-text {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
