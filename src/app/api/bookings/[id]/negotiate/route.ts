import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resend, FROM_EMAIL } from '@/lib/resend'
import { negotiationEmail } from '@/lib/email-templates'
import { formatCurrency } from '@/lib/utils'

interface NegotiationBody {
  proposed_by: 'airline' | 'hotel'
  proposed_price?: number
  message?: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body: NegotiationBody = await request.json()
    const { proposed_by, proposed_price, message } = body

    if (!proposed_by || !['airline', 'hotel'].includes(proposed_by)) {
      return NextResponse.json(
        { error: "proposed_by must be 'airline' or 'hotel'" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: booking, error: fetchError } = await supabase
      .from('booking_requests')
      .select(`
        *,
        hotel:hotels(id, name, contact_email),
        airline:airlines(id, name),
        layover:layovers(id, flight_number)
      `)
      .eq('id', id)
      .single()

    if (fetchError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (['confirmed', 'rejected', 'cancelled', 'completed'].includes(booking.status)) {
      return NextResponse.json(
        { error: `Cannot negotiate on booking with status '${booking.status}'` },
        { status: 400 }
      )
    }

    const { data: negotiation, error: negError } = await supabase
      .from('negotiations')
      .insert({
        booking_request_id: id,
        proposed_by,
        proposed_price: proposed_price ?? null,
        message: message ?? null,
      })
      .select('*')
      .single()

    if (negError || !negotiation) {
      console.error('Failed to create negotiation:', negError)
      return NextResponse.json(
        { error: 'Failed to create negotiation' },
        { status: 500 }
      )
    }

    if (booking.status !== 'negotiating') {
      await supabase
        .from('booking_requests')
        .update({ status: 'negotiating' })
        .eq('id', id)
    }

    if (proposed_price != null) {
      await supabase
        .from('booking_requests')
        .update({ total_amount: proposed_price })
        .eq('id', id)
    }

    const hotel = booking.hotel as { id: string; name: string; contact_email: string | null }
    const airline = booking.airline as { id: string; name: string } | null
    const layover = booking.layover as { id: string; flight_number: string | null } | null

    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://aerostay.app'}/dashboard/bookings/${id}`

    if (proposed_by === 'airline' && hotel.contact_email) {
      const emailData = negotiationEmail({
        recipientName: hotel.name,
        proposedBy: 'airline',
        proposedPrice: proposed_price != null ? formatCurrency(proposed_price) : 'N/A',
        message: message ?? '',
        hotelName: hotel.name,
        flightNumber: layover?.flight_number ?? 'N/A',
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
        console.error('Failed to send negotiation email to hotel:', emailErr)
      }
    } else if (proposed_by === 'hotel' && booking.contact_email) {
      const emailData = negotiationEmail({
        recipientName: booking.contact_name ?? airline?.name ?? 'Airline',
        proposedBy: 'hotel',
        proposedPrice: proposed_price != null ? formatCurrency(proposed_price) : 'N/A',
        message: message ?? '',
        hotelName: hotel.name,
        flightNumber: layover?.flight_number ?? 'N/A',
        dashboardUrl,
      })

      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: booking.contact_email,
          subject: emailData.subject,
          html: emailData.html,
        })
      } catch (emailErr) {
        console.error('Failed to send negotiation email to airline:', emailErr)
      }
    }

    return NextResponse.json({ negotiation })
  } catch (error) {
    console.error('POST /api/bookings/[id]/negotiate error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
