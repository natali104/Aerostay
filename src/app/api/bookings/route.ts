import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resend, FROM_EMAIL } from '@/lib/resend'
import { newBookingRequestEmail } from '@/lib/email-templates'
import { formatCurrency } from '@/lib/utils'

interface BookingRoom {
  room_type_id: string
  quantity: number
  price_per_night: number
}

interface BookingRequestBody {
  hotel_id: string
  layover_id?: string
  airline_id?: string
  guest_count: number
  check_in: string
  check_out: string
  rooms: BookingRoom[]
  contact_name?: string
  contact_email?: string
  contact_phone?: string
  notes?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: BookingRequestBody = await request.json()

    const {
      hotel_id,
      layover_id,
      airline_id,
      guest_count,
      check_in,
      check_out,
      rooms,
      contact_name,
      contact_email,
      contact_phone,
      notes,
    } = body

    if (!hotel_id || !check_in || !check_out || !rooms || rooms.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: hotel_id, check_in, check_out, rooms' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const checkInDate = new Date(check_in)
    const checkOutDate = new Date(check_out)
    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (nights <= 0) {
      return NextResponse.json(
        { error: 'check_out must be after check_in' },
        { status: 400 }
      )
    }

    const totalAmount = rooms.reduce(
      (sum, room) => sum + room.quantity * room.price_per_night * nights,
      0
    )

    const { data: booking, error: bookingError } = await supabase
      .from('booking_requests')
      .insert({
        hotel_id,
        layover_id: layover_id ?? null,
        airline_id: airline_id ?? null,
        guest_count,
        check_in,
        check_out,
        total_amount: totalAmount,
        contact_name: contact_name ?? null,
        contact_email: contact_email ?? null,
        contact_phone: contact_phone ?? null,
        notes: notes ?? null,
        status: 'pending',
      })
      .select('*')
      .single()

    if (bookingError || !booking) {
      console.error('Failed to create booking:', bookingError)
      return NextResponse.json(
        { error: 'Failed to create booking request' },
        { status: 500 }
      )
    }

    const bookingRoomsData = rooms.map((room) => ({
      booking_request_id: booking.id,
      room_type_id: room.room_type_id,
      quantity: room.quantity,
      price_per_night: room.price_per_night,
      check_in,
      check_out,
    }))

    const { error: roomsError } = await supabase
      .from('booking_rooms')
      .insert(bookingRoomsData)

    if (roomsError) {
      console.error('Failed to create booking rooms:', roomsError)
    }

    const { data: hotel } = await supabase
      .from('hotels')
      .select('name, contact_email')
      .eq('id', hotel_id)
      .single()

    let airlineName = 'Unknown Airline'
    let flightNumber = 'N/A'

    if (layover_id) {
      const { data: layover } = await supabase
        .from('layovers')
        .select('flight_number')
        .eq('id', layover_id)
        .single()
      if (layover) flightNumber = layover.flight_number ?? 'N/A'
    }

    if (airline_id) {
      const { data: airline } = await supabase
        .from('airlines')
        .select('name')
        .eq('id', airline_id)
        .single()
      if (airline) airlineName = airline.name
    }

    if (hotel?.contact_email) {
      const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://aerostay.app'}/dashboard/bookings/${booking.id}`

      const emailData = newBookingRequestEmail({
        hotelName: hotel.name,
        airlineName,
        flightNumber,
        guestCount: guest_count,
        checkIn: check_in,
        checkOut: check_out,
        totalAmount: formatCurrency(totalAmount),
        dashboardUrl,
      })

      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: hotel.contact_email,
          subject: emailData.subject,
          html: emailData.html,
        })
      } catch (emailErr) {
        console.error('Failed to send booking notification email:', emailErr)
      }
    }

    if (layover_id) {
      await supabase
        .from('layovers')
        .update({ status: 'booking_in_progress' })
        .eq('id', layover_id)
    }

    return NextResponse.json({ booking, total_amount: totalAmount }, { status: 201 })
  } catch (error) {
    console.error('POST /api/bookings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
