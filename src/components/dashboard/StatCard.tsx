import type { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: number
  icon?: ReactNode
}

export function StatCard({ title, value, subtitle, trend, icon }: StatCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-xl p-5"
      style={{
        backgroundColor: '#111827',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {icon && (
        <div
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: 'rgba(59,158,255,0.1)' }}
        >
          {icon}
        </div>
      )}

      <p
        className="font-medium uppercase"
        style={{
          fontSize: '11px',
          letterSpacing: '0.06em',
          color: '#94A3B8',
        }}
      >
        {title}
      </p>

      <p
        className="mt-2 font-bold"
        style={{ fontSize: '28px', color: '#F1F5F9' }}
      >
        {value}
      </p>

      {subtitle && (
        <p className="mt-1 text-xs" style={{ color: '#94A3B8' }}>
          {subtitle}
        </p>
      )}

      {trend != null && trend !== 0 && (
        <span
          className="mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
          style={{
            backgroundColor: trend > 0 ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
            color: trend > 0 ? '#22C55E' : '#EF4444',
          }}
        >
          {trend > 0 ? `↑ +${trend}%` : `↓ ${trend}%`}
        </span>
      )}
    </div>
  )
}
