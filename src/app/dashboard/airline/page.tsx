'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Star, ArrowRight, Clock, Users, BedDouble, Plane } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const AirlineGlobe = dynamic(
  () => import('@/components/dashboard/AirlineGlobe'),
  { ssr: false }
)

const DEMO_LAYOVER_EVENTS = [
  {
    id: '1',
    flightNumber: 'FB 401',
    airline: 'Bulgaria Air',
    status: 'booking_in_progress' as const,
    pax: 42,
    timeAgo: '12 min ago',
  },
  {
    id: '2',
    flightNumber: 'FB 607',
    airline: 'Bulgaria Air',
    status: 'notified' as const,
    pax: 38,
    timeAgo: '28 min ago',
  },
  {
    id: '3',
    flightNumber: 'FB 215',
    airline: 'Bulgaria Air',
    status: 'booked' as const,
    pax: 32,
    timeAgo: '1 hr ago',
  },
]

const DEMO_HOTELS_NEARBY = [
  {
    id: 'h1',
    name: 'Sofia Hotel Balkan',
    stars: 5,
    availability: 24,
    price: '€89',
  },
  {
    id: 'h2',
    name: 'Hilton Sofia',
    stars: 5,
    availability: 18,
    price: '€105',
  },
  {
    id: 'h3',
    name: 'Ramada by Wyndham',
    stars: 4,
    availability: 32,
    price: '€62',
  },
  {
    id: 'h4',
    name: 'Best Western Premier',
    stars: 4,
    availability: 15,
    price: '€71',
  },
]

const BOOKING_VOLUME = [
  { day: 'Mon', bookings: 14 },
  { day: 'Tue', bookings: 22 },
  { day: 'Wed', bookings: 18 },
  { day: 'Thu', bookings: 31 },
  { day: 'Fri', bookings: 26 },
  { day: 'Sat', bookings: 9 },
  { day: 'Sun', bookings: 12 },
]

const statusConfig: Record<
  string,
  { label: string; dot: string }
> = {
  detected: { label: 'Detected', dot: '#94A3B8' },
  notified: { label: 'Notified', dot: '#0EA5E9' },
  booking_in_progress: { label: 'Booking…', dot: '#F59E0B' },
  booked: { label: 'Booked', dot: '#22C55E' },
  cancelled: { label: 'Cancelled', dot: '#EF4444' },
}

function GlassCard({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-xl bg-white ${className}`}
      style={{ border: '1px solid #E2E8F0' }}
    >
      {children}
    </div>
  )
}

export default function AirlineDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>
          Airline Operations
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#64748B' }}>
          Monitor layovers and bookings in real-time
        </p>
      </div>

      {/* Top row */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left — Globe */}
        <div className="lg:col-span-5">
          <GlassCard className="flex flex-col items-center justify-center p-6 h-full">
            <h2
              className="mb-4 text-xs font-semibold uppercase tracking-widest"
              style={{ color: '#64748B' }}
            >
              Live Layover Network
            </h2>
            <AirlineGlobe />
          </GlassCard>
        </div>

        {/* Right — Bento grid */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Card A — Active Layover Events */}
          <GlassCard className="p-5 flex-1">
            <div className="mb-3 flex items-center justify-between">
              <h2
                className="text-sm font-semibold"
                style={{ color: '#0F172A' }}
              >
                Active Layover Events
              </h2>
              <Link
                href="/dashboard/airline/bookings"
                className="flex items-center gap-1 text-xs font-medium"
                style={{ color: '#0EA5E9' }}
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="space-y-2.5">
              {DEMO_LAYOVER_EVENTS.map((evt) => {
                const cfg = statusConfig[evt.status] ?? statusConfig.detected
                return (
                  <div
                    key={evt.id}
                    className="flex items-center justify-between rounded-lg px-3.5 py-2.5"
                    style={{ backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9' }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: cfg.dot }}
                      />
                      <div>
                        <span
                          className="text-sm font-semibold"
                          style={{ color: '#0F172A' }}
                        >
                          {evt.flightNumber}
                        </span>
                        <span
                          className="ml-2 text-xs"
                          style={{ color: '#64748B' }}
                        >
                          {evt.airline}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span style={{ color: '#64748B' }}>
                        {evt.pax} pax
                      </span>
                      <span style={{ color: '#94A3B8' }}>{evt.timeAgo}</span>
                      <Link
                        href="/dashboard/airline/bookings"
                        className="font-medium"
                        style={{ color: '#0EA5E9' }}
                      >
                        Manage →
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </GlassCard>

          {/* Bottom bento: two columns */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Card B — Today at a Glance */}
            <GlassCard className="p-5">
              <h2
                className="mb-3 text-sm font-semibold"
                style={{ color: '#0F172A' }}
              >
                Today at a Glance
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: 'Active Events',
                    value: '3',
                    icon: <Plane className="h-4 w-4" />,
                  },
                  {
                    label: 'Rooms Booked',
                    value: '56',
                    icon: <BedDouble className="h-4 w-4" />,
                  },
                  {
                    label: 'Pax',
                    value: '112',
                    icon: <Users className="h-4 w-4" />,
                  },
                  {
                    label: 'Avg Response',
                    value: '3.2 min',
                    icon: <Clock className="h-4 w-4" />,
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-lg p-3"
                    style={{ backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9' }}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span style={{ color: '#0EA5E9' }}>{stat.icon}</span>
                      <span
                        className="text-[10px] font-medium uppercase tracking-wider"
                        style={{ color: '#94A3B8' }}
                      >
                        {stat.label}
                      </span>
                    </div>
                    <p
                      className="text-lg font-bold"
                      style={{ color: '#0F172A' }}
                    >
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Card C — Partner Hotels Near SOF */}
            <GlassCard className="p-5">
              <h2
                className="mb-3 text-sm font-semibold"
                style={{ color: '#0F172A' }}
              >
                Partner Hotels Near SOF
              </h2>
              <div className="space-y-2">
                {DEMO_HOTELS_NEARBY.map((hotel) => (
                  <div
                    key={hotel.id}
                    className="flex items-center justify-between rounded-lg px-3 py-2"
                    style={{ backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9' }}
                  >
                    <div>
                      <p
                        className="text-xs font-semibold"
                        style={{ color: '#0F172A' }}
                      >
                        {hotel.name}
                      </p>
                      <div className="mt-0.5 flex items-center gap-1">
                        {Array.from({ length: hotel.stars }).map((_, i) => (
                          <Star
                            key={i}
                            className="h-2.5 w-2.5 fill-current"
                            style={{ color: '#F59E0B' }}
                          />
                        ))}
                        <span
                          className="ml-1.5 text-[10px]"
                          style={{ color: '#94A3B8' }}
                        >
                          {hotel.availability} rooms
                        </span>
                      </div>
                    </div>
                    <span
                      className="text-sm font-bold"
                      style={{ color: '#0EA5E9' }}
                    >
                      {hotel.price}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Bottom — Booking Volume Chart */}
      <GlassCard className="p-6">
        <h2
          className="mb-4 text-sm font-semibold"
          style={{ color: '#0F172A' }}
        >
          Booking Volume — Last 7 Days
        </h2>
        <div style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={BOOKING_VOLUME}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fill: '#64748B' }}
                axisLine={{ stroke: '#E2E8F0' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#64748B' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: 8,
                  fontSize: 13,
                  color: '#0F172A',
                }}
              />
              <Bar
                dataKey="bookings"
                fill="#0EA5E9"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  )
}
