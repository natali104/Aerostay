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
      <div style={{ padding: '24px 20px' }}>
        <Link href="/dashboard" className="flex items-center gap-1" style={{ fontFamily: "'Space Mono', monospace" }}>
          <span style={{ color: '#0EA5E9', fontSize: 18, fontWeight: 700 }}>✦</span>
          <span style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 700 }}>AeroStay</span>
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
                  className="flex items-center gap-3 px-5 py-2.5 text-sm transition-colors duration-150"
                  style={
                    active
                      ? {
                          color: '#FFFFFF',
                          backgroundColor: 'rgba(14,165,233,0.15)',
                          borderLeft: '3px solid #0EA5E9',
                          paddingLeft: 17,
                        }
                      : { color: '#94A3B8', borderLeft: '3px solid transparent', paddingLeft: 17 }
                  }
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.color = '#FFFFFF'
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

        {role === 'admin' && (
          <div className="mt-4 pt-4 mx-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="mb-2 text-[10px] uppercase tracking-wider" style={{ color: '#64748B', letterSpacing: '0.08em' }}>
              View as
            </p>
            <ul className="space-y-0.5">
              <li>
                <Link
                  href="/dashboard/hotel"
                  onClick={onMobileClose}
                  className="flex items-center gap-3 py-2 text-sm transition-colors duration-150 rounded-md px-2"
                  style={{
                    color: pathname.startsWith('/dashboard/hotel') ? '#FFFFFF' : '#94A3B8',
                    backgroundColor: pathname.startsWith('/dashboard/hotel') ? 'rgba(14,165,233,0.15)' : 'transparent',
                  }}
                >
                  <Building2 className="w-[16px] h-[16px] shrink-0" />
                  <span>Hotel Dashboard</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/airline"
                  onClick={onMobileClose}
                  className="flex items-center gap-3 py-2 text-sm transition-colors duration-150 rounded-md px-2"
                  style={{
                    color: pathname.startsWith('/dashboard/airline') ? '#FFFFFF' : '#94A3B8',
                    backgroundColor: pathname.startsWith('/dashboard/airline') ? 'rgba(14,165,233,0.15)' : 'transparent',
                  }}
                >
                  <Plane className="w-[16px] h-[16px] shrink-0" />
                  <span>Airline Dashboard</span>
                </Link>
              </li>
            </ul>
          </div>
        )}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto border-t px-5 py-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 mb-3">
          <p className="truncate" style={{ fontSize: 11, color: '#64748B' }}>{userEmail}</p>
          <span
            className="shrink-0 uppercase rounded-full font-medium"
            style={{
              fontSize: 11,
              backgroundColor: 'rgba(14,165,233,0.12)',
              color: '#0EA5E9',
              padding: '2px 8px',
            }}
          >
            {role}
          </span>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-xs transition-colors duration-150"
          style={{ color: '#94A3B8' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444' }}
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
            className="fixed inset-0"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
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
