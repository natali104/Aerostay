'use client'

import { useState, useMemo } from 'react'
import {
  DEMO_LAYOVER_EVENTS,
  DEMO_HOTEL,
  timeAgo,
} from '@/lib/demo'
import { formatEuro } from '@/lib/format'
import ShimmerButton from '@/components/ui/ShimmerButton'
import StatusBadge from '@/components/ui/StatusBadge'
import { Plane, Radar } from 'lucide-react'

type Filter = 'all' | 'pending' | 'confirmed' | 'rejected'

const extraRows = [
  { id: 'e6', flight_number: 'BA2041', pax_count: 44, status: 'confirmed', detected_at: new Date(Date.now() - 55 * 60000).toISOString(), airline_name: 'British Airways', rooms_needed: 22, airport_code: 'SOF', amount_eur: 1958 },
  { id: 'e7', flight_number: 'LH1423', pax_count: 31, status: 'rejected', detected_at: new Date(Date.now() - 120 * 60000).toISOString(), airline_name: 'Lufthansa', rooms_needed: 16, airport_code: 'SOF', amount_eur: 0 },
  { id: 'e8', flight_number: 'AF1184', pax_count: 58, status: 'pending', detected_at: new Date(Date.now() - 8 * 60000).toISOString(), airline_name: 'Air France', rooms_needed: 29, airport_code: 'SOF', amount_eur: 0 },
  { id: 'e9', flight_number: 'KL7792', pax_count: 27, status: 'confirmed', detected_at: new Date(Date.now() - 90 * 60000).toISOString(), airline_name: 'KLM', rooms_needed: 14, airport_code: 'SOF', amount_eur: 1246 },
  { id: 'e10', flight_number: 'SU2150', pax_count: 72, status: 'pending', detected_at: new Date(Date.now() - 3 * 60000).toISOString(), airline_name: 'Aeroflot', rooms_needed: 36, airport_code: 'SOF', amount_eur: 0 },
]

const allBookings = [...DEMO_LAYOVER_EVENTS, ...extraRows].map((evt) => ({
  ...evt,
  price_per_room: DEMO_HOTEL.price_per_room_eur,
  total_value: evt.amount_eur > 0 ? evt.amount_eur : evt.rooms_needed * DEMO_HOTEL.price_per_room_eur,
}))

const statusDot: Record<string, string> = {
  pending: '#F59E0B',
  confirmed: '#10B981',
  booking_in_progress: '#0EA5E9',
  rejected: '#EF4444',
  cancelled: '#EF4444',
}

const filterPills: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'rejected', label: 'Rejected' },
]

export default function HotelBookingsPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const [lastUpdated] = useState(() => Math.floor(Math.random() * 5) + 2)

  const filtered = useMemo(() => {
    if (filter === 'all') return allBookings
    if (filter === 'pending')
      return allBookings.filter((b) => b.status === 'pending' || b.status === 'booking_in_progress')
    return allBookings.filter((b) => b.status === filter)
  }, [filter])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>
          Booking Requests
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Filter pills */}
          <div style={{ display: 'flex', gap: 6 }}>
            {filterPills.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setFilter(p.value)}
                style={{
                  padding: '6px 14px',
                  fontSize: 13,
                  fontWeight: 600,
                  borderRadius: 20,
                  border: 'none',
                  cursor: 'pointer',
                  background: filter === p.value ? '#0EA5E9' : '#F1F5F9',
                  color: filter === p.value ? '#FFFFFF' : '#64748B',
                  transition: 'all 0.15s ease',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
          <span style={{ fontSize: 12, color: '#94A3B8' }}>
            Last updated: {lastUpdated}s ago
          </span>
        </div>
      </div>

      {/* Table */}
      {filtered.length > 0 ? (
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFF' }}>
                {['Status', 'Flight', 'Airline', 'Pax', 'Rooms', '€/room', 'Total', 'Time', 'Actions'].map(
                  (col) => (
                    <th
                      key={col}
                      style={{
                        padding: '10px 14px',
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: '#94A3B8',
                        textAlign: 'left',
                        borderBottom: '1px solid #E2E8F0',
                      }}
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr
                  key={b.id}
                  style={{ borderBottom: '1px solid #F1F5F9' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFF')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '12px 14px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: statusDot[b.status] ?? '#94A3B8',
                      }}
                    />
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Plane size={14} color="#0EA5E9" />
                      <span
                        style={{
                          fontFamily: "'Space Mono', monospace",
                          fontWeight: 600,
                          color: '#0F172A',
                          fontSize: 14,
                        }}
                      >
                        {b.flight_number}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 14, color: '#64748B' }}>
                    {b.airline_name}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 14, fontWeight: 600, color: '#0F172A' }}>
                    {b.pax_count}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 14, fontWeight: 600, color: '#0F172A' }}>
                    {b.rooms_needed}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 14, color: '#64748B' }}>
                    {formatEuro(b.price_per_room)}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 14, fontWeight: 600, color: '#10B981' }}>
                    {formatEuro(b.total_value)}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: '#94A3B8' }}>
                    {timeAgo(b.detected_at)}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {b.status === 'pending' || b.status === 'booking_in_progress' ? (
                        <>
                          <ShimmerButton color="green" size="sm" onClick={() => {}}>
                            Confirm
                          </ShimmerButton>
                          <button
                            type="button"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#EF4444',
                              fontSize: 13,
                              fontWeight: 600,
                              cursor: 'pointer',
                              padding: '4px 8px',
                            }}
                          >
                            Decline
                          </button>
                        </>
                      ) : (
                        <StatusBadge status={b.status} />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 12,
            padding: '64px 20px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginBottom: 12,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#F59E0B',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
            <Radar size={20} color="#64748B" />
          </div>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>
            Radar is clear
          </p>
          <p style={{ fontSize: 14, color: '#94A3B8' }}>
            No booking requests match this filter right now.
          </p>
        </div>
      )}
    </div>
  )
}
