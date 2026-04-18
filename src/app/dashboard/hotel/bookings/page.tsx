import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { LiveBookingFeed } from './live-booking-feed'

export default async function HotelBookingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('hotel_id')
    .eq('id', user!.id)
    .single()
  const hotelId = profile?.hotel_id

  if (!hotelId) {
    return (
      <div className="py-20 text-center text-[#94A3B8]">
        No hotel assigned to your account.
      </div>
    )
  }

  const { data: bookings } = await supabase
    .from('booking_requests')
    .select(
      'id, guest_count, check_in, check_out, total_amount, status, contact_name, contact_email, created_at, confirmed_at, hotel_id, layovers(flight_number, passenger_count, airlines(name, iata_code))'
    )
    .eq('hotel_id', hotelId)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Bookings"
        subtitle="Real-time booking request feed"
      />
      <LiveBookingFeed hotelId={hotelId} initialBookings={(bookings ?? []) as never[]} />
    </div>
  )
}
