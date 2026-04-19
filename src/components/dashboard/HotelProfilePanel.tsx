'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { DemoHotel, DemoRoom } from '@/lib/demo'

interface HotelProfilePanelProps {
  hotel: DemoHotel
  rooms: DemoRoom[]
  onUpdate: (field: string, value: string | number | boolean | { roomNumber: number; status: string }) => void
}

/* ─── Inline Editable Field ──────────────────────── */

function InlineEdit({
  value,
  field,
  onSave,
  fontSize = 14,
  fontWeight = 400,
  color = '#0F172A',
}: {
  value: string | number
  field: string
  onSave: (field: string, value: string) => void
  fontSize?: number
  fontWeight?: number
  color?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(value))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setDraft(String(value))
  }, [value])

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const commit = useCallback(() => {
    setEditing(false)
    if (draft !== String(value)) {
      onSave(field, draft)
    }
  }, [draft, value, field, onSave])

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') { setDraft(String(value)); setEditing(false) }
        }}
        style={{
          fontSize,
          fontWeight,
          color,
          border: '1px solid #3B9EFF',
          borderRadius: 4,
          padding: '2px 6px',
          outline: 'none',
          width: '100%',
          background: '#F0F9FF',
          fontFamily: 'inherit',
        }}
      />
    )
  }

  return (
    <span
      onClick={() => setEditing(true)}
      style={{
        fontSize,
        fontWeight,
        color,
        cursor: 'pointer',
        borderBottom: '1px dashed #CBD5E1',
        paddingBottom: 1,
      }}
      title="Click to edit"
    >
      {value}
    </span>
  )
}

/* ─── Inline Toggle ──────────────────────────────── */

function InlineToggle({
  label,
  value,
  field,
  onToggle,
}: {
  label: string
  value: boolean
  field: string
  onToggle: (field: string, value: boolean) => void
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
      <span style={{ fontSize: 13, color: '#334155', fontWeight: 500 }}>{label}</span>
      <div
        onClick={() => onToggle(field, !value)}
        style={{
          width: 36,
          height: 20,
          borderRadius: 10,
          background: value ? '#0EA5E9' : '#CBD5E1',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background 0.2s ease',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 2,
            left: value ? 18 : 2,
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: '#FFFFFF',
            transition: 'left 0.2s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          }}
        />
      </div>
    </div>
  )
}

/* ─── Room Popover ───────────────────────────────── */

function RoomPopover({
  room,
  position,
  onChangeStatus,
  onClose,
}: {
  room: DemoRoom
  position: { x: number; y: number }
  onChangeStatus: (roomNumber: number, status: DemoRoom['status']) => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  const statuses: DemoRoom['status'][] = ['available', 'occupied', 'blocked']
  const statusColors: Record<string, string> = {
    available: '#22C55E',
    occupied: '#3B82F6',
    blocked: '#EF4444',
  }

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 100,
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: 8,
        padding: 12,
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        minWidth: 140,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 600, color: '#0F172A', marginBottom: 8 }}>
        Room {room.number}
      </div>
      {statuses.map((s) => (
        <div
          key={s}
          onClick={() => { onChangeStatus(room.number, s); onClose() }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 8px',
            borderRadius: 4,
            cursor: 'pointer',
            background: room.status === s ? '#F0F9FF' : 'transparent',
            fontSize: 12,
            color: '#334155',
            fontWeight: room.status === s ? 600 : 400,
          }}
        >
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: statusColors[s],
            flexShrink: 0,
          }} />
          {s.charAt(0).toUpperCase() + s.slice(1)}
        </div>
      ))}
    </div>
  )
}

/* ─── Main Panel ─────────────────────────────────── */

