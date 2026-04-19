'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { DEMO_BOOKING_HISTORY } from '@/lib/demo'

const revenueData = DEMO_BOOKING_HISTORY.map((d) => ({
  day: d.day,
  revenue: d.rooms * 89,
}))

export function RevenueChart() {
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: 12,
        padding: 20,
      }}
    >
      <h3
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: '#0F172A',
          marginBottom: 16,
        }}
      >
        Revenue This Week
      </h3>
      <div style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={revenueData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E2E8F0"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 12 }}
              tickFormatter={(v) => `€${v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: 8,
                color: '#0F172A',
                fontSize: 13,
              }}
              formatter={(value) => [
                `€${Number(value).toLocaleString()}`,
                'Revenue',
              ]}
              cursor={{ fill: 'rgba(14,165,233,0.06)' }}
            />
            <Bar
              dataKey="revenue"
              fill="#0EA5E9"
              radius={[4, 4, 0, 0]}
              maxBarSize={36}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
