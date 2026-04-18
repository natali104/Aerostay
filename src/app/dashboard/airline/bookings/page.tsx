import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { formatEuro, formatDate } from '@/lib/format'

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-[#F5A623]/20', text: 'text-[#F5A623]' },
  confirmed: { bg: 'bg-[#22C55E]/20', text: 'text-[#22C55E]' },
  cancelled: { bg: 'bg-red-500/20', text: 'text-red-400' },
  completed: { bg: 'bg-[#3B9EFF]/20', text: 'text-[#3B9EFF]' },
  declined: { bg: 'bg-red-500/20', text: 'text-red-400' },
  negotiating: { bg: 'bg-[#F5A623]/20', text: 'text-[#F5A623]' },
  detected: { bg: 'bg-slate-500/20', text: 'text-slate-300' },
  notified: { bg: 'bg-[#3B9EFF]/20', text: 'text-[#3B9EFF]' },
  booking_in_progress: { bg: 'bg-[#F5A623]/20', text: 'text-[#F5A623]' },
  booked: { bg: 'bg-[#22C55E]/20', text: 'text-[#22C55E]' },
}

export default async function AirlineBookingsPage() {
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

  const { data: bookings } = await supabase
    .from('booking_requests')
    .select(
      'id, guest_count, check_in, check_out, total_amount, status, contact_name, confirmed_at, created_at, layover:layovers(flight_number, passenger_count), hotel:hotels(name)'
    )
    .eq('airline_id', profile.airline_id)
    .order('created_at', { ascending: false })

  const rows = (bookings ?? []).map((b) => {
    const layover = Array.isArray(b.layover) ? b.layover[0] : b.layover
    const hotel = Array.isArray(b.hotel) ? b.hotel[0] : b.hotel
    return {
      ...b,
      _layover: layover as { flight_number: string; passenger_count: number } | null,
      _hotel: hotel as { name: string } | null,
    }
  })

  return (
    <div className="min-h-screen bg-[#0B1120] p-6">
      <DashboardHeader
        title="Booking History"
        subtitle="All booking requests and layover events"
      />

      <div className="rounded-xl border border-white/[0.08] bg-[#111827] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.08]">
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-[#94A3B8]">
                  Flight
                </th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-[#94A3B8]">
                  Hotel
                </th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-[#94A3B8]">
                  Guests
                </th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-[#94A3B8]">
                  Check-in
                </th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-[#94A3B8]">
                  Check-out
                </th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-[#94A3B8]">
                  Amount
                </th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-[#94A3B8]">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-[#94A3B8]">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-16 text-center text-[#94A3B8]"
                  >
                    No booking records found
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const colors =
                    statusColors[row.status] ?? statusColors.pending
                  return (
                    <tr
                      key={row.id}
                      className="transition-colors hover:bg-white/[0.02]"
                    >
                      <td className="whitespace-nowrap px-6 py-4 font-medium text-[#F1F5F9]">
                        {row._layover?.flight_number ?? '—'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-[#F1F5F9]">
                        {row._hotel?.name ?? '—'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-[#94A3B8]">
                        {row.guest_count}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-[#94A3B8]">
                        {row.check_in ? formatDate(row.check_in) : '—'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-[#94A3B8]">
                        {row.check_out ? formatDate(row.check_out) : '—'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-medium text-[#F1F5F9]">
                        {row.total_amount
                          ? formatEuro(Number(row.total_amount))
                          : '—'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}
                        >
                          {row.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-[#94A3B8]">
                        {row.created_at ? formatDate(row.created_at) : '—'}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
