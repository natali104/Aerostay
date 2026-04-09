import Link from 'next/link'
import {
  Plane,
  Hotel,
  Clock,
  ArrowRight,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  Star,
  Building2,
  TrendingUp,
  Zap,
} from 'lucide-react'

const NAV_LINKS = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'For Hotels', href: '#for-hotels' },
  { label: 'For Airlines', href: '#for-airlines' },
]

const STEPS = [
  {
    icon: Clock,
    title: 'Layover Detected',
    description:
      'Our system automatically detects flight delays and layover events requiring hotel accommodation.',
    step: '01',
  },
  {
    icon: Hotel,
    title: 'Hotels Notified',
    description:
      'Instant availability requests are sent to partner hotels near the airport with real-time pricing.',
    step: '02',
  },
  {
    icon: CheckCircle,
    title: 'Booking Confirmed',
    description:
      'Airlines review options and confirm bookings with a single click. Guests receive their details instantly.',
    step: '03',
  },
]

const FEATURES = [
  {
    icon: Clock,
    title: 'Real-time Monitoring',
    description:
      'Automatically detect layovers and delays that require hotel accommodation for passengers and crew.',
  },
  {
    icon: Zap,
    title: 'Instant Availability',
    description:
      'Get live pricing and room availability from partner hotels the moment a layover is detected.',
  },
  {
    icon: Star,
    title: 'Smart Matching',
    description:
      'Intelligently connect airlines with the best-fit hotels based on proximity, price, and rating.',
  },
  {
    icon: TrendingUp,
    title: 'Price Negotiation',
    description:
      'Built-in negotiation flow lets airlines and hotels agree on the best rates before confirming.',
  },
  {
    icon: Building2,
    title: 'Commission Tracking',
    description:
      'Automated billing and commission calculations for every confirmed booking. Full transparency.',
  },
  {
    icon: Mail,
    title: 'Email Notifications',
    description:
      'Instant email alerts keep airlines, hotels, and guests informed at every stage of the booking.',
  },
]

const HOTEL_BENEFITS = [
  'Fill empty rooms during off-peak hours with guaranteed airline bookings',
  'Receive instant notifications when airlines need accommodation nearby',
  'Negotiate rates directly through the platform — no middlemen',
  'Automated invoicing and commission tracking for every booking',
  'Build long-term partnerships with major airline operators',
]

const AIRLINE_BENEFITS = [
  'Eliminate the chaos of phone calls and last-minute scrambling',
  'Access real-time availability from verified partner hotels',
  'One-click booking confirmation for passengers and crew',
  'Full audit trail and reporting for every layover event',
  'Reduce layover costs with competitive, pre-negotiated rates',
]

