import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { formatEuro, formatDate } from '@/lib/format'
import { Building2, Plane, AlertTriangle, DollarSign } from 'lucide-react'
import { RevenueChart } from './revenue-chart'
import { QuickActions } from './quick-actions'

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-[#F5A623]/20', text: 'text-[#F5A623]' },
  confirmed: { bg: 'bg-[#22C55E]/20', text: 'text-[#22C55E]' },
  cancelled: { bg: 'bg-red-500/20', text: 'text-red-400' },
  completed: { bg: 'bg-[#3B9EFF]/20', text: 'text-[#3B9EFF]' },
  declined: { bg: 'bg-red-500/20', text: 'text-red-400' },
  negotiating: { bg: 'bg-[#F5A623]/20', text: 'text-[#F5A623]' },
  booked: { bg: 'bg-[#22C55E]/20', text: 'text-[#22C55E]' },
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    hotelsRes,
    airlinesRes,
    layoversMonthRes,
    commissionsRes,
    recentBookingsRes,
  ] = await Promise.all([
    supabase.from('hotels').select('id', { count: 'exact', head: true }),
    supabase.from('airlines').select('id', { count: 'exact', head: true }),
    supabase
      .from('layovers')
      .select('id', { count: 'exact', head: true })
      .gte('detected_at', monthStart),
    supabase
      .from('commissions')
      .select('amount, status')
      .neq('status', 'paid'),
    supabase
      .from('booking_requests')
      .select(
        'id, total_amount, status, created_at, hotel:hotels(name), airline:airlines(name)'
      )
      .order('created_at', { ascending: false })
      .limit(15),
  ])

  const totalHotels = hotelsRes.count ?? 0
  const totalAirlines = airlinesRes.count ?? 0
  const layoversThisMonth = layoversMonthRes.count ?? 0
  const platformRevenue = (commissionsRes.data ?? []).reduce(
    (sum, c) => sum + (Number(c.amount) || 0),
    0
  )

  const recentBookings = (recentBookingsRes.data ?? []).map((b) => {
    const hotel = Array.isArray(b.hotel) ? b.hotel[0] : b.hotel
    const airline = Array.isArray(b.airline) ? b.airline[0] : b.airline
    return { ...b, _hotel: hotel as { name: string } | null, _airline: airline as { name: string } | null }
  })

  return (
    <div className="min-h-screen bg-[#0B1120] p-6">
      <DashboardHeader
        title="Platform Overview"
        subtitle="AeroStay administration panel"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Hotels"
          value={totalHotels}
          icon={<Building2 className="h-5 w-5" />}
        />
        <StatCard
          label="Total Airlines"
          value={totalAirlines}
          icon={<Plane className="h-5 w-5" />}
        />
        <StatCard
          label="Layovers This Month"
          value={layoversThisMonth}
          icon={<AlertTriangle className="h-5 w-5" />}
        />
        <StatCard
          label="Platform Revenue"
          value={formatEuro(platformRevenue)}
          icon={<DollarSign className="h-5 w-5" />}
        />
      </div>

      {/* Revenue Chart */}
      <div className="mt-6">
        <RevenueChart />
      </div>

      {/* Recent Activity */}
      <div className="mt-6 rounded-xl border border-white/[0.08] bg-[#111827] p-6">
        <h2 className="mb-4 text-lg font-semibold text-[#F1F5F9]">
          Recent Activity
        </h2>
        {recentBookings.length === 0 ? (
          <p className="py-12 text-center text-sm text-[#94A3B8]">
            No recent activity
          </p>
        ) : (
          <div className="space-y-3">
            {recentBookings.map((b) => {
              const colors =
                statusColors[b.status] ?? statusColors.pending
              return (
                <div
                  key={b.id}
                  className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-[#0B1120] px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-medium text-[#F1F5F9]">
                        {b._hotel?.name ?? 'Unknown Hotel'}
                      </span>
                      <span className="text-[#94A3B8]">·</span>
                      <span className="text-[#94A3B8]">
                        {b._airline?.name ?? 'Unknown Airline'}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-[#94A3B8]">
                      {b.total_amount && (
                        <span className="font-medium text-[#F1F5F9]">
                          {formatEuro(Number(b.total_amount))}
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}
                      >
                        {b.status?.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                  <span className="ml-4 shrink-0 text-xs text-[#94A3B8]">
                    {b.created_at ? formatDate(b.created_at) : '—'}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6">
        <QuickActions />
      </div>
    </div>
  )
}
