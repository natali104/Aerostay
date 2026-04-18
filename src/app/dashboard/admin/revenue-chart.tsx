'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

function generateData() {
  const data: { date: string; revenue: number }[] = []
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const day = d.getDate().toString().padStart(2, '0')
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ]
    data.push({
      date: `${day} ${months[d.getMonth()]}`,
      revenue: Math.floor(Math.random() * 3200) + 800,
    })
  }
  return data
}

const sampleData = generateData()

export function RevenueChart() {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#111827] p-6">
      <h2 className="mb-4 text-lg font-semibold text-[#F1F5F9]">
        Platform Revenue (30 Days)
      </h2>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sampleData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.06)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 12 }}
              tickFormatter={(v: number) => `€${v.toLocaleString()}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1E293B',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#F1F5F9',
              }}
              formatter={(value) => [
                `€${Number(value).toLocaleString()}`,
                'Revenue',
              ]}
              labelStyle={{ color: '#94A3B8' }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#3B9EFF"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#3B9EFF', stroke: '#111827', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
