'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

const colorMap = {
  blue: {
    bg: 'bg-[#0EA5E9]',
    hover: 'hover:bg-[#0284C7]',
    shimmer: 'rgba(255,255,255,0.25)',
  },
  green: {
    bg: 'bg-[#10B981]',
    hover: 'hover:bg-[#059669]',
    shimmer: 'rgba(255,255,255,0.25)',
  },
  red: {
    bg: 'bg-[#EF4444]',
    hover: 'hover:bg-[#DC2626]',
    shimmer: 'rgba(255,255,255,0.25)',
  },
} as const

const sizeMap = {
  sm: 'px-4 py-2 text-sm rounded-lg',
  md: 'px-6 py-2.5 text-sm rounded-lg',
  lg: 'px-8 py-3 text-base rounded-xl',
} as const

interface ShimmerButtonProps {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  color?: keyof typeof colorMap
  size?: keyof typeof sizeMap
  className?: string
}

export default function ShimmerButton({
  children,
  href,
  onClick,
  color = 'blue',
  size = 'md',
  className,
}: ShimmerButtonProps) {
  const c = colorMap[color]
  const base = cn(
    'relative inline-flex items-center justify-center gap-2 font-semibold text-white',
    'overflow-hidden transition-all duration-200',
    c.bg,
    c.hover,
    sizeMap[size],
    className
  )

  const shimmerOverlay = (
    <span
      className="pointer-events-none absolute inset-0"
      style={{
        background: `linear-gradient(110deg, transparent 33%, ${c.shimmer} 50%, transparent 67%)`,
        backgroundSize: '250% 100%',
        animation: 'shimmerSlide 3s ease-in-out infinite',
      }}
    />
  )

  if (href) {
    return (
      <Link href={href} className={base}>
        {shimmerOverlay}
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={base}>
      {shimmerOverlay}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  )
}
