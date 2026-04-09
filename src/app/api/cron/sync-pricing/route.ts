import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function simulateBookingComPrice(basePrice: number): number {
  const variation = (Math.random() - 0.5) * 0.1 // ±5%
  return Math.round((basePrice * (1 + variation)) * 100) / 100
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // In production, use service role client to bypass RLS for cron jobs
    const supabase = await createClient()

    const { data: hotels, error: hotelsError } = await supabase
      .from('hotels')
      .select('id, name, pricing_method, partner_discount_pct')
      .eq('pricing_method', 'booking_com')
      .eq('is_active', true)

    if (hotelsError || !hotels || hotels.length === 0) {
      return NextResponse.json({ message: 'No hotels using booking_com pricing', updated: 0 })
    }

    const today = new Date()
    const dates: string[] = []
    for (let i = 0; i < 3; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() + i)
      dates.push(d.toISOString().split('T')[0])
    }

    let totalUpdated = 0

    for (const hotel of hotels) {
      const { data: roomTypes } = await supabase
        .from('room_types')
        .select('id, name')
        .eq('hotel_id', hotel.id)

      if (!roomTypes || roomTypes.length === 0) continue

      for (const roomType of roomTypes) {
        for (const date of dates) {
          const { data: existing } = await supabase
            .from('room_availability')
            .select('id, price_per_night, booking_com_price')
            .eq('room_type_id', roomType.id)
            .eq('date', date)
            .maybeSingle()

          const currentPrice = existing?.booking_com_price
            ? Number(existing.booking_com_price)
            : existing?.price_per_night
              ? Number(existing.price_per_night)
              : 80 + Math.floor(Math.random() * 120) // fallback base price

          const newBookingComPrice = simulateBookingComPrice(currentPrice)
          const discountMultiplier = 1 - Number(hotel.partner_discount_pct) / 100
          const finalPrice = Math.round(newBookingComPrice * discountMultiplier * 100) / 100

          if (existing) {
            const { error } = await supabase
              .from('room_availability')
              .update({
                booking_com_price: newBookingComPrice,
                price_per_night: finalPrice,
                updated_at: new Date().toISOString(),
              })
              .eq('id', existing.id)

            if (!error) totalUpdated++
          } else {
            const { error } = await supabase
              .from('room_availability')
              .insert({
                room_type_id: roomType.id,
                date,
                booking_com_price: newBookingComPrice,
                price_per_night: finalPrice,
                available_count: roomType.name.toLowerCase().includes('suite') ? 2 : 5,
              })

            if (!error) totalUpdated++
          }
        }
      }
    }

    return NextResponse.json({
      message: `Pricing sync complete`,
      hotels_processed: hotels.length,
      dates_synced: dates,
      updated: totalUpdated,
    })
  } catch (error) {
    console.error('Cron sync-pricing error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
