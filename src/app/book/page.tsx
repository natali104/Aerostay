'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Plane,
  Hotel,
  Star,
  Users,
  CalendarDays,
  Clock,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertTriangle,
  Minus,
  Plus,
  MessageSquare,
  BedDouble,
  MapPin,
  ShieldCheck,
  Loader2,
} from 'lucide-react'

/* ─── Types ─────────────────────────────────────────────── */

interface Airport {
  id: string
  iata_code: string
  name: string
  city: string
  country: string
}

interface Layover {
  id: string
  flight_number: string
  origin_airport: string
  destination_airport: string
  original_departure: string
  estimated_departure: string
  passenger_count: number
  reason: string
  status: string
  airport: Airport | null
}

interface Airline {
  id: string
  name: string
  iata_code: string
  logo_url?: string
}

interface TokenData {
  valid: boolean
  email: string
  layover: Layover
  airline: Airline
}

interface RoomTypeAvailability {
  room_type: {
    id: string
    name: string
    description: string
    max_occupancy: number
    total_rooms: number
    amenities: string[] | null
  }
  available_count: number
  is_available: boolean
  avg_price_per_night: number
  total_price: number
  nights: number
  partner_discount_applied: boolean
  discount_pct: number
}

interface HotelAvailability {
  hotel: {
    id: string
    name: string
    star_rating: number
    amenities: string[] | null
    image_url: string | null
    address: string
    city: string
  }
  check_in: string
  check_out: string
  nights: number
  room_types: RoomTypeAvailability[]
}

interface RoomSelection {
  room_type_id: string
  room_type_name: string
  quantity: number
  price_per_night: number
  max_occupancy: number
}

interface BookingResult {
  booking: { id: string }
  total_amount: number
}

/* ─── Main Page ──────────────────────────────────────────── */

export default function BookPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#1e3a5f]" />
        </div>
      }
    >
      <BookingEngine />
    </Suspense>
  )
}

