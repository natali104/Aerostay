import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'AeroStay - Smart Layover Hotel Booking',
  description:
    'AeroStay connects airlines with hotels near airports for seamless layover accommodation. Real-time availability, instant booking, and automated commission tracking — all in one B2B platform.',
  keywords: [
    'airline layover',
    'hotel booking',
    'B2B aviation',
    'airport hotels',
    'crew accommodation',
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  )
}
