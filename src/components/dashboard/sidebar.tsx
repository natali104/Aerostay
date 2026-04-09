'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Plane,
  Hotel,
  Clock,
  CalendarCheck,
  DollarSign,
  Users,
  Settings,
  Calendar,
  BedDouble,
  Heart,
  Contact,
  ChevronLeft,
  X,
} from 'lucide-react'

type Role = 'admin' | 'hotel' | 'airline'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

interface SidebarProps {
  role: Role
  userName: string
  userEmail: string
  mobileOpen?: boolean
  onMobileClose?: () => void
}

const iconClass = 'h-5 w-5 shrink-0'

const navConfig: Record<Role, NavItem[]> = {
  admin: [
    { label: 'Dashboard', href: '/dashboard/admin', icon: <LayoutDashboard className={iconClass} /> },
    { label: 'Airports', href: '/dashboard/admin/airports', icon: <Plane className={iconClass} /> },
    { label: 'Airlines', href: '/dashboard/admin/airlines', icon: <Plane className={iconClass} /> },
    { label: 'Hotels', href: '/dashboard/admin/hotels', icon: <Hotel className={iconClass} /> },
    { label: 'Layovers', href: '/dashboard/admin/layovers', icon: <Clock className={iconClass} /> },
    { label: 'Bookings', href: '/dashboard/admin/bookings', icon: <CalendarCheck className={iconClass} /> },
    { label: 'Commissions', href: '/dashboard/admin/commissions', icon: <DollarSign className={iconClass} /> },
    { label: 'Users', href: '/dashboard/admin/users', icon: <Users className={iconClass} /> },
    { label: 'Settings', href: '/dashboard/admin/settings', icon: <Settings className={iconClass} /> },
  ],
  hotel: [
    { label: 'Dashboard', href: '/dashboard/hotel', icon: <LayoutDashboard className={iconClass} /> },
    { label: 'Bookings', href: '/dashboard/hotel/bookings', icon: <CalendarCheck className={iconClass} /> },
    { label: 'Calendar & Pricing', href: '/dashboard/hotel/calendar', icon: <Calendar className={iconClass} /> },
    { label: 'Room Management', href: '/dashboard/hotel/rooms', icon: <BedDouble className={iconClass} /> },
    { label: 'Commissions', href: '/dashboard/hotel/commissions', icon: <DollarSign className={iconClass} /> },
    { label: 'Settings', href: '/dashboard/hotel/settings', icon: <Settings className={iconClass} /> },
  ],
  airline: [
    { label: 'Dashboard', href: '/dashboard/airline', icon: <LayoutDashboard className={iconClass} /> },
    { label: 'Bookings', href: '/dashboard/airline/bookings', icon: <CalendarCheck className={iconClass} /> },
    { label: 'Hotel Preferences', href: '/dashboard/airline/preferences', icon: <Heart className={iconClass} /> },
    { label: 'Contacts', href: '/dashboard/airline/contacts', icon: <Contact className={iconClass} /> },
    { label: 'Settings', href: '/dashboard/airline/settings', icon: <Settings className={iconClass} /> },
  ],
}

export function Sidebar({ role, userName, userEmail, mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const items = navConfig[role]

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const isActive = (href: string) => {
    if (href === `/dashboard/${role}`) return pathname === href
    return pathname.startsWith(href)
  }

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className={cn(
        'flex h-16 items-center border-b border-white/10 px-4',
        collapsed ? 'justify-center' : 'gap-1',
      )}>
        <Link href="/dashboard" className="flex items-center gap-1 text-xl font-bold tracking-tight">
          <span className="text-white">Aero</span>
          {!collapsed && <span className="text-sky-400">Stay</span>}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {items.map((item) => {
            const active = isActive(item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onMobileClose}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150',
                    active
                      ? 'bg-sky-400/15 text-sky-400'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white',
                    collapsed && 'justify-center px-2',
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  {item.icon}
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User info + Collapse toggle */}
      <div className="border-t border-white/10 p-3">
        {/* Collapse toggle — desktop only */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="mb-3 hidden w-full items-center justify-center rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white lg:flex"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className={cn('h-5 w-5 transition-transform duration-200', collapsed && 'rotate-180')} />
        </button>

        <div className={cn('flex items-center gap-3', collapsed && 'flex-col')}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-400/20 text-sm font-semibold text-sky-400">
            {userName.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{userName}</p>
              <p className="truncate text-xs text-slate-400">{userEmail}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:flex-col bg-[#1e3a5f] transition-[width] duration-200',
          collapsed ? 'lg:w-[72px]' : 'lg:w-64',
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={onMobileClose} />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#1e3a5f] shadow-xl animate-in slide-in-from-left duration-200">
            <button
              onClick={onMobileClose}
              className="absolute right-3 top-4 rounded-lg p-1 text-slate-400 hover:text-white"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