export default function HotelProfilePanel({ hotel, rooms, onUpdate }: HotelProfilePanelProps) {
  const [localHotel, setLocalHotel] = useState(hotel)
  const [localRooms, setLocalRooms] = useState(rooms)
  const [popover, setPopover] = useState<{ room: DemoRoom; x: number; y: number } | null>(null)
  const [showAllRooms, setShowAllRooms] = useState(false)

  useEffect(() => { setLocalHotel(hotel) }, [hotel])
  useEffect(() => { setLocalRooms(rooms) }, [rooms])

  const handleFieldSave = useCallback((field: string, value: string) => {
    setLocalHotel((prev: DemoHotel) => ({ ...prev, [field]: value }))
    onUpdate(field, value)
  }, [onUpdate])

  const handleToggle = useCallback((field: string, value: boolean) => {
    setLocalHotel((prev: DemoHotel) => ({ ...prev, [field]: value }))
    onUpdate(field, value)
  }, [onUpdate])

  const handleStarClick = useCallback((stars: number) => {
    setLocalHotel((prev: DemoHotel) => ({ ...prev, star_rating: stars }))
    onUpdate('star_rating', stars)
  }, [onUpdate])

  const handlePriceChange = useCallback((value: number) => {
    setLocalHotel((prev: DemoHotel) => ({ ...prev, price_per_room_eur: value }))
    onUpdate('price_per_room_eur', value)
  }, [onUpdate])

  const handlePricingMode = useCallback((mode: string) => {
    setLocalHotel((prev: DemoHotel) => ({ ...prev, pricing_mode: mode as DemoHotel['pricing_mode'] }))
    onUpdate('pricing_mode', mode)
  }, [onUpdate])

  const handleDiscountChange = useCallback((value: number) => {
    setLocalHotel((prev: DemoHotel) => ({ ...prev, booking_com_discount_pct: value }))
    onUpdate('booking_com_discount_pct', value)
  }, [onUpdate])

  const handleRoomStatus = useCallback((roomNumber: number, status: DemoRoom['status']) => {
    setLocalRooms((prev) => prev.map((r) => r.number === roomNumber ? { ...r, status } : r))
    onUpdate('room_status', { roomNumber, status })
  }, [onUpdate])

  const available = localRooms.filter((r) => r.status === 'available').length
  const occupied = localRooms.filter((r) => r.status === 'occupied').length
  const total = localRooms.length
  const occupancyPct = total > 0 ? Math.round((occupied / total) * 100) : 0

  const displayRooms = showAllRooms ? localRooms : localRooms.slice(0, 32)
  const hiddenCount = localRooms.length - 32

  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  const sectionTitle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: 12,
    marginTop: 24,
  }

  const fieldRow: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 0',
    borderBottom: '1px solid #F1F5F9',
  }

  const fieldLabel: React.CSSProperties = {
    fontSize: 12,
    color: '#94A3B8',
    flexShrink: 0,
    width: 100,
  }

  const statusColors: Record<string, string> = {
    available: '#22C55E',
    occupied: '#3B82F6',
    blocked: '#EF4444',
  }

  return (
    <div
      style={{
        height: 480,
        overflowY: 'auto',
        background: '#FFFFFF',
        padding: 20,
        borderLeft: '1px solid #E2E8F0',
      }}
      className="hotel-profile-scroll"
    >
      {/* A. Hotel Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 8,
            background: '#E0F2FE',
            color: '#0369A1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {localHotel.name.charAt(0)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <InlineEdit
            value={localHotel.name}
            field="name"
            onSave={handleFieldSave}
            fontSize={18}
            fontWeight={700}
            color="#0F172A"
          />
          <div style={{ marginTop: 4 }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <span
                key={s}
                onClick={() => handleStarClick(s)}
                style={{
                  cursor: 'pointer',
                  fontSize: 16,
                  color: s <= localHotel.star_rating ? '#F59E0B' : '#E2E8F0',
                }}
              >
                ★
              </span>
            ))}
          </div>
          <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
            {localHotel.address}
          </div>
        </div>
      </div>

      {/* B. Property Details */}
      <div style={sectionTitle}>Property Details</div>
      {([
        ['address', 'Address', localHotel.address],
        ['city', 'City', localHotel.city],
        ['phone', 'Phone', localHotel.phone],
        ['email', 'Email', localHotel.email],
        ['website', 'Website', localHotel.website],
        ['checkin_time', 'Check-in', localHotel.checkin_time],
        ['checkout_time', 'Check-out', localHotel.checkout_time],
        ['max_pax_per_room', 'Max Pax/Room', localHotel.max_pax_per_room],
      ] as [string, string, string | number][]).map(([field, label, val]) => (
        <div key={field} style={fieldRow}>
          <span style={fieldLabel}>{label}</span>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <InlineEdit
              value={val}
              field={field}
              onSave={handleFieldSave}
              fontSize={13}
              fontWeight={500}
              color="#334155"
            />
          </div>
        </div>
      ))}

      {/* C. Room Availability */}
      <div style={sectionTitle}>
        Rooms Tonight
        <span style={{ fontWeight: 400, color: '#94A3B8', marginLeft: 8, textTransform: 'none', letterSpacing: 0 }}>
          {today}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <div style={{
          flex: 1,
          background: '#F0FDF4',
          borderRadius: 8,
          padding: '12px 14px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#16A34A' }}>{available}</div>
          <div style={{ fontSize: 11, color: '#16A34A', fontWeight: 500 }}>Available</div>
        </div>
        <div style={{
          flex: 1,
          background: '#EFF6FF',
          borderRadius: 8,
          padding: '12px 14px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#2563EB' }}>{occupied}</div>
          <div style={{ fontSize: 11, color: '#2563EB', fontWeight: 500 }}>Occupied</div>
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748B', marginBottom: 4 }}>
          <span>Occupancy</span>
          <span style={{ fontWeight: 600 }}>{occupancyPct}%</span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: '#E2E8F0', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${occupancyPct}%`,
            borderRadius: 3,
            background: 'linear-gradient(90deg, #3B82F6, #0EA5E9)',
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(8, 1fr)',
        gap: 4,
        marginBottom: 8,
      }}>
        {displayRooms.map((room) => (
          <div
            key={room.number}
            onClick={(e) => {
              const rect = (e.target as HTMLElement).getBoundingClientRect()
              setPopover({ room, x: rect.left, y: rect.bottom + 4 })
            }}
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
              transition: 'transform 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.12)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {room.number}
          </div>
        ))}
      </div>

      {!showAllRooms && hiddenCount > 0 && (
        <div
          onClick={() => setShowAllRooms(true)}
          style={{ fontSize: 12, color: '#3B82F6', cursor: 'pointer', fontWeight: 500, marginBottom: 8 }}
        >
          +{hiddenCount} more rooms
        </div>
      )}
      {showAllRooms && hiddenCount > 0 && (
        <div
          onClick={() => setShowAllRooms(false)}
          style={{ fontSize: 12, color: '#3B82F6', cursor: 'pointer', fontWeight: 500, marginBottom: 8 }}
        >
          Show fewer
        </div>
      )}

      <div style={{ display: 'flex', gap: 16, fontSize: 10, color: '#64748B' }}>
        {(['available', 'occupied', 'blocked'] as const).map((s) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: statusColors[s], display: 'inline-block' }} />
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </div>
        ))}
      </div>

      {/* D. Pricing */}
      <div style={sectionTitle}>Pricing</div>

      <div style={{ textAlign: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: 36, fontWeight: 700, color: '#0F172A' }}>€{localHotel.price_per_room_eur}</span>
        <span style={{ fontSize: 14, color: '#94A3B8', marginLeft: 4 }}>/night</span>
      </div>

      <div style={{ marginBottom: 14 }}>
        <input
          type="range"
          min={40}
          max={500}
          value={localHotel.price_per_room_eur}
          onChange={(e) => handlePriceChange(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#3B82F6' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94A3B8' }}>
          <span>€40</span>
          <span>€500</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {['manual', 'booking_com', 'channel_mgr'].map((mode) => {
          const labels: Record<string, string> = {
            manual: 'Manual',
            booking_com: 'Booking.com',
            channel_mgr: 'Channel Mgr',
          }
          const active = localHotel.pricing_mode === mode
          return (
            <div
              key={mode}
              onClick={() => handlePricingMode(mode)}
              style={{
                flex: 1,
                padding: '6px 8px',
                borderRadius: 6,
                textAlign: 'center',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                background: active ? '#0EA5E9' : '#F1F5F9',
                color: active ? '#FFFFFF' : '#64748B',
                transition: 'all 0.15s ease',
              }}
            >
              {labels[mode]}
            </div>
          )
        })}
      </div>

      {localHotel.pricing_mode === 'booking_com' && (
        <div style={{ background: '#F0F9FF', borderRadius: 8, padding: 12, marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: '#0369A1', fontWeight: 600, marginBottom: 8 }}>
            Booking.com Discount: {localHotel.booking_com_discount_pct}%
          </div>
          <input
            type="range"
            min={0}
            max={30}
            value={localHotel.booking_com_discount_pct}
            onChange={(e) => handleDiscountChange(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#0369A1' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94A3B8' }}>
            <span>0%</span>
            <span>30%</span>
          </div>
        </div>
      )}

      {/* E. Settings */}
      <div style={sectionTitle}>Settings</div>

      <InlineToggle label="Accept Requests" value={localHotel.accept_requests} field="accept_requests" onToggle={handleToggle} />
      <InlineToggle label="Breakfast Included" value={localHotel.breakfast_included} field="breakfast_included" onToggle={handleToggle} />
      <InlineToggle label="Auto Confirm" value={localHotel.auto_confirm} field="auto_confirm" onToggle={handleToggle} />
      <InlineToggle label="SMS Alerts" value={localHotel.sms_alerts} field="sms_alerts" onToggle={handleToggle} />
      <InlineToggle label="Show on Map" value={localHotel.show_on_map} field="show_on_map" onToggle={handleToggle} />

      {/* F. Commission */}
      <div style={sectionTitle}>Commission</div>

      <div style={{
        borderLeft: '3px solid #7DD3FC',
        paddingLeft: 14,
        padding: '12px 14px',
        background: '#F0F9FF',
        borderRadius: '0 8px 8px 0',
      }}>
        <div style={{ fontSize: 13, color: '#0F172A', fontWeight: 600, marginBottom: 6 }}>
          {localHotel.commission_rate}% per confirmed booking
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <span style={{ fontSize: 12, color: '#64748B' }}>This month</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#16A34A' }}>€391.20</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <span style={{ fontSize: 12, color: '#64748B' }}>Next billing</span>
          <span style={{ fontSize: 12, color: '#334155', fontWeight: 500 }}>1 May 2026</span>
        </div>
        <div
          style={{ fontSize: 12, color: '#3B82F6', cursor: 'pointer', fontWeight: 500, marginTop: 6 }}
          onClick={() => {}}
        >
          View settlement history →
        </div>
      </div>

      <div style={{ height: 24 }} />

      {popover && (
        <RoomPopover
          room={popover.room}
          position={{ x: popover.x, y: popover.y }}
          onChangeStatus={handleRoomStatus}
          onClose={() => setPopover(null)}
        />
      )}

      <style>{`
        .hotel-profile-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .hotel-profile-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .hotel-profile-scroll::-webkit-scrollbar-thumb {
          background: #CBD5E1;
          border-radius: 2px;
        }
        .hotel-profile-scroll::-webkit-scrollbar-thumb:hover {
          background: #94A3B8;
        }
      `}</style>
    </div>
  )
}
