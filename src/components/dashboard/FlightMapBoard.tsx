'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import type { DemoNearbyHotel, DemoEvent } from '@/lib/demo'

interface FlightMapBoardProps {
  hotels: DemoNearbyHotel[]
  activeEvents: DemoEvent[]
}

const HOTEL_OFFSETS: Record<string, { x: number; y: number }> = {
  h1: { x: -80, y: -60 },
  h2: { x: 90, y: -40 },
  h3: { x: -60, y: 90 },
  h4: { x: 70, y: 70 },
  h5: { x: 120, y: -90 },
}

function seededHash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i)
    h = h ^ (h >>> 16)
  }
  return (h >>> 0) / 0xffffffff
}

function quadBezier(
  t: number,
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number }
) {
  const mt = 1 - t
  return {
    x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
    y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y,
  }
}

export default function FlightMapBoard({ hotels, activeEvents }: FlightMapBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const sweepAngle = useRef(0)
  const planeT = useRef(0)
  const time = useRef(0)
  const landingFrame = useRef(0)
  const pauseCounter = useRef(0)
  const mousePos = useRef<{ x: number; y: number } | null>(null)

  const [tooltip, setTooltip] = useState<{
    x: number
    y: number
    hotel: DemoNearbyHotel
  } | null>(null)

  const hotelsRef = useRef(hotels)
  const eventsRef = useRef(activeEvents)

  useEffect(() => { hotelsRef.current = hotels }, [hotels])
  useEffect(() => { eventsRef.current = activeEvents }, [activeEvents])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    mousePos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }, [])

  const handleMouseLeave = useCallback(() => {
    mousePos.current = null
    setTooltip(null)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const displayWidth = canvas.offsetWidth
    const displayHeight = 480
    canvas.width = displayWidth * dpr
    canvas.height = displayHeight * dpr
    ctx.scale(dpr, dpr)

    const sofCenter = { x: displayWidth * 0.42, y: displayHeight * 0.52 }

    function draw() {
      if (!ctx) return
      const w = displayWidth
      const h = displayHeight

      ctx.fillStyle = '#070B14'
      ctx.fillRect(0, 0, w, h)

      ctx.strokeStyle = 'rgba(59,158,255,0.05)'
      ctx.lineWidth = 0.5
      for (let x = 0; x < w; x += 50) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
      }
      for (let y = 0; y < h; y += 50) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }

      const ringRadii = [100, 200, 300]
      ctx.strokeStyle = 'rgba(59,158,255,0.08)'
      ctx.lineWidth = 0.5
      for (const r of ringRadii) {
        ctx.beginPath()
        ctx.arc(sofCenter.x, sofCenter.y, r, 0, Math.PI * 2)
        ctx.stroke()
      }

      const sweep = sweepAngle.current
      const glowSpan = Math.PI / 4
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(sofCenter.x, sofCenter.y)
      ctx.arc(sofCenter.x, sofCenter.y, 300, sweep - glowSpan, sweep)
      ctx.closePath()
      const grad = ctx.createRadialGradient(
        sofCenter.x, sofCenter.y, 0,
        sofCenter.x, sofCenter.y, 300
      )
      grad.addColorStop(0, 'rgba(59,158,255,0)')
      grad.addColorStop(1, 'rgba(59,158,255,0.06)')
      ctx.fillStyle = grad
      ctx.fill()
      ctx.restore()

      ctx.strokeStyle = 'rgba(59,158,255,0.55)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(sofCenter.x, sofCenter.y)
      ctx.lineTo(
        sofCenter.x + Math.cos(sweep) * 300,
        sofCenter.y + Math.sin(sweep) * 300
      )
      ctx.stroke()

      const pulse = 4 + Math.sin(time.current * 3) * 2
      ctx.beginPath()
      ctx.arc(sofCenter.x, sofCenter.y, pulse, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(59,158,255,0.3)'
      ctx.lineWidth = 1
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(sofCenter.x, sofCenter.y, 3, 0, Math.PI * 2)
      ctx.fillStyle = '#3B9EFF'
      ctx.fill()

      ctx.font = "10px 'Space Mono', monospace"
      ctx.fillStyle = '#FFFFFF'
      ctx.textAlign = 'center'
      ctx.fillText('SOF', sofCenter.x, sofCenter.y - 12)

      ctx.font = "9px 'Space Mono', monospace"
      ctx.fillStyle = 'rgba(255,255,255,0.2)'
      ctx.textAlign = 'center'
      ctx.fillText('N', w / 2, 14)
      ctx.fillText('S', w / 2, h - 6)
      ctx.textAlign = 'right'
      ctx.fillText('E', w - 8, h / 2 + 3)
      ctx.textAlign = 'left'
      ctx.fillText('W', 8, h / 2 + 3)

      let hoveredHotel: DemoNearbyHotel | null = null
      let hoveredPos = { x: 0, y: 0 }

      hotelsRef.current.forEach((hotel) => {
        const offset = HOTEL_OFFSETS[hotel.id]
        if (!offset) return
        const px = sofCenter.x + offset.x
        const py = sofCenter.y + offset.y

        if (hotel.owned) {
          const ownerPulse = 10 + Math.sin(time.current * 2) * 4
          ctx.beginPath()
          ctx.arc(px, py, ownerPulse, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(59,158,255,${0.15 + Math.sin(time.current * 2) * 0.1})`
          ctx.lineWidth = 1
          ctx.stroke()
        }

        ctx.beginPath()
        ctx.arc(px, py, 4, 0, Math.PI * 2)
        ctx.fillStyle = '#F59E0B'
        ctx.fill()

        ctx.font = "9px 'Space Mono', monospace"
        ctx.fillStyle = hotel.owned ? '#3B9EFF' : 'rgba(255,255,255,0.5)'
        ctx.textAlign = 'center'
        ctx.fillText(hotel.name.split(' ').slice(0, 2).join(' '), px, py - 10)

        if (mousePos.current) {
          const dx = mousePos.current.x - px
          const dy = mousePos.current.y - py
          if (Math.sqrt(dx * dx + dy * dy) < 14) {
            hoveredHotel = hotel
            hoveredPos = { x: px, y: py }
          }
        }
      })

      eventsRef.current.forEach((evt) => {
        if (evt.status !== 'pending' && evt.status !== 'booking_in_progress') return
        const hash1 = seededHash(evt.id + 'a')
        const hash2 = seededHash(evt.id + 'b')
        const angle = hash1 * Math.PI * 2
        const dist = 60 + hash2 * 200
        const ex = sofCenter.x + Math.cos(angle) * dist
        const ey = sofCenter.y + Math.sin(angle) * dist

        const evtPulse = 3 + Math.sin(time.current * 4 + hash1 * 10) * 2
        ctx.beginPath()
        ctx.arc(ex, ey, evtPulse + 4, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(245,158,11,${0.2 + Math.sin(time.current * 4 + hash1 * 10) * 0.15})`
        ctx.lineWidth = 0.5
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(ex, ey, 3, 0, Math.PI * 2)
        ctx.fillStyle = '#F59E0B'
        ctx.fill()
        ctx.shadowColor = '#F59E0B'
        ctx.shadowBlur = 6
        ctx.fill()
        ctx.shadowBlur = 0
      })

      const flightStart = { x: -20, y: -20 }
      const flightCtrl = { x: w * 0.2, y: h * 0.3 }
      const flightEnd = { x: sofCenter.x, y: sofCenter.y }

      ctx.setLineDash([6, 4])
      ctx.strokeStyle = 'rgba(59,158,255,0.25)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(flightStart.x, flightStart.y)
      ctx.quadraticCurveTo(flightCtrl.x, flightCtrl.y, flightEnd.x, flightEnd.y)
      ctx.stroke()
      ctx.setLineDash([])

      const t = planeT.current
      const planePos = quadBezier(t, flightStart, flightCtrl, flightEnd)
      const tangentT = Math.min(t + 0.01, 1)
      const nextPos = quadBezier(tangentT, flightStart, flightCtrl, flightEnd)
      const angle = Math.atan2(nextPos.y - planePos.y, nextPos.x - planePos.x)

      ctx.save()
      ctx.translate(planePos.x, planePos.y)
      ctx.rotate(angle)

      ctx.fillStyle = '#3B9EFF'
      ctx.beginPath()
      ctx.moveTo(8, 0)
      ctx.lineTo(-6, -5)
      ctx.lineTo(-4, 0)
      ctx.lineTo(-6, 5)
      ctx.closePath()
      ctx.fill()

      ctx.shadowColor = '#3B9EFF'
      ctx.shadowBlur = 8
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.restore()

      if (t >= 0.99 && landingFrame.current < 30) {
        landingFrame.current++
        const rippleR = landingFrame.current * 2
        ctx.beginPath()
        ctx.arc(sofCenter.x, sofCenter.y, rippleR, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(59,158,255,${0.4 - landingFrame.current * 0.013})`
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      if (hoveredHotel) {
        setTooltip({ x: hoveredPos.x, y: hoveredPos.y, hotel: hoveredHotel })
      } else if (mousePos.current) {
        setTooltip(null)
      }

      time.current += 0.016
      sweepAngle.current += 0.008

      if (pauseCounter.current > 0) {
        pauseCounter.current--
      } else {
        planeT.current += 0.003
        if (planeT.current > 1) {
          planeT.current = 0
          landingFrame.current = 0
          pauseCounter.current = 120
        }
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <div style={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          width: '100%',
          height: 480,
          background: '#070B14',
          borderRadius: 12,
          display: 'block',
        }}
      />
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x,
            top: tooltip.y - 10,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none',
            background: 'rgba(10,15,30,0.95)',
            border: '1px solid rgba(59,158,255,0.3)',
            borderRadius: 8,
            padding: '10px 14px',
            fontFamily: "'Space Mono', monospace",
            fontSize: 11,
            color: '#FFFFFF',
            minWidth: 150,
            zIndex: 50,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{tooltip.hotel.name}</div>
          <div style={{ color: '#F59E0B', marginBottom: 2 }}>
            {'★'.repeat(tooltip.hotel.stars)}
            {'☆'.repeat(5 - tooltip.hotel.stars)}
          </div>
          <div style={{ color: '#94A3B8', fontSize: 10, marginBottom: 2 }}>
            {tooltip.hotel.available_rooms} rooms available
          </div>
          <div style={{ color: '#22C55E', fontSize: 10 }}>
            €{tooltip.hotel.price}/night
          </div>
        </div>
      )}
    </div>
  )
}
