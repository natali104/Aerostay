import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
}

export default function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/20 bg-white/70 p-6',
        'backdrop-blur-xl shadow-lg',
        className
      )}
    >
      {children}
    </div>
  )
}
