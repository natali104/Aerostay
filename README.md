# AeroStay - Smart Layover Hotel Booking Platform

A B2B platform that streamlines airline layover hotel bookings by connecting airlines with hotels near airports in real-time.

## Overview

When flight layovers occur, the traditional process of booking hotels involves chaotic phone calls and inefficient communication between airlines and hotels. AeroStay automates this entire workflow:

1. **Automatic layover detection** - Monitors airports for flight delays and layovers
2. **Instant hotel notifications** - Sends real-time availability and pricing to airline contacts
3. **One-click booking** - Airline staff can book rooms through a simple booking engine
4. **Built-in negotiation** - Airlines and hotels can negotiate pricing within the platform
5. **Commission tracking** - Automated 8% commission billing for hotels

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL, Auth, Row Level Security)
- **Email**: Resend (transactional emails via aerostay.app)
- **Hosting**: Vercel (with cron jobs for monitoring)
- **Repository**: GitHub

## Features

### Three Dashboards

- **Admin Dashboard** (`/dashboard/admin`) - Manage airports, airlines, hotels, layovers, bookings, commissions, and users
- **Hotel Dashboard** (`/dashboard/hotel`) - Manage bookings, calendar/pricing/availability, rooms, commissions, and settings
- **Airline Dashboard** (`/dashboard/airline`) - Manage bookings, hotel preferences, notification contacts, and settings

### Public Booking Engine

- **Booking Page** (`/book?token=xxx`) - Token-authenticated booking flow for airline staff
- Step-by-step: layover info → hotel selection → room selection → contact & confirm
- Supports price negotiation between airlines and hotels

### Automated Cron Jobs

- **Layover Detection** (every 5 min) - Checks for new layovers at monitored airports
- **Pricing Sync** (every 30 min) - Syncs hotel pricing from Booking.com with partner discounts

### Business Model

- Free signup for hotels and airlines
- 8% commission on confirmed bookings, billed monthly

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase project
- Resend API key

### Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Fill in your Supabase and Resend credentials

# Run development server
npm run dev
```

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
RESEND_API_KEY=your-resend-api-key
CRON_SECRET=your-cron-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login & signup pages
│   ├── api/             # API routes (bookings, cron, auth)
│   ├── book/            # Public booking engine
│   ├── dashboard/
│   │   ├── admin/       # Admin dashboard pages
│   │   ├── airline/     # Airline dashboard pages
│   │   └── hotel/       # Hotel dashboard pages
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Landing page
├── components/
│   ├── dashboard/       # Sidebar, header, shell
│   └── ui/              # Reusable UI components
└── lib/
    ├── supabase/        # Supabase client (browser, server, middleware)
    ├── email-templates.ts
    ├── resend.ts
    └── utils.ts
```

## Starting Market

Sofia Airport (SOF), Bulgaria - expanding globally.

## License

Proprietary - All rights reserved.
