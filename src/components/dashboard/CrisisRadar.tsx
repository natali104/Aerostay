'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import type { LayoverEvent } from '@/lib/hooks/useLayoverEvents'

/* ─── Types ───────────────────────────────────────── */

interface CrisisRadarProps {
  events: LayoverEvent[]
  onSelectEvent: (id: string) => void
}

/* ─── Helpers ─────────────────────────────────────── */

function seededRandom(seed: string): () => number {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i)
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 0x45d9f3b)
    h = Math.imul(h ^ (h >>> 13), 0x45d9f3b)
    h = h ^ (h >>> 16)
    return ((h >>> 0) / 0xffffffff + 1) / 2
  }
}

function getBlipPosition(id: string, radius: number) {
  const rng = seededRandom(id)
  const angle = rng() * Math.PI * 2
  const dist = Math.sqrt(rng()) * radius * 0.85
  return {
    x: Math.cos(angle) * dist,
    y: Math.sin(angle) * dist,
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const STATUS_COLORS: Record<string, string> = {
  detected: '#F5A623',
  notified: '#3B9EFF',
  booking_in_progress: '#FFFFFF',
  booked: '#22C55E',
  confirmed: '#22C55E',
  cancelled: '#EF4444',
  expired: '#EF4444',
}

const STATUS_LABELS: Record<string, string> = {
  detected: 'Detected',
  notified: 'Notified',
  booking_in_progress: 'Booking',
  booked: 'Confirmed',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  expired: 'Expired',
}

/* ─── Radar Canvas ────────────────────────────────── */

function useRadarCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  size: number
) {
  const angleRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)

    const center = size / 2
    const radius = center - 4

    let raf: number

    function draw() {
      if (!ctx) return
      ctx.clearRect(0, 0, size, size)

      // Background
      ctx.fillStyle = '#070B14'
      ctx.beginPath()
      ctx.arc(center, center, radius, 0, Math.PI * 2)
      ctx.fill()

      // Concentric rings
      const ringRadii = [radius * 0.33, radius * 0.66, radius]
      ctx.strokeStyle = 'rgba(59,158,255,0.15)'
      ctx.lineWidth = 0.5
      for (const r of ringRadii) {
        ctx.beginPath()
        ctx.arc(center, center, r, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Crosshairs
      ctx.strokeStyle = 'rgba(59,158,255,0.08)'
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.moveTo(center - radius, center)
      ctx.lineTo(center + radius, center)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(center, center - radius)
      ctx.lineTo(center, center + radius)
      ctx.stroke()

      // Sweep afterglow (45° arc behind the sweep line)
      const sweepAngle = angleRef.current
      const glowSpan = Math.PI / 4
      const gradient = ctx.createConicGradient(
        sweepAngle - glowSpan - Math.PI / 2,
        center,
        center
      )
      gradient.addColorStop(0, 'transparent')
      gradient.addColorStop(0.7, 'rgba(59,158,255,0.06)')
      gradient.addColorStop(1, 'rgba(59,158,255,0.18)')

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.moveTo(center, center)
      ctx.arc(center, center, radius, sweepAngle - glowSpan, sweepAngle)
      ctx.closePath()
      ctx.fill()

      // Sweep line
      ctx.strokeStyle = 'rgba(59,158,255,0.6)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(center, center)
      ctx.lineTo(
        center + Math.cos(sweepAngle) * radius,
        center + Math.sin(sweepAngle) * radius
      )
      ctx.stroke()

      // Center dot
      ctx.fillStyle = 'rgba(59,158,255,0.5)'
      ctx.beginPath()
      ctx.arc(center, center, 2, 0, Math.PI * 2)
      ctx.fill()

      angleRef.current += (Math.PI * 2) / (6 * 60) // 6 seconds per revolution at ~60fps
      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [canvasRef, size])
}

/* ─── Blip Component ──────────────────────────────── */

function Blip({
  event,
  radius,
  onSelect,
}: {
  event: LayoverEvent
  radius: number
  onSelect: (id: string) => void
}) {
  const [hovered, setHovered] = useState(false)
  const pos = getBlipPosition(event.id, radius)
  const color = STATUS_COLORS[event.status] ?? '#94A3B8'
  const isActive = !['confirmed', 'booked', 'cancelled', 'expired'].includes(
    event.status
  )
  const isDimmed = ['cancelled', 'expired'].includes(event.status)

  const pulseSpeed =
    event.status === 'detected'
      ? '1.5s'
      : event.status === 'notified'
        ? '2s'
        : event.status === 'booking_in_progress'
          ? '0.8s'
          : '0s'

  return (
    <div
      className="absolute"
      style={{
        left: `calc(50% + ${pos.x}px)`,
        top: `calc(50% + ${pos.y}px)`,
        transform: 'translate(-50%, -50%)',
        zIndex: hovered ? 50 : 10,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Pulse ring */}
      {isActive && (
        <div
          className="absolute inset-0 rounded-full"
          style={{
            width: 6,
            height: 6,
            margin: 'auto',
            border: `1px solid ${color}`,
            animation: `blip-pulse ${pulseSpeed} ease-out infinite`,
          }}
        />
      )}

      {/* Dot */}
      <div
        className={`rounded-full cursor-pointer transition-transform ${hovered ? 'scale-150' : ''} ${event.isNew ? 'blip-flash' : ''}`}
        style={{
          width: 6,
          height: 6,
          backgroundColor: color,
          opacity: isDimmed ? 0.4 : 1,
          boxShadow: isDimmed ? 'none' : `0 0 6px ${color}`,
        }}
      />

      {/* Tooltip */}
      {hovered && (
        <div
          className="absolute z-50 w-48 rounded-lg p-3 shadow-2xl"
          style={{
            left: '50%',
            bottom: 'calc(100% + 8px)',
            transform: 'translateX(-50%)',
            backgroundColor: '#1A2235',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <p className="text-sm font-bold text-white">
            {event.flight_number || 'Unknown'}
          </p>
          <p className="mt-1 text-xs text-[#94A3B8]">
            {event.passenger_count ?? 0} pax
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{
                backgroundColor: `${color}20`,
                color: color,
              }}
            >
              {STATUS_LABELS[event.status] ?? event.status}
            </span>
            <span className="text-[10px] text-[#94A3B8]">
              {timeAgo(event.detected_at)}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onSelect(event.id)
            }}
            className="mt-2 w-full rounded-md px-2 py-1 text-[10px] font-medium text-[#3B9EFF] transition-colors hover:bg-[rgba(59,158,255,0.15)]"
            style={{ border: '1px solid rgba(59,158,255,0.3)' }}
          >
            View Details
          </button>
        </div>
      )}
    </div>
  )
}

/* ─── Main Component ──────────────────────────────── */

export default function CrisisRadar({ events, onSelectEvent }: CrisisRadarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState(320)

  useEffect(() => {
    function handleResize() {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth
        setSize(Math.min(w, window.innerWidth < 768 ? 240 : 320))
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useRadarCanvas(canvasRef, size)

  const radius = size / 2 - 4

  const activeEvents = events.filter(
    (e) => !['confirmed', 'booked', 'cancelled', 'expired'].includes(e.status)
  )
  const confirmedEvents = events.filter(
    (e) => e.status === 'confirmed' || e.status === 'booked'
  )
  const cancelledEvents = events.filter(
    (e) => e.status === 'cancelled' || e.status === 'expired'
  )

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Radar container */}
      <div
        ref={containerRef}
        className="relative"
        style={{ width: size, height: size }}
      >
        {/* Canvas layer (sweep + grid) */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 rounded-full"
          style={{ width: size, height: size }}
        />

        {/* Labels overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          {/* SOF label */}
          <span
            className="absolute left-1/2 -translate-x-1/2 font-bold"
            style={{
              top: 12,
              fontSize: 10,
              color: '#3B9EFF',
              letterSpacing: '0.1em',
            }}
          >
            SOF
          </span>

          {/* Cardinal directions */}
          <span
            className="absolute left-1/2 -translate-x-1/2"
            style={{ top: 4, fontSize: 9, color: 'rgba(255,255,255,0.2)' }}
          >
            N
          </span>
          <span
            className="absolute left-1/2 -translate-x-1/2"
            style={{ bottom: 4, fontSize: 9, color: 'rgba(255,255,255,0.2)' }}
          >
            S
          </span>
          <span
            className="absolute top-1/2 -translate-y-1/2"
            style={{ right: 6, fontSize: 9, color: 'rgba(255,255,255,0.2)' }}
          >
            E
          </span>
          <span
            className="absolute top-1/2 -translate-y-1/2"
            style={{ left: 6, fontSize: 9, color: 'rgba(255,255,255,0.2)' }}
          >
            W
          </span>
        </div>

        {/* Blips layer */}
        <div className="absolute inset-0">
          {events.map((event) => (
            <Blip
              key={event.id}
              event={event}
              radius={radius}
              onSelect={onSelectEvent}
            />
          ))}
        </div>
      </div>

      {/* Status summary */}
      <div
        className="flex items-center gap-1 text-xs"
        style={{ fontFamily: "'Space Mono', monospace" }}
      >
        {activeEvents.length > 0 ? (
          <>
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{
                backgroundColor: '#F5A623',
                boxShadow: '0 0 6px #F5A623',
                animation: 'blip-pulse 1.5s ease-out infinite',
              }}
            />
            <span className="ml-1 text-[#F1F5F9]">
              {activeEvents.length} active event
              {activeEvents.length !== 1 ? 's' : ''}
            </span>
          </>
        ) : (
          <>
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: '#22C55E', boxShadow: '0 0 6px #22C55E' }}
            />
            <span className="ml-1 text-[#22C55E]">All clear</span>
          </>
        )}
        {confirmedEvents.length > 0 && (
          <span className="text-[#94A3B8]">
            {' '}· {confirmedEvents.length} confirmed
          </span>
        )}
        {cancelledEvents.length > 0 && (
          <span className="text-[#94A3B8]">
            {' '}· {cancelledEvents.length} cancelled
          </span>
        )}
      </div>

      {/* eslint-disable-next-line react/no-unknown-property */}
      <style>{`
        @keyframes blip-pulse {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        .blip-flash {
          animation: blip-flash-anim 1s ease-out;
        }
        @keyframes blip-flash-anim {
          0% { box-shadow: 0 0 0 0 rgba(245, 166, 35, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(245, 166, 35, 0); }
          100% { box-shadow: 0 0 0 0 rgba(245, 166, 35, 0); }
        }
      `}</style>
    </div>
  )
}
