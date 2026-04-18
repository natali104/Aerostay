'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { Star, MapPin } from 'lucide-react'

interface Hotel {
  id: string
  name: string
  star_rating: number
  city: string
  is_active: boolean
}

interface Preference {
  hotel_id: string
  is_preferred: boolean
  priority: number
}

export default function AirlinePreferencesPage() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [preferences, setPreferences] = useState<Map<string, Preference>>(
    new Map()
  )
  const [airlineId, setAirlineId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('airline_id')
      .eq('id', user.id)
      .single()

    if (!profile?.airline_id) return
    setAirlineId(profile.airline_id)

    const [hotelsRes, prefsRes] = await Promise.all([
      supabase
        .from('hotels')
        .select('id, name, star_rating, city, is_active')
        .eq('is_active', true)
        .order('name'),
      supabase
        .from('airline_hotel_preferences')
        .select('hotel_id, is_preferred, priority')
        .eq('airline_id', profile.airline_id),
    ])

    setHotels(hotelsRes.data ?? [])

    const prefMap = new Map<string, Preference>()
    for (const p of prefsRes.data ?? []) {
      prefMap.set(p.hotel_id, {
        hotel_id: p.hotel_id,
        is_preferred: p.is_preferred ?? false,
        priority: p.priority ?? 0,
      })
    }
    setPreferences(prefMap)
    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData()
  }, [loadData])

  async function togglePreferred(hotelId: string) {
    if (!airlineId) return
    setSaving(hotelId)

    const current = preferences.get(hotelId)
    const newVal = !(current?.is_preferred ?? false)

    const supabase = createClient()

    await supabase.from('airline_hotel_preferences').upsert(
      {
        airline_id: airlineId,
        hotel_id: hotelId,
        is_preferred: newVal,
        priority: current?.priority ?? 0,
      },
      { onConflict: 'airline_id,hotel_id' }
    )

    setPreferences((prev) => {
      const next = new Map(prev)
      next.set(hotelId, {
        hotel_id: hotelId,
        is_preferred: newVal,
        priority: current?.priority ?? 0,
      })
      return next
    })

    setSaving(null)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B1120]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#3B9EFF] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B1120] p-6">
      <DashboardHeader
        title="Hotel Preferences"
        subtitle="Manage your preferred hotels for layover bookings"
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {hotels.map((hotel) => {
          const pref = preferences.get(hotel.id)
          const isPreferred = pref?.is_preferred ?? false
          const isSaving = saving === hotel.id

          return (
            <div
              key={hotel.id}
              className={`rounded-xl bg-[#111827] p-5 transition-all ${
                isPreferred
                  ? 'border-2 border-[#3B9EFF]'
                  : 'border border-white/[0.08]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[#F1F5F9]">
                      {hotel.name}
                    </h3>
                    {isPreferred && (
                      <Star className="h-4 w-4 fill-[#3B9EFF] text-[#3B9EFF]" />
                    )}
                  </div>
                  <div className="mt-1.5 flex items-center gap-3 text-sm text-[#94A3B8]">
                    <span className="flex items-center gap-0.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {hotel.city}
                    </span>
                    <span className="flex items-center gap-0.5 text-[#F5A623]">
                      {Array.from({ length: hotel.star_rating ?? 0 }).map(
                        (_, i) => (
                          <Star key={i} className="h-3 w-3 fill-current" />
                        )
                      )}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => togglePreferred(hotel.id)}
                  disabled={isSaving}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    isPreferred
                      ? 'bg-[#3B9EFF]/20 text-[#3B9EFF] hover:bg-[#3B9EFF]/30'
                      : 'bg-white/[0.06] text-[#94A3B8] hover:bg-white/[0.1] hover:text-[#F1F5F9]'
                  }`}
                >
                  {isSaving
                    ? '...'
                    : isPreferred
                      ? 'Preferred'
                      : 'Set Preferred'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {hotels.length === 0 && (
        <p className="py-16 text-center text-[#94A3B8]">
          No active hotels available
        </p>
      )}
    </div>
  )
}
