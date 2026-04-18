'use client'

import { useState } from 'react'
import { Sidebar } from './sidebar'
import { Menu } from 'lucide-react'

interface DashboardShellProps {
  role: 'admin' | 'hotel' | 'airline'
  userName: string
  userEmail: string
  children: React.ReactNode
}

export function DashboardShell({ role, userName, userEmail, children }: DashboardShellProps) {
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

      <div className="ml-0 lg:ml-60 min-h-screen" style={{ backgroundColor: '#0A0F1E' }}>
        {/* Mobile hamburger */}
        <div className="lg:hidden p-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 transition-colors"
            style={{ color: '#94A3B8' }}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
