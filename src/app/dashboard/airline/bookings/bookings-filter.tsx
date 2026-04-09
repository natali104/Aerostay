'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

const statuses = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'negotiating', label: 'Negotiating' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'declined', label: 'Declined' },
]

export function BookingsFilter({ currentStatus }: { currentStatus: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleFilter(status: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (status === 'all') {
      params.delete('status')
    } else {
      params.set('status', status)
    }
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((s) => (
        <button
          key={s.value}
          onClick={() => handleFilter(s.value)}
          className={cn(
            'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
            currentStatus === s.value
              ? 'bg-[#1e3a5f] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}