const FOOTER_LINKS = {
  Platform: [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Contact', href: '#' },
    { label: 'Careers', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
  ],
}

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* ───── Navbar ───── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-md border-b border-white/10">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Plane className="h-7 w-7 text-accent" />
            <span className="text-xl font-bold text-white tracking-tight">
              AeroStay
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-white/70 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-white/80 hover:text-white transition-colors"
            >
              Log in
            </Link>
            <Link href="/signup" className="btn-primary text-sm !py-2 !px-5">
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* ───── Hero ───── */}
      <section className="relative flex items-center justify-center pt-32 pb-24 md:pt-44 md:pb-36 bg-gradient-to-br from-primary via-primary-dark to-[#0f2133] overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07]">
          <div className="absolute top-20 left-10 w-72 h-72 bg-accent rounded-full blur-[120px]" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-accent-light rounded-full blur-[150px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-accent-light backdrop-blur-sm">
            <Plane className="h-4 w-4" />
            <span>B2B Layover Management Platform</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]">
            Streamline Airline{' '}
            <span className="text-accent">Layover Hotel Bookings</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60 leading-relaxed">
            Eliminate the chaos of phone calls, faxes, and last-minute
            scrambling. AeroStay connects airlines with partner hotels in
            real&nbsp;time — so every layover is handled seamlessly.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="btn-primary text-base px-8 py-3.5"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a href="#how-it-works" className="btn-secondary text-base px-8 py-3.5">
              Learn More
            </a>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto">
            {[
              { value: '50+', label: 'Partner Hotels' },
              { value: '24/7', label: 'Availability' },
              { value: '< 2min', label: 'Avg. Booking' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-accent">{stat.value}</p>
                <p className="mt-1 text-xs text-white/50">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Trusted By ───── */}
      <section className="border-b border-gray-100 bg-gray-50/60 py-10">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <p className="text-sm font-medium tracking-wide text-gray-400 uppercase">
            Trusted by airlines serving Sofia Airport
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {['Bulgaria Air', 'Wizz Air', 'Ryanair', 'Lufthansa', 'Turkish Airlines'].map(
              (name) => (
                <span
                  key={name}
                  className="text-lg font-semibold text-gray-300 select-none"
                >
                  {name}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* ───── How It Works ───── */}
      <section id="how-it-works" className="py-24 bg-white scroll-mt-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-accent-dark">
              How It Works
            </p>
            <h2 className="mt-2 text-3xl font-bold text-primary sm:text-4xl">
              Three simple steps
            </h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">
              From layover detection to confirmed booking — fully automated so
              your team can focus on what matters.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {STEPS.map((step) => (
              <div
                key={step.step}
                className="group relative rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:shadow-lg hover:border-accent/30"
              >
                <span className="absolute -top-4 left-8 flex h-8 items-center rounded-full bg-accent/10 px-3 text-xs font-bold text-accent-dark">
                  Step {step.step}
                </span>
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/5 text-primary transition-colors group-hover:bg-accent/10 group-hover:text-accent-dark">
                  <step.icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-semibold text-primary">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Features ───── */}
      <section
        id="features"
        className="py-24 bg-gradient-to-b from-gray-50 to-white scroll-mt-20"
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-accent-dark">
              Features
            </p>
            <h2 className="mt-2 text-3xl font-bold text-primary sm:text-4xl">
              Everything you need to manage layovers
            </h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">
              Purpose-built tools for airlines and hotels to collaborate
              effortlessly.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm transition-all hover:shadow-lg hover:border-accent/30"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent-dark">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-base font-semibold text-primary">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── For Hotels ───── */}
      <section id="for-hotels" className="py-24 bg-white scroll-mt-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent-dark">
                <Hotel className="h-4 w-4" />
                For Hotels
              </div>
              <h2 className="mt-4 text-3xl font-bold text-primary sm:text-4xl">
                Turn empty rooms into guaranteed revenue
              </h2>
              <p className="mt-4 text-gray-500 leading-relaxed">
                Partner with airlines to fill rooms during off-peak hours.
                AeroStay brings bookings directly to you — no OTA commissions,
                no uncertainty.
              </p>
              <ul className="mt-8 space-y-4">
                {HOTEL_BENEFITS.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                    <span className="text-sm text-gray-600">{benefit}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="btn-primary mt-10 inline-flex bg-primary text-white hover:bg-primary-light"
              >
                Register Your Hotel
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="relative rounded-2xl bg-gradient-to-br from-primary to-primary-dark p-10 text-white">
              <Building2 className="h-12 w-12 text-accent mb-6" />
              <p className="text-3xl font-bold">+35%</p>
              <p className="mt-1 text-white/60 text-sm">
                Average occupancy increase for partner hotels
              </p>
              <div className="mt-8 space-y-4">
                {[
                  { label: 'Avg. booking value', value: '€120' },
                  { label: 'Response time', value: '< 5 min' },
                  { label: 'Repeat bookings', value: '78%' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between border-t border-white/10 pt-4"
                  >
                    <span className="text-sm text-white/50">{item.label}</span>
                    <span className="font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── For Airlines ───── */}
      <section
        id="for-airlines"
        className="py-24 bg-gradient-to-b from-gray-50 to-white scroll-mt-20"
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div className="order-2 lg:order-1 relative rounded-2xl bg-gradient-to-br from-accent-dark to-primary p-10 text-white">
              <Plane className="h-12 w-12 text-accent-light mb-6" />
              <p className="text-3xl font-bold">2 min</p>
              <p className="mt-1 text-white/60 text-sm">
                Average time from layover detection to confirmed booking
              </p>
              <div className="mt-8 space-y-4">
                {[
                  { label: 'Cost savings', value: 'Up to 40%' },
                  { label: 'Booking success rate', value: '99.2%' },
                  { label: 'Hotels in network', value: '50+' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between border-t border-white/10 pt-4"
                  >
                    <span className="text-sm text-white/50">{item.label}</span>
                    <span className="font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                <Plane className="h-4 w-4" />
                For Airlines
              </div>
              <h2 className="mt-4 text-3xl font-bold text-primary sm:text-4xl">
                Handle every layover with confidence
              </h2>
              <p className="mt-4 text-gray-500 leading-relaxed">
                No more phone trees or spreadsheet chaos. AeroStay gives your
                operations team a single dashboard to manage every layover
                event.
              </p>
              <ul className="mt-8 space-y-4">
                {AIRLINE_BENEFITS.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-accent-dark" />
                    <span className="text-sm text-gray-600">{benefit}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="btn-primary mt-10 inline-flex"
              >
                Register Your Airline
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className="py-24 bg-gradient-to-br from-primary via-primary-dark to-[#0f2133] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-accent rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to Transform Layover Management?
          </h2>
          <p className="mt-4 text-white/60 text-lg max-w-xl mx-auto">
            Join the growing network of airlines and hotels streamlining
            layover bookings with AeroStay.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="btn-primary text-base px-10 py-4"
            >
              Create Free Account
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="btn-secondary text-base px-10 py-4"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ───── Footer ───── */}
      <footer className="bg-primary-dark text-white/60">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
            {/* Brand */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-2">
                <Plane className="h-6 w-6 text-accent" />
                <span className="text-lg font-bold text-white">AeroStay</span>
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-relaxed">
                The B2B platform connecting airlines with airport hotels for
                seamless layover accommodation management.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs text-accent/80">
                <MapPin className="h-4 w-4" />
                Starting with Sofia Airport — Expanding globally
              </div>
            </div>

            {/* Link groups */}
            {Object.entries(FOOTER_LINKS).map(([group, links]) => (
              <div key={group}>
                <p className="text-sm font-semibold text-white">{group}</p>
                <ul className="mt-4 space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm hover:text-white transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
            <p className="text-xs">
              &copy; {new Date().getFullYear()} AeroStay. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="mailto:contact@aerostay.io"
                className="flex items-center gap-1.5 text-xs hover:text-white transition-colors"
              >
                <Mail className="h-3.5 w-3.5" />
                contact@aerostay.io
              </a>
              <a
                href="tel:+35921234567"
                className="flex items-center gap-1.5 text-xs hover:text-white transition-colors"
              >
                <Phone className="h-3.5 w-3.5" />
                +359 2 123 4567
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
