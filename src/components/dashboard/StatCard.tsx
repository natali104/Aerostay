import type { ReactNode } from 'react'

export function StatCard({
  label,
  title,
  value,
  subtitle,
  icon,
}: {
  label?: string
  title?: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
}) {
  const heading = label ?? title ?? ''

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
        {heading}
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
    </div>
  )
}
