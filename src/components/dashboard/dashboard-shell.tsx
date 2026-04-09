'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Sidebar } from './sidebar'
import { Header } from './header'

interface DashboardShellProps {
  role: 'admin' | 'hotel' | 'airline'
  userName: string
  userEmail: string
  children: React.ReactNode
}

export function DashboardShell({ role, userName, userEmail, children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        role={role}
        userName={userName}
        userEmail={userEmail}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className={cn('flex flex-col transition-[margin] duration-200 lg:ml-64')}>
        <Header
          userName={userName}
          onMenuToggle={() => setMobileOpen((o) => !o)}
        />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
