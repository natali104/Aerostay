'use client'

import { useEffect, useState } from 'react'

interface DashboardHeaderProps {
  title: string
  subtitle?: string
}

function formatClock(date: Date): string {
  const h = date.getHours().toString().padStart(2, '0')
  const m = date.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const [time, setTime] = useState(() => formatClock(new Date()))

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(formatClock(new Date()))
    }, 10_000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="mb-6 flex items-center justify-between px-0 py-4">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#F1F5F9' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 text-sm" style={{ color: '#94A3B8' }}>
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span
            className="block h-1.5 w-1.5 animate-pulse rounded-full"
            style={{ backgroundColor: '#22C55E' }}
          />
          <span className="text-xs" style={{ color: '#22C55E' }}>
            Live Monitoring
          </span>
        </div>
        <span
          className="text-sm font-bold tabular-nums"
          style={{ fontFamily: "'Space Mono', monospace", color: '#F1F5F9' }}
        >
          {time}
        </span>
      </div>
    </div>
  )
}
