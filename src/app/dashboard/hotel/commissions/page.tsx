'use client'

import { DEMO_MODE, DEMO_HOTEL } from '@/lib/demo'
import { formatEuro } from '@/lib/format'
import AeroStatCard from '@/components/ui/AeroStatCard'
import StatusBadge from '@/components/ui/StatusBadge'
import { DollarSign, Clock, FileText, CheckCircle2, TrendingUp } from 'lucide-react'

const demoCommissions = [
  { id: 'c1', period: '2026-04', amount: 391, rate: 0.08, status: 'pending', bookingRef: 'BK-2841', airline: 'Wizz Air', bookingAmount: 4892 },
  { id: 'c2', period: '2026-03', amount: 523, rate: 0.08, status: 'billed', bookingRef: 'BK-2738', airline: 'Bulgaria Air', bookingAmount: 6538 },
  { id: 'c3', period: '2026-02', amount: 289, rate: 0.08, status: 'paid', bookingRef: 'BK-2654', airline: 'Turkish Airlines', bookingAmount: 3613 },
  { id: 'c4', period: '2026-01', amount: 412, rate: 0.08, status: 'paid', bookingRef: 'BK-2501', airline: 'Austrian Airlines', bookingAmount: 5150 },
  { id: 'c5', period: '2025-12', amount: 678, rate: 0.08, status: 'paid', bookingRef: 'BK-2389', airline: 'Ryanair', bookingAmount: 8475 },
]

const totalOwed = demoCommissions.reduce((s, c) => s + c.amount, 0)
const pendingAmount = demoCommissions.filter((c) => c.status === 'pending').reduce((s, c) => s + c.amount, 0)
const billedAmount = demoCommissions.filter((c) => c.status === 'billed').reduce((s, c) => s + c.amount, 0)
const paidAmount = demoCommissions.filter((c) => c.status === 'paid').reduce((s, c) => s + c.amount, 0)

const monthlyBreakdown = [
  { month: '2026-04', total: 391, count: 1 },
  { month: '2026-03', total: 523, count: 2 },
  { month: '2026-02', total: 289, count: 1 },
  { month: '2026-01', total: 412, count: 2 },
  { month: '2025-12', total: 678, count: 3 },
]

export default function CommissionsPage() {
  const card: React.CSSProperties = {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 12,
    padding: 24,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>
          Commissions
        </h1>
        <p style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>
          Track your platform commission obligations
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <AeroStatCard
          label="Total Owed"
          value={formatEuro(totalOwed)}
          icon={<DollarSign size={18} />}
        />
        <AeroStatCard
          label="Pending"
          value={formatEuro(pendingAmount)}
          icon={<Clock size={18} />}
          color="#F59E0B"
        />
        <AeroStatCard
          label="Billed"
          value={formatEuro(billedAmount)}
          icon={<FileText size={18} />}
          color="#0EA5E9"
        />
        <AeroStatCard
          label="Paid"
          value={formatEuro(paidAmount)}
          icon={<CheckCircle2 size={18} />}
          color="#10B981"
        />
      </div>

      {/* Commission Details Table */}
      <div style={card}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginBottom: 16 }}>
          Commission Details
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFF' }}>
                {['Booking', 'Airline', 'Booking Amount', 'Rate', 'Commission', 'Period', 'Status'].map(
                  (col) => (
                    <th
                      key={col}
                      style={{
                        padding: '10px 14px',
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: '#94A3B8',
                        textAlign: 'left',
                        borderBottom: '1px solid #E2E8F0',
                      }}
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {demoCommissions.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td
                    style={{
                      padding: '12px 14px',
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 12,
                      color: '#0F172A',
                    }}
                  >
                    {c.bookingRef}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 14, color: '#64748B' }}>
                    {c.airline}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 14, color: '#0F172A' }}>
                    {formatEuro(c.bookingAmount)}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 14, color: '#64748B' }}>
                    {(c.rate * 100).toFixed(0)}%
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 14, fontWeight: 600, color: '#0F172A' }}>
                    {formatEuro(c.amount)}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 14, color: '#64748B' }}>
                    {c.period}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <StatusBadge status={c.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div style={card}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={18} color="#0EA5E9" />
          Monthly Breakdown
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {monthlyBreakdown.map((m) => (
            <div
              key={m.month}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 14,
                border: '1px solid #E2E8F0',
                borderRadius: 8,
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>
                  {m.month}
                </div>
                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
                  {m.count} commission{m.count !== 1 ? 's' : ''}
                </div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>
                {formatEuro(m.total)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
