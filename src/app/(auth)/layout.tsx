import Link from 'next/link'
import { Plane } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary via-primary-dark to-[#0f2133] px-4 py-12">
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-accent rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent-light rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2 text-white/60 text-sm hover:text-white transition-colors"
        >
          <Plane className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Plane className="h-8 w-8 text-accent" />
            <span className="text-2xl font-bold text-white tracking-tight">
              AeroStay
            </span>
          </Link>
          <p className="mt-2 text-sm text-white/40">
            Smart Layover Hotel Booking
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-xl">
          {children}
        </div>
      </div>
    </div>
  )
}
