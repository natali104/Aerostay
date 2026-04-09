import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hotelId } = await params
    const checkIn = request.nextUrl.searchParams.get('check_in')
    const checkOut = request.nextUrl.searchParams.get('check_out')

    if (!checkIn || !checkOut) {
      return NextResponse.json(
        { error: 'Missing required query params: check_in, check_out' },
        { status: 400 }
      )
    }

    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)

    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        { error: 'check_out must be after check_in' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: hotel, error: hotelError } = await supabase
      .from('hotels')
      .select('id, name, partner_discount_pct, pricing_method, star_rating, amenities, image_url, address, city')
      .eq('id', hotelId)
      .eq('is_active', true)
      .single()

    if (hotelError || !hotel) {
      return NextResponse.json({ error: 'Hotel not found' }, { status: 404 })
    }

    const { data: roomTypes, error: roomTypesError } = await supabase
      .from('room_types')
      .select('id, name, description, max_occupancy, total_rooms, amenities')
      .eq('hotel_id', hotelId)

    if (roomTypesError || !roomTypes) {
      return NextResponse.json({ error: 'Failed to fetch room types' }, { status: 500 })
    }

    const dates: string[] = []
    const current = new Date(checkIn)
    while (current < checkOutDate) {
      dates.push(current.toISOString().split('T')[0])
      current.setDate(current.getDate() + 1)
    }

    const roomTypeIds = roomTypes.map((rt) => rt.id)

    const { data: availability, error: availError } = await supabase
      .from('room_availability')
      .select('room_type_id, date, available_count, price_per_night, booking_com_price, is_blocked')
      .in('room_type_id', roomTypeIds)
      .in('date', dates)

    if (availError) {
      console.error('Failed to fetch availability:', availError)
    }

    const availMap = new Map<string, typeof availability>()
    for (const a of availability ?? []) {
      const key = a.room_type_id
      if (!availMap.has(key)) availMap.set(key, [])
      availMap.get(key)!.push(a)
    }

    const discountPct = Number(hotel.partner_discount_pct) || 0
    const discountMultiplier = 1 - discountPct / 100

    const result = roomTypes.map((rt) => {
      const rtAvailability = availMap.get(rt.id) ?? []

      let minAvailable = rt.total_rooms
      let totalPrice = 0
      let hasAllDates = true

      const dailyPrices: Array<{ date: string; price: number; available: number }> = []

      for (const date of dates) {
        const dayAvail = rtAvailability.find((a) => a.date === date)

        if (!dayAvail || dayAvail.is_blocked) {
          hasAllDates = false
          dailyPrices.push({ date, price: 0, available: 0 })
          minAvailable = 0
          continue
        }

        const rawPrice = Number(dayAvail.price_per_night) || 0
        const finalPrice = discountPct > 0
          ? Math.round(rawPrice * discountMultiplier * 100) / 100
          : rawPrice

        dailyPrices.push({
          date,
          price: finalPrice,
          available: dayAvail.available_count,
        })

        totalPrice += finalPrice
        minAvailable = Math.min(minAvailable, dayAvail.available_count)
      }

      const avgPrice = dates.length > 0 ? Math.round((totalPrice / dates.length) * 100) / 100 : 0

      return {
        room_type: {
          id: rt.id,
          name: rt.name,
          description: rt.description,
          max_occupancy: rt.max_occupancy,
          total_rooms: rt.total_rooms,
          amenities: rt.amenities,
        },
        available_count: Math.max(minAvailable, 0),
        is_available: hasAllDates && minAvailable > 0,
        avg_price_per_night: avgPrice,
        total_price: Math.round(totalPrice * 100) / 100,
        nights: dates.length,
        daily_prices: dailyPrices,
        partner_discount_applied: discountPct > 0,
        discount_pct: discountPct,
      }
    })

    return NextResponse.json({
      hotel: {
        id: hotel.id,
        name: hotel.name,
        star_rating: hotel.star_rating,
        amenities: hotel.amenities,
        image_url: hotel.image_url,
        address: hotel.address,
        city: hotel.city,
        pricing_method: hotel.pricing_method,
      },
      check_in: checkIn,
      check_out: checkOut,
      nights: dates.length,
      room_types: result,
    })
  } catch (error) {
    console.error('GET /api/hotels/[id]/availability error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
