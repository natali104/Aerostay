'use client'

import { useState } from 'react'
import {
  DEMO_MODE,
  DEMO_HOTEL,
  DEMO_LAYOVER_EVENTS,
  DEMO_ROOMS,
  DEMO_HOTELS_NEARBY,
  DEMO_BOOKING_HISTORY,
  timeAgo,
} from '@/lib/demo'
import { formatEuro } from '@/lib/format'
import ShimmerButton from '@/components/ui/ShimmerButton'
import AeroStatCard from '@/components/ui/AeroStatCard'
import FlightMapBoard from '@/components/dashboard/FlightMapBoard'
import HotelProfilePanel from '@/components/dashboard/HotelProfilePanel'
import { RevenueChart } from './revenue-chart'
import { BedDouble, Clock, DollarSign, Percent, Plane, Users } from 'lucide-react'

const pendingEvents = DEMO_LAYOVER_EVENTS.filter(
  (e) => e.status === 'pending' || e.status === 'booking_in_progress'
)

export default function HotelDashboardPage() {
  const [hotel, setHotel] = useState(DEMO_HOTEL)
  const [rooms, setRooms] = useState(DEMO_ROOMS)

  function handleUpdate(field: string, value: string | number | boolean | { roomNumber: number; status: string }) {
    if (field === 'room_status' && typeof value === 'object' && value !== null && 'roomNumber' in value) {
      setRooms((prev) =>
        prev.map((r) =>
          r.number === value.roomNumber ? { ...r, status: value.status as 'available' | 'occupied' | 'blocked' } : r
        )
      )
    } else {
      setHotel((prev) => ({ ...prev, [field]: value }))
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top: Map + Hotel Profile */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '3fr 2fr',
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: 12,
          overflow: 'hidden',
          minHeight: 480,
        }}
      >
        <FlightMapBoard hotels={DEMO_HOTELS_NEARBY} activeEvents={DEMO_LAYOVER_EVENTS} />
        <HotelProfilePanel hotel={hotel} rooms={rooms} onUpdate={handleUpdate} />
      </div>

      {/* Incoming Layover Requests */}
      <div>
        <h2
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: '#0F172A',
            marginBottom: 16,
          }}
        >
          Incoming Layover Requests
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {pendingEvents.map((evt) => {
            const totalValue = evt.rooms_needed * hotel.price_per_room_eur
            return (
              <div
                key={evt.id}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: 12,
                  padding: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                }}
              >
                {/* Left: flight info */}
                <div style={{ minWidth: 140 }}>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                      fontFamily: "'Space Mono', monospace",
                      color: '#0369A1',
                      lineHeight: 1.2,
                    }}
                  >
                    {evt.flight_number}
                  </div>
                  <div style={{ fontSize: 14, color: '#64748B', marginTop: 2 }}>
                    {evt.airline_name}
                  </div>
                </div>

                {/* Center: stats */}
                <div style={{ flex: 1, display: 'flex', gap: 28, alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                      <Users size={14} color="#64748B" />
                      <span style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>
                        {evt.pax_count}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>passengers</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                      <BedDouble size={14} color="#64748B" />
                      <span style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>
                        {evt.rooms_needed}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>rooms needed</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#10B981' }}>
                      {formatEuro(totalValue)}
                    </span>
                    <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>total value</div>
                  </div>
                </div>

                {/* Right: time + actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 12, color: '#94A3B8', whiteSpace: 'nowrap' }}>
                    {timeAgo(evt.detected_at)}
                  </span>
                  <ShimmerButton color="green" size="sm" onClick={() => {}}>
                    Accept
                  </ShimmerButton>
                  <button
                    type="button"
                    style={{
                      padding: '8px 16px',
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#0EA5E9',
                      background: 'transparent',
                      border: '1px solid #0EA5E9',
                      borderRadius: 8,
                      cursor: 'pointer',
                    }}
                  >
                    Negotiate
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <AeroStatCard
          label="Available Rooms"
          value={47}
          trend={12}
          icon={<BedDouble size={18} />}
        />
        <AeroStatCard
          label="Pending Requests"
          value={3}
          trend={23}
          icon={<Clock size={18} />}
        />
        <AeroStatCard
          label="Monthly Revenue"
          value="€4,892"
          icon={<DollarSign size={18} />}
        />
        <AeroStatCard
          label="Commission"
          value="€391"
          icon={<Percent size={18} />}
        />
      </div>

      {/* Revenue Chart */}
      <RevenueChart />
    </div>
  )
}
