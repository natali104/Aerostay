<div align="center">

# ✦ AeroStay

**Smart Layover Hotel Booking Platform**

*Eliminating the chaos of airline layover hotel bookings — one airport at a time.*

[![Live Demo](https://img.shields.io/badge/Live-aerostay.app-0EA5E9?style=for-the-badge&logo=vercel&logoColor=white)](https://aerostay.app)
[![Interactive Demo](https://img.shields.io/badge/Demo-Product_Showcase-F5A623?style=for-the-badge&logo=youtube&logoColor=white)](https://aerostay.app/demo)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

</div>

---

## The Problem

When airline flights are delayed or cancelled, passengers need hotel accommodation. The current process is **chaotic**:

- Airlines manually call 10+ hotels for availability
- Average booking time: **47 minutes** per layover event
- Hotels miss **60%** of layover booking opportunities
- No standardized communication channel between airlines and hotels

## The Solution

AeroStay automates the entire layover hotel booking workflow:

1. **Detect** — Monitor airports for delays and cancellations in real-time
2. **Match** — Instantly notify partner hotels with availability requests
3. **Book** — One-click booking confirmation with automated voucher generation
4. **Track** — Commission tracking, billing, and analytics

**Result: Average booking time reduced from 47 minutes to under 2 minutes.**

---

## Features

### For Hotels
- **Real-time radar** — Canvas-based ATC-style radar showing live layover events
- **Room management** — Interactive calendar with availability editing
- **Pricing controls** — Manual, Booking.com sync, or channel manager integration
- **Booking dashboard** — Live feed with Supabase realtime subscriptions
- **Commission tracking** — Automated 8% commission billing

### For Airlines
- **3D globe network** — Interactive globe showing airport connections (cobe library)
- **Layover detection** — Automated monitoring with instant notifications
- **Passenger manifests** — CSV upload with auto room assignment
- **PDF vouchers** — Generated with QR codes, EU 261/2004 compliant
- **Hotel preferences** — Preferred hotel management with priority ordering

### For Platform Admins
- **Platform overview** — Revenue charts, activity feeds, health monitoring
- **User management** — Hotels, airlines, and layover event oversight
- **Commission management** — Billing cycles and payment tracking

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 |
| **Database** | Supabase (PostgreSQL + Row Level Security) |
| **Auth** | Supabase Auth with role-based access (admin/hotel/airline) |
| **Realtime** | Supabase Realtime (live booking feed, event detection) |
| **Email** | Resend (transactional emails via aerostay.app domain) |
| **PDF Generation** | jsPDF + QRCode |
| **Charts** | Recharts |
| **3D Globe** | cobe |
| **Animations** | Framer Motion + Canvas API |
| **Hosting** | Vercel (with cron jobs) |
| **Domain** | aerostay.app |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                         │
│  Next.js 16 App Router + TypeScript + Tailwind      │
│                                                     │
│  ┌───────────┐ ┌──────────┐ ┌─────────────┐       │
│  │  Landing   │ │  Hotel   │ │   Airline    │       │
│  │   Page     │ │Dashboard │ │  Dashboard   │       │
│  └───────────┘ └──────────┘ └─────────────┘       │
│  ┌───────────┐ ┌──────────┐ ┌─────────────┐       │
│  │  Booking   │ │  Admin   │ │    Demo      │       │
│  │  Engine    │ │Dashboard │ │  Showcase    │       │
│  └───────────┘ └──────────┘ └─────────────┘       │
├─────────────────────────────────────────────────────┤
│                   API LAYER                         │
│  Next.js API Routes + Supabase Server Client        │
│                                                     │
│  /api/bookings   /api/cron   /api/vouchers          │
│  /api/auth       /api/hotels                        │
├─────────────────────────────────────────────────────┤
│                   DATABASE                          │
│  Supabase PostgreSQL + Row Level Security           │
│                                                     │
│  airports · airlines · hotels · room_types          │
│  layovers · booking_requests · passengers           │
│  commissions · profiles · auth_tokens               │
├─────────────────────────────────────────────────────┤
│                 EXTERNAL SERVICES                   │
│  Resend (Email) · Vercel (Hosting + Cron)          │
└─────────────────────────────────────────────────────┘
```

---

## Database Schema

14 tables with comprehensive Row Level Security:

- **profiles** — User accounts with role-based access (admin/hotel/airline)
- **airports** — Monitored airports (starting with Sofia)
- **airlines** — Airline companies with IATA codes
- **hotels** — Partner hotels with pricing and availability
- **room_types** — Room categories per hotel
- **room_availability** — Daily room counts and pricing
- **layovers** — Detected layover events
- **booking_requests** — Booking flow with negotiation support
- **booking_rooms** — Line items within bookings
- **negotiations** — Price negotiation threads
- **commissions** — Automated commission tracking
- **passengers** — Passenger manifests with voucher codes
- **airline_contacts** — Notification recipients
- **airline_hotel_preferences** — Preferred hotel rankings

---

## Key Technical Highlights

- **Canvas-based radar** — Custom HTML5 Canvas radar with requestAnimationFrame animation loop, sweep line, blip positioning via seeded random, and hover tooltips
- **Supabase Realtime** — Live booking feed with WebSocket subscriptions, new row animations, and Web Audio API notification sounds
- **PDF Generation** — Client-side A5 voucher generation with jsPDF, QR codes, and JSZip bundling
- **3D Globe** — Interactive WebGL globe with cobe library showing airport network
- **Role-based middleware** — Supabase SSR auth with automatic role-based dashboard routing
- **Demo mode** — Complete demo data system that populates every page with realistic aviation data

---

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase project
- Resend API key (optional, for email)

### Setup

```bash
# Clone the repository
git clone https://github.com/natali104/Aerostay.git
cd Aerostay

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase and Resend credentials

# Run development server
npm run dev
```

Visit `http://localhost:3000` to see the app.

### Demo Mode

The app includes a built-in demo mode (`DEMO_MODE = true` in `lib/demo.ts`) that populates all pages with realistic data. No database connection needed to explore the UI.

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Login & signup
│   ├── api/                 # API routes (bookings, cron, vouchers)
│   ├── book/                # Public booking engine
│   ├── dashboard/
│   │   ├── admin/           # Platform administration
│   │   ├── airline/         # Airline operations
│   │   └── hotel/           # Hotel management
│   ├── demo/                # Interactive product showcase
│   └── page.tsx             # Landing page
├── components/
│   ├── dashboard/           # Radar, globe, panels, feeds
│   ├── landing/             # Navbar, ticker
│   └── ui/                  # Reusable components
└── lib/
    ├── demo.ts              # Demo data
    ├── hooks/               # Custom React hooks
    ├── supabase/            # Supabase clients
    └── format.ts            # Formatting utilities
```

---

## Deployment

The app is deployed on Vercel with:
- Automatic builds from the `main` branch
- Environment variables configured in Vercel dashboard
- Cron jobs for airport monitoring and price syncing
- Custom domain: [aerostay.app](https://aerostay.app)

---

## Starting Market

**Sofia Airport (SOF), Bulgaria** — with architecture designed for global expansion to any airport.

---

## Author

**Nataliya Nikolova**

---

## License

Proprietary — All rights reserved.
