import {
  DollarSign,
  Clock,
  FileText,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react'
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
import { formatCurrency, formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'

const statusVariant: Record<string, 'info' | 'warning' | 'success' | 'danger' | 'default'> = {
  pending: 'warning',
  billed: 'info',
  paid: 'success',
  overdue: 'danger',
  waived: 'default',
}

export default async function AdminCommissionsPage() {
  const supabase = await createClient()

  const { data: commissions } = await supabase
    .from('commissions')
    .select(
      '*, hotel:hotels(name), booking:booking_requests(id)'
    )
    .order('created_at', { ascending: false })

  const allCommissions = commissions ?? []

  const totalEarned = allCommissions.reduce(
    (sum: number, c: any) => sum + (c.amount ?? 0),
    0
  )
  const pendingAmount = allCommissions
    .filter((c: any) => c.status === 'pending')
    .reduce((sum: number, c: any) => sum + (c.amount ?? 0), 0)
  const billedAmount = allCommissions
    .filter((c: any) => c.status === 'billed')
    .reduce((sum: number, c: any) => sum + (c.amount ?? 0), 0)
  const paidAmount = allCommissions
    .filter((c: any) => c.status === 'paid')
    .reduce((sum: number, c: any) => sum + (c.amount ?? 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1e3a5f]">Commissions</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track and manage commission earnings from hotel bookings
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Earned"
          value={formatCurrency(totalEarned)}
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
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Commission Records
              <Badge variant="default">{allCommissions.length}</Badge>
            </CardTitle>
            <div className="flex gap-2">
              <form method="POST" action="/api/commissions/bulk-bill">
                <button
                  type="submit"
                  className="h-9 rounded-lg border border-[#1e3a5f] bg-transparent px-4 text-sm font-medium text-[#1e3a5f] hover:bg-[#1e3a5f]/5 transition-colors"
                >
                  Mark as Billed
                </button>
              </form>
              <form method="POST" action="/api/commissions/bulk-pay">
                <button
                  type="submit"
                  className="h-9 rounded-lg bg-[#1e3a5f] px-4 text-sm font-medium text-white hover:bg-[#162d4a] transition-colors"
                >
                  Mark as Paid
                </button>
              </form>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hotel</TableHead>
                <TableHead>Booking</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Billing Period</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allCommissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                    No commissions found
                  </TableCell>
                </TableRow>
              ) : (
                allCommissions.map((commission: any) => (
                  <TableRow key={commission.id}>
                    <TableCell className="font-medium">
                      {commission.hotel?.name ?? '—'}
                    </TableCell>
                    <TableCell>
                      {commission.booking?.id ? (
                        <span className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-700">
                          {commission.booking.id.slice(0, 8)}
                        </span>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {commission.amount != null
                        ? formatCurrency(commission.amount)
                        : '—'}
                    </TableCell>
                    <TableCell>
                      {commission.rate != null
                        ? `${commission.rate}%`
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[commission.status] ?? 'default'}>
                        {commission.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-gray-500">
                      {commission.billing_period_start && commission.billing_period_end ? (
                        <>
                          {formatDate(commission.billing_period_start)}
                          {' — '}
                          {formatDate(commission.billing_period_end)}
                        </>
                      ) : commission.created_at ? (
                        formatDate(commission.created_at)
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>
                      <button className="inline-flex items-center gap-1 text-sm text-[#38bdf8] hover:underline">
                        <ExternalLink className="h-3.5 w-3.5" />
                        View
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
