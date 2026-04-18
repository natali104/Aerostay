'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { formatEuro } from '@/lib/format'
import { Edit3, RefreshCw, Globe } from 'lucide-react'

interface Hotel {
  id: string
  name: string
  pricing_method: string
  partner_discount_pct: number | null
  commission_rate: number | null
}

interface Commission {
  id: string
  amount: number
  rate: number
  status: string
  billing_period: string
}

const pricingOptions = [
  {
    value: 'manual',
    label: 'Manual Pricing',
    desc: 'Set your own rates per room type',
    Icon: Edit3,
  },
  {
    value: 'channel_manager',
    label: 'Channel Manager',
    desc: 'Sync from your channel manager',
    Icon: RefreshCw,
  },
  {
    value: 'booking_com',
    label: 'Booking.com Sync',
    desc: 'Auto-sync with Booking.com rates',
    Icon: Globe,
  },
]

export default function SettingsPage() {
  const supabase = createClient()

  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [pricingMethod, setPricingMethod] = useState('manual')
  const [manualPrice, setManualPrice] = useState('')
  const [discount, setDiscount] = useState(10)

  const [commissionTotal, setCommissionTotal] = useState(0)
  const [commissions, setCommissions] = useState<Commission[]>([])

  const loadData = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('hotel_id')
      .eq('id', user.id)
      .single()

    if (!profile?.hotel_id) {
      setLoading(false)
      return
    }

    const { data: hotelData } = await supabase
      .from('hotels')
      .select('*')
      .eq('id', profile.hotel_id)
      .single()

    if (hotelData) {
      setHotel(hotelData)
      setPricingMethod(hotelData.pricing_method ?? 'manual')
      setDiscount(hotelData.partner_discount_pct ?? 10)
    }

    const { data: commData } = await supabase
      .from('commissions')
      .select('id, amount, rate, status, billing_period')
      .eq('hotel_id', profile.hotel_id)
      .order('billing_period', { ascending: false })
      .limit(5)

    if (commData) {
      setCommissions(commData)
      const unpaid = commData
        .filter((c) => c.status !== 'paid')
        .reduce((s, c) => s + (c.amount ?? 0), 0)
      setCommissionTotal(unpaid)
    }

    setLoading(false)
  }, [supabase])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
  }, [loadData])

  async function handleSave() {
    if (!hotel) return
    setSaving(true)

    await supabase
      .from('hotels')
      .update({
        pricing_method: pricingMethod,
        partner_discount_pct:
          pricingMethod === 'booking_com' ? discount : null,
      })
      .eq('id', hotel.id)

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const basePrice = 120
  const discountedPrice = Math.round(basePrice * (1 - discount / 100))

  if (loading) {
    return (
      <div className="py-20 text-center text-[#94A3B8]">
        Loading settings...
      </div>
    )
  }

  if (!hotel) {
    return (
      <div className="py-20 text-center text-[#94A3B8]">Hotel not found</div>
    )
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Settings"
        subtitle="Configure pricing and preferences"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pricing Configuration */}
        <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#111827] p-6">
          <h3 className="mb-5 text-base font-semibold text-[#F1F5F9]">
            Pricing Configuration
          </h3>

          <div className="space-y-3">
            {pricingOptions.map((opt) => {
              const selected = pricingMethod === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPricingMethod(opt.value)}
                  className={`flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-all ${
                    selected
                      ? 'border-[#3B9EFF] bg-[#3B9EFF]/5'
                      : 'border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.15)]'
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                      selected
                        ? 'border-[#3B9EFF]'
                        : 'border-[#94A3B8]'
                    }`}
                  >
                    {selected && (
                      <div className="h-2 w-2 rounded-full bg-[#3B9EFF]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <opt.Icon
                        className={`h-4 w-4 ${
                          selected ? 'text-[#3B9EFF]' : 'text-[#94A3B8]'
                        }`}
                      />
                      <span className="text-sm font-medium text-[#F1F5F9]">
                        {opt.label}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#94A3B8]">{opt.desc}</p>
                  </div>
                </button>
              )
            })}
          </div>

          {pricingMethod === 'manual' && (
            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-[#94A3B8]">
                Price per room per night (&euro;)
              </label>
              <input
                type="number"
                min={0}
                value={manualPrice}
                onChange={(e) => setManualPrice(e.target.value)}
                placeholder="e.g. 95"
                className="w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#0A0F1E] px-3 py-2 text-[#F1F5F9] outline-none placeholder:text-[#475569] focus:border-[#3B9EFF] focus:ring-1 focus:ring-[#3B9EFF]"
              />
            </div>
          )}

          {pricingMethod === 'booking_com' && (
            <div className="mt-5 space-y-3">
              <label className="block text-sm font-medium text-[#94A3B8]">
                Partner Discount: {discount}%
              </label>
              <input
                type="range"
                min={0}
                max={30}
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-full accent-[#3B9EFF]"
              />
              <div className="flex items-center gap-3 text-sm">
                <span className="text-[#94A3B8]">
                  Base: &euro;{basePrice}
                </span>
                <span className="text-[#F1F5F9]">&rarr;</span>
                <span className="font-semibold text-[#3B9EFF]">
                  Your price: &euro;{discountedPrice}
                </span>
                <span className="text-xs text-[#94A3B8]">
                  ({discount}% discount applied)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Commission & Billing */}
        <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#111827] p-6">
          <h3 className="mb-5 text-base font-semibold text-[#F1F5F9]">
            Commission &amp; Billing
          </h3>

          <div className="mb-5 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4">
            <p className="text-sm text-[#94A3B8]">Commission Rate</p>
            <p className="mt-1 text-2xl font-bold text-[#F1F5F9]">
              {hotel.commission_rate != null
                ? `${(hotel.commission_rate * 100).toFixed(0)}%`
                : '8%'}
            </p>
            <p className="mt-1 text-xs text-[#94A3B8]">
              Billed monthly by AeroStay
            </p>
          </div>

          <div className="mb-5 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4">
            <p className="text-sm text-[#94A3B8]">
              This Month&apos;s Commission
            </p>
            <p className="mt-1 text-2xl font-bold text-[#F5A623]">
              {formatEuro(commissionTotal)}
            </p>
          </div>

          {commissions.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.06)]">
                    <th className="px-2 py-2 text-left text-xs font-medium text-[#94A3B8]">
                      Period
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-[#94A3B8]">
                      Amount
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-[#94A3B8]">
                      Rate
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-[#94A3B8]">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-[rgba(255,255,255,0.04)]"
                    >
                      <td className="px-2 py-2 text-[#F1F5F9]">
                        {c.billing_period}
                      </td>
                      <td className="px-2 py-2 text-[#F1F5F9]">
                        {formatEuro(c.amount)}
                      </td>
                      <td className="px-2 py-2 text-[#94A3B8]">
                        {(c.rate * 100).toFixed(0)}%
                      </td>
                      <td className="px-2 py-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            c.status === 'paid'
                              ? 'bg-[#22C55E]/10 text-[#22C55E]'
                              : 'bg-[#F5A623]/10 text-[#F5A623]'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-[#3B9EFF] px-8 py-3 font-semibold text-white transition-colors hover:bg-[#3B9EFF]/90 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        {saved && (
          <span className="text-sm font-medium text-[#22C55E]">
            Settings saved successfully
          </span>
        )}
      </div>
    </div>
  )
}
