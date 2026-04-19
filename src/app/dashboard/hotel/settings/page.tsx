'use client'

import { useState } from 'react'
import { DEMO_HOTEL } from '@/lib/demo'
import { formatEuro } from '@/lib/format'
import Toggle from '@/components/ui/Toggle'
import ShimmerButton from '@/components/ui/ShimmerButton'
import { Edit3, RefreshCw, Globe, FileText, AlertTriangle } from 'lucide-react'

const pricingOptions = [
  {
    value: 'manual' as const,
    label: 'Manual Pricing',
    desc: 'Set your own rates per room type',
    Icon: Edit3,
  },
  {
    value: 'booking_com' as const,
    label: 'Booking.com Sync',
    desc: 'Auto-sync with Booking.com rates',
    Icon: Globe,
  },
  {
    value: 'channel_mgr' as const,
    label: 'Channel Manager',
    desc: 'Sync from your channel manager',
    Icon: RefreshCw,
  },
]

export default function SettingsPage() {
  const [pricingMode, setPricingMode] = useState(DEMO_HOTEL.pricing_mode)
  const [discount, setDiscount] = useState(DEMO_HOTEL.booking_com_discount_pct)
  const [acceptRequests, setAcceptRequests] = useState(DEMO_HOTEL.accept_requests)
  const [breakfastIncluded, setBreakfastIncluded] = useState(DEMO_HOTEL.breakfast_included)
  const [autoConfirm, setAutoConfirm] = useState(DEMO_HOTEL.auto_confirm)
  const [smsAlerts, setSmsAlerts] = useState(DEMO_HOTEL.sms_alerts)
  const [showOnMap, setShowOnMap] = useState(DEMO_HOTEL.show_on_map)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const sectionTitle: React.CSSProperties = {
    fontSize: 16,
    fontWeight: 600,
    color: '#0F172A',
    marginBottom: 20,
  }

  const card: React.CSSProperties = {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 12,
    padding: 24,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>
        Settings
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {/* Card 1: Pricing Configuration */}
        <div style={card}>
          <h3 style={sectionTitle}>Pricing Configuration</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pricingOptions.map((opt) => {
              const selected = pricingMode === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPricingMode(opt.value)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: 14,
                    borderRadius: 10,
                    border: `1.5px solid ${selected ? '#0EA5E9' : '#E2E8F0'}`,
                    background: selected ? '#F0F9FF' : '#FFFFFF',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      border: `2px solid ${selected ? '#0EA5E9' : '#CBD5E1'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    {selected && (
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: '#0EA5E9',
                        }}
                      />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <opt.Icon
                        size={15}
                        color={selected ? '#0EA5E9' : '#94A3B8'}
                      />
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: '#0F172A',
                        }}
                      >
                        {opt.label}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: '#64748B', marginTop: 4, margin: '4px 0 0 0' }}>
                      {opt.desc}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {pricingMode === 'booking_com' && (
            <div
              style={{
                background: '#F0F9FF',
                borderRadius: 10,
                padding: 16,
                marginTop: 16,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#0369A1',
                  marginBottom: 10,
                }}
              >
                Booking.com Discount: {discount}%
              </div>
              <input
                type="range"
                min={0}
                max={30}
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#0EA5E9' }}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 11,
                  color: '#94A3B8',
                  marginTop: 4,
                }}
              >
                <span>0%</span>
                <span>30%</span>
              </div>
            </div>
          )}

          <div style={{ marginTop: 20 }}>
            <ShimmerButton color="blue" size="md" onClick={handleSave}>
              {saved ? 'Saved!' : 'Save Pricing'}
            </ShimmerButton>
          </div>
        </div>

        {/* Card 2: Notification Preferences */}
        <div style={card}>
          <h3 style={sectionTitle}>Notification Preferences</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Toggle
              label="Accept Booking Requests"
              value={acceptRequests}
              onChange={setAcceptRequests}
            />
            <div style={{ borderTop: '1px solid #F1F5F9' }} />
            <Toggle
              label="Breakfast Included"
              value={breakfastIncluded}
              onChange={setBreakfastIncluded}
            />
            <div style={{ borderTop: '1px solid #F1F5F9' }} />
            <Toggle
              label="Auto-Confirm Bookings"
              value={autoConfirm}
              onChange={setAutoConfirm}
            />
            <div style={{ borderTop: '1px solid #F1F5F9' }} />
            <Toggle
              label="SMS Alerts"
              value={smsAlerts}
              onChange={setSmsAlerts}
            />
            <div style={{ borderTop: '1px solid #F1F5F9' }} />
            <Toggle
              label="Show on Public Map"
              value={showOnMap}
              onChange={setShowOnMap}
            />
          </div>
        </div>

        {/* Card 3: Account & Billing */}
        <div style={card}>
          <h3 style={sectionTitle}>Account & Billing</h3>

          <div
            style={{
              borderLeft: '3px solid #7DD3FC',
              padding: '14px 16px',
              background: '#F0F9FF',
              borderRadius: '0 10px 10px 0',
              marginBottom: 20,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 8 }}>
              {DEMO_HOTEL.commission_rate}% commission per booking
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 6,
              }}
            >
              <span style={{ fontSize: 12, color: '#64748B' }}>This month</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#16A34A' }}>
                {formatEuro(391)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: '#64748B' }}>Next billing</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: '#334155' }}>
                1 May 2026
              </span>
            </div>
          </div>

          <button
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              padding: '12px 14px',
              border: '1px solid #E2E8F0',
              borderRadius: 8,
              background: '#FFFFFF',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
              color: '#0369A1',
              marginBottom: 12,
            }}
          >
            <FileText size={16} />
            View Invoice History
          </button>

          <div
            style={{
              fontSize: 12,
              color: '#64748B',
              lineHeight: 1.6,
            }}
          >
            <p style={{ margin: '0 0 8px 0' }}>
              <strong style={{ color: '#0F172A' }}>Hotel:</strong> {DEMO_HOTEL.name}
            </p>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong style={{ color: '#0F172A' }}>Email:</strong> {DEMO_HOTEL.email}
            </p>
            <p style={{ margin: 0 }}>
              <strong style={{ color: '#0F172A' }}>Phone:</strong> {DEMO_HOTEL.phone}
            </p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #FECACA',
          borderRadius: 12,
          padding: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <AlertTriangle size={20} color="#EF4444" />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#991B1B' }}>
              Danger Zone
            </div>
            <div style={{ fontSize: 13, color: '#64748B' }}>
              Deactivate your hotel listing or delete your account permanently.
            </div>
          </div>
        </div>
        <button
          type="button"
          style={{
            padding: '8px 20px',
            fontSize: 13,
            fontWeight: 600,
            color: '#EF4444',
            background: 'transparent',
            border: '1px solid #EF4444',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          Deactivate Hotel
        </button>
      </div>
    </div>
  )
}
