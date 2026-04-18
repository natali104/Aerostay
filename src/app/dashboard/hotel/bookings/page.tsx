import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { formatEuro, formatDate } from '@/lib/format'

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  pending:      { label: 'Pending',      bg: 'bg-[#F5A623]/10', text: 'text-[#F5A623]' },
  confirmed:    { label: 'Confirmed',    bg: 'bg-[#22C55E]/10', text: 'text-[#22C55E]' },
  negotiating:  { label: 'Negotiating',  bg: 'bg-[#3B9EFF]/10', text: 'text-[#3B9EFF]' },
  rejected:     { label: 'Rejected',     bg: 'bg-red-500/10',   text: 'text-red-400' },
  cancelled:    { label: 'Cancelled',    bg: 'bg-gray-500/10',  text: 'text-gray-400' },
  completed:    { label: 'Completed',    bg: 'bg-[#22C55E]/10', text: 'text-[#22C55E]' },
}

export default async function HotelBookingsPage() {
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

  const { data: bookings } = await supabase
    .from('booking_requests')
    .select(
      'id, guest_count, check_in, check_out, total_amount, status, contact_name, contact_email, created_at, layover_id, layovers(flight_number, airline_id, airlines(name))'
    )
    .eq('hotel_id', hotelId)
    .order('created_at', { ascending: false })

  const rows = bookings ?? []

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Bookings"
        subtitle="Manage all booking requests"
      />

      <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#111827] p-5">
        {rows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.06)]">
                  {[
                    'Booking ID',
                    'Flight',
                    'Airline',
                    'Guests',
                    'Check-in',
                    'Check-out',
                    'Amount',
                    'Status',
                    'Date',
                  ].map((col) => (
                    <th
                      key={col}
                      className="px-3 py-2 text-left text-xs font-medium text-[#94A3B8]"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((b) => {
                  const layover = b.layovers as unknown as {
                    flight_number: string
                    airline_id: string
                    airlines: { name: string } | null
                  } | null
                  const status = statusConfig[b.status] ?? {
                    label: b.status,
                    bg: 'bg-gray-500/10',
                    text: 'text-gray-400',
                  }

                  return (
                    <tr
                      key={b.id}
                      className="border-b border-[rgba(255,255,255,0.04)] transition-colors hover:bg-[rgba(255,255,255,0.02)]"
                    >
                      <td className="px-3 py-3 font-mono text-xs text-[#F1F5F9]">
                        {b.id.slice(0, 8)}
                      </td>
                      <td className="px-3 py-3 text-[#F1F5F9]">
                        {layover?.flight_number ?? '—'}
                      </td>
                      <td className="px-3 py-3 text-[#94A3B8]">
                        {layover?.airlines?.name ?? '—'}
                      </td>
                      <td className="px-3 py-3 text-[#F1F5F9]">
                        {b.guest_count}
                      </td>
                      <td className="px-3 py-3 text-[#94A3B8]">
                        {formatDate(b.check_in)}
                      </td>
                      <td className="px-3 py-3 text-[#94A3B8]">
                        {formatDate(b.check_out)}
                      </td>
                      <td className="px-3 py-3 font-medium text-[#F1F5F9]">
                        {formatEuro(b.total_amount ?? 0)}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${status.bg} ${status.text}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-[#94A3B8]">
                        {formatDate(b.created_at)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-12 text-center text-sm text-[#94A3B8]">
            No bookings yet
          </p>
        )}
      </div>
    </div>
  )
}
