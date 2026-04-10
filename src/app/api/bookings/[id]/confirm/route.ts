import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getResend, FROM_EMAIL } from '@/lib/resend'
import { bookingConfirmedEmail } from '@/lib/email-templates'
import { formatCurrency } from '@/lib/utils'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: booking, error: fetchError } = await supabase
      .from('booking_requests')
      .select(`
        *,
        hotel:hotels(id, name, contact_email, commission_rate),
        airline:airlines(id, name),
        layover:layovers(id, flight_number)
      `)
      .eq('id', id)
      .single()

    if (fetchError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.status !== 'pending' && booking.status !== 'negotiating') {
      return NextResponse.json(
        { error: `Cannot confirm booking with status '${booking.status}'` },
        { status: 400 }
      )
    }

    const { data: updatedBooking, error: updateError } = await supabase
      .from('booking_requests')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single()

    if (updateError || !updatedBooking) {
      return NextResponse.json({ error: 'Failed to confirm booking' }, { status: 500 })
    }

    const hotel = booking.hotel as { id: string; name: string; contact_email: string | null; commission_rate: number }
    const commissionRate = Number(hotel.commission_rate) || 8
    const totalAmount = Number(booking.total_amount) || 0
    const commissionAmount = Math.round(totalAmount * (commissionRate / 100) * 100) / 100

    const { error: commissionError } = await supabase
      .from('commissions')
      .insert({
        hotel_id: hotel.id,
        booking_request_id: id,
        amount: commissionAmount,
        rate: commissionRate,
        status: 'pending',
      })

    if (commissionError) {
      console.error('Failed to create commission:', commissionError)
    }

    if (booking.layover_id) {
      await supabase
        .from('layovers')
        .update({ status: 'booked' })
        .eq('id', booking.layover_id)
    }

    const airline = booking.airline as { id: string; name: string } | null
    const layover = booking.layover as { id: string; flight_number: string | null } | null

    if (booking.contact_email) {
      const emailData = bookingConfirmedEmail({
        airlineName: airline?.name ?? 'Airline',
        hotelName: hotel.name,
        flightNumber: layover?.flight_number ?? 'N/A',
        guestCount: booking.guest_count,
        checkIn: booking.check_in,
        checkOut: booking.check_out,
        totalAmount: formatCurrency(totalAmount),
        contactName: booking.contact_name ?? 'Operations Team',
      })

      try {
        await getResend().emails.send({
          from: FROM_EMAIL,
          to: booking.contact_email,
          subject: emailData.subject,
          html: emailData.html,
        })
      } catch (emailErr) {
        console.error('Failed to send confirmation email:', emailErr)
      }
    }

    return NextResponse.json({
      booking: updatedBooking,
      commission: {
        amount: commissionAmount,
        rate: commissionRate,
      },
    })
  } catch (error) {
    console.error('POST /api/bookings/[id]/confirm error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
