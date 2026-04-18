import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { LayoverDetail } from './layover-detail'

export default async function LayoverDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('airline_id')
    .eq('id', user.id)
    .single()
  if (!profile?.airline_id) redirect('/dashboard')

  const { data: layover } = await supabase
    .from('layovers')
    .select('*, airports(iata_code, name, city)')
    .eq('id', id)
    .single()

  if (!layover) redirect('/dashboard/airline/bookings')

  const { data: booking } = await supabase
    .from('booking_requests')
    .select('*, hotels(id, name, address, city, star_rating)')
    .eq('layover_id', id)
    .eq('status', 'confirmed')
    .single()

  const { data: existingPassengers } = booking
    ? await supabase
        .from('passengers')
        .select('*')
        .eq('booking_request_id', booking.id)
        .order('last_name')
    : { data: [] }

  const roomTypes = booking?.hotel_id
    ? (
        await supabase
          .from('room_types')
          .select('*')
          .eq('hotel_id', booking.hotel_id)
      ).data
    : []

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/airline/bookings"
        className="inline-flex items-center gap-1.5 text-sm text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
      >
        ← Back to Booking History
      </Link>
      <DashboardHeader
        title={`Flight ${layover.flight_number}`}
        subtitle="Layover event details and passenger manifest"
      />
      <LayoverDetail
        layover={layover}
        booking={booking}
        existingPassengers={existingPassengers ?? []}
        roomTypes={roomTypes ?? []}
      />
    </div>
  )
}
