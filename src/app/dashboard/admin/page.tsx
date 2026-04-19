'use client'

import AeroStatCard from '@/components/ui/AeroStatCard'
import StatusBadge from '@/components/ui/StatusBadge'
import ShimmerButton from '@/components/ui/ShimmerButton'
import GlassCard from '@/components/ui/GlassCard'
import { formatEuro } from '@/lib/format'
import { timeAgo } from '@/lib/demo'
import { Building2, Plane, AlertTriangle, DollarSign } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'

const statusBorderColors: Record<string, string> = {
  confirmed: '#10B981',
  pending: '#F5A623',
  negotiating: '#0EA5E9',
}

const recentActivity = [
  { hotel: 'Hyatt Regency', airline: 'Bulgaria Air', status: 'confirmed', amount: 2314, time: new Date(Date.now() - 3 * 60000).toISOString() },
  { hotel: 'Hilton Sofia', airline: 'Turkish Airlines', status: 'pending', amount: 3740, time: new Date(Date.now() - 8 * 60000).toISOString() },
  { hotel: 'Radisson Blu', airline: 'Wizz Air', status: 'confirmed', amount: 1501, time: new Date(Date.now() - 22 * 60000).toISOString() },
  { hotel: 'InterContinental', airline: 'Austrian Airlines', status: 'negotiating', amount: 1485, time: new Date(Date.now() - 35 * 60000).toISOString() },
  { hotel: 'Marinela Hotel', airline: 'Ryanair', status: 'confirmed', amount: 6175, time: new Date(Date.now() - 52 * 60000).toISOString() },
  { hotel: 'Hyatt Regency', airline: 'Lufthansa', status: 'pending', amount: 4450, time: new Date(Date.now() - 67 * 60000).toISOString() },
  { hotel: 'Hilton Sofia', airline: 'Bulgaria Air', status: 'confirmed', amount: 890, time: new Date(Date.now() - 90 * 60000).toISOString() },
  { hotel: 'Radisson Blu', airline: 'Turkish Airlines', status: 'confirmed', amount: 2370, time: new Date(Date.now() - 120 * 60000).toISOString() },
]

const revenueData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  revenue: 600 + Math.floor(Math.random() * 400) + i * 15,
}))

function HealthRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span style={{ color: '#0F172A', fontSize: 14 }}>{label}</span>
      <span
        className="inline-flex items-center gap-1.5"
        style={{ fontSize: 13, fontWeight: 500, color: ok ? '#059669' : '#DC2626' }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: ok ? '#10B981' : '#EF4444',
            display: 'inline-block',
          }}
        />
        {ok ? 'Operational' : 'Down'}
      </span>
    </div>
  )
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A' }}>
          Platform Overview
        </h1>
        <p style={{ fontSize: 14, color: '#64748B', marginTop: 2 }}>
          AeroStay administration panel
        </p>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AeroStatCard
          label="Total Hotels"
          value={12}
          icon={<Building2 className="h-5 w-5" />}
          color="#0F172A"
        />
        <AeroStatCard
          label="Total Airlines"
          value={8}
          icon={<Plane className="h-5 w-5" />}
          color="#0F172A"
        />
        <AeroStatCard
          label="Layovers This Month"
          value={47}
          trend={18}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="#0F172A"
        />
        <AeroStatCard
          label="Platform Revenue"
          value="€18,432"
          trend={12}
          icon={<DollarSign className="h-5 w-5" />}
          color="#0F172A"
        />
      </div>

      {/* Two-column section */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left — 60% */}
        <div className="lg:col-span-3">
          <GlassCard>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginBottom: 16 }}>
              Recent Platform Activity
            </h2>
            <div className="space-y-2">
              {recentActivity.map((entry, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5"
                  style={{
                    borderLeft: `3px solid ${statusBorderColors[entry.status] ?? '#94A3B8'}`,
                    background: '#F8FAFC',
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span style={{ fontWeight: 600, color: '#0F172A' }}>
                        {entry.hotel}
                      </span>
                      <span style={{ color: '#94A3B8' }}>·</span>
                      <span style={{ color: '#64748B' }}>{entry.airline}</span>
                    </div>
                  </div>
                  <StatusBadge status={entry.status} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap' }}>
                    {formatEuro(entry.amount)}
                  </span>
                  <span style={{ fontSize: 12, color: '#94A3B8', whiteSpace: 'nowrap' }}>
                    {timeAgo(entry.time)}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right — 40% */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginBottom: 16 }}>
              Quick Actions
            </h2>
            <div className="flex flex-col gap-3">
              <ShimmerButton color="blue" size="md">Add Hotel Manually</ShimmerButton>
              <ShimmerButton color="green" size="md">Send Announcement</ShimmerButton>
            </div>
          </GlassCard>

          <GlassCard>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginBottom: 16 }}>
              Platform Health
            </h2>
            <div className="divide-y" style={{ borderColor: '#E2E8F0' }}>
              <HealthRow label="API Status" ok />
              <HealthRow label="Database" ok />
              <HealthRow label="Email Service" ok />
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Revenue chart */}
      <GlassCard>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginBottom: 16 }}>
          Revenue — Last 30 Days
        </h2>
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(14,165,233,0.08)" />
                  <stop offset="100%" stopColor="rgba(14,165,233,0)" />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 11 }}
                width={40}
                tickFormatter={(v: number) => `€${v}`}
              />
              <Tooltip
                contentStyle={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: 8,
                  color: '#0F172A',
                  fontSize: 13,
                }}
                formatter={(value) => [`€${Number(value).toLocaleString()}`, 'Revenue']}
                labelFormatter={(label) => `Day ${label}`}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#0EA5E9"
                strokeWidth={2}
                fill="url(#revenueGrad)"
                dot={false}
                activeDot={{ r: 4, fill: '#0EA5E9', stroke: '#FFFFFF', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  )
}
