'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  CalendarCheck,
  Calendar,
  Settings,
  AlertTriangle,
  Heart,
  Users,
  Building2,
  Plane,
  DollarSign,
  MapPin,
  LogOut,
} from 'lucide-react'

type Role = 'admin' | 'hotel' | 'airline'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

interface SidebarProps {
  role: Role
  userName: string
  userEmail: string
  mobileOpen?: boolean
  onMobileClose?: () => void
}

const navConfig: Record<Role, NavItem[]> = {
  hotel: [
    { label: 'Overview', href: '/dashboard/hotel', icon: LayoutDashboard },
    { label: 'Bookings', href: '/dashboard/hotel/bookings', icon: CalendarCheck },
    { label: 'Calendar', href: '/dashboard/hotel/calendar', icon: Calendar },
    { label: 'Settings', href: '/dashboard/hotel/settings', icon: Settings },
  ],
  airline: [
    { label: 'Overview', href: '/dashboard/airline', icon: LayoutDashboard },
    { label: 'Layover Events', href: '/dashboard/airline/bookings', icon: AlertTriangle },
    { label: 'Preferences', href: '/dashboard/airline/preferences', icon: Heart },
    { label: 'Contacts', href: '/dashboard/airline/contacts', icon: Users },
    { label: 'Settings', href: '/dashboard/airline/settings', icon: Settings },
  ],
  admin: [
    { label: 'Overview', href: '/dashboard/admin', icon: LayoutDashboard },
    { label: 'All Bookings', href: '/dashboard/admin/bookings', icon: CalendarCheck },
    { label: 'Hotels', href: '/dashboard/admin/hotels', icon: Building2 },
    { label: 'Airlines', href: '/dashboard/admin/airlines', icon: Plane },
    { label: 'Layovers', href: '/dashboard/admin/layovers', icon: AlertTriangle },
    { label: 'Commissions', href: '/dashboard/admin/commissions', icon: DollarSign },
    { label: 'Airports', href: '/dashboard/admin/airports', icon: MapPin },
  ],
}

export function Sidebar({ role, userName, userEmail, mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const items = navConfig[role]

  const isActive = (href: string) => {
    if (href === `/dashboard/${role}`) return pathname === href
    return pathname.startsWith(href)
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const sidebarContent = (
    <div className="flex h-full flex-col" style={{ backgroundColor: '#0D1426' }}>
      {/* Logo */}
      <div className="py-6 px-5">
        <Link href="/dashboard" className="flex items-center gap-1 text-lg font-bold">
          <span style={{ color: '#3B9EFF' }}>✦</span>
          <span style={{ color: '#F1F5F9' }}>AeroStay</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        <ul className="space-y-0.5">
          {items.map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onMobileClose}
                  className="flex items-center gap-3 rounded-lg mx-3 px-5 py-2.5 text-sm transition-colors duration-150"
                  style={
                    active
                      ? { color: '#3B9EFF', backgroundColor: 'rgba(59,158,255,0.1)' }
                      : { color: '#94A3B8' }
                  }
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.color = '#F1F5F9'
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.color = '#94A3B8'
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <Icon className="w-[18px] h-[18px] shrink-0" />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="mt-auto border-t px-5 py-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 mb-3">
          <p className="truncate text-xs" style={{ color: '#94A3B8' }}>{userEmail}</p>
          <span
            className="shrink-0 uppercase px-2 py-0.5 rounded-full font-medium"
            style={{
              fontSize: '10px',
              backgroundColor: 'rgba(59,158,255,0.15)',
              color: '#3B9EFF',
            }}
          >
            {role}
          </span>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-xs transition-colors duration-150"
          style={{ color: '#94A3B8' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#f87171' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8' }}
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:flex-col lg:w-60"
        style={{
          backgroundColor: '#0D1426',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={onMobileClose}
          />
          <aside
            className="fixed inset-y-0 left-0 z-50 flex w-60 flex-col shadow-xl"
            style={{
              backgroundColor: '#0D1426',
              borderRight: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
