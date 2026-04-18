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

const data = [
  { day: 'Mon', revenue: 2400 },
  { day: 'Tue', revenue: 1800 },
  { day: 'Wed', revenue: 3200 },
  { day: 'Thu', revenue: 2800 },
  { day: 'Fri', revenue: 3600 },
  { day: 'Sat', revenue: 2200 },
  { day: 'Sun', revenue: 1500 },
]

export function RevenueChart() {
  return (
    <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#111827] p-5">
      <h3 className="mb-4 text-sm font-semibold text-[#F1F5F9]">
        Revenue This Week
      </h3>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.06)"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 12 }}
              tickFormatter={(v) => `€${v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1E293B',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#F1F5F9',
                fontSize: 13,
              }}
              formatter={(value) => [`€${Number(value).toLocaleString()}`, 'Revenue']}
              cursor={{ fill: 'rgba(59,158,255,0.08)' }}
            />
            <Bar
              dataKey="revenue"
              fill="#3B9EFF"
              radius={[4, 4, 0, 0]}
              maxBarSize={36}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
