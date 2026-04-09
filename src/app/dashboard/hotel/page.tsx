import { createClient } from '@/lib/supabase/server'
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
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  CalendarDays,
  BedDouble,
  ClipboardList,
  Clock,
  DollarSign,
  BarChart3,
  ArrowRight,
  LogIn,
} from 'lucide-react'
import Link from 'next/link'

export default async function HotelDashboardPage() {
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

  const today = new Date().toISOString().split('T')[0]

  const [
    { count: activeBookings },
    { count: pendingRequests },
    { data: monthRevenue },
    { data: occupancyData },
    { data: recentBookings },
    { data: todayCheckins },
  ] = await Promise.all([
    supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('hotel_id', hotelId)
      .in('status', ['confirmed', 'checked_in']),
    supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('hotel_id', hotelId)
      .eq('status', 'pending'),
    supabase
      .from('bookings')
      .select('total_amount')
      .eq('hotel_id', hotelId)
      .in('status', ['confirmed', 'checked_in', 'completed'])
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    supabase
      .from('room_availability')
      .select('available_rooms, total_rooms')
      .eq('hotel_id', hotelId)
      .eq('date', today),
    supabase
      .from('bookings')
      .select('id, airline:airlines(name), contact_name, guest_count, check_in, check_out, total_amount, status, created_at')
      .eq('hotel_id', hotelId)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('bookings')
      .select('id, airline:airlines(name), contact_name, guest_count, room_type:room_types(name), status')
      .eq('hotel_id', hotelId)
      .eq('check_in', today)
      .in('status', ['confirmed', 'checked_in']),
  ])

  const totalRevenue = monthRevenue?.reduce((sum, b) => sum + (b.total_amount || 0), 0) ?? 0

  const totalRooms = occupancyData?.reduce((sum, r) => sum + (r.total_rooms || 0), 0) ?? 0
  const availableRooms = occupancyData?.reduce((sum, r) => sum + (r.available_rooms || 0), 0) ?? 0
  const occupancyRate = totalRooms > 0 ? Math.round(((totalRooms - availableRooms) / totalRooms) * 100) : 0

  const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
    pending: 'warning',
    confirmed: 'info',
    checked_in: 'success',
    completed: 'default',
    cancelled: 'danger',
    rejected: 'danger',
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1e3a5f]">Hotel Dashboard</h1>
        <p className="mt-1 text-gray-500">
          Overview of your property performance and bookings
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Bookings"
          value={activeBookings ?? 0}
          icon={<ClipboardList className="h-5 w-5" />}
        />
        <StatCard
          label="Pending Requests"
          value={pendingRequests ?? 0}
          icon={<Clock className="h-5 w-5" />}
        />
        <StatCard
          label="This Month Revenue"
          value={formatCurrency(totalRevenue)}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          label="Occupancy Rate"
          value={`${occupancyRate}%`}
          icon={<BarChart3 className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Recent Bookings</CardTitle>
            <Link href="/dashboard/hotel/bookings">
              <Button variant="ghost" size="sm">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentBookings && recentBookings.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Airline</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Guests</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentBookings.map((booking) => {
                    const airlineRaw = booking.airline as unknown
                    const airlineObj = Array.isArray(airlineRaw) ? airlineRaw[0] as { name: string } | undefined : airlineRaw as { name: string } | null
                    return (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">
                        {airlineObj?.name ?? '—'}
                      </TableCell>
                      <TableCell>{booking.contact_name}</TableCell>
                      <TableCell>{booking.guest_count}</TableCell>
                      <TableCell>{formatDate(booking.check_in)}</TableCell>
                      <TableCell>{formatCurrency(booking.total_amount)}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[booking.status] ?? 'default'}>
                          {booking.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            ) : (
              <p className="py-8 text-center text-sm text-gray-400">
                No recent bookings
              </p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LogIn className="h-5 w-5 text-[#38bdf8]" />
                Today&apos;s Check-ins
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayCheckins && todayCheckins.length > 0 ? (
                <ul className="space-y-3">
                  {todayCheckins.map((ci) => {
                    const ciAirlineRaw = ci.airline as unknown
                    const ciAirline = Array.isArray(ciAirlineRaw) ? ciAirlineRaw[0] as { name: string } | undefined : ciAirlineRaw as { name: string } | null
                    const ciRtRaw = ci.room_type as unknown
                    const ciRoomType = Array.isArray(ciRtRaw) ? ciRtRaw[0] as { name: string } | undefined : ciRtRaw as { name: string } | null
                    return (
                    <li
                      key={ci.id}
                      className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-[#1e3a5f]">
                          {ci.contact_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {ciAirline?.name} &middot; {ci.guest_count} guests
                        </p>
                        {ciRoomType && (
                          <p className="text-xs text-gray-400">
                            {ciRoomType.name}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={
                          ci.status === 'checked_in' ? 'success' : 'info'
                        }
                      >
                        {ci.status.replace('_', ' ')}
                      </Badge>
                    </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="py-6 text-center text-sm text-gray-400">
                  No check-ins today
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/dashboard/hotel/calendar" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  View Calendar
                </Button>
              </Link>
              <Link href="/dashboard/hotel/rooms" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <BedDouble className="mr-2 h-4 w-4" />
                  Manage Rooms
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
