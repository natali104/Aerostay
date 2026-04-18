'use client'

import type { ReactNode } from 'react'
import { useCountUp } from '@/lib/hooks/useCountUp'

interface StatCardProps {
  label?: string
  title?: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  trend?: { value: number; positive?: boolean }
  loading?: boolean
}

function AnimatedValue({ target }: { target: number }) {
  const animated = useCountUp(target)
  return <>{animated.toLocaleString()}</>
}

function ShimmerPlaceholder() {
  return (
    <div className="mt-2 h-8 w-24 rounded-md shimmer-loading" />
  )
}

export function StatCard({
  label,
  title,
  value,
  subtitle,
  icon,
  trend,
  loading,
}: StatCardProps) {
  const heading = label ?? title ?? ''
  const isNumeric = typeof value === 'number'

  const numericFromString =
    typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : NaN

  const hasAnimatablePrefix =
    typeof value === 'string' && (value.startsWith('€') || value.endsWith('%'))

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
          <span className="text-[#3B9EFF]">{icon}</span>
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

      {loading ? (
        <ShimmerPlaceholder />
      ) : (
        <p
          className="mt-2 font-bold stat-value-fade-in"
          style={{ fontSize: '28px', color: '#F1F5F9' }}
        >
          {isNumeric ? (
            <AnimatedValue target={value} />
          ) : hasAnimatablePrefix && !isNaN(numericFromString) ? (
            <>
              {value.startsWith('€') && '€'}
              <AnimatedValue target={Math.round(numericFromString)} />
              {value.endsWith('%') && '%'}
            </>
          ) : (
            value
          )}
        </p>
      )}

      {subtitle && (
        <p className="mt-1 text-xs" style={{ color: '#94A3B8' }}>
          {subtitle}
        </p>
      )}

      {trend && !loading && (
        <div className="mt-2 flex items-center gap-1">
          <span
            className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
            style={{
              backgroundColor: trend.positive !== false
                ? 'rgba(34,197,94,0.1)'
                : 'rgba(239,68,68,0.1)',
              color: trend.positive !== false ? '#22C55E' : '#EF4444',
            }}
          >
            {trend.positive !== false ? '↑' : '↓'}{' '}
            {Math.abs(trend.value)}%
          </span>
        </div>
      )}
    </div>
  )
}
