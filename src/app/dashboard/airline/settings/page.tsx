'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { Plane, Bell, Save } from 'lucide-react'

interface Airline {
  id: string
  name: string
  iata_code: string
}

export default function AirlineSettingsPage() {
  const [airline, setAirline] = useState<Airline | null>(null)
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [smsAlerts, setSmsAlerts] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const loadData = useCallback(async () => {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('airline_id')
      .eq('id', user.id)
      .single()

    if (!profile?.airline_id) return

    const { data: airlineData } = await supabase
      .from('airlines')
      .select('id, name, iata_code')
      .eq('id', profile.airline_id)
      .single()

    if (airlineData) setAirline(airlineData)
    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData()
  }, [loadData])

  async function handleSave() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 600))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B1120]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#3B9EFF] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B1120] p-6">
      <DashboardHeader
        title="Settings"
        subtitle="Airline configuration"
      />

      {/* Airline Info */}
      <div className="mb-6 rounded-xl border border-white/[0.08] bg-[#111827] p-6">
        <div className="mb-4 flex items-center gap-2 text-[#F1F5F9]">
          <Plane className="h-5 w-5 text-[#3B9EFF]" />
          <h2 className="text-lg font-semibold">Airline Information</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-[#94A3B8]">Airline Name</p>
            <p className="mt-1 text-lg font-semibold text-[#F1F5F9]">
              {airline?.name ?? '—'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-[#94A3B8]">IATA Code</p>
            <div className="mt-1">
              <span className="inline-flex items-center rounded-lg bg-[#3B9EFF]/15 px-3 py-1 text-lg font-bold tracking-widest text-[#3B9EFF]">
                {airline?.iata_code ?? '—'}
              </span>
            </div>
          </div>
        </div>
        <p className="mt-4 text-xs text-[#94A3B8]/60">
          To update airline information, please contact AeroStay support.
        </p>
      </div>

      {/* Notification Preferences */}
      <div className="mb-6 rounded-xl border border-white/[0.08] bg-[#111827] p-6">
        <div className="mb-4 flex items-center gap-2 text-[#F1F5F9]">
          <Bell className="h-5 w-5 text-[#3B9EFF]" />
          <h2 className="text-lg font-semibold">Notification Preferences</h2>
        </div>
        <div className="space-y-4">
          <ToggleRow
            label="Email Notifications"
            description="Receive layover alerts and booking confirmations via email"
            checked={emailAlerts}
            onChange={() => {
              setEmailAlerts((v) => !v)
              setSaved(false)
            }}
          />
          <ToggleRow
            label="SMS Notifications"
            description="Receive urgent layover alerts via SMS"
            checked={smsAlerts}
            onChange={() => {
              setSmsAlerts((v) => !v)
              setSaved(false)
            }}
          />
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-[#3B9EFF] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#3B9EFF]/90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-white/[0.06] bg-[#0B1120] p-4">
      <div>
        <p className="text-sm font-medium text-[#F1F5F9]">{label}</p>
        <p className="mt-0.5 text-xs text-[#94A3B8]">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
          checked ? 'bg-[#3B9EFF]' : 'bg-white/[0.1]'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}
