'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plane, Bell, BedDouble, Save } from 'lucide-react'

interface Airline {
  id: string
  name: string
  iata_code: string
}

interface SettingsData {
  email_notifications: boolean
  sms_notifications: boolean
  auto_book_preferred: boolean
  default_room_type: string
  max_budget_per_night: string
  require_approval: boolean
}

export default function AirlineSettingsPage() {
  const [airline, setAirline] = useState<Airline | null>(null)
  const [settings, setSettings] = useState<SettingsData>({
    email_notifications: true,
    sms_notifications: false,
    auto_book_preferred: false,
    default_room_type: 'standard',
    max_budget_per_night: '',
    require_approval: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [airlineId, setAirlineId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('airline_id')
      .eq('id', user.id)
      .single()

    if (!profile?.airline_id) return
    setAirlineId(profile.airline_id)

    const { data: airlineData } = await supabase
      .from('airlines')
      .select('id, name, iata_code')
      .eq('id', profile.airline_id)
      .single()

    if (airlineData) setAirline(airlineData)

    const { data: settingsData } = await supabase
      .from('airline_settings')
      .select('*')
      .eq('airline_id', profile.airline_id)
      .single()

    if (settingsData) {
      setSettings({
        email_notifications: settingsData.email_notifications ?? true,
        sms_notifications: settingsData.sms_notifications ?? false,
        auto_book_preferred: settingsData.auto_book_preferred ?? false,
        default_room_type: settingsData.default_room_type ?? 'standard',
        max_budget_per_night: settingsData.max_budget_per_night?.toString() ?? '',
        require_approval: settingsData.require_approval ?? true,
      })
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData()
  }, [loadData])

  async function handleSave() {
    if (!airlineId) return
    setSaving(true)

    const supabase = createClient()

    const payload = {
      airline_id: airlineId,
      email_notifications: settings.email_notifications,
      sms_notifications: settings.sms_notifications,
      auto_book_preferred: settings.auto_book_preferred,
      default_room_type: settings.default_room_type,
      max_budget_per_night: settings.max_budget_per_night
        ? parseFloat(settings.max_budget_per_night)
        : null,
      require_approval: settings.require_approval,
    }

    await supabase
      .from('airline_settings')
      .upsert(payload, { onConflict: 'airline_id' })

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function toggleSetting(key: keyof SettingsData) {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
    setSaved(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1e3a5f] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your airline profile and booking preferences
          </p>
        </div>
        <Button onClick={handleSave} loading={saving} size="md">
          <Save className="h-4 w-4" />
          {saved ? 'Saved!' : 'Save Changes'}
        </Button>
      </div>

      {/* Airline Info (read-only) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Airline Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-gray-500">Airline Name</p>
              <p className="mt-1 text-lg font-semibold text-[#1e3a5f]">
                {airline?.name ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">IATA Code</p>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="default" className="text-base font-bold tracking-widest">
                  {airline?.iata_code ?? '—'}
                </Badge>
              </div>
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-400">
            To update airline information, please contact AeroStay support.
          </p>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ToggleRow
              label="Email Notifications"
              description="Receive layover alerts and booking confirmations via email"
              checked={settings.email_notifications}
              onChange={() => toggleSetting('email_notifications')}
            />
            <ToggleRow
              label="SMS Notifications"
              description="Receive urgent layover alerts via SMS"
              checked={settings.sms_notifications}
              onChange={() => toggleSetting('sms_notifications')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Booking Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BedDouble className="h-5 w-5" />
            Default Booking Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ToggleRow
              label="Auto-Book Preferred Hotels"
              description="Automatically create bookings at preferred hotels when a layover is detected"
              checked={settings.auto_book_preferred}
              onChange={() => toggleSetting('auto_book_preferred')}
            />
            <ToggleRow
              label="Require Manager Approval"
              description="Bookings require approval before being sent to hotels"
              checked={settings.require_approval}
              onChange={() => toggleSetting('require_approval')}
            />

            <div className="grid gap-4 pt-2 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Default Room Type
                </label>
                <select
                  value={settings.default_room_type}
                  onChange={(e) => {
                    setSettings((prev) => ({ ...prev, default_room_type: e.target.value }))
                    setSaved(false)
                  }}
                  className="flex h-10 w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors focus:border-[#38bdf8] focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/30"
                >
                  <option value="standard">Standard</option>
                  <option value="superior">Superior</option>
                  <option value="deluxe">Deluxe</option>
                  <option value="suite">Suite</option>
                </select>
              </div>
              <Input
                label="Max Budget Per Night (EUR)"
                type="number"
                min={0}
                step={0.01}
                value={settings.max_budget_per_night}
                onChange={(e) => {
                  setSettings((prev) => ({ ...prev, max_budget_per_night: e.target.value }))
                  setSaved(false)
                }}
                placeholder="e.g. 150.00"
              />
            </div>
          </div>
        </CardContent>
      </Card>
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
    <div className="flex items-center justify-between gap-4 rounded-lg border border-gray-100 p-4">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="mt-0.5 text-xs text-gray-500">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
          checked ? 'bg-[#38bdf8]' : 'bg-gray-200'
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
