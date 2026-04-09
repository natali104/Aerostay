import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { CalendarCheck } from 'lucide-react'
import { BookingsFilter } from './bookings-filter'

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  pending: 'warning',
  confirmed: 'success',
  cancelled: 'danger',
  completed: 'info',
  declined: 'danger',
  negotiating: 'warning',
}

export default async function AirlineBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status: statusFilter } = await searchParams
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

  let query = supabase
    .from('booking_requests')
    .select('id, hotel_id, guest_count, check_in, check_out, total_amount, status, created_at, hotel:hotels(name)')
    .eq('airline_id', profile.airline_id)
    .order('created_at', { ascending: false })

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter)
  }

  const { data: bookings } = await query

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Bookings</h1>
          <p className="mt-1 text-sm text-gray-500">
            All booking requests for your airline
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CalendarCheck className="h-5 w-5 text-[#1e3a5f]" />
          <span className="text-sm font-medium text-gray-600">
            {bookings?.length ?? 0} booking{(bookings?.length ?? 0) !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <BookingsFilter currentStatus={statusFilter ?? 'all'} />

      <Card>
        <CardHeader>
          <CardTitle>Booking Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {!bookings || bookings.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-400">
              No bookings found{statusFilter && statusFilter !== 'all' ? ` with status "${statusFilter}"` : ''}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Hotel</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => {
                  const hotelRaw = booking.hotel as unknown
                  const hotel = Array.isArray(hotelRaw) ? hotelRaw[0] as { name: string } | undefined : hotelRaw as { name: string } | null
                  return (
                    <TableRow key={booking.id}>
                      <TableCell className="font-mono text-xs">
                        {booking.id.slice(0, 8)}…
                      </TableCell>
                      <TableCell className="font-medium">
                        {hotel?.name ?? '—'}
                      </TableCell>
                      <TableCell>{booking.guest_count}</TableCell>
                      <TableCell>{formatDate(booking.check_in)}</TableCell>
                      <TableCell>{formatDate(booking.check_out)}</TableCell>
                      <TableCell>
                        {formatCurrency(Number(booking.total_amount) || 0)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[booking.status] ?? 'default'}>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-gray-500">
                        {formatDateTime(booking.created_at)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
