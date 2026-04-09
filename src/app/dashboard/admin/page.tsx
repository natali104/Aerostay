import Link from 'next/link'
import {
  Hotel,
  Plane,
  Clock,
  CalendarCheck,
  DollarSign,
  Receipt,
  Plus,
  MapPin,
  RefreshCw,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/ui/stat-card'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'

const layoverStatusVariant: Record<string, 'info' | 'warning' | 'success' | 'danger' | 'default'> = {
  detected: 'info',
  notified: 'warning',
  booking_in_progress: 'info',
  booked: 'success',
  expired: 'danger',
  cancelled: 'danger',
}

const bookingStatusVariant: Record<string, 'info' | 'warning' | 'success' | 'danger' | 'default'> = {
  pending: 'warning',
  confirmed: 'success',
  negotiating: 'info',
  rejected: 'danger',
  cancelled: 'danger',
  completed: 'success',
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const [
    { count: hotelsCount },
    { count: airlinesCount },
    { count: activeLayoversCount },
    { count: bookingsCount },
    { data: commissionTotals },
    { data: recentLayovers },
    { data: recentBookings },
  ] = await Promise.all([
    supabase.from('hotels').select('*', { count: 'exact', head: true }),
    supabase.from('airlines').select('*', { count: 'exact', head: true }),
    supabase
      .from('layovers')
      .select('*', { count: 'exact', head: true })
      .in('status', ['detected', 'notified', 'booking_in_progress']),
    supabase.from('booking_requests').select('*', { count: 'exact', head: true }),
    supabase
      .from('commissions')
      .select('amount, status'),
    supabase
      .from('layovers')
      .select('*, airport:airports(name, iata_code), airline:airlines(name)')
      .order('detected_at', { ascending: false })
      .limit(10),
    supabase
      .from('booking_requests')
      .select('*, hotel:hotels(name), airline:airlines(name)')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const totalRevenue = (commissionTotals ?? [])
    .filter((c: any) => c.status === 'paid')
    .reduce((sum: number, c: any) => sum + (c.amount ?? 0), 0)

  const pendingCommissions = (commissionTotals ?? [])
    .filter((c: any) => c.status === 'pending')
    .reduce((sum: number, c: any) => sum + (c.amount ?? 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Platform overview and recent activity
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/admin/hotels">
            <Button size="sm" variant="primary">
              <Plus className="h-4 w-4" />
              Add Hotel
            </Button>
          </Link>
          <Link href="/dashboard/admin/airports">
            <Button size="sm" variant="outline">
              <MapPin className="h-4 w-4" />
              Add Airport
            </Button>
          </Link>
          <Link href="/api/cron/check-layovers">
            <Button size="sm" variant="ghost">
              <RefreshCw className="h-4 w-4" />
              Trigger Layover Check
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Total Hotels"
          value={hotelsCount ?? 0}
          icon={<Hotel className="h-5 w-5" />}
        />
        <StatCard
          label="Total Airlines"
          value={airlinesCount ?? 0}
          icon={<Plane className="h-5 w-5" />}
        />
        <StatCard
          label="Active Layovers"
          value={activeLayoversCount ?? 0}
          icon={<Clock className="h-5 w-5" />}
        />
        <StatCard
          label="Total Bookings"
          value={bookingsCount ?? 0}
          icon={<CalendarCheck className="h-5 w-5" />}
        />
        <StatCard
          label="Revenue"
          value={formatCurrency(totalRevenue)}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          label="Pending Commissions"
          value={formatCurrency(pendingCommissions)}
          icon={<Receipt className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>Recent Layovers</CardTitle>
            <Link
              href="/dashboard/admin/layovers"
              className="text-sm font-medium text-[#38bdf8] hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Flight</TableHead>
                  <TableHead>Airport</TableHead>
                  <TableHead>Airline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Detected At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(recentLayovers ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-400 py-8">
                      No layovers found
                    </TableCell>
                  </TableRow>
                ) : (
                  (recentLayovers ?? []).map((layover: any) => (
                    <TableRow key={layover.id}>
                      <TableCell className="font-medium">
                        {layover.flight_number}
                      </TableCell>
                      <TableCell>
                        {layover.airport?.iata_code ?? '—'}
                      </TableCell>
                      <TableCell>
                        {layover.airline?.name ?? '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={layoverStatusVariant[layover.status] ?? 'default'}>
                          {layover.status?.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {layover.detected_at
                          ? formatDateTime(layover.detected_at)
                          : '—'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>Recent Bookings</CardTitle>
            <Link
              href="/dashboard/admin/bookings"
              className="text-sm font-medium text-[#38bdf8] hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Hotel</TableHead>
                  <TableHead>Airline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(recentBookings ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                      No bookings found
                    </TableCell>
                  </TableRow>
                ) : (
                  (recentBookings ?? []).map((booking: any) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-mono text-xs">
                        {booking.id?.slice(0, 8)}
                      </TableCell>
                      <TableCell>{booking.hotel?.name ?? '—'}</TableCell>
                      <TableCell>{booking.airline?.name ?? '—'}</TableCell>
                      <TableCell>
                        <Badge variant={bookingStatusVariant[booking.status] ?? 'default'}>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {booking.total_amount
                          ? formatCurrency(booking.total_amount)
                          : '—'}
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {booking.created_at
                          ? formatDateTime(booking.created_at)
                          : '—'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
