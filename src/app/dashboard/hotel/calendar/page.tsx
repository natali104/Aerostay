'use client'

import { useState, useMemo, useCallback } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import ShimmerButton from '@/components/ui/ShimmerButton'

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = []
  const d = new Date(year, month, 1)
  while (d.getMonth() === month) {
    days.push(new Date(d))
    d.setDate(d.getDate() + 1)
  }
  return days
}

function pad(n: number) {
  return n.toString().padStart(2, '0')
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function generateAvailability(year: number, month: number): Record<string, number> {
  const days = getDaysInMonth(year, month)
  const map: Record<string, number> = {}
  days.forEach((d, i) => {
    const seed = year * 10000 + month * 100 + d.getDate()
    const rand = seededRandom(seed)
    const dayOfWeek = d.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const base = isWeekend ? 15 : 35
    map[toDateStr(d)] = Math.round(base + rand * 30)
  })
  return map
}

export default function CalendarPage() {
  const [year, setYear] = useState(() => new Date().getFullYear())
  const [month, setMonth] = useState(() => new Date().getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [availability, setAvailability] = useState<Record<string, number>>(() =>
    generateAvailability(new Date().getFullYear(), new Date().getMonth())
  )

  const days = useMemo(() => getDaysInMonth(year, month), [year, month])
  const firstDayOfWeek = (days[0].getDay() + 6) % 7
  const monthName = new Date(year, month).toLocaleString('default', { month: 'long' })
  const todayStr = toDateStr(new Date())

  const goPrev = useCallback(() => {
    if (month === 0) {
      setMonth(11)
      setYear((y) => y - 1)
      setAvailability(generateAvailability(year - 1, 11))
    } else {
      setMonth((m) => m - 1)
      setAvailability(generateAvailability(year, month - 1))
    }
  }, [month, year])

  const goNext = useCallback(() => {
    if (month === 11) {
      setMonth(0)
      setYear((y) => y + 1)
      setAvailability(generateAvailability(year + 1, 0))
    } else {
      setMonth((m) => m + 1)
      setAvailability(generateAvailability(year, month + 1))
    }
  }, [month, year])

  function openDay(dateStr: string) {
    setSelectedDate(dateStr)
    setEditValue(String(availability[dateStr] ?? 0))
  }

  function handleSave() {
    if (!selectedDate) return
    setAvailability((prev) => ({ ...prev, [selectedDate]: parseInt(editValue) || 0 }))
    setSelectedDate(null)
  }

  function roomColor(count: number): string {
    if (count === 0) return '#EF4444'
    if (count <= 5) return '#0EA5E9'
    return '#10B981'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>
        Availability Calendar
      </h1>

      {/* Month navigation */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: 12,
          padding: 20,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}
        >
          <button
            onClick={goPrev}
            type="button"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748B',
            }}
          >
            <ChevronLeft size={18} />
          </button>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0F172A', margin: 0 }}>
            {monthName} {year}
          </h2>
          <button
            onClick={goNext}
            type="button"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748B',
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Calendar grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {/* Day headers */}
          {DAY_NAMES.map((d) => (
            <div
              key={d}
              style={{
                padding: '8px 0',
                textAlign: 'center',
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#94A3B8',
              }}
            >
              {d}
            </div>
          ))}

          {/* Blank cells */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`blank-${i}`} />
          ))}

          {/* Day cells */}
          {days.map((d) => {
            const dateStr = toDateStr(d)
            const avail = availability[dateStr] ?? 0
            const isToday = dateStr === todayStr

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => openDay(dateStr)}
                style={{
                  minHeight: 80,
                  background: isToday ? '#F0F9FF' : '#FFFFFF',
                  border: `1px solid ${isToday ? '#0EA5E9' : '#E2E8F0'}`,
                  borderRadius: 8,
                  padding: 8,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  transition: 'background 0.15s ease',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (!isToday) e.currentTarget.style.background = '#F0F9FF'
                }}
                onMouseLeave={(e) => {
                  if (!isToday) e.currentTarget.style.background = '#FFFFFF'
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    color: '#64748B',
                    textAlign: 'right',
                    fontWeight: isToday ? 700 : 400,
                  }}
                >
                  {d.getDate()}
                </div>
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    fontWeight: 700,
                    color: roomColor(avail),
                  }}
                >
                  {avail}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Edit modal */}
      {selectedDate && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.4)',
          }}
          onClick={() => setSelectedDate(null)}
        >
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 12,
              padding: 24,
              width: '100%',
              maxWidth: 380,
              position: 'relative',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedDate(null)}
              type="button"
              style={{
                position: 'absolute',
                right: 12,
                top: 12,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94A3B8',
              }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </h3>
            <p style={{ fontSize: 14, color: '#94A3B8', marginBottom: 20 }}>
              Current availability: {availability[selectedDate] ?? 0} rooms
            </p>

            <label
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 500,
                color: '#64748B',
                marginBottom: 6,
              }}
            >
              Available Rooms
            </label>
            <input
              type="number"
              min={0}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: 14,
                border: '1px solid #E2E8F0',
                borderRadius: 8,
                outline: 'none',
                color: '#0F172A',
                background: '#F8FAFF',
                marginBottom: 16,
                boxSizing: 'border-box',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#0EA5E9')}
              onBlur={(e) => (e.target.style.borderColor = '#E2E8F0')}
            />

            <ShimmerButton color="blue" size="md" onClick={handleSave}>
              Save
            </ShimmerButton>
          </div>
        </div>
      )}
    </div>
  )
}
