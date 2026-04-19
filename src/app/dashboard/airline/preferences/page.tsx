'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

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
  {
    id: 'h5',
    name: 'Grand Hotel Sofia',
    stars: 5,
    availability: 12,
    price: '€95',
  },
  {
    id: 'h6',
    name: 'Holiday Inn Sofia',
    stars: 4,
    availability: 28,
    price: '€58',
  },
]

export default function AirlinePreferencesPage() {
  const [preferred, setPreferred] = useState<Set<string>>(
    new Set(['h1', 'h2'])
  )

  function togglePreferred(hotelId: string) {
    setPreferred((prev) => {
      const next = new Set(prev)
      if (next.has(hotelId)) {
        next.delete(hotelId)
      } else {
        next.add(hotelId)
      }
      return next
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>
          Hotel Preferences
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#64748B' }}>
          Select your preferred partner hotels for layover bookings
        </p>
      </div>

      {/* Hotel grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DEMO_HOTELS_NEARBY.map((hotel) => {
          const isPreferred = preferred.has(hotel.id)
          return (
            <div
              key={hotel.id}
              className="rounded-xl bg-white p-5 transition-all"
              style={{
                border: isPreferred
                  ? '2px solid #0EA5E9'
                  : '1px solid #E2E8F0',
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3
                    className="font-semibold"
                    style={{ color: '#0F172A' }}
                  >
                    {hotel.name}
                  </h3>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="flex items-center gap-0.5">
                      {Array.from({ length: hotel.stars }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-3 w-3 fill-current"
                          style={{ color: '#F59E0B' }}
                        />
                      ))}
                    </span>
                    <span className="text-xs" style={{ color: '#94A3B8' }}>
                      {hotel.availability} rooms available
                    </span>
                  </div>
                </div>
                <span
                  className="text-lg font-bold"
                  style={{ color: '#0EA5E9' }}
                >
                  {hotel.price}
                </span>
              </div>

              <button
                onClick={() => togglePreferred(hotel.id)}
                className="mt-4 w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                style={
                  isPreferred
                    ? {
                        backgroundColor: 'rgba(14,165,233,0.1)',
                        color: '#0EA5E9',
                        border: '1px solid rgba(14,165,233,0.3)',
                      }
                    : {
                        backgroundColor: '#F8FAFC',
                        color: '#64748B',
                        border: '1px solid #E2E8F0',
                      }
                }
              >
                {isPreferred ? '★ Preferred' : 'Set Preferred'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
