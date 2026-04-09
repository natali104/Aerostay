import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils'
import {
  Users,
  CalendarDays,
  BedDouble,
  Mail,
  Phone,
  ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BookingActions } from './booking-actions'

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('hotel_id')
    .eq('id', user!.id)
    .single()
  const hotelId = profile!.hotel_id

  const { data: booking } = await supabase
    .from('bookings')
    .select(
      '*, airline:airlines(name, iata_code), room_type:room_types(name, max_occupancy, amenities)'
    )
    .eq('id', id)
    .eq('hotel_id', hotelId)
    .single()

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg text-gray-500">Booking not found</p>
        <Link href="/dashboard/hotel/bookings" className="mt-4">
          <Button variant="outline">Back to Bookings</Button>
        </Link>
      </div>
    )
  }

  const { data: negotiations } = await supabase
    .from('negotiations')
    .select('*, sender:profiles(full_name, role)')
    .eq('booking_id', id)
    .order('created_at', { ascending: true })

  const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
    pending: 'warning',
    confirmed: 'info',
    checked_in: 'success',
    completed: 'default',
    cancelled: 'danger',
    rejected: 'danger',
    negotiating: 'warning',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/hotel/bookings">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f]">
            Booking Details
          </h1>
          <p className="mt-0.5 font-mono text-sm text-gray-400">{booking.id}</p>
        </div>
        <Badge
          variant={statusVariant[booking.status] ?? 'default'}
          className="ml-auto text-sm"
        >
          {booking.status.replace('_', ' ')}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#38bdf8]" />
              Guest Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow label="Contact Name" value={booking.contact_name} />
            <InfoRow
              label="Email"
              value={booking.contact_email}
              icon={<Mail className="h-4 w-4 text-gray-400" />}
            />
            {booking.contact_phone && (
              <InfoRow
                label="Phone"
                value={booking.contact_phone}
                icon={<Phone className="h-4 w-4 text-gray-400" />}
              />
            )}
            <InfoRow label="Number of Guests" value={booking.guest_count} />
            <InfoRow
              label="Airline"
              value={
                booking.airline
                  ? `${booking.airline.name} (${booking.airline.iata_code})`
                  : '—'
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BedDouble className="h-5 w-5 text-[#38bdf8]" />
              Room &amp; Stay Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow
              label="Room Type"
              value={booking.room_type?.name ?? '—'}
            />
            {booking.room_type?.max_occupancy && (
              <InfoRow
                label="Max Occupancy"
                value={`${booking.room_type.max_occupancy} guests`}
              />
            )}
            <InfoRow
              label="Check-in"
              value={formatDate(booking.check_in)}
              icon={<CalendarDays className="h-4 w-4 text-gray-400" />}
            />
            <InfoRow
              label="Check-out"
              value={formatDate(booking.check_out)}
              icon={<CalendarDays className="h-4 w-4 text-gray-400" />}
            />
            <InfoRow
              label="Room Count"
              value={booking.room_count ?? 1}
            />
            <div className="border-t border-gray-100 pt-4">
              <InfoRow
                label="Total Amount"
                value={formatCurrency(booking.total_amount)}
                bold
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {booking.room_type?.amenities && (
        <Card>
          <CardHeader>
            <CardTitle>Room Amenities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(Array.isArray(booking.room_type.amenities)
                ? booking.room_type.amenities
                : []
              ).map((amenity: string) => (
                <Badge key={amenity} variant="default">
                  {amenity}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Negotiation Thread</CardTitle>
        </CardHeader>
        <CardContent>
          {negotiations && negotiations.length > 0 ? (
            <div className="space-y-4">
              {negotiations.map((msg: Record<string, unknown> & { id: string; sender?: { full_name: string; role: string }; created_at: string; message: string; proposed_amount?: number }) => (
                <div
                  key={msg.id}
                  className={`rounded-lg border p-4 ${
                    msg.sender?.role === 'hotel'
                      ? 'ml-8 border-[#38bdf8]/30 bg-sky-50/50'
                      : 'mr-8 border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-[#1e3a5f]">
                      {msg.sender?.full_name ?? 'Unknown'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDateTime(msg.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{msg.message}</p>
                  {msg.proposed_amount && (
                    <p className="mt-2 text-sm font-semibold text-[#1e3a5f]">
                      Proposed: {formatCurrency(msg.proposed_amount)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-gray-400">
              No negotiation messages yet
            </p>
          )}
        </CardContent>
      </Card>

      <BookingActions
        bookingId={booking.id}
        bookingStatus={booking.status}
        currentAmount={booking.total_amount}
      />
    </div>
  )
}

function InfoRow({
  label,
  value,
  icon,
  bold,
}: {
  label: string
  value: string | number
  icon?: React.ReactNode
  bold?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-500">{label}</span>
      <span
        className={`flex items-center gap-1.5 text-sm ${
          bold ? 'text-lg font-bold text-[#1e3a5f]' : 'font-medium text-gray-900'
        }`}
      >
        {icon}
        {value}
      </span>
    </div>
  )
}
