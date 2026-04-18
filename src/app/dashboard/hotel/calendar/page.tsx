'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

interface AvailabilityRow {
  id: string
  room_type_id: string
  date: string
  available_count: number
  price_per_night: number
  is_blocked: boolean
}

interface BookingCount {
  date: string
  count: number
}

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

function availColor(count: number): string {
  if (count === 0) return 'text-red-400'
  if (count <= 5) return 'text-[#F5A623]'
  return 'text-[#22C55E]'
}

export default function CalendarPage() {
  const [hotelId, setHotelId] = useState<string | null>(null)
  const [year, setYear] = useState(() => new Date().getFullYear())
  const [month, setMonth] = useState(() => new Date().getMonth())
  const [availability, setAvailability] = useState<
    Record<string, { total: number; id: string | null }>
  >({})
  const [bookingCounts, setBookingCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  const loadHotel = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: profile } = await supabase
      .from('profiles')
      .select('hotel_id')
      .eq('id', user.id)
      .single()
    if (profile?.hotel_id) setHotelId(profile.hotel_id)
  }, [supabase])

  useEffect(() => {
    loadHotel()
  }, [loadHotel])

  const loadData = useCallback(async () => {
    if (!hotelId) return
    setLoading(true)

    const days = getDaysInMonth(year, month)
    const firstDay = toDateStr(days[0])
    const lastDay = toDateStr(days[days.length - 1])

    const { data: roomTypes } = await supabase
      .from('room_types')
      .select('id')
      .eq('hotel_id', hotelId)

    const rtIds = roomTypes?.map((r) => r.id) ?? []

    if (rtIds.length === 0) {
      setAvailability({})
      setBookingCounts({})
      setLoading(false)
      return
    }

    const { data: availData } = await supabase
      .from('room_availability')
      .select('id, room_type_id, date, available_count, is_blocked')
      .in('room_type_id', rtIds)
      .gte('date', firstDay)
      .lte('date', lastDay)
      .eq('is_blocked', false)

    const map: Record<string, { total: number; id: string | null }> = {}
    for (const row of availData ?? []) {
      if (!map[row.date]) map[row.date] = { total: 0, id: row.id }
      map[row.date].total += row.available_count ?? 0
    }
    setAvailability(map)

    const { data: bookings } = await supabase
      .from('booking_requests')
      .select('check_in')
      .eq('hotel_id', hotelId)
      .eq('status', 'confirmed')
      .gte('check_in', firstDay)
      .lte('check_in', lastDay)

    const bMap: Record<string, number> = {}
    for (const b of bookings ?? []) {
      bMap[b.check_in] = (bMap[b.check_in] ?? 0) + 1
    }
    setBookingCounts(bMap)
    setLoading(false)
  }, [hotelId, year, month, supabase])

  useEffect(() => {
    loadData()
  }, [loadData])

  function goPrev() {
    if (month === 0) {
      setMonth(11)
      setYear((y) => y - 1)
    } else {
      setMonth((m) => m - 1)
    }
  }

  function goNext() {
    if (month === 11) {
      setMonth(0)
      setYear((y) => y + 1)
    } else {
      setMonth((m) => m + 1)
    }
  }

  function openDay(dateStr: string) {
    setSelectedDate(dateStr)
    setEditValue(String(availability[dateStr]?.total ?? 0))
  }

  async function handleSave() {
    if (!selectedDate || !hotelId) return
    setSaving(true)

    const { data: roomTypes } = await supabase
      .from('room_types')
      .select('id')
      .eq('hotel_id', hotelId)
      .limit(1)

    const rtId = roomTypes?.[0]?.id
    if (rtId) {
      await supabase.from('room_availability').upsert(
        {
          room_type_id: rtId,
          date: selectedDate,
          available_count: parseInt(editValue) || 0,
          is_blocked: false,
        },
        { onConflict: 'room_type_id,date' }
      )
    }

    setSaving(false)
    setSelectedDate(null)
    loadData()
  }

  const days = getDaysInMonth(year, month)
  const firstDayOfWeek = (days[0].getDay() + 6) % 7
  const monthName = new Date(year, month).toLocaleString('default', {
    month: 'long',
  })

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Availability Calendar"
        subtitle="Manage daily room availability"
      />

      <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#111827] p-5">
        <div className="mb-5 flex items-center justify-between">
          <button
            onClick={goPrev}
            className="rounded-lg p-2 text-[#94A3B8] transition-colors hover:bg-[rgba(255,255,255,0.05)] hover:text-[#3B9EFF]"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold text-[#F1F5F9]">
            {monthName} {year}
          </h2>
          <button
            onClick={goNext}
            className="rounded-lg p-2 text-[#94A3B8] transition-colors hover:bg-[rgba(255,255,255,0.05)] hover:text-[#3B9EFF]"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {DAY_NAMES.map((d) => (
            <div
              key={d}
              className="py-2 text-center text-xs font-medium text-[#94A3B8]"
            >
              {d}
            </div>
          ))}

          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`blank-${i}`} />
          ))}

          {loading
            ? days.map((d) => (
                <div
                  key={d.toISOString()}
                  className="min-h-[80px] animate-pulse rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-2"
                />
              ))
            : days.map((d) => {
                const dateStr = toDateStr(d)
                const avail = availability[dateStr]?.total ?? 0
                const bookings = bookingCounts[dateStr] ?? 0

                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => openDay(dateStr)}
                    className="group flex min-h-[80px] flex-col rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-2 text-left transition-all hover:border-[#3B9EFF]/30 hover:bg-[rgba(255,255,255,0.04)]"
                  >
                    <span className="text-xs text-[#94A3B8]">
                      {d.getDate()}
                    </span>
                    <span
                      className={`mt-auto text-lg font-bold ${availColor(avail)}`}
                    >
                      {avail}
                    </span>
                    {bookings > 0 && (
                      <span className="mt-0.5 inline-flex w-fit items-center rounded-full bg-[#F5A623]/15 px-1.5 py-0.5 text-[10px] font-medium text-[#F5A623]">
                        {bookings} booking{bookings > 1 ? 's' : ''}
                      </span>
                    )}
                  </button>
                )
              })}
        </div>
      </div>

      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="relative w-full max-w-sm rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#111827] p-6 shadow-2xl">
            <button
              onClick={() => setSelectedDate(null)}
              className="absolute right-3 top-3 text-[#94A3B8] hover:text-[#F1F5F9]"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="mb-1 text-lg font-semibold text-[#F1F5F9]">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </h3>
            <p className="mb-5 text-sm text-[#94A3B8]">
              Current availability: {availability[selectedDate]?.total ?? 0}{' '}
              rooms
            </p>

            <label className="mb-2 block text-sm font-medium text-[#94A3B8]">
              Available Rooms
            </label>
            <input
              type="number"
              min={0}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="mb-5 w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#0A0F1E] px-3 py-2 text-[#F1F5F9] outline-none focus:border-[#3B9EFF] focus:ring-1 focus:ring-[#3B9EFF]"
            />

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full rounded-lg bg-[#3B9EFF] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#3B9EFF]/90 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
