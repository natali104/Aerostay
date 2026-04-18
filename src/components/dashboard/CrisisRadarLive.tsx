'use client'

import { useLayoverEvents } from '@/lib/hooks/useLayoverEvents'
import CrisisRadar from '@/components/dashboard/CrisisRadar'

export function CrisisRadarLive() {
  const { events, loading } = useLayoverEvents()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-[#3B9EFF] border-t-transparent"
          />
          <span className="text-xs text-[#94A3B8]" style={{ fontFamily: "'Space Mono', monospace" }}>
            Initializing radar...
          </span>
        </div>
      </div>
    )
  }

  return (
    <CrisisRadar
      events={events}
      onSelectEvent={(id) => {
        console.log('Selected event:', id)
      }}
    />
  )
}
