'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface LayoverEvent {
  id: string
  flight_number: string
  airline_id: string | null
  passenger_count: number | null
  status: string
  detected_at: string
  origin_airport: string | null
  destination_airport: string | null
  isNew?: boolean
}

export function useLayoverEvents() {
  const [events, setEvents] = useState<LayoverEvent[]>([])
  const [loading, setLoading] = useState(true)

  const fetchEvents = useCallback(async () => {
    const supabase = createClient()
    const cutoff = new Date()
    cutoff.setHours(cutoff.getHours() - 24)

    const { data } = await supabase
      .from('layovers')
      .select(
        'id, flight_number, airline_id, passenger_count, status, detected_at, origin_airport, destination_airport'
      )
      .gte('detected_at', cutoff.toISOString())
      .order('detected_at', { ascending: false })

    setEvents(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchEvents()

    const supabase = createClient()
    const channel = supabase
      .channel('layover-events-radar')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'layovers' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newEvent = payload.new as LayoverEvent
            setEvents((prev) => [{ ...newEvent, isNew: true }, ...prev])
            setTimeout(() => {
              setEvents((prev) =>
                prev.map((e) =>
                  e.id === newEvent.id ? { ...e, isNew: false } : e
                )
              )
            }, 1000)
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as LayoverEvent
            setEvents((prev) =>
              prev.map((e) => (e.id === updated.id ? updated : e))
            )
          } else if (payload.eventType === 'DELETE') {
            const deleted = payload.old as { id: string }
            setEvents((prev) => prev.filter((e) => e.id !== deleted.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchEvents])

  return { events, loading }
}
