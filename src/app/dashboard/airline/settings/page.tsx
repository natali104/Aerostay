'use client'

import { useState } from 'react'
import { Plane, Bell, Save } from 'lucide-react'

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
    <div
      className="flex items-center justify-between gap-4 rounded-lg p-4"
      style={{ backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9' }}
    >
      <div>
        <p className="text-sm font-medium" style={{ color: '#0F172A' }}>
          {label}
        </p>
        <p className="mt-0.5 text-xs" style={{ color: '#64748B' }}>
          {description}
        </p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200"
        style={{ backgroundColor: checked ? '#0EA5E9' : '#E2E8F0' }}
      >
        <span
          className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200"
          style={{
            transform: checked ? 'translateX(20px)' : 'translateX(0)',
          }}
        />
      </button>
    </div>
  )
}

export default function AirlineSettingsPage() {
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [smsAlerts, setSmsAlerts] = useState(false)
  const [pushAlerts, setPushAlerts] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }, 600)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>
          Settings
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#64748B' }}>
          Airline configuration and preferences
        </p>
      </div>

      {/* Airline Info */}
      <div
        className="rounded-xl bg-white p-6"
        style={{ border: '1px solid #E2E8F0' }}
      >
        <div className="mb-4 flex items-center gap-2">
          <Plane className="h-5 w-5" style={{ color: '#0EA5E9' }} />
          <h2 className="text-lg font-semibold" style={{ color: '#0F172A' }}>
            Airline Information
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium" style={{ color: '#64748B' }}>
              Airline Name
            </p>
            <p
              className="mt-1 text-lg font-semibold"
              style={{ color: '#0F172A' }}
            >
              Bulgaria Air
            </p>
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: '#64748B' }}>
              IATA Code
            </p>
            <div className="mt-1">
              <span
                className="inline-flex items-center rounded-lg px-3 py-1 text-lg font-bold tracking-widest"
                style={{
                  backgroundColor: 'rgba(14,165,233,0.1)',
                  color: '#0EA5E9',
                }}
              >
                FB
              </span>
            </div>
          </div>
        </div>
        <p className="mt-4 text-xs" style={{ color: '#94A3B8' }}>
          To update airline information, please contact AeroStay support.
        </p>
      </div>

      {/* Notification Preferences */}
      <div
        className="rounded-xl bg-white p-6"
        style={{ border: '1px solid #E2E8F0' }}
      >
        <div className="mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5" style={{ color: '#0EA5E9' }} />
          <h2 className="text-lg font-semibold" style={{ color: '#0F172A' }}>
            Notification Preferences
          </h2>
        </div>
        <div className="space-y-3">
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
          <ToggleRow
            label="Push Notifications"
            description="Browser push notifications for real-time updates"
            checked={pushAlerts}
            onChange={() => {
              setPushAlerts((v) => !v)
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
          className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50"
          style={{ backgroundColor: '#0EA5E9' }}
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
