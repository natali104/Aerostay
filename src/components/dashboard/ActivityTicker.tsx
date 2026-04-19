'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatEuro } from '@/lib/format'

interface TickerBooking {
  id: string
  guest_count: number
  total_amount: number
  hotel_name: string
  airline_name: string
  flight_number: string
}

export function ActivityTicker() {
  const [items, setItems] = useState<TickerBooking[]>([])

  useEffect(() => {
    async function fetchActivity() {
      const supabase = createClient()
      const { data } = await supabase
        .from('booking_requests')
        .select(
          'id, guest_count, total_amount, hotels(name), layovers(flight_number, airlines(name))'
        )
        .eq('status', 'confirmed')
        .order('confirmed_at', { ascending: false })
        .limit(20)

      if (data) {
        setItems(
          data.map((b) => {
            const hotel = b.hotels as unknown as { name: string } | null
            const layover = b.layovers as unknown as {
              flight_number: string
              airlines: { name: string } | null
            } | null
            return {
              id: b.id,
              guest_count: b.guest_count ?? 0,
              total_amount: b.total_amount ?? 0,
              hotel_name: hotel?.name ?? 'Hotel',
              airline_name: layover?.airlines?.name ?? 'Airline',
              flight_number: layover?.flight_number ?? 'Flight',
            }
          })
        )
      }
    }

    fetchActivity()
  }, [])

  const fallbackItems: TickerBooking[] = [
    { id: '1', flight_number: 'TK1234', hotel_name: 'Hyatt Regency', airline_name: 'Turkish Airlines', guest_count: 24, total_amount: 2880 },
    { id: '2', flight_number: 'LZ481', hotel_name: 'Hilton Sofia', airline_name: 'Bulgaria Air', guest_count: 18, total_amount: 1440 },
    { id: '3', flight_number: 'W64455', hotel_name: 'Radisson Blu', airline_name: 'Wizz Air', guest_count: 31, total_amount: 2480 },
    { id: '4', flight_number: 'OS801', hotel_name: 'InterContinental', airline_name: 'Austrian Airlines', guest_count: 12, total_amount: 1560 },
    { id: '5', flight_number: 'FB402', hotel_name: 'Marinela Hotel', airline_name: 'Bulgaria Air', guest_count: 22, total_amount: 1980 },
  ]

  const displayItems = items.length > 0 ? items : fallbackItems

  const tickerText = displayItems
    .map(
      (b) =>
        `✈ ${b.flight_number} · ${b.hotel_name} · ${b.guest_count} rooms · ${formatEuro(b.total_amount)} confirmed`
    )
    .join('   ·   ')

  const doubled = `${tickerText}   ·   ${tickerText}`

  return (
    <div
      className="relative flex items-center overflow-hidden"
      style={{
        height: 34,
        backgroundColor: '#0A0F1E',
      }}
    >
      {/* LIVE badge */}
      <div
        className="flex-shrink-0 flex items-center gap-1.5 px-3 z-10"
        style={{
          backgroundColor: 'rgba(34,197,94,0.1)',
          borderRight: '1px solid rgba(14,165,233,0.12)',
          height: '100%',
        }}
      >
        <span
          className="rounded-full animate-pulse"
          style={{ width: 6, height: 6, backgroundColor: '#22C55E', boxShadow: '0 0 4px #22C55E' }}
        />
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: '#22C55E',
            letterSpacing: '0.05em',
          }}
        >
          LIVE
        </span>
      </div>

      {/* Scrolling ticker */}
      <div className="flex-1 overflow-hidden">
        <div
          className="activity-ticker-scroll whitespace-nowrap"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          <span style={{ fontSize: 12, color: 'rgba(14,165,233,0.85)' }}>
            {doubled}
          </span>
        </div>
      </div>
    </div>
  )
}
