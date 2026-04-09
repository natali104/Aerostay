'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import { CheckCircle, XCircle, MessageSquare } from 'lucide-react'

interface BookingActionsProps {
  bookingId: string
  bookingStatus: string
  currentAmount: number
}

export function BookingActions({
  bookingId,
  bookingStatus,
  currentAmount,
}: BookingActionsProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [showCounterOffer, setShowCounterOffer] = useState(false)
  const [proposedPrice, setProposedPrice] = useState(currentAmount.toString())
  const [message, setMessage] = useState('')

  const canAct = ['pending', 'negotiating'].includes(bookingStatus)

  async function handleConfirm() {
    setLoading(true)
    await supabase
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', bookingId)
    setLoading(false)
    router.refresh()
  }

  async function handleReject() {
    setLoading(true)
    await supabase
      .from('bookings')
      .update({ status: 'rejected' })
      .eq('id', bookingId)
    setLoading(false)
    router.refresh()
  }

  async function handleCounterOffer(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    await supabase.from('negotiations').insert({
      booking_id: bookingId,
      sender_id: user!.id,
      proposed_amount: parseFloat(proposedPrice),
      message: message,
    })

    await supabase
      .from('bookings')
      .update({ status: 'negotiating' })
      .eq('id', bookingId)

    setMessage('')
    setShowCounterOffer(false)
    setLoading(false)
    router.refresh()
  }

  if (!canAct) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleConfirm} loading={loading}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Confirm Booking
          </Button>
          <Button variant="danger" onClick={handleReject} loading={loading}>
            <XCircle className="mr-2 h-4 w-4" />
            Reject Booking
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowCounterOffer(!showCounterOffer)}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Counter-offer
          </Button>
        </div>

        {showCounterOffer && (
          <form onSubmit={handleCounterOffer} className="mt-6 space-y-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
              <p className="mb-3 text-sm text-gray-500">
                Current amount:{' '}
                <span className="font-semibold text-[#1e3a5f]">
                  {formatCurrency(currentAmount)}
                </span>
              </p>
              <Input
                label="Proposed Price"
                type="number"
                step="0.01"
                min="0"
                value={proposedPrice}
                onChange={(e) => setProposedPrice(e.target.value)}
                required
              />
              <div className="mt-3">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors placeholder:text-gray-400 focus:border-[#38bdf8] focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/30"
                  placeholder="Explain your counter-offer..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>
              <div className="mt-4 flex gap-2">
                <Button type="submit" variant="secondary" loading={loading}>
                  Send Counter-offer
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowCounterOffer(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
