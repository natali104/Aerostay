import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { CrisisRadarLive } from '@/components/dashboard/CrisisRadarLive'
import { formatDate } from '@/lib/format'
import { AlertTriangle, BedDouble, Clock, Users, Star, ArrowRight } from 'lucide-react'

const statusColors: Record<string, { bg: string; text: string }> = {
  detected: { bg: 'bg-slate-500/20', text: 'text-slate-300' },
  notified: { bg: 'bg-[#3B9EFF]/20', text: 'text-[#3B9EFF]' },
  booking_in_progress: { bg: 'bg-[#F5A623]/20', text: 'text-[#F5A623]' },
  booked: { bg: 'bg-[#22C55E]/20', text: 'text-[#22C55E]' },
  cancelled: { bg: 'bg-red-500/20', text: 'text-red-400' },
  expired: { bg: 'bg-red-500/20', text: 'text-red-400' },
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

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    activeLayoversRes,
    roomsBookedRes,
    totalPaxRes,
    layoversRes,
    prefsRes,
  ] = await Promise.all([
    supabase
      .from('layovers')
      .select('id', { count: 'exact', head: true })
      .eq('airline_id', airlineId)
      .not('status', 'in', '("booked","expired","cancelled")'),
    supabase
      .from('booking_requests')
      .select('guest_count')
      .eq('airline_id', airlineId)
      .eq('status', 'confirmed')
      .gte('created_at', monthStart),
    supabase
      .from('layovers')
      .select('passenger_count')
      .eq('airline_id', airlineId)
      .eq('status', 'booked'),
    supabase
      .from('layovers')
      .select('id, flight_number, passenger_count, status, detected_at')
      .eq('airline_id', airlineId)
      .not('status', 'in', '("booked","expired","cancelled")')
      .order('detected_at', { ascending: false })
      .limit(10),
    supabase
      .from('airline_hotel_preferences')
      .select('hotel:hotels(id, name, star_rating, city, is_active)')
      .eq('airline_id', airlineId)
      .eq('is_preferred', true)
      .order('priority', { ascending: false })
      .limit(4),
  ])

  const activeLayoverCount = activeLayoversRes.count ?? 0
  const roomsBooked = (roomsBookedRes.data ?? []).reduce(
    (sum, b) => sum + (b.guest_count ?? 0),
    0
  )
  const totalPax = (totalPaxRes.data ?? []).reduce(
    (sum, l) => sum + (l.passenger_count ?? 0),
    0
  )
  const layovers = layoversRes.data ?? []
  const preferredHotels = (prefsRes.data ?? [])
    .map((p) => (p as unknown as { hotel: { id: string; name: string; star_rating: number; city: string; is_active: boolean } | null }).hotel)
    .filter(Boolean) as {
    id: string
    name: string
    star_rating: number
    city: string
    is_active: boolean
  }[]

  return (
    <div className="min-h-screen bg-[#0B1120] p-6">
      <DashboardHeader
        title="Airline Operations"
        subtitle="Monitor layovers and bookings in real-time"
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Layovers"
          value={activeLayoverCount}
          icon={<AlertTriangle className="h-5 w-5" />}
        />
        <StatCard
          label="Rooms Booked This Month"
          value={roomsBooked}
          icon={<BedDouble className="h-5 w-5" />}
        />
        <StatCard
          label="Avg. Booking Time"
          value="< 4 min"
          icon={<Clock className="h-5 w-5" />}
        />
        <StatCard
          label="Total Pax Accommodated"
          value={totalPax}
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Active Layover Events */}
        <div className="lg:col-span-2 rounded-xl border border-white/[0.08] bg-[#111827] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#F1F5F9]">
              Active Layover Events
            </h2>
            <Link
              href="/dashboard/airline/bookings"
              className="flex items-center gap-1 text-sm font-medium text-[#3B9EFF] hover:underline"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {layovers.length === 0 ? (
            <p className="py-12 text-center text-sm text-[#94A3B8]">
              No active layover events
            </p>
          ) : (
            <div className="space-y-3">
              {layovers.map((layover) => {
                const colors = statusColors[layover.status] ?? statusColors.detected
                return (
                  <div
                    key={layover.id}
                    className="rounded-lg border border-white/[0.06] bg-[#0B1120] p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xl font-bold text-[#F1F5F9]">
                          {layover.flight_number}
                        </p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-[#94A3B8]">
                          <span>{layover.passenger_count ?? 0} pax</span>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}
                          >
                            {layover.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-[#94A3B8]">
                        {layover.detected_at
                          ? formatDate(layover.detected_at)
                          : '—'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Preferred Hotels */}
        <div className="rounded-xl border border-white/[0.08] bg-[#111827] p-6">
          <h2 className="mb-4 text-lg font-semibold text-[#F1F5F9]">
            Preferred Hotels
          </h2>

          {preferredHotels.length === 0 ? (
            <p className="py-12 text-center text-sm text-[#94A3B8]">
              No preferred hotels set
            </p>
          ) : (
            <div className="space-y-3">
              {preferredHotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className="rounded-lg border border-white/[0.06] bg-[#0B1120] p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-[#F1F5F9]">
                        {hotel.name}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-sm text-[#94A3B8]">
                        <span className="flex items-center gap-0.5 text-[#F5A623]">
                          {Array.from({ length: hotel.star_rating ?? 0 }).map(
                            (_, i) => (
                              <Star
                                key={i}
                                className="h-3 w-3 fill-current"
                              />
                            )
                          )}
                        </span>
                        <span>{hotel.city}</span>
                      </div>
                    </div>
                    <span
                      className={`mt-1 h-2.5 w-2.5 rounded-full ${
                        hotel.is_active ? 'bg-[#22C55E]' : 'bg-red-500'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
