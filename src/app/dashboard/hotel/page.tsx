import { createClient } from '@/lib/supabase/server'
import { StatCard } from '@/components/dashboard/StatCard'
import { LiveEventFeed } from '@/components/dashboard/LiveEventFeed'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { CrisisRadarLive } from '@/components/dashboard/CrisisRadarLive'
import { formatEuro, formatDate } from '@/lib/format'
import { BedDouble, Clock, DollarSign, TrendingUp, Plane } from 'lucide-react'
import { RevenueChart } from './revenue-chart'

export default async function HotelDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
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

  const today = new Date().toISOString().split('T')[0]
  const monthStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  ).toISOString()

  const threeDaysFromNow = new Date()
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
  const threeDaysStr = threeDaysFromNow.toISOString().split('T')[0]

  const { data: roomTypes } = await supabase
    .from('room_types')
    .select('id, total_rooms')
    .eq('hotel_id', hotelId)

  const roomTypeIds = roomTypes?.map((rt) => rt.id) ?? []
  const totalRooms = roomTypes?.reduce((s, rt) => s + (rt.total_rooms ?? 0), 0) ?? 0

  const [availResult, pendingResult, revenueResult, arrivalsResult] =
    await Promise.all([
      roomTypeIds.length > 0
        ? supabase
            .from('room_availability')
            .select('available_count')
            .in('room_type_id', roomTypeIds)
            .eq('date', today)
            .eq('is_blocked', false)
        : Promise.resolve({ data: [] as { available_count: number }[] }),
      supabase
        .from('booking_requests')
        .select('*', { count: 'exact', head: true })
        .eq('hotel_id', hotelId)
        .eq('status', 'pending'),
      supabase
        .from('booking_requests')
        .select('total_amount')
        .eq('hotel_id', hotelId)
        .eq('status', 'confirmed')
        .gte('confirmed_at', monthStart),
      supabase
        .from('booking_requests')
        .select(
          'id, guest_count, check_in, status, contact_name, layover_id, layovers(flight_number, airlines(name, iata_code))'
        )
        .eq('hotel_id', hotelId)
        .eq('status', 'confirmed')
        .gte('check_in', today)
        .lte('check_in', threeDaysStr)
        .order('check_in', { ascending: true })
        .limit(10),
    ])

  const availableRooms =
    availResult.data?.reduce(
      (s: number, r: { available_count: number }) => s + (r.available_count ?? 0),
      0
    ) ?? 0
  const pendingCount = pendingResult.count ?? 0
  const monthRevenue =
    revenueResult.data?.reduce(
      (s: number, r: { total_amount: number }) => s + (r.total_amount ?? 0),
      0
    ) ?? 0
  const occupiedRooms = totalRooms - availableRooms
  const occupancyRate =
    totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0

  const arrivals = arrivalsResult.data ?? []

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Hotel Overview"
        subtitle="Real-time monitoring of your property"
      />

      {/* Crisis Radar */}
      <div className="mb-6 flex justify-center">
        <div
          className="w-full max-w-sm rounded-xl p-6"
          style={{
            backgroundColor: '#111827',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <h3
            className="mb-4 text-center text-xs font-medium uppercase tracking-[0.1em]"
            style={{ color: '#94A3B8' }}
          >
            Crisis Radar — SOF Airport
          </h3>
          <CrisisRadarLive />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Available Rooms"
          value={availableRooms}
          subtitle={`of ${totalRooms} total`}
          icon={<BedDouble className="h-5 w-5" />}
        />
        <StatCard
          title="Pending Requests"
          value={pendingCount}
          subtitle="awaiting response"
          icon={<Clock className="h-5 w-5" />}
        />
        <StatCard
          title="This Month Revenue"
          value={formatEuro(monthRevenue)}
          subtitle="confirmed bookings"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          title="Occupancy Rate"
          value={`${occupancyRate}%`}
          subtitle="today"
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <LiveEventFeed hotelId={hotelId} />
        </div>
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
      </div>

      <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#111827] p-5">
        <h3 className="mb-4 text-sm font-semibold text-[#F1F5F9]">
          Upcoming Arrivals
        </h3>
        {arrivals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.06)]">
                  <th className="px-3 py-2 text-left text-xs font-medium text-[#94A3B8]">
                    Flight
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-[#94A3B8]">
                    Airline
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-[#94A3B8]">
                    Rooms
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-[#94A3B8]">
                    Check-in
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-[#94A3B8]">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {arrivals.map((a) => {
                  const layover = a.layovers as unknown as {
                    flight_number: string
                    airlines: { name: string; iata_code: string } | null
                  } | null
                  return (
                    <tr
                      key={a.id}
                      className="border-b border-[rgba(255,255,255,0.04)]"
                    >
                      <td className="px-3 py-3 font-medium text-[#F1F5F9]">
                        <div className="flex items-center gap-2">
                          <Plane className="h-3.5 w-3.5 text-[#3B9EFF]" />
                          {layover?.flight_number ?? '—'}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-[#94A3B8]">
                        {layover?.airlines?.name ?? '—'}
                      </td>
                      <td className="px-3 py-3 text-[#F1F5F9]">
                        {a.guest_count}
                      </td>
                      <td className="px-3 py-3 text-[#94A3B8]">
                        {formatDate(a.check_in)}
                      </td>
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center rounded-full bg-[#22C55E]/10 px-2 py-0.5 text-xs font-medium text-[#22C55E]">
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-[#94A3B8]">
            No upcoming arrivals in the next 3 days
          </p>
        )}
      </div>
    </div>
  )
}
