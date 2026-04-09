import type { Metadata } from 'next'
import { Plane } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Book Layover Hotel — AeroStay',
  description: 'Quickly book layover hotel accommodation through AeroStay.',
}

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Navy branded header */}
      <header className="sticky top-0 z-30 border-b border-[#162d4a] bg-[#1e3a5f] shadow-sm">
        <div className="mx-auto flex h-14 max-w-4xl items-center gap-2 px-4 sm:h-16 sm:px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
            <Plane className="h-4 w-4 text-[#38bdf8]" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white sm:text-xl">
            Aero<span className="text-[#38bdf8]">Stay</span>
          </span>
          <span className="ml-2 hidden rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-[#38bdf8] sm:inline-block">
            Layover Booking
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <p className="text-xs text-gray-400">
            Powered by{' '}
            <span className="font-semibold text-[#1e3a5f]">AeroStay</span>
          </p>
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} AeroStay. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
