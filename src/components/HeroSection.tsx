'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useAnimationControls,
} from 'framer-motion'

/* ─── Constants ─────────────────────────────────────────── */

const SOFIA = { x: 38, y: 52 }
const RADAR_CENTER = { x: 25, y: 55 }

const HOTELS = [
  { name: 'Hyatt Regency', rooms: 42, price: 89, x: 41, y: 49 },
  { name: 'Hilton Sofia', rooms: 38, price: 95, x: 39, y: 54 },
  { name: 'Radisson Blu', rooms: 29, price: 79, x: 43, y: 57 },
  { name: 'InterContinental', rooms: 34, price: 109, x: 37, y: 51 },
] as const

const TICKER_ITEMS = [
  '✈ LZ481 SOF — 52 pax — Hyatt confirmed — 2 min ago',
  '✈ TK1234 SOF — 38 pax — Hilton confirmed — 14 min ago',
  '✈ W64455 SOF — 61 pax — Radisson confirmed — 31 min ago',
  '✈ OS801 SOF — 27 pax — InterContinental confirmed — 44 min ago',
  '✈ FB402 SOF — 45 pax — Hyatt confirmed — 58 min ago',
]

const BULGARIA_PATH =
  'M 30 38 L 38 35 L 48 36 L 56 34 L 62 38 L 64 44 L 60 50 L 56 55 L 50 58 L 44 60 L 38 58 L 32 54 L 28 48 L 26 42 Z'

/* ─── Sub-components ────────────────────────────────────── */

function RadarGrid({ reduced }: { reduced: boolean }) {
  const lines = []
  for (let i = 0; i <= 100; i += 6) {
    lines.push(
      <line key={`h${i}`} x1="0" y1={`${i}%`} x2="100%" y2={`${i}%`} />,
      <line key={`v${i}`} x1={`${i}%`} y1="0" x2={`${i}%`} y2="100%" />
    )
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <g stroke="rgba(59,158,255,0.06)" strokeWidth="0.5" fill="none">
          {lines}
        </g>
        <circle
          cx={`${RADAR_CENTER.x}%`}
          cy={`${RADAR_CENTER.y}%`}
          r="180"
          stroke="rgba(59,158,255,0.08)"
          strokeWidth="0.5"
          fill="none"
        />
        <circle
          cx={`${RADAR_CENTER.x}%`}
          cy={`${RADAR_CENTER.y}%`}
          r="340"
          stroke="rgba(59,158,255,0.08)"
          strokeWidth="0.5"
          fill="none"
        />
      </svg>

      {!reduced && (
        <motion.div
          className="absolute origin-bottom"
          style={{
            left: `${RADAR_CENTER.x}%`,
            top: `calc(${RADAR_CENTER.y}% - 340px)`,
            width: 1,
            height: 340,
            background:
              'linear-gradient(to top, rgba(59,158,255,0.35), transparent)',
            transformOrigin: 'bottom center',
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}
    </div>
  )
}

function BulgariaMap({ reduced }: { reduced: boolean }) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d={BULGARIA_PATH}
          fill="rgba(255,255,255,0.03)"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="0.3"
        />
      </svg>

      {/* Airport pulsing dot */}
      <div
        className="absolute"
        style={{ left: `${SOFIA.x}%`, top: `${SOFIA.y}%` }}
      >
        <div className="relative -translate-x-1/2 -translate-y-1/2">
          <div className="w-2 h-2 rounded-full bg-[#3B9EFF]" />

          {!reduced && (
            <>
              <motion.div
                className="absolute inset-0 w-2 h-2 rounded-full border border-[#3B9EFF]"
                animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />
              <motion.div
                className="absolute inset-0 w-2 h-2 rounded-full border border-[#3B9EFF]"
                animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeOut',
                  delay: 1,
                }}
              />
            </>
          )}

          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] tracking-wider text-[#3B9EFF] whitespace-nowrap"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            SOF
          </span>
        </div>
      </div>
    </div>
  )
}

