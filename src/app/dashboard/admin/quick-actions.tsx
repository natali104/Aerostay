'use client'

import { Zap, RefreshCw } from 'lucide-react'

export function QuickActions() {
  function handleLayoverCheck() {
    alert('Layover check triggered. Processing...')
  }

  function handleSyncPricing() {
    alert('Hotel pricing sync initiated.')
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={handleLayoverCheck}
        className="flex items-center gap-2 rounded-lg bg-[#3B9EFF] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#3B9EFF]/90"
      >
        <Zap className="h-4 w-4" />
        Trigger Layover Check
      </button>
      <button
        onClick={handleSyncPricing}
        className="flex items-center gap-2 rounded-lg border border-white/[0.15] bg-transparent px-5 py-2.5 text-sm font-medium text-[#F1F5F9] transition-colors hover:bg-white/[0.06]"
      >
        <RefreshCw className="h-4 w-4" />
        Sync Hotel Pricing
      </button>
    </div>
  )
}
