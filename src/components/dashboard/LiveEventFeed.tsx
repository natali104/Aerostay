'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell, CheckCircle, XCircle, Clock, MessageSquare } from 'lucide-react'

interface Event {
  id: string
  type: string
  message: string
  time: string
}

const iconMap: Record<string, React.ReactNode> = {
  confirmed: <CheckCircle className="h-4 w-4 text-[#22C55E]" />,
  rejected: <XCircle className="h-4 w-4 text-red-400" />,
  pending: <Clock className="h-4 w-4 text-[#F5A623]" />,
  negotiating: <MessageSquare className="h-4 w-4 text-[#3B9EFF]" />,
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function LiveEventFeed({ hotelId }: { hotelId: string }) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function fetchEvents() {
      const { data } = await supabase
        .from('booking_requests')
        .select('id, status, contact_name, created_at, confirmed_at')
        .eq('hotel_id', hotelId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (data) {
        setEvents(
          data.map((b) => ({
            id: b.id,
            type: b.status,
            message: `${b.contact_name ?? 'Guest'} — booking ${b.status}`,
            time: b.confirmed_at ?? b.created_at,
          }))
        )
      }
      setLoading(false)
    }

    fetchEvents()

    const channel = supabase
      .channel(`hotel-events-${hotelId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'booking_requests',
          filter: `hotel_id=eq.${hotelId}`,
        },
        () => {
          fetchEvents()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [hotelId])

  return (
    <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#111827] p-5">
      <div className="mb-4 flex items-center gap-2">
        <Bell className="h-5 w-5 text-[#3B9EFF]" />
        <h3 className="text-sm font-semibold text-[#F1F5F9]">Live Event Feed</h3>
        <span className="ml-auto flex h-2 w-2 rounded-full bg-[#22C55E]" />
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-[#94A3B8]">Loading events...</p>
      ) : events.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#94A3B8]">No recent events</p>
      ) : (
        <ul className="space-y-3">
          {events.map((event) => (
            <li
              key={event.id}
              className="flex items-start gap-3 rounded-lg border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.02)] p-3"
            >
              <div className="mt-0.5">
                {iconMap[event.type] ?? <Bell className="h-4 w-4 text-[#94A3B8]" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-[#F1F5F9]">{event.message}</p>
                <p className="text-xs text-[#94A3B8]">{timeAgo(event.time)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