function HotelPin({
  hotel,
  reduced,
  delay,
}: {
  hotel: (typeof HOTELS)[number]
  reduced: boolean
  delay: number
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      className="absolute z-10"
      style={{ left: `${hotel.x}%`, top: `${hotel.y}%` }}
      initial={reduced ? undefined : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="-translate-x-1/2 -translate-y-full cursor-pointer">
        {/* Pin shape */}
        <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
          <rect x="3" y="0" width="6" height="8" rx="1" fill="#F5A623" />
          <polygon points="3,8 9,8 6,14" fill="#F5A623" />
        </svg>

        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+6px)] pointer-events-none"
            >
              <div className="bg-white rounded-lg px-3 py-2 shadow-xl border border-gray-100 whitespace-nowrap">
                <p className="text-xs font-semibold text-gray-900">
                  {hotel.name}
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {hotel.rooms} rooms available
                </p>
                <p className="text-[10px] font-medium text-[#3B9EFF] mt-0.5">
                  from €{hotel.price}/night
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function FlightArc({ reduced }: { reduced: boolean }) {
  const controls = useAnimationControls()
  const pathRef = useRef<SVGPathElement>(null)
  const [pathLength, setPathLength] = useState(800)
  const [showPlane, setShowPlane] = useState(false)

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength())
    }
  }, [])

  useEffect(() => {
    if (reduced) return
    let cancelled = false

    async function runLoop() {
      while (!cancelled) {
        setShowPlane(false)
        await controls.set({ strokeDashoffset: pathLength })
        await controls.start({
          strokeDashoffset: 0,
          transition: { duration: 2.5, ease: 'easeInOut' },
        })
        setShowPlane(true)
        await new Promise((r) => setTimeout(r, 1500))
      }
    }

    runLoop()
    return () => {
      cancelled = true
    }
  }, [controls, pathLength, reduced])

  const arcD = `M 5,8 C 18,20 28,45 ${SOFIA.x},${SOFIA.y}`

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          ref={pathRef}
          d={arcD}
          fill="none"
          stroke="rgba(59,158,255,0.5)"
          strokeWidth="0.2"
          strokeDasharray="1 0.6"
          strokeDashoffset={pathLength}
          animate={controls}
        />
      </svg>

      <AnimatePresence>
        {showPlane && !reduced && (
          <motion.div
            className="absolute"
            style={{
              left: `${SOFIA.x}%`,
              top: `${SOFIA.y}%`,
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="-translate-x-1/2 -translate-y-1/2">
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                className="rotate-[135deg]"
              >
                <polygon points="6,0 8,5 12,5 9,8 10,12 6,10 2,12 3,8 0,5 4,5" fill="white" />
              </svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Ticker() {
  const text = TICKER_ITEMS.join('  ·  ')
  const doubled = `${text}  ·  ${text}`

  return (
    <div
      className="mt-10 w-full max-w-2xl mx-auto overflow-hidden border-t border-[rgba(59,158,255,0.15)] pt-4"
    >
      <div className="relative overflow-hidden">
        <div
          className="ticker-scroll whitespace-nowrap"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          <span className="text-[11px] text-[rgba(59,158,255,0.7)]">
            {doubled}
          </span>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Component ────────────────────────────────────── */

export default function HeroSection() {
  const prefersReduced = useReducedMotion()
  const reduced = !!prefersReduced

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: '#070B14' }}
    >
      {/* Layers 1–4: hidden on mobile */}
      <div className="hidden md:block">
        <RadarGrid reduced={reduced} />
        <BulgariaMap reduced={reduced} />
        <div className="absolute inset-0">
          {HOTELS.map((hotel, i) => (
            <HotelPin
              key={hotel.name}
              hotel={hotel}
              reduced={reduced}
              delay={0.8 + i * 0.3}
            />
          ))}
        </div>
        <FlightArc reduced={reduced} />
      </div>

      {/* Layer 5: Content */}
      <div className="relative z-20 mx-auto max-w-3xl px-6 text-center flex flex-col items-center">
        <motion.div
          initial={reduced ? undefined : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5"
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 11,
            background: 'rgba(59,158,255,0.12)',
            border: '1px solid rgba(59,158,255,0.3)',
            color: '#3B9EFF',
          }}
        >
          <span>✦</span>
          <span>NOW LIVE — SOFIA AIRPORT</span>
        </motion.div>

        <motion.h1
          initial={reduced ? undefined : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-7 font-bold leading-[1.1]"
          style={{
            fontSize: 'clamp(36px, 5vw, 64px)',
            color: '#E8EDF5',
          }}
        >
          Every layover,
          <br />
          handled in{' '}
          <span
            style={{
              textDecoration: 'underline',
              textDecorationColor: '#3B9EFF',
              textDecorationThickness: 2,
              textUnderlineOffset: 4,
            }}
          >
            seconds
          </span>
          .
        </motion.h1>

        <motion.p
          initial={reduced ? undefined : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-5 leading-relaxed"
          style={{
            fontSize: 16,
            color: 'rgba(232,237,245,0.6)',
            maxWidth: 480,
          }}
        >
          AeroStay connects airlines with partner hotels the moment a delay is
          detected. No calls. No chaos. One platform.
        </motion.p>

        <motion.div
          initial={reduced ? undefined : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mt-8 flex flex-col sm:flex-row items-center gap-3"
        >
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 rounded-lg px-7 py-3 text-sm font-semibold text-white transition-all hover:brightness-110"
            style={{ background: '#3B9EFF' }}
          >
            Get Started
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center justify-center gap-2 rounded-lg px-7 py-3 text-sm font-semibold transition-all hover:bg-white/5"
            style={{
              color: '#E8EDF5',
              border: '1px solid rgba(232,237,245,0.25)',
              background: 'transparent',
            }}
          >
            <svg
              width="10"
              height="12"
              viewBox="0 0 10 12"
              fill="currentColor"
            >
              <polygon points="0,0 10,6 0,12" />
            </svg>
            Watch Demo
          </Link>
        </motion.div>

        <motion.div
          initial={reduced ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="w-full"
        >
          <Ticker />
        </motion.div>
      </div>
    </section>
  )
}
