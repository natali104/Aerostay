'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Modal,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from '@/components/ui/modal'
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/tabs'
import { formatCurrency } from '@/lib/utils'
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Lock,
  Unlock,
} from 'lucide-react'
import {
  addDays,
  format,
  startOfDay,
  isToday,
  isBefore,
} from 'date-fns'

interface RoomType {
  id: string
  name: string
  total_rooms: number
  base_price: number
}

interface AvailabilityEntry {
  id?: string
  room_type_id: string
  date: string
  available_rooms: number
  total_rooms: number
  price: number
  is_blocked: boolean
}

interface PendingChange {
  room_type_id: string
  date: string
  available_rooms: number
  price: number
  is_blocked: boolean
}

export default function CalendarPage() {
  const supabase = createClient()

  const [hotelId, setHotelId] = useState<string | null>(null)
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [activeRoomType, setActiveRoomType] = useState<string>('')
  const [availability, setAvailability] = useState<AvailabilityEntry[]>([])
  const [pendingChanges, setPendingChanges] = useState<Map<string, PendingChange>>(new Map())
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const [startDate, setStartDate] = useState(() => startOfDay(new Date()))

  const [editModal, setEditModal] = useState<{
    open: boolean
    date: string
    entry: AvailabilityEntry | null
  }>({ open: false, date: '', entry: null })
  const [editPrice, setEditPrice] = useState('')
  const [editAvailable, setEditAvailable] = useState('')
  const [editBlocked, setEditBlocked] = useState(false)

  const days = Array.from({ length: 30 }, (_, i) => addDays(startDate, i))

  const loadData = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('hotel_id')
      .eq('id', user.id)
      .single()
    if (!profile?.hotel_id) return

    setHotelId(profile.hotel_id)

    const { data: types } = await supabase
      .from('room_types')
      .select('id, name, total_rooms, base_price')
      .eq('hotel_id', profile.hotel_id)
      .order('name')

    if (types && types.length > 0) {
      setRoomTypes(types)
      if (!activeRoomType) {
        setActiveRoomType(types[0].id)
      }
    }
  }, [supabase, activeRoomType])

  const loadAvailability = useCallback(async () => {
    if (!hotelId || !activeRoomType) return
    setLoading(true)

    const dateFrom = format(startDate, 'yyyy-MM-dd')
    const dateTo = format(addDays(startDate, 29), 'yyyy-MM-dd')

    const { data } = await supabase
      .from('room_availability')
      .select('*')
      .eq('hotel_id', hotelId)
      .eq('room_type_id', activeRoomType)
      .gte('date', dateFrom)
      .lte('date', dateTo)
      .order('date')

    setAvailability(data ?? [])
    setLoading(false)
  }, [supabase, hotelId, activeRoomType, startDate])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
  }, [loadData])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAvailability()
  }, [loadAvailability])

  function getEntryForDate(date: Date): AvailabilityEntry | undefined {
    const dateStr = format(date, 'yyyy-MM-dd')
    return availability.find((a) => a.date === dateStr)
  }

  function getPendingForDate(date: Date): PendingChange | undefined {
    const key = `${activeRoomType}:${format(date, 'yyyy-MM-dd')}`
    return pendingChanges.get(key)
  }

  function getEffectiveData(date: Date) {
    const pending = getPendingForDate(date)
    const entry = getEntryForDate(date)
    const roomType = roomTypes.find((r) => r.id === activeRoomType)
    const totalRooms = roomType?.total_rooms ?? 0

    if (pending) {
      return {
        available: pending.available_rooms,
        price: pending.price,
        blocked: pending.is_blocked,
        totalRooms,
      }
    }

    if (entry) {
      return {
        available: entry.available_rooms,
        price: entry.price,
        blocked: entry.is_blocked,
        totalRooms: entry.total_rooms,
      }
    }

    return {
      available: totalRooms,
      price: roomType?.base_price ?? 0,
      blocked: false,
      totalRooms,
    }
  }

  function getCellColor(date: Date) {
    if (isBefore(date, startOfDay(new Date())) && !isToday(date)) {
      return 'bg-gray-50 text-gray-300'
    }
    const data = getEffectiveData(date)
    if (data.blocked) return 'bg-red-50 border-red-200'
    if (data.available === 0) return 'bg-red-50 border-red-200'
    if (data.totalRooms > 0 && data.available / data.totalRooms <= 0.2)
      return 'bg-amber-50 border-amber-200'
    return 'bg-emerald-50/50 border-emerald-200'
  }

  function openEditModal(date: Date) {
    if (isBefore(date, startOfDay(new Date())) && !isToday(date)) return
    const data = getEffectiveData(date)
    const entry = getEntryForDate(date)
    setEditPrice(data.price.toString())
    setEditAvailable(data.available.toString())
    setEditBlocked(data.blocked)
    setEditModal({
      open: true,
      date: format(date, 'yyyy-MM-dd'),
      entry: entry ?? null,
    })
  }

  function applyEdit() {
    const key = `${activeRoomType}:${editModal.date}`
    const newChanges = new Map(pendingChanges)
    newChanges.set(key, {
      room_type_id: activeRoomType,
      date: editModal.date,
      available_rooms: parseInt(editAvailable) || 0,
      price: parseFloat(editPrice) || 0,
      is_blocked: editBlocked,
    })
    setPendingChanges(newChanges)
    setEditModal({ open: false, date: '', entry: null })
  }

  async function saveChanges() {
    if (!hotelId || pendingChanges.size === 0) return
    setSaving(true)

    const upserts = Array.from(pendingChanges.values()).map((change) => {
      const roomType = roomTypes.find((r) => r.id === change.room_type_id)
      return {
        hotel_id: hotelId,
        room_type_id: change.room_type_id,
        date: change.date,
        available_rooms: change.is_blocked ? 0 : change.available_rooms,
        total_rooms: roomType?.total_rooms ?? 0,
        price: change.price,
        is_blocked: change.is_blocked,
      }
    })

    await supabase.from('room_availability').upsert(upserts, {
      onConflict: 'hotel_id,room_type_id,date',
    })

    setPendingChanges(new Map())
    await loadAvailability()
    setSaving(false)
  }

  const activeRoomTypeName =
    roomTypes.find((r) => r.id === activeRoomType)?.name ?? 'Room'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f]">
            Calendar &amp; Pricing
          </h1>
          <p className="mt-1 text-gray-500">
            Manage availability and rates per room type
          </p>
        </div>
        {pendingChanges.size > 0 && (
          <Button onClick={saveChanges} loading={saving}>
            <Save className="mr-2 h-4 w-4" />
            Save {pendingChanges.size} Change{pendingChanges.size > 1 ? 's' : ''}
          </Button>
        )}
      </div>

      {roomTypes.length > 0 ? (
        <Tabs
          defaultValue={roomTypes[0]?.id ?? ''}
          value={activeRoomType}
          onValueChange={setActiveRoomType}
        >
          <TabList>
            {roomTypes.map((rt) => (
              <Tab key={rt.id} value={rt.id}>
                {rt.name}
              </Tab>
            ))}
          </TabList>

          {roomTypes.map((rt) => (
            <TabPanel key={rt.id} value={rt.id}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle>{rt.name} - Next 30 Days</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setStartDate((d) => addDays(d, -7))
                      }
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium text-gray-600">
                      {format(startDate, 'MMM d')} -{' '}
                      {format(addDays(startDate, 29), 'MMM d, yyyy')}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setStartDate((d) => addDays(d, 7))
                      }
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="h-3 w-3 rounded border border-emerald-300 bg-emerald-50" />
                      Available
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-3 w-3 rounded border border-amber-300 bg-amber-50" />
                      Low availability
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-3 w-3 rounded border border-red-300 bg-red-50" />
                      Blocked / Sold out
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-20 text-gray-400">
                      Loading calendar...
                    </div>
                  ) : (
                    <div className="grid grid-cols-7 gap-1">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(
                        (d) => (
                          <div
                            key={d}
                            className="py-2 text-center text-xs font-semibold uppercase text-gray-400"
                          >
                            {d}
                          </div>
                        )
                      )}

                      {(() => {
                        const firstDay = days[0]
                        const dayOfWeek = (firstDay.getDay() + 6) % 7
                        const blanks = Array.from(
                          { length: dayOfWeek },
                          (_, i) => (
                            <div key={`blank-${i}`} className="h-20" />
                          )
                        )

                        const dayCells = days.map((date) => {
                          const data = getEffectiveData(date)
                          const isPast =
                            isBefore(date, startOfDay(new Date())) &&
                            !isToday(date)
                          const hasPending = !!getPendingForDate(date)

                          return (
                            <button
                              key={date.toISOString()}
                              type="button"
                              disabled={isPast}
                              onClick={() => openEditModal(date)}
                              className={`relative flex h-20 flex-col items-start rounded-lg border p-1.5 text-left transition-all ${getCellColor(date)} ${
                                isPast
                                  ? 'cursor-not-allowed opacity-50'
                                  : 'cursor-pointer hover:ring-2 hover:ring-[#38bdf8]/40'
                              } ${isToday(date) ? 'ring-2 ring-[#1e3a5f]' : ''} ${hasPending ? 'ring-2 ring-amber-400' : ''}`}
                            >
                              <span
                                className={`text-xs font-medium ${
                                  isToday(date)
                                    ? 'text-[#1e3a5f]'
                                    : 'text-gray-600'
                                }`}
                              >
                                {format(date, 'd')}
                              </span>
                              <span className="mt-auto text-[10px] font-medium text-gray-500">
                                {data.available}/{data.totalRooms} rooms
                              </span>
                              <span className="text-xs font-semibold text-[#1e3a5f]">
                                {formatCurrency(data.price)}
                              </span>
                              {data.blocked && (
                                <Lock className="absolute right-1 top-1 h-3 w-3 text-red-500" />
                              )}
                            </button>
                          )
                        })

                        return [...blanks, ...dayCells]
                      })()}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabPanel>
          ))}
        </Tabs>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-sm text-gray-400">
            No room types configured. Add room types first.
          </CardContent>
        </Card>
      )}

      <Modal
        open={editModal.open}
        onClose={() => setEditModal({ open: false, date: '', entry: null })}
      >
        <ModalTitle>
          Edit {activeRoomTypeName} — {editModal.date && format(new Date(editModal.date + 'T00:00:00'), 'EEE, MMM d, yyyy')}
        </ModalTitle>
        <ModalBody className="space-y-4">
          <Input
            label="Price per Night"
            type="number"
            step="0.01"
            min="0"
            value={editPrice}
            onChange={(e) => setEditPrice(e.target.value)}
          />
          <Input
            label="Available Rooms"
            type="number"
            min="0"
            max={roomTypes.find((r) => r.id === activeRoomType)?.total_rooms ?? 999}
            value={editAvailable}
            onChange={(e) => setEditAvailable(e.target.value)}
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setEditBlocked(!editBlocked)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${editBlocked ? 'bg-red-500' : 'bg-gray-200'}`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform ${editBlocked ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
            <span className="flex items-center gap-1.5 text-sm text-gray-700">
              {editBlocked ? (
                <>
                  <Lock className="h-4 w-4 text-red-500" /> Blocked
                </>
              ) : (
                <>
                  <Unlock className="h-4 w-4 text-emerald-500" /> Available
                </>
              )}
            </span>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() =>
              setEditModal({ open: false, date: '', entry: null })
            }
          >
            Cancel
          </Button>
          <Button onClick={applyEdit}>Apply</Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
