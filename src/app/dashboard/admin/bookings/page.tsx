import Link from 'next/link'
import { CalendarCheck, ExternalLink } from 'lucide-react'
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
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'

const statusVariant: Record<string, 'info' | 'warning' | 'success' | 'danger' | 'default'> = {
  pending: 'warning',
  confirmed: 'success',
  negotiating: 'info',
  rejected: 'danger',
  cancelled: 'danger',
  completed: 'success',
}

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('booking_requests')
    .select('*, hotel:hotels(name), airline:airlines(name)')
    .order('created_at', { ascending: false })

  if (params.status) {
    query = query.eq('status', params.status)
  }

  const { data: bookings } = await query

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1e3a5f]">Bookings</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage all booking requests across the platform
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5" />
              All Bookings
              <Badge variant="default">{bookings?.length ?? 0}</Badge>
            </CardTitle>
            <BookingFilters currentStatus={params.status} />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Hotel</TableHead>
                <TableHead>Airline</TableHead>
                <TableHead>Guests</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Check-out</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(bookings ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-gray-400 py-8">
                    No bookings found
                  </TableCell>
                </TableRow>
              ) : (
                (bookings ?? []).map((booking: any) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <span className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-700">
                        {booking.id?.slice(0, 8)}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      {booking.hotel?.name ?? '—'}
                    </TableCell>
                    <TableCell>{booking.airline?.name ?? '—'}</TableCell>
                    <TableCell className="text-center">
                      {booking.guest_count ?? booking.rooms ?? '—'}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {booking.check_in
                        ? formatDate(booking.check_in)
                        : '—'}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {booking.check_out
                        ? formatDate(booking.check_out)
                        : '—'}
                    </TableCell>
                    <TableCell className="font-medium">
                      {booking.total_amount
                        ? formatCurrency(booking.total_amount)
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[booking.status] ?? 'default'}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-gray-500">
                      {booking.created_at
                        ? formatDateTime(booking.created_at)
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/dashboard/admin/bookings/${booking.id}`}
                        className="inline-flex items-center gap-1 text-sm text-[#38bdf8] hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Details
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function BookingFilters({ currentStatus }: { currentStatus?: string }) {
  return (
    <form className="flex flex-col gap-2 sm:flex-row sm:items-center" method="GET">
      <select
        name="status"
        defaultValue={currentStatus ?? ''}
        className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-[#38bdf8] focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/30"
      >
        <option value="">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="negotiating">Negotiating</option>
        <option value="rejected">Rejected</option>
        <option value="cancelled">Cancelled</option>
        <option value="completed">Completed</option>
      </select>
      <button
        type="submit"
        className="h-9 rounded-lg bg-[#1e3a5f] px-4 text-sm font-medium text-white hover:bg-[#162d4a] transition-colors"
      >
        Filter
      </button>
    </form>
  )
}
