import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Eye, CheckCircle, MessageSquare } from 'lucide-react'
import Link from 'next/link'

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
  const hotelId = profile!.hotel_id

  const { data: bookings } = await supabase
    .from('bookings')
    .select(
      'id, airline:airlines(name), contact_name, contact_email, guest_count, check_in, check_out, total_amount, status, created_at'
    )
    .eq('hotel_id', hotelId)
    .order('created_at', { ascending: false })

  const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
    pending: 'warning',
    confirmed: 'info',
    checked_in: 'success',
    completed: 'default',
    cancelled: 'danger',
    rejected: 'danger',
    negotiating: 'warning',
  }

  const statusLabel: Record<string, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    checked_in: 'Checked In',
    completed: 'Completed',
    cancelled: 'Cancelled',
    rejected: 'Rejected',
    negotiating: 'Negotiating',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1e3a5f]">Bookings</h1>
        <p className="mt-1 text-gray-500">
          Manage all booking requests for your hotel
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings && bookings.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Airline</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => {
                  const airlineRaw = booking.airline as unknown
                  const airlineObj = Array.isArray(airlineRaw) ? airlineRaw[0] as { name: string } | undefined : airlineRaw as { name: string } | null
                  return (
                  <TableRow key={booking.id}>
                    <TableCell className="font-mono text-xs">
                      {booking.id.slice(0, 8)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {airlineObj?.name ?? '—'}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{booking.contact_name}</p>
                        <p className="text-xs text-gray-400">
                          {booking.contact_email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{booking.guest_count}</TableCell>
                    <TableCell>{formatDate(booking.check_in)}</TableCell>
                    <TableCell>{formatDate(booking.check_out)}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(booking.total_amount)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={statusVariant[booking.status] ?? 'default'}
                      >
                        {statusLabel[booking.status] ?? booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {booking.status === 'pending' && (
                          <Link
                            href={`/dashboard/hotel/bookings/${booking.id}`}
                          >
                            <Button variant="secondary" size="sm">
                              <CheckCircle className="mr-1 h-3.5 w-3.5" />
                              Confirm
                            </Button>
                          </Link>
                        )}
                        <Link href={`/dashboard/hotel/bookings/${booking.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="mr-1 h-3.5 w-3.5" />
                            View
                          </Button>
                        </Link>
                        <Link href={`/dashboard/hotel/bookings/${booking.id}`}>
                          <Button variant="ghost" size="sm">
                            <MessageSquare className="mr-1 h-3.5 w-3.5" />
                            Negotiate
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="py-12 text-center text-sm text-gray-400">
              No bookings yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
