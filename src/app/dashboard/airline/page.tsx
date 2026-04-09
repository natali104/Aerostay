import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils'
import { StatCard } from '@/components/ui/stat-card'
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
import { Plane, Clock, CalendarCheck, DollarSign } from 'lucide-react'
import Link from 'next/link'

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  pending: 'warning',
  confirmed: 'success',
  cancelled: 'danger',
  completed: 'info',
  declined: 'danger',
  negotiating: 'warning',
  detected: 'info',
  booking_in_progress: 'warning',
  accommodated: 'success',
}

export default async function AirlineDashboardPage() {
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

  const airlineId = profile.airline_id

  const [layoversRes, bookingsRes] = await Promise.all([
    supabase
      .from('layovers')
      .select('id, flight_number, origin_airport, destination_airport, estimated_departure, status, created_at, airport:airports(iata_code, city)')
      .eq('airline_id', airlineId)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('booking_requests')
      .select('id, hotel_id, guest_count, check_in, check_out, total_amount, status, created_at, hotel:hotels(name)')
      .eq('airline_id', airlineId)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const layovers = layoversRes.data ?? []
  const bookings = bookingsRes.data ?? []

  const activeLayovers = layovers.filter(
    (l) => l.status === 'detected' || l.status === 'booking_in_progress'
  ).length

  const pendingBookings = bookings.filter((b) => b.status === 'pending' || b.status === 'negotiating').length
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed').length
  const totalSpend = bookings
    .filter((b) => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1e3a5f]">Airline Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your layover operations and bookings
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Layovers"
          value={activeLayovers}
          icon={<Plane className="h-5 w-5" />}
        />
        <StatCard
          label="Pending Bookings"
          value={pendingBookings}
          icon={<Clock className="h-5 w-5" />}
        />
        <StatCard
          label="Confirmed Bookings"
          value={confirmedBookings}
          icon={<CalendarCheck className="h-5 w-5" />}
        />
        <StatCard
          label="Total Spend"
          value={formatCurrency(totalSpend)}
          icon={<DollarSign className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Layovers */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Layovers</CardTitle>
              <Link
                href="/dashboard/airline/bookings"
                className="text-sm font-medium text-[#38bdf8] hover:underline"
              >
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {layovers.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">
                No layovers recorded yet
              </p>
            ) : (
              <div className="space-y-3">
                {layovers.slice(0, 5).map((layover) => {
                  const airportRaw = layover.airport as unknown
                  const airport = Array.isArray(airportRaw) ? airportRaw[0] as { iata_code: string; city: string } | undefined : airportRaw as { iata_code: string; city: string } | null
                  return (
                    <div
                      key={layover.id}
                      className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#1e3a5f]">
                            {layover.flight_number}
                          </span>
                          <Badge variant={statusVariant[layover.status] ?? 'default'}>
                            {layover.status?.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {airport?.iata_code ? `${airport.iata_code} — ${airport.city}` : layover.destination_airport}
                          {layover.estimated_departure &&
                            ` · Dep: ${formatDateTime(layover.estimated_departure)}`}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-gray-400">
                        {formatDate(layover.created_at)}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Bookings</CardTitle>
              <Link
                href="/dashboard/airline/bookings"
                className="text-sm font-medium text-[#38bdf8] hover:underline"
              >
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">
                No bookings yet
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hotel</TableHead>
                    <TableHead>Guests</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.slice(0, 5).map((booking) => {
                    const hotelRaw = booking.hotel as unknown
                    const hotel = Array.isArray(hotelRaw) ? hotelRaw[0] as { name: string } | undefined : hotelRaw as { name: string } | null
                    return (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">
                          {hotel?.name ?? '—'}
                        </TableCell>
                        <TableCell>{booking.guest_count}</TableCell>
                        <TableCell>
                          {formatCurrency(Number(booking.total_amount) || 0)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant[booking.status] ?? 'default'}>
                            {booking.status}
                          </Badge>
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
    </div>
  )
}
