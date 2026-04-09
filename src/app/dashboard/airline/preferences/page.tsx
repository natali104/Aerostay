'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Heart, Star, MapPin, GripVertical, Save } from 'lucide-react'

interface Hotel {
  id: string
  name: string
  star_rating: number
  city: string
  distance_km?: number
  avg_price?: number
  image_url?: string
}

interface Preference {
  hotel_id: string
  priority: number
  is_preferred: boolean
}

export default function AirlinePreferencesPage() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [preferences, setPreferences] = useState<Map<string, Preference>>(new Map())
  const [airlineId, setAirlineId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const loadData = useCallback(async () => {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
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
        .select('id, name, star_rating, city, distance_km, image_url')
        .eq('is_active', true)
        .order('name'),
      supabase
        .from('airline_hotel_preferences')
        .select('hotel_id, priority, is_preferred')
        .eq('airline_id', profile.airline_id),
    ])

    setHotels(hotelsRes.data ?? [])

    const prefMap = new Map<string, Preference>()
    for (const p of prefsRes.data ?? []) {
      prefMap.set(p.hotel_id, {
        hotel_id: p.hotel_id,
        priority: p.priority ?? 0,
        is_preferred: p.is_preferred ?? false,
      })
    }
    setPreferences(prefMap)
    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData()
  }, [loadData])

  function togglePreferred(hotelId: string) {
    setPreferences((prev) => {
      const next = new Map(prev)
      const existing = next.get(hotelId)
      if (existing) {
        next.set(hotelId, { ...existing, is_preferred: !existing.is_preferred })
      } else {
        next.set(hotelId, { hotel_id: hotelId, priority: 0, is_preferred: true })
      }
      return next
    })
    setSaved(false)
  }

  function setPriority(hotelId: string, priority: number) {
    setPreferences((prev) => {
      const next = new Map(prev)
      const existing = next.get(hotelId)
      if (existing) {
        next.set(hotelId, { ...existing, priority })
      } else {
        next.set(hotelId, { hotel_id: hotelId, priority, is_preferred: true })
      }
      return next
    })
    setSaved(false)
  }

  async function handleSave() {
    if (!airlineId) return
    setSaving(true)

    const supabase = createClient()

    await supabase
      .from('airline_hotel_preferences')
      .delete()
      .eq('airline_id', airlineId)

    const rows = Array.from(preferences.values())
      .filter((p) => p.is_preferred || p.priority > 0)
      .map((p) => ({
        airline_id: airlineId,
        hotel_id: p.hotel_id,
        priority: p.priority,
        is_preferred: p.is_preferred,
      }))

    if (rows.length > 0) {
      await supabase.from('airline_hotel_preferences').insert(rows)
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const preferredHotels = hotels.filter((h) => preferences.get(h.id)?.is_preferred)
  const otherHotels = hotels.filter((h) => !preferences.get(h.id)?.is_preferred)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1e3a5f] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Hotel Preferences</h1>
          <p className="mt-1 text-sm text-gray-500">
            Select and prioritize your preferred hotels for layover bookings
          </p>
        </div>
        <Button onClick={handleSave} loading={saving} size="md">
          <Save className="h-4 w-4" />
          {saved ? 'Saved!' : 'Save Preferences'}
        </Button>
      </div>

      {preferredHotels.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-500" />
              Preferred Hotels ({preferredHotels.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {preferredHotels
                .sort((a, b) => {
                  const pa = preferences.get(a.id)?.priority ?? 0
                  const pb = preferences.get(b.id)?.priority ?? 0
                  return pb - pa
                })
                .map((hotel) => (
                  <HotelRow
                    key={hotel.id}
                    hotel={hotel}
                    pref={preferences.get(hotel.id)}
                    onToggle={() => togglePreferred(hotel.id)}
                    onPriorityChange={(p) => setPriority(hotel.id, p)}
                  />
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            Available Hotels ({otherHotels.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {otherHotels.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">
              All hotels have been marked as preferred
            </p>
          ) : (
            <div className="space-y-3">
              {otherHotels.map((hotel) => (
                <HotelRow
                  key={hotel.id}
                  hotel={hotel}
                  pref={preferences.get(hotel.id)}
                  onToggle={() => togglePreferred(hotel.id)}
                  onPriorityChange={(p) => setPriority(hotel.id, p)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function HotelRow({
  hotel,
  pref,
  onToggle,
  onPriorityChange,
}: {
  hotel: Hotel
  pref?: Preference
  onToggle: () => void
  onPriorityChange: (p: number) => void
}) {
  const isPreferred = pref?.is_preferred ?? false

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-100 p-4 transition-colors hover:bg-gray-50/50 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <GripVertical className="hidden h-5 w-5 shrink-0 text-gray-300 sm:block" />
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#1e3a5f]/5">
          {hotel.image_url ? (
            <Image
              src={hotel.image_url}
              alt={hotel.name}
              width={48}
              height={48}
              className="h-12 w-12 rounded-lg object-cover"
            />
          ) : (
            <span className="text-lg font-bold text-[#1e3a5f]">
              {hotel.name.charAt(0)}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-[#1e3a5f]">{hotel.name}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span className="flex items-center gap-0.5">
              {Array.from({ length: hotel.star_rating || 0 }).map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
              ))}
            </span>
            {hotel.city && (
              <span className="flex items-center gap-0.5">
                <MapPin className="h-3 w-3" />
                {hotel.city}
              </span>
            )}
            {hotel.distance_km != null && (
              <Badge variant="info">{hotel.distance_km} km from airport</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:shrink-0">
        {isPreferred && (
          <div className="w-20">
            <Input
              type="number"
              min={0}
              max={100}
              value={pref?.priority ?? 0}
              onChange={(e) => onPriorityChange(Number(e.target.value))}
              className="h-8 text-center text-sm"
              aria-label="Priority"
            />
            <p className="mt-0.5 text-center text-[10px] text-gray-400">Priority</p>
          </div>
        )}
        <button
          onClick={onToggle}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          style={{
            background: isPreferred ? 'rgb(254 242 242)' : 'rgb(240 253 244)',
            color: isPreferred ? 'rgb(220 38 38)' : 'rgb(22 163 74)',
          }}
        >
          <Heart
            className="h-4 w-4"
            fill={isPreferred ? 'currentColor' : 'none'}
          />
          {isPreferred ? 'Remove' : 'Prefer'}
        </button>
      </div>
    </div>
  )
}
