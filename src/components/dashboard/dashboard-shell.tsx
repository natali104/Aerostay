'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './sidebar'
import { ActivityTicker } from './ActivityTicker'
import { Menu } from 'lucide-react'

interface DashboardShellProps {
  role: 'admin' | 'hotel' | 'airline'
  userName: string
  userEmail: string
  children: React.ReactNode
}

function SofiaTime() {
  const [time, setTime] = useState('')

  useEffect(() => {
    function update() {
      const now = new Date()
      setTime(
        now.toLocaleTimeString('en-GB', {
          timeZone: 'Europe/Sofia',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }) + ' EET'
      )
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <span
      style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 12,
        color: '#64748B',
      }}
    >
      {time}
    </span>
  )
}

function Breadcrumb() {
  const pathname = usePathname()
  const segments = pathname
    .replace('/dashboard/', '')
    .split('/')
    .filter(Boolean)

  return (
    <div className="flex items-center gap-1.5" style={{ fontSize: 13 }}>
      <span style={{ color: '#0EA5E9', fontWeight: 500 }}>Dashboard</span>
      {segments.map((seg, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span style={{ color: '#CBD5E1' }}>/</span>
          <span style={{
            color: i === segments.length - 1 ? '#0F172A' : '#64748B',
            fontWeight: i === segments.length - 1 ? 500 : 400,
          }}>
            {seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ')}
          </span>
        </span>
      ))}
    </div>
  )
}

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      className="flex items-center justify-center rounded-full font-semibold"
      style={{
        width: 34,
        height: 34,
        backgroundColor: '#E0F2FE',
        color: '#0369A1',
        fontSize: 13,
      }}
    >
      {initials || '?'}
    </div>
  )
}

export function DashboardShell({
  role,
  userName,
  userEmail,
  children,
}: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F0F4FF' }}>
      <Sidebar
        role={role}
        userName={userName}
        userEmail={userEmail}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div
        className="ml-0 lg:ml-60 min-h-screen flex flex-col"
        style={{ backgroundColor: '#F0F4FF' }}
      >
        {/* Header bar */}
        <div
          className="flex items-center justify-between px-6"
          style={{
            height: 56,
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0',
          }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden rounded-lg p-1.5 transition-colors"
              style={{ color: '#64748B' }}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Breadcrumb />
          </div>

          <div className="flex items-center gap-4">
            <SofiaTime />

            {/* MONITORING badge */}
            <div
              className="hidden sm:flex items-center gap-1.5 rounded-md"
              style={{
                backgroundColor: 'rgba(34,197,94,0.08)',
                border: '0.5px solid rgba(34,197,94,0.25)',
                padding: '4px 12px',
              }}
            >
              <span
                className="rounded-full animate-pulse"
                style={{
                  width: 6,
                  height: 6,
                  backgroundColor: '#22C55E',
                  boxShadow: '0 0 4px #22C55E',
                }}
              />
              <span style={{ fontSize: 10, color: '#22C55E', fontWeight: 600, letterSpacing: '0.05em' }}>
                MONITORING
              </span>
            </div>

            <UserAvatar name={userName} />
          </div>
        </div>

        {/* Activity ticker */}
        <ActivityTicker />

        {/* Main content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
