'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatEuro, formatDate } from '@/lib/format'

/* ─── Types ───────────────────────────────────────── */

interface BookingRow {
  id: string
  guest_count: number
  check_in: string
  check_out: string
  total_amount: number
  status: string
  contact_name: string
  contact_email: string
  created_at: string
  confirmed_at: string | null
  hotel_id: string
  layovers: {
    flight_number: string
    passenger_count: number
    airlines: { name: string; iata_code: string } | null
  } | null
  _isNew?: boolean
  _glowing?: boolean
}

/* ─── Sound ───────────────────────────────────────── */

function playPingSound() {
  try {
    const ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.2)
  } catch {
    // Audio not available
  }
}

/* ─── Status config ───────────────────────────────── */

const STATUS_DOT: Record<string, string> = {
  pending: '#F5A623',
  confirmed: '#22C55E',
  negotiating: '#3B9EFF',
  rejected: '#EF4444',
  cancelled: '#6B7280',
  completed: '#22C55E',
}

/* ─── Time ago ────────────────────────────────────── */

function timeAgo(date: string): string {
  const secs = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (secs < 60) return `${secs}s ago`
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return formatDate(date)
}

/* ─── Component ───────────────────────────────────── */

export function LiveBookingFeed({
  hotelId,
  initialBookings,
}: {
  hotelId: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialBookings: any[]
}) {
  const [bookings, setBookings] = useState<BookingRow[]>(() =>
    initialBookings.map((b) => ({
      ...b,
      layovers: (Array.isArray(b.layovers) ? b.layovers[0] : b.layovers) as BookingRow['layovers'],
    }))
  )
  const [lastUpdated, setLastUpdated] = useState(Date.now())
  const [secondsAgo, setSecondsAgo] = useState(0)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const newIds = useRef<Set<string>>(new Set())

  // Update "last updated" counter
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdated) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [lastUpdated])

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`bookings-feed-${hotelId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'booking_requests',
          filter: `hotel_id=eq.${hotelId}`,
        },
        async (payload) => {
          setLastUpdated(Date.now())

          if (payload.eventType === 'INSERT') {
            const row = payload.new as BookingRow
            // Fetch joined data
            const { data } = await supabase
              .from('booking_requests')
              .select(
                'id, guest_count, check_in, check_out, total_amount, status, contact_name, contact_email, created_at, confirmed_at, hotel_id, layovers(flight_number, passenger_count, airlines(name, iata_code))'
              )
              .eq('id', row.id)
              .single()

            if (data) {
              const enriched = {
                ...data,
                layovers: data.layovers as unknown as BookingRow['layovers'],
                _isNew: true,
                _glowing: true,
              }
              setBookings((prev) => [enriched, ...prev])
              newIds.current.add(row.id)
              playPingSound()

              setTimeout(() => {
                setBookings((prev) =>
                  prev.map((b) =>
                    b.id === row.id ? { ...b, _isNew: false } : b
                  )
                )
              }, 500)
              setTimeout(() => {
                setBookings((prev) =>
                  prev.map((b) =>
                    b.id === row.id ? { ...b, _glowing: false } : b
                  )
                )
                newIds.current.delete(row.id)
              }, 3000)
            }
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as BookingRow
            setBookings((prev) =>
              prev.map((b) =>
                b.id === updated.id
                  ? {
                      ...b,
                      status: updated.status,
                      confirmed_at: updated.confirmed_at,
                      total_amount: updated.total_amount,
                    }
                  : b
              )
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [hotelId])

  const handleConfirm = useCallback(
    async (bookingId: string) => {
      setActionLoading(bookingId)
      try {
        const res = await fetch(`/api/bookings/${bookingId}/confirm`, {
          method: 'POST',
        })
        if (res.ok) {
          setBookings((prev) =>
            prev.map((b) =>
              b.id === bookingId
                ? {
                    ...b,
                    status: 'confirmed',
                    confirmed_at: new Date().toISOString(),
                  }
                : b
            )
          )
        }
      } finally {
        setActionLoading(null)
      }
    },
    []
  )

  const handleDecline = useCallback(
    async (bookingId: string) => {
      setActionLoading(bookingId)
      try {
        const supabase = createClient()
        await supabase
          .from('booking_requests')
          .update({ status: 'rejected' })
          .eq('id', bookingId)

        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId ? { ...b, status: 'rejected' } : b
          )
        )
      } finally {
        setActionLoading(null)
      }
    },
    []
  )

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: '#111827',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full animate-pulse"
            style={{ backgroundColor: '#22C55E', boxShadow: '0 0 6px #22C55E' }}
          />
          <span className="text-sm font-medium text-[#F1F5F9]">
            Live Feed
          </span>
          <span className="text-xs text-[#94A3B8]">
            ({bookings.length} requests)
          </span>
        </div>
        <span
          className="text-[10px] text-[#94A3B8]"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          Updated {secondsAgo}s ago
        </span>
      </div>

      {bookings.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.06)]">
                {[
                  '',
                  'Flight',
                  'Airline',
                  'Pax',
                  'Rooms',
                  'Price/room',
                  'Total',
                  'Time',
                  'Actions',
                ].map((col) => (
                  <th
                    key={col}
                    className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-[#94A3B8]"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                const layover = b.layovers
                const dotColor = STATUS_DOT[b.status] ?? '#6B7280'
                const pricePerRoom =
                  b.guest_count > 0
                    ? Math.round((b.total_amount ?? 0) / b.guest_count)
                    : 0
                const isPending = b.status === 'pending'

                return (
                  <tr
                    key={b.id}
                    className={`border-b border-[rgba(255,255,255,0.04)] transition-all ${b._isNew ? 'booking-row-new' : ''} ${b._glowing ? 'booking-glow' : ''}`}
                  >
                    {/* Status dot */}
                    <td className="px-3 py-3">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{
                          backgroundColor: dotColor,
                          boxShadow:
                            b.status === 'pending'
                              ? `0 0 6px ${dotColor}`
                              : 'none',
                        }}
                      />
                    </td>
                    <td className="px-3 py-3 font-medium text-[#F1F5F9]">
                      {layover?.flight_number ?? '—'}
                    </td>
                    <td className="px-3 py-3 text-[#94A3B8]">
                      {layover?.airlines?.name ?? '—'}
                    </td>
                    <td className="px-3 py-3 text-[#F1F5F9]">
                      {layover?.passenger_count ?? b.guest_count}
                    </td>
                    <td className="px-3 py-3 text-[#F1F5F9]">
                      {b.guest_count}
                    </td>
                    <td className="px-3 py-3 text-[#94A3B8]">
                      {formatEuro(pricePerRoom)}
                    </td>
                    <td className="px-3 py-3 font-medium text-[#F1F5F9]">
                      {formatEuro(b.total_amount ?? 0)}
                    </td>
                    <td
                      className="px-3 py-3 text-[#94A3B8]"
                      style={{ fontFamily: "'Space Mono', monospace", fontSize: 11 }}
                    >
                      {timeAgo(b.created_at)}
                    </td>
                    <td className="px-3 py-3">
                      {isPending ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleConfirm(b.id)}
                            disabled={actionLoading === b.id}
                            className="rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors disabled:opacity-40"
                            style={{
                              borderColor: 'rgba(34,197,94,0.4)',
                              color: '#22C55E',
                            }}
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleDecline(b.id)}
                            disabled={actionLoading === b.id}
                            className="rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors disabled:opacity-40"
                            style={{
                              borderColor: 'rgba(239,68,68,0.4)',
                              color: '#EF4444',
                            }}
                          >
                            Decline
                          </button>
                        </div>
                      ) : (
                        <span
                          className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
                          style={{
                            backgroundColor: `${dotColor}15`,
                            color: dotColor,
                          }}
                        >
                          {b.status}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          {/* Pulsing radar blip */}
          <div className="relative mb-4">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: '#F5A623', boxShadow: '0 0 8px #F5A623' }}
            />
            <span
              className="absolute inset-0 h-3 w-3 rounded-full animate-ping"
              style={{
                backgroundColor: '#F5A623',
                opacity: 0.4,
              }}
            />
          </div>
          <p className="text-sm font-medium text-[#F1F5F9]">
            Radar is clear
          </p>
          <p className="mt-1 text-xs text-[#94A3B8]">
            No booking requests yet
          </p>
        </div>
      )}
    </div>
  )
}
