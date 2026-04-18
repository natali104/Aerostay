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
      className="text-xs text-[#94A3B8]"
      style={{ fontFamily: "'Space Mono', monospace" }}
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
    <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
      <span className="text-[#3B9EFF]">Dashboard</span>
      {segments.map((seg, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span className="text-[#94A3B8]/40">/</span>
          <span className={i === segments.length - 1 ? 'text-[#F1F5F9]' : ''}>
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
      className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
      style={{ backgroundColor: '#1a3a5c', color: '#3B9EFF' }}
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
    <div className="min-h-screen" style={{ backgroundColor: '#0A0F1E' }}>
      <Sidebar
        role={role}
        userName={userName}
        userEmail={userEmail}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div
        className="ml-0 lg:ml-60 min-h-screen flex flex-col"
        style={{ backgroundColor: '#0A0F1E' }}
      >
        {/* Top header */}
        <div
          className="flex items-center justify-between px-6 py-3"
          style={{
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="flex items-center gap-4">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden rounded-lg p-1.5 transition-colors hover:bg-[rgba(255,255,255,0.05)]"
              style={{ color: '#94A3B8' }}
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
              className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-md"
              style={{
                backgroundColor: 'rgba(34,197,94,0.08)',
                border: '0.5px solid rgba(34,197,94,0.3)',
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full animate-pulse"
                style={{
                  backgroundColor: '#22C55E',
                  boxShadow: '0 0 4px #22C55E',
                }}
              />
              <span
                style={{ fontSize: 11, color: '#22C55E', fontWeight: 500 }}
              >
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
