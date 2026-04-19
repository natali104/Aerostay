'use client'

import { useState } from 'react'
import { DEMO_ROOMS } from '@/lib/demo'
import { formatEuro } from '@/lib/format'
import ShimmerButton from '@/components/ui/ShimmerButton'
import { BedDouble, Users, Plus, Pencil, X } from 'lucide-react'

const demoRoomTypes = [
  { id: 'rt1', name: 'Standard Double', max_occupancy: 2, total_rooms: 60, base_price: 89, amenities: ['WiFi', 'TV', 'Air Conditioning', 'Safe', 'Hair Dryer'] },
  { id: 'rt2', name: 'Superior King', max_occupancy: 2, total_rooms: 35, base_price: 119, amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Room Service', 'Bathrobe', 'Safe'] },
  { id: 'rt3', name: 'Executive Suite', max_occupancy: 3, total_rooms: 20, base_price: 189, amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Room Service', 'Bathrobe', 'Safe', 'Desk', 'Coffee Maker', 'Balcony'] },
  { id: 'rt4', name: 'Family Room', max_occupancy: 4, total_rooms: 5, base_price: 159, amenities: ['WiFi', 'TV', 'Air Conditioning', 'Refrigerator', 'Safe'] },
]

export default function RoomsPage() {
  const [roomTypes] = useState(demoRoomTypes)
  const [editId, setEditId] = useState<string | null>(null)

  const available = DEMO_ROOMS.filter((r) => r.status === 'available').length
  const occupied = DEMO_ROOMS.filter((r) => r.status === 'occupied').length
  const blocked = DEMO_ROOMS.filter((r) => r.status === 'blocked').length

  const statusColors: Record<string, string> = {
    available: '#10B981',
    occupied: '#3B82F6',
    blocked: '#EF4444',
  }

  const card: React.CSSProperties = {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 12,
    padding: 24,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>
            Room Management
          </h1>
          <p style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>
            Configure your room types and amenities
          </p>
        </div>
        <ShimmerButton color="blue" size="md" onClick={() => {}}>
          <Plus size={16} />
          Add Room Type
        </ShimmerButton>
      </div>

      {/* Room overview bar */}
      <div
        style={{
          ...card,
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          padding: '16px 24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: 4, background: '#10B981' }} />
          <span style={{ fontSize: 14, color: '#0F172A', fontWeight: 600 }}>{available}</span>
          <span style={{ fontSize: 13, color: '#64748B' }}>Available</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: 4, background: '#3B82F6' }} />
          <span style={{ fontSize: 14, color: '#0F172A', fontWeight: 600 }}>{occupied}</span>
          <span style={{ fontSize: 13, color: '#64748B' }}>Occupied</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: 4, background: '#EF4444' }} />
          <span style={{ fontSize: 14, color: '#0F172A', fontWeight: 600 }}>{blocked}</span>
          <span style={{ fontSize: 13, color: '#64748B' }}>Blocked</span>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 14, color: '#64748B' }}>
          Total: <strong style={{ color: '#0F172A' }}>{DEMO_ROOMS.length}</strong> rooms
        </div>
      </div>

      {/* Room type cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {roomTypes.map((rt) => (
          <div key={rt.id} style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: '#E0F2FE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BedDouble size={20} color="#0EA5E9" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A' }}>{rt.name}</div>
              </div>
              <button
                type="button"
                onClick={() => setEditId(editId === rt.id ? null : rt.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94A3B8',
                  padding: 4,
                }}
              >
                <Pencil size={14} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <div
                style={{
                  background: '#F8FAFF',
                  borderRadius: 8,
                  padding: 12,
                  textAlign: 'center',
                }}
              >
                <Users size={16} color="#94A3B8" style={{ margin: '0 auto 4px' }} />
                <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>{rt.max_occupancy}</div>
                <div style={{ fontSize: 11, color: '#94A3B8' }}>Max Guests</div>
              </div>
              <div
                style={{
                  background: '#F8FAFF',
                  borderRadius: 8,
                  padding: 12,
                  textAlign: 'center',
                }}
              >
                <BedDouble size={16} color="#94A3B8" style={{ margin: '0 auto 4px' }} />
                <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>{rt.total_rooms}</div>
                <div style={{ fontSize: 11, color: '#94A3B8' }}>Total Rooms</div>
              </div>
            </div>

            <div
              style={{
                background: '#F0F9FF',
                border: '1px solid #BAE6FD',
                borderRadius: 8,
                padding: 12,
                textAlign: 'center',
                marginBottom: 14,
              }}
            >
              <div style={{ fontSize: 11, color: '#64748B', marginBottom: 2 }}>Base Price / Night</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#0F172A' }}>
                {formatEuro(rt.base_price)}
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {rt.amenities.slice(0, 5).map((a) => (
                <span
                  key={a}
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    padding: '2px 8px',
                    borderRadius: 12,
                    background: '#F1F5F9',
                    color: '#64748B',
                  }}
                >
                  {a}
                </span>
              ))}
              {rt.amenities.length > 5 && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    padding: '2px 8px',
                    borderRadius: 12,
                    background: '#E0F2FE',
                    color: '#0369A1',
                  }}
                >
                  +{rt.amenities.length - 5} more
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Room grid */}
      <div style={card}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginBottom: 16 }}>
          Room Grid — All Floors
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(34px, 1fr))',
            gap: 3,
          }}
        >
          {DEMO_ROOMS.slice(0, 60).map((room) => (
            <div
              key={room.number}
              style={{
                width: 34,
                height: 34,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 9,
                fontFamily: "'Space Mono', monospace",
                fontWeight: 600,
                color: '#FFFFFF',
                background: statusColors[room.status],
                cursor: 'pointer',
                opacity: room.status === 'blocked' ? 0.7 : 1,
              }}
            >
              {room.number}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 10, color: '#64748B', marginTop: 12 }}>
          {(['available', 'occupied', 'blocked'] as const).map((s) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: statusColors[s], display: 'inline-block' }} />
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
