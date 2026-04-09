import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/ui/stat-card'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils'
import {
  DollarSign,
  Clock,
  FileText,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react'

export default async function CommissionsPage() {
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

  const { data: commissions } = await supabase
    .from('commissions')
    .select(
      '*, booking:bookings(id, check_in, check_out, total_amount, airline:airlines(name))'
    )
    .eq('hotel_id', hotelId)
    .order('created_at', { ascending: false })

  const allCommissions = commissions ?? []

  const totalOwed = allCommissions.reduce(
    (sum, c) => sum + (c.amount ?? 0),
    0
  )
  const pendingAmount = allCommissions
    .filter((c) => c.status === 'pending')
    .reduce((sum, c) => sum + (c.amount ?? 0), 0)
  const billedAmount = allCommissions
    .filter((c) => c.status === 'billed')
    .reduce((sum, c) => sum + (c.amount ?? 0), 0)
  const paidAmount = allCommissions
    .filter((c) => c.status === 'paid')
    .reduce((sum, c) => sum + (c.amount ?? 0), 0)

  const monthlyBreakdown = new Map<string, { total: number; count: number }>()
  for (const c of allCommissions) {
    const month = c.period ?? c.created_at?.slice(0, 7) ?? 'Unknown'
    const existing = monthlyBreakdown.get(month) ?? { total: 0, count: 0 }
    existing.total += c.amount ?? 0
    existing.count++
    monthlyBreakdown.set(month, existing)
  }
  const sortedMonths = Array.from(monthlyBreakdown.entries()).sort(
    (a, b) => b[0].localeCompare(a[0])
  )

  const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
    pending: 'warning',
    billed: 'info',
    paid: 'success',
    overdue: 'danger',
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1e3a5f]">Commissions</h1>
        <p className="mt-1 text-gray-500">
          Track your platform commission obligations
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Owed"
          value={formatCurrency(totalOwed)}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          label="Pending"
          value={formatCurrency(pendingAmount)}
          icon={<Clock className="h-5 w-5" />}
        />
        <StatCard
          label="Billed"
          value={formatCurrency(billedAmount)}
          icon={<FileText className="h-5 w-5" />}
        />
        <StatCard
          label="Paid"
          value={formatCurrency(paidAmount)}
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Commission Details</CardTitle>
        </CardHeader>
        <CardContent>
          {allCommissions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking</TableHead>
                  <TableHead>Airline</TableHead>
                  <TableHead>Booking Amount</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allCommissions.map((commission: Record<string, unknown> & { id: string; booking?: { id: string; total_amount: number; airline?: { name: string } }; rate?: number; amount: number; period?: string; status: string }) => (
                  <TableRow key={commission.id}>
                    <TableCell className="font-mono text-xs">
                      {commission.booking?.id?.slice(0, 8) ?? '—'}
                    </TableCell>
                    <TableCell>
                      {commission.booking?.airline?.name ?? '—'}
                    </TableCell>
                    <TableCell>
                      {commission.booking?.total_amount
                        ? formatCurrency(commission.booking.total_amount)
                        : '—'}
                    </TableCell>
                    <TableCell>
                      {commission.rate != null
                        ? `${(commission.rate * 100).toFixed(1)}%`
                        : '—'}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(commission.amount)}
                    </TableCell>
                    <TableCell>
                      {commission.period ?? '—'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          statusVariant[commission.status] ?? 'default'
                        }
                      >
                        {commission.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-12 text-center text-sm text-gray-400">
              No commission records yet
            </p>
          )}
        </CardContent>
      </Card>

      {sortedMonths.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#38bdf8]" />
              Monthly Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sortedMonths.map(([month, data]) => (
                <div
                  key={month}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-4"
                >
                  <div>
                    <p className="font-medium text-[#1e3a5f]">{month}</p>
                    <p className="text-xs text-gray-500">
                      {data.count} commission{data.count !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-[#1e3a5f]">
                    {formatCurrency(data.total)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
