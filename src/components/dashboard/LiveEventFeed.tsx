'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatEuro } from '@/lib/format'

interface BookingRequest {
  id: string
  guest_count: number
  total_amount: number
  status: string
  notes: string | null
  created_at: string
  layovers: {
    flight_number: string
    passenger_count: number
  }
  airlines: {
    name: string
  }
}

interface LiveEventFeedProps {
  hotelId: string
}

export function LiveEventFeed({ hotelId }: LiveEventFeedProps) {
  const [requests, setRequests] = useState<BookingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [negotiatingId, setNegotiatingId] = useState<string | null>(null)
  const [negotiateText, setNegotiateText] = useState('')
  const [animatingIds, setAnimatingIds] = useState<Set<string>>(new Set())

  const supabase = createClient()

  const fetchRequests = useCallback(async () => {
    const { data } = await supabase
      .from('booking_requests')
      .select(`
        id,
        guest_count,
        total_amount,
        status,
        notes,
        created_at,
        layovers ( flight_number, passenger_count ),
        airlines ( name )
      `)
      .eq('hotel_id', hotelId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (data) {
      setRequests(data as unknown as BookingRequest[])
    }
    setLoading(false)
  }, [hotelId, supabase])

  useEffect(() => {
    fetchRequests()

    const channel = supabase
      .channel(`booking_requests:hotel_id=eq.${hotelId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'booking_requests',
          filter: `hotel_id=eq.${hotelId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newId = (payload.new as { id: string }).id
            setAnimatingIds((prev) => new Set(prev).add(newId))
            setTimeout(() => {
              setAnimatingIds((prev) => {
                const next = new Set(prev)
                next.delete(newId)
                return next
              })
            }, 600)
          }
          fetchRequests()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId])

  async function handleConfirm(id: string) {
    await supabase
      .from('booking_requests')
      .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
      .eq('id', id)

    setRequests((prev) => prev.filter((r) => r.id !== id))
  }

  async function handleNegotiate(id: string) {
    if (negotiatingId === id) {
      setNegotiatingId(null)
      setNegotiateText('')
    } else {
      setNegotiatingId(id)
      setNegotiateText('')
    }
  }

  async function handleSendNegotiation(id: string) {
    if (!negotiateText.trim()) return

    await supabase
      .from('booking_requests')
      .update({ status: 'negotiating', notes: negotiateText.trim() })
      .eq('id', id)

    setNegotiatingId(null)
    setNegotiateText('')
    setRequests((prev) => prev.filter((r) => r.id !== id))
  }

  if (loading) {
    return (
      <div
        className="rounded-xl p-6"
        style={{
          backgroundColor: '#111827',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 animate-pulse rounded-full" style={{ backgroundColor: '#3B9EFF' }} />
          <span className="text-sm" style={{ color: '#94A3B8' }}>Loading events…</span>
        </div>
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-xl py-16"
        style={{
          backgroundColor: '#111827',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
          className="mb-4 opacity-30"
        >
          <path
            d="M32 8L8 48h48L32 8z"
            stroke="#94A3B8"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M20 36H8L32 8l24 28H44"
            stroke="#94A3B8"
            strokeWidth="2"
            fill="none"
          />
          <line
            x1="32"
            y1="48"
            x2="32"
            y2="56"
            stroke="#94A3B8"
            strokeWidth="2"
          />
        </svg>
        <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>
          All clear — no pending requests
        </p>
      </div>
    )
  }

  return (
    <div
      className="overflow-hidden rounded-xl"
      style={{
        backgroundColor: '#111827',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {requests.map((req) => (
        <div
          key={req.id}
          className="p-4"
          style={{
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            animation: animatingIds.has(req.id)
              ? 'slide-in 0.4s ease-out'
              : undefined,
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span
                className="mt-1.5 block h-2 w-2 flex-shrink-0 rounded-full"
                style={{
                  backgroundColor: '#F5A623',
                  boxShadow: '0 0 6px rgba(245,166,35,0.6)',
                  animation: 'amber-pulse 2s ease-in-out infinite',
                }}
              />
              <div>
                <p className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>
                  {req.layovers?.flight_number ?? 'N/A'}
                  <span className="ml-2 font-normal" style={{ color: '#94A3B8' }}>
                    {req.airlines?.name ?? ''}
                  </span>
                </p>
                <p className="mt-1 text-xs" style={{ color: '#94A3B8' }}>
                  {req.layovers?.passenger_count ?? 0} pax · {req.guest_count} rooms requested
                </p>
              </div>
            </div>

            <p className="whitespace-nowrap text-sm font-bold" style={{ color: '#F1F5F9' }}>
              {formatEuro(req.total_amount ?? 0)}
            </p>
          </div>

          <div className="mt-3 flex items-center gap-2 pl-5">
            <button
              onClick={() => handleConfirm(req.id)}
              className="rounded-md px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#22C55E' }}
            >
              Confirm
            </button>
            <button
              onClick={() => handleNegotiate(req.id)}
              className="rounded-md px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-90"
              style={{
                color: '#F5A623',
                border: '1px solid #F5A623',
                backgroundColor: 'transparent',
              }}
            >
              Negotiate
            </button>
          </div>

          {negotiatingId === req.id && (
            <div className="mt-3 flex gap-2 pl-5">
              <textarea
                value={negotiateText}
                onChange={(e) => setNegotiateText(e.target.value)}
                placeholder="Enter your counter-offer or notes…"
                rows={2}
                className="flex-1 resize-none rounded-md px-3 py-2 text-xs outline-none placeholder:text-[#64748B]"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#F1F5F9',
                }}
              />
              <button
                onClick={() => handleSendNegotiation(req.id)}
                className="self-end rounded-md px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#F5A623' }}
              >
                Send
              </button>
            </div>
          )}
        </div>
      ))}

      <style>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(-12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes amber-pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
        }
      `}</style>
    </div>
  )
}