function BookingEngine() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [step, setStep] = useState(1)
  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [tokenError, setTokenError] = useState<string | null>(null)
  const [validating, setValidating] = useState(true)

  // Dates
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')

  // Hotels
  const [nearbyHotels, setNearbyHotels] = useState<{ id: string; name: string }[]>([])
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null)
  const [hotelAvailability, setHotelAvailability] = useState<HotelAvailability | null>(null)
  const [loadingHotels, setLoadingHotels] = useState(false)
  const [loadingAvailability, setLoadingAvailability] = useState(false)

  // Room selections
  const [roomSelections, setRoomSelections] = useState<RoomSelection[]>([])
  const [guestCount, setGuestCount] = useState(1)

  // Contact & submit
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [negotiateMode, setNegotiateMode] = useState(false)
  const [negotiateMessage, setNegotiateMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  /* ─── Token Validation ───────────────────────────────── */

  useEffect(() => {
    if (!token) {
      setTokenError('No booking token provided. Please use the link from your email.')
      setValidating(false)
      return
    }

    async function validateToken() {
      try {
        const res = await fetch(`/api/auth/token?token=${encodeURIComponent(token!)}`)
        const data = await res.json()

        if (!res.ok || !data.valid) {
          setTokenError(data.error || 'Invalid or expired token.')
          setValidating(false)
          return
        }

        setTokenData(data)

        const today = new Date().toISOString().split('T')[0]
        const estDep = data.layover?.estimated_departure
          ? new Date(data.layover.estimated_departure).toISOString().split('T')[0]
          : new Date(Date.now() + 86400000).toISOString().split('T')[0]

        setCheckIn(today)
        setCheckOut(estDep > today ? estDep : new Date(Date.now() + 86400000).toISOString().split('T')[0])
        setGuestCount(data.layover?.passenger_count || 1)

        if (data.email) setContactEmail(data.email)
      } catch {
        setTokenError('Failed to validate token. Please try again.')
      }
      setValidating(false)
    }

    validateToken()
  }, [token])

  /* ─── Fetch Nearby Hotels ────────────────────────────── */

  const fetchHotels = useCallback(async () => {
    if (!tokenData?.layover?.airport) return
    setLoadingHotels(true)

    try {
      const airportId = tokenData.layover.airport.id
      const res = await fetch(`/api/hotels?airport_id=${airportId}`)
      if (res.ok) {
        const data = await res.json()
        setNearbyHotels(data.hotels ?? data ?? [])
      }
    } catch {
      // Silently fail — user can still see availability
    }
    setLoadingHotels(false)
  }, [tokenData])

  useEffect(() => {
    if (step === 2 && tokenData) {
      fetchHotels()
    }
  }, [step, tokenData, fetchHotels])

  /* ─── Fetch Availability ─────────────────────────────── */

  async function fetchAvailability(hotelId: string) {
    if (!checkIn || !checkOut) return
    setLoadingAvailability(true)
    setSelectedHotelId(hotelId)

    try {
      const res = await fetch(
        `/api/hotels/${hotelId}/availability?check_in=${checkIn}&check_out=${checkOut}`
      )
      if (res.ok) {
        const data: HotelAvailability = await res.json()
        setHotelAvailability(data)
        setRoomSelections([])
      }
    } catch {
      setHotelAvailability(null)
    }
    setLoadingAvailability(false)
  }

  /* ─── Room Selection Helpers ─────────────────────────── */

  function updateRoomQuantity(roomTypeId: string, delta: number) {
    setRoomSelections((prev) => {
      const existing = prev.find((r) => r.room_type_id === roomTypeId)
      if (existing) {
        const newQty = Math.max(0, existing.quantity + delta)
        if (newQty === 0) return prev.filter((r) => r.room_type_id !== roomTypeId)
        return prev.map((r) => (r.room_type_id === roomTypeId ? { ...r, quantity: newQty } : r))
      }
      if (delta > 0) {
        const rt = hotelAvailability?.room_types.find((r) => r.room_type.id === roomTypeId)
        if (!rt) return prev
        return [
          ...prev,
          {
            room_type_id: roomTypeId,
            room_type_name: rt.room_type.name,
            quantity: 1,
            price_per_night: rt.avg_price_per_night,
            max_occupancy: rt.room_type.max_occupancy,
          },
        ]
      }
      return prev
    })
  }

  const totalRooms = roomSelections.reduce((s, r) => s + r.quantity, 0)
  const nights = hotelAvailability?.nights ?? 1
  const totalPrice = roomSelections.reduce(
    (s, r) => s + r.quantity * r.price_per_night * nights,
    0
  )

  /* ─── Submit Booking ─────────────────────────────────── */

  async function handleSubmit(type: 'confirm' | 'negotiate') {
    if (!selectedHotelId || roomSelections.length === 0) return
    setSubmitting(true)
    setSubmitError(null)

    try {
      const body = {
        hotel_id: selectedHotelId,
        layover_id: tokenData?.layover?.id,
        airline_id: tokenData?.airline?.id,
        guest_count: guestCount,
        check_in: checkIn,
        check_out: checkOut,
        rooms: roomSelections.map((r) => ({
          room_type_id: r.room_type_id,
          quantity: r.quantity,
          price_per_night: r.price_per_night,
        })),
        contact_name: contactName,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        notes:
          type === 'negotiate'
            ? `[PRICE NEGOTIATION] ${negotiateMessage}\n\n${notes}`.trim()
            : notes || undefined,
      }

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        throw new Error(errData?.error || 'Failed to submit booking')
      }

      const result: BookingResult = await res.json()
      setBookingResult(result)
      setStep(5)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong')
    }

    setSubmitting(false)
  }

  /* ─── Reset for New Booking ──────────────────────────── */

  function resetBooking() {
    setStep(1)
    setSelectedHotelId(null)
    setHotelAvailability(null)
    setRoomSelections([])
    setNotes('')
    setNegotiateMode(false)
    setNegotiateMessage('')
    setBookingResult(null)
    setSubmitError(null)
  }

  /* ─── Render States ──────────────────────────────────── */

  if (validating) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-[#1e3a5f]" />
        <p className="mt-4 text-sm text-gray-500">Validating your booking link...</p>
      </div>
    )
  }

  if (tokenError) {
    return (
      <Card className="mx-auto max-w-md">
        <CardContent className="flex flex-col items-center py-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-gray-900">Unable to Access Booking</h2>
          <p className="mt-2 text-center text-sm text-gray-500">{tokenError}</p>
          <p className="mt-4 text-center text-xs text-gray-400">
            If you believe this is an error, please contact your airline operations team
            or AeroStay support.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!tokenData) return null

  const { layover, airline } = tokenData

  /* ─── Success State ──────────────────────────────────── */

  if (step === 5 && bookingResult) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardContent className="flex flex-col items-center py-12">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
            <Check className="h-10 w-10 text-emerald-500" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-[#1e3a5f]">Booking Request Submitted!</h2>
          <p className="mt-2 text-center text-gray-500">
            The hotel has been notified and will confirm shortly.
          </p>

          <div className="mt-6 w-full rounded-lg bg-gray-50 p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Booking Reference</span>
                <span className="font-mono font-medium text-[#1e3a5f]">
                  {bookingResult.booking.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Amount</span>
                <span className="font-semibold text-[#1e3a5f]">
                  {formatCurrency(bookingResult.total_amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Flight</span>
                <span className="font-medium">{layover.flight_number}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-lg bg-sky-50 px-4 py-3 text-sm text-sky-700">
            <ShieldCheck className="h-5 w-5 shrink-0" />
            <span>You&apos;ll receive a confirmation email once the hotel responds.</span>
          </div>

          <Button onClick={resetBooking} variant="outline" className="mt-6">
            Make Another Booking
          </Button>
        </CardContent>
      </Card>
    )
  }

  /* ─── Step Indicator ─────────────────────────────────── */

  const steps = [
    { num: 1, label: 'Layover Info' },
    { num: 2, label: 'Select Hotel' },
    { num: 3, label: 'Choose Rooms' },
    { num: 4, label: 'Confirm' },
  ]

  return (
    <div className="space-y-6">
      {/* Progress steps */}
      <div className="flex items-center justify-between">
        {steps.map((s, i) => (
          <div key={s.num} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors sm:h-10 sm:w-10 ${
                  step >= s.num
                    ? 'bg-[#1e3a5f] text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step > s.num ? <Check className="h-4 w-4" /> : s.num}
              </div>
              <span className="mt-1 hidden text-xs font-medium text-gray-500 sm:block">
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`mx-2 h-0.5 flex-1 transition-colors ${
                  step > s.num ? 'bg-[#1e3a5f]' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* ─── Step 1: Layover Info ─────────────────────── */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plane className="h-5 w-5" />
              Layover Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Airline header */}
            <div className="flex items-center gap-3 rounded-lg bg-[#1e3a5f]/5 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#1e3a5f] text-lg font-bold text-white">
                {airline.iata_code}
              </div>
              <div>
                <p className="font-semibold text-[#1e3a5f]">{airline.name}</p>
                <p className="text-sm text-gray-500">
                  Flight {layover.flight_number}
                </p>
              </div>
            </div>

            {/* Flight details grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoRow
                icon={<MapPin className="h-4 w-4" />}
                label="Airport"
                value={
                  layover.airport
                    ? `${layover.airport.iata_code} — ${layover.airport.name}, ${layover.airport.city}`
                    : layover.destination_airport
                }
              />
              <InfoRow
                icon={<Users className="h-4 w-4" />}
                label="Passengers"
                value={layover.passenger_count?.toString() || '—'}
              />
              <InfoRow
                icon={<Clock className="h-4 w-4" />}
                label="Reason"
                value={layover.reason?.replace(/_/g, ' ') || '—'}
              />
              <InfoRow
                icon={<CalendarDays className="h-4 w-4" />}
                label="Est. Departure"
                value={
                  layover.estimated_departure
                    ? formatDate(layover.estimated_departure)
                    : '—'
                }
              />
            </div>

            {/* Dates */}
            <div className="rounded-lg border border-[#38bdf8]/20 bg-sky-50/50 p-4">
              <p className="mb-3 text-sm font-medium text-[#1e3a5f]">Accommodation Dates</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Check-in"
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
                <Input
                  label="Check-out"
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  min={checkIn}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button
              onClick={() => setStep(2)}
              size="lg"
              disabled={!checkIn || !checkOut || checkOut <= checkIn}
            >
              Find Hotels
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* ─── Step 2: Hotel Selection ──────────────────── */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Hotel className="h-5 w-5" />
                Available Hotels
              </CardTitle>
              <Badge variant="info">
                {checkIn} → {checkOut}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {loadingHotels ? (
              <div className="flex flex-col items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#1e3a5f]" />
                <p className="mt-3 text-sm text-gray-500">Searching for hotels near the airport...</p>
              </div>
            ) : nearbyHotels.length === 0 ? (
              <div className="py-12 text-center">
                <Hotel className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-3 text-sm text-gray-500">
                  No hotels found near this airport. Please contact support.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {nearbyHotels.map((h: Record<string, unknown>) => {
                  const hotelId = h.id as string
                  const isSelected = selectedHotelId === hotelId
                  const isLoadingThis = isSelected && loadingAvailability

                  return (
                    <button
                      key={hotelId}
                      onClick={() => fetchAvailability(hotelId)}
                      disabled={loadingAvailability}
                      className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${
                        isSelected
                          ? 'border-[#38bdf8] bg-sky-50/50 shadow-sm'
                          : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50/50'
                      }`}
                    >
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-[#1e3a5f]/5">
                        {(h.image_url as string) ? (
                          <Image
                            src={h.image_url as string}
                            alt={h.name as string}
                            width={56}
                            height={56}
                            className="h-14 w-14 rounded-lg object-cover"
                          />
                        ) : (
                          <Hotel className="h-6 w-6 text-[#1e3a5f]" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[#1e3a5f]">{h.name as string}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          {(h.star_rating as number) > 0 && (
                            <span className="flex items-center gap-0.5">
                              {Array.from({ length: h.star_rating as number }).map((_, i) => (
                                <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                              ))}
                            </span>
                          )}
                          {(h.city as string) && (
                            <span className="flex items-center gap-0.5">
                              <MapPin className="h-3 w-3" />
                              {h.city as string}
                            </span>
                          )}
                          {(h.distance_km as number) != null && (
                            <Badge variant="info">{h.distance_km as number} km</Badge>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0">
                        {isLoadingThis ? (
                          <Loader2 className="h-5 w-5 animate-spin text-[#38bdf8]" />
                        ) : isSelected ? (
                          <Check className="h-5 w-5 text-[#38bdf8]" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-300" />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Availability details */}
            {hotelAvailability && (
              <div className="mt-6 space-y-3 border-t pt-6">
                <h3 className="font-semibold text-[#1e3a5f]">
                  {hotelAvailability.hotel.name} — Room Types
                </h3>
                {hotelAvailability.room_types.length === 0 ? (
                  <p className="py-6 text-center text-sm text-gray-400">
                    No rooms available for selected dates
                  </p>
                ) : (
                  <div className="space-y-3">
                    {hotelAvailability.room_types.map((rt) => (
                      <div
                        key={rt.room_type.id}
                        className={`rounded-lg border p-4 transition-colors ${
                          rt.is_available
                            ? 'border-gray-200'
                            : 'border-gray-100 bg-gray-50 opacity-60'
                        }`}
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <BedDouble className="h-4 w-4 text-[#1e3a5f]" />
                              <span className="font-medium text-[#1e3a5f]">
                                {rt.room_type.name}
                              </span>
                              {rt.partner_discount_applied && (
                                <Badge variant="success">-{rt.discount_pct}%</Badge>
                              )}
                            </div>
                            {rt.room_type.description && (
                              <p className="mt-1 text-xs text-gray-500">
                                {rt.room_type.description}
                              </p>
                            )}
                            <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                              <span>Max {rt.room_type.max_occupancy} guests</span>
                              <span>{rt.available_count} available</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-lg font-bold text-[#1e3a5f]">
                                {formatCurrency(rt.avg_price_per_night)}
                              </p>
                              <p className="text-xs text-gray-400">per night</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="ghost" onClick={() => setStep(1)}>
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={() => setStep(3)}
              size="lg"
              disabled={!hotelAvailability || hotelAvailability.room_types.filter((r) => r.is_available).length === 0}
            >
              Select Rooms
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* ─── Step 3: Room Selection ───────────────────── */}
      {step === 3 && hotelAvailability && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BedDouble className="h-5 w-5" />
              Select Rooms — {hotelAvailability.hotel.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Guest count */}
            <div className="rounded-lg border border-[#38bdf8]/20 bg-sky-50/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#1e3a5f]">Total Guests</p>
                  <p className="text-xs text-gray-500">
                    How many guests need accommodation?
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setGuestCount((g) => Math.max(1, g - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center text-lg font-bold text-[#1e3a5f]">
                    {guestCount}
                  </span>
                  <button
                    onClick={() => setGuestCount((g) => g + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Room types */}
            <div className="space-y-3">
              {hotelAvailability.room_types
                .filter((rt) => rt.is_available)
                .map((rt) => {
                  const selected = roomSelections.find(
                    (r) => r.room_type_id === rt.room_type.id
                  )
                  const qty = selected?.quantity ?? 0

                  return (
                    <div
                      key={rt.room_type.id}
                      className={`rounded-xl border-2 p-4 transition-colors ${
                        qty > 0
                          ? 'border-[#38bdf8] bg-sky-50/30'
                          : 'border-gray-100'
                      }`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#1e3a5f]">
                              {rt.room_type.name}
                            </span>
                            {rt.partner_discount_applied && (
                              <Badge variant="success">-{rt.discount_pct}%</Badge>
                            )}
                          </div>
                          <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                            <span>Max {rt.room_type.max_occupancy} guests</span>
                            <span>{rt.available_count} rooms left</span>
                            <span>{nights} night{nights !== 1 ? 's' : ''}</span>
                          </div>
                          {rt.room_type.amenities && rt.room_type.amenities.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {(rt.room_type.amenities as string[]).slice(0, 4).map((a) => (
                                <Badge key={a} variant="default" className="text-[10px]">
                                  {a}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-lg font-bold text-[#1e3a5f]">
                              {formatCurrency(rt.avg_price_per_night)}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatCurrency(rt.avg_price_per_night * nights)} total
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateRoomQuantity(rt.room_type.id, -1)}
                              disabled={qty === 0}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-30"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center text-lg font-bold text-[#1e3a5f]">
                              {qty}
                            </span>
                            <button
                              onClick={() => updateRoomQuantity(rt.room_type.id, 1)}
                              disabled={qty >= rt.available_count}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-30"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>

            {/* Selection summary */}
            {totalRooms > 0 && (
              <div className="rounded-lg bg-[#1e3a5f] p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-sky-200">
                      {totalRooms} room{totalRooms !== 1 ? 's' : ''} &times; {nights} night
                      {nights !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-sky-300/70">
                      {roomSelections.map((r) => `${r.quantity}x ${r.room_type_name}`).join(', ')}
                    </p>
                  </div>
                  <p className="text-2xl font-bold">{formatCurrency(totalPrice)}</p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="ghost" onClick={() => setStep(2)}>
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={() => setStep(4)}
              size="lg"
              disabled={totalRooms === 0}
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* ─── Step 4: Contact & Confirm ────────────────── */}
      {step === 4 && hotelAvailability && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Contact Name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Your full name"
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="you@airline.com"
                />
              </div>
              <Input
                label="Phone Number (optional)"
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+1 234 567 8900"
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Special Requests / Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors placeholder:text-gray-400 focus:border-[#38bdf8] focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/30"
                  placeholder="Any special requirements for the guests..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Order summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="space-y-3 text-sm">
                  <SummaryRow label="Hotel" value={hotelAvailability.hotel.name} />
                  <SummaryRow label="Check-in" value={formatDate(checkIn)} />
                  <SummaryRow label="Check-out" value={formatDate(checkOut)} />
                  <SummaryRow label="Nights" value={nights.toString()} />
                  <SummaryRow label="Guests" value={guestCount.toString()} />
                  <SummaryRow label="Flight" value={layover.flight_number} />

                  <div className="border-t pt-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Rooms
                    </p>
                    {roomSelections.map((r) => (
                      <div key={r.room_type_id} className="flex justify-between py-0.5">
                        <span className="text-gray-600">
                          {r.quantity}x {r.room_type_name}
                        </span>
                        <span className="font-medium">
                          {formatCurrency(r.quantity * r.price_per_night * nights)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-base font-bold text-[#1e3a5f]">Total</span>
                      <span className="text-xl font-bold text-[#1e3a5f]">
                        {formatCurrency(totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {submitError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {submitError}
                </div>
              )}

              {/* Negotiate mode */}
              {negotiateMode && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="mb-2 text-sm font-medium text-amber-800">
                    Request a different price
                  </p>
                  <textarea
                    value={negotiateMessage}
                    onChange={(e) => setNegotiateMessage(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                    placeholder="Enter your desired price and any justification (e.g., 'We can offer €80/night for 15 rooms as a bulk booking')"
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex-col gap-3 sm:flex-row sm:justify-between">
              <Button variant="ghost" onClick={() => setStep(3)}>
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                {!negotiateMode ? (
                  <Button
                    variant="outline"
                    onClick={() => setNegotiateMode(true)}
                    className="w-full sm:w-auto"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Request Lower Price
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={() => handleSubmit('negotiate')}
                    loading={submitting}
                    disabled={!negotiateMessage.trim()}
                    className="w-full sm:w-auto"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Submit Negotiation
                  </Button>
                )}
                <Button
                  onClick={() => handleSubmit('confirm')}
                  loading={submitting}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <Check className="h-4 w-4" />
                  Confirm Booking — {formatCurrency(totalPrice)}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}

/* ─── Helper Components ──────────────────────────────── */

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-gray-100 p-3">
      <div className="mt-0.5 text-[#38bdf8]">{icon}</div>
      <div>
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-gray-800">{value}</p>
      </div>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  )
}
