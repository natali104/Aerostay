'use client'

import { useState } from 'react'
import Link from 'next/link'

const DEMO_LAYOVER_EVENTS = [
  {
    id: '1',
    flight: 'FB 401',
    airport: 'SOF',
    status: 'booking_in_progress' as const,
    pax: 42,
    rooms: 21,
    hotelsContacted: 4,
    confirmed: 2,
    time: '12 min ago',
  },
  {
    id: '2',
    flight: 'FB 607',
    airport: 'SOF',
    status: 'notified' as const,
    pax: 38,
    rooms: 19,
    hotelsContacted: 3,
    confirmed: 0,
    time: '28 min ago',
  },
  {
    id: '3',
    flight: 'FB 215',
    airport: 'SOF',
    status: 'booked' as const,
    pax: 32,
    rooms: 16,
    hotelsContacted: 2,
    confirmed: 2,
    time: '1 hr ago',
  },
  {
    id: '4',
    flight: 'FB 310',
    airport: 'SOF',
    status: 'detected' as const,
    pax: 55,
    rooms: 28,
    hotelsContacted: 0,
    confirmed: 0,
    time: '2 hr ago',
  },
  {
    id: '5',
    flight: 'FB 122',
    airport: 'SOF',
    status: 'booked' as const,
    pax: 27,
    rooms: 14,
    hotelsContacted: 3,
    confirmed: 3,
    time: '5 hr ago',
  },
  {
    id: '6',
    flight: 'FB 508',
    airport: 'SOF',
    status: 'cancelled' as const,
    pax: 18,
    rooms: 9,
    hotelsContacted: 2,
    confirmed: 0,
    time: '8 hr ago',
  },
]

type Status = 'detected' | 'notified' | 'booking_in_progress' | 'booked' | 'cancelled'

const statusConfig: Record<Status, { label: string; bg: string; text: string }> = {
  detected: { label: 'Detected', bg: '#F1F5F9', text: '#64748B' },
  notified: { label: 'Notified', bg: '#E0F2FE', text: '#0369A1' },
  booking_in_progress: { label: 'Booking…', bg: '#FEF3C7', text: '#92400E' },
  booked: { label: 'Booked', bg: '#DCFCE7', text: '#166534' },
  cancelled: { label: 'Cancelled', bg: '#FEE2E2', text: '#991B1B' },
}

const filterOptions: { label: string; value: Status | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Detected', value: 'detected' },
  { label: 'Notified', value: 'notified' },
  { label: 'Booking…', value: 'booking_in_progress' },
  { label: 'Booked', value: 'booked' },
  { label: 'Cancelled', value: 'cancelled' },
]

function StatusBadge({ status }: { status: Status }) {
  const cfg = statusConfig[status]
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: cfg.bg, color: cfg.text }}
    >
      {cfg.label}
    </span>
  )
}

export default function AirlineBookingsPage() {
  const [filter, setFilter] = useState<Status | 'all'>('all')

  const filtered =
    filter === 'all'
      ? DEMO_LAYOVER_EVENTS
      : DEMO_LAYOVER_EVENTS.filter((e) => e.status === filter)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>
          Booking History
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#64748B' }}>
          All layover events and booking requests
        </p>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className="rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors"
            style={
              filter === opt.value
                ? { backgroundColor: '#0EA5E9', color: '#FFFFFF' }
                : { backgroundColor: '#FFFFFF', color: '#64748B', border: '1px solid #E2E8F0' }
            }
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div
        className="overflow-hidden rounded-xl bg-white"
        style={{ border: '1px solid #E2E8F0' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                {[
                  'Flight',
                  'Airport',
                  'Status',
                  'Pax',
                  'Rooms',
                  'Hotels Contacted',
                  'Confirmed',
                  'Time',
                  'Actions',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: '#64748B' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, idx) => (
                <tr
                  key={row.id}
                  className="transition-colors hover:bg-[#F8FAFC]"
                  style={{
                    borderBottom:
                      idx < filtered.length - 1
                        ? '1px solid #F1F5F9'
                        : undefined,
                  }}
                >
                  <td
                    className="whitespace-nowrap px-5 py-3.5 font-semibold"
                    style={{ color: '#0F172A' }}
                  >
                    {row.flight}
                  </td>
                  <td
                    className="whitespace-nowrap px-5 py-3.5"
                    style={{ color: '#64748B' }}
                  >
                    {row.airport}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <StatusBadge status={row.status} />
                  </td>
                  <td
                    className="whitespace-nowrap px-5 py-3.5"
                    style={{ color: '#0F172A' }}
                  >
                    {row.pax}
                  </td>
                  <td
                    className="whitespace-nowrap px-5 py-3.5"
                    style={{ color: '#0F172A' }}
                  >
                    {row.rooms}
                  </td>
                  <td
                    className="whitespace-nowrap px-5 py-3.5"
                    style={{ color: '#64748B' }}
                  >
                    {row.hotelsContacted}
                  </td>
                  <td
                    className="whitespace-nowrap px-5 py-3.5"
                    style={{ color: '#64748B' }}
                  >
                    {row.confirmed}
                  </td>
                  <td
                    className="whitespace-nowrap px-5 py-3.5"
                    style={{ color: '#94A3B8' }}
                  >
                    {row.time}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <Link
                      href={`/dashboard/airline/layovers/${row.id}`}
                      className="text-xs font-medium"
                      style={{ color: '#0EA5E9' }}
                    >
                      View Details →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
