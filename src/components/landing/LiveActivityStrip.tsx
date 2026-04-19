'use client'

const TICKER_TEXT =
  '✈ LZ481 · Bulgaria Air · Hyatt Regency · 26 rooms · €2,314 confirmed  ·  ✈ TK1029 · Turkish Airlines · Hilton Sofia · 18 rooms · €1,710 confirmed  ·  ✈ W64455 · Wizz Air · Radisson Blu · 31 rooms · €2,449 confirmed  ·  ✈ OS801 · Austrian Airlines · InterContinental · 14 rooms · €1,526 confirmed  ·  ✈ FB402 · Bulgaria Air · Ramada Sofia · 22 rooms · €1,958 confirmed  ·  '

export default function LiveActivityStrip() {
  const doubled = TICKER_TEXT + TICKER_TEXT

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ background: '#0D1426', paddingTop: 14, paddingBottom: 14 }}
    >
      <div className="mx-auto max-w-[100vw] flex items-center">
        {/* LIVE badge */}
        <div
          className="shrink-0 ml-4 mr-4 flex items-center gap-2 rounded-full px-3 py-1 z-10"
          style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}
        >
          <span className="relative flex h-2 w-2">
            <span
              className="absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ background: '#10B981', animation: 'pulseRing 1.5s ease-out infinite' }}
            />
            <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: '#10B981' }} />
          </span>
          <span className="text-xs font-bold tracking-wider" style={{ color: '#10B981' }}>
            LIVE
          </span>
        </div>

        {/* Scrolling ticker */}
        <div className="overflow-hidden flex-1">
          <div
            className="landing-ticker-scroll whitespace-nowrap"
            style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: 'rgba(14,165,233,0.85)' }}
          >
            {doubled}
          </div>
        </div>
      </div>
    </section>
  )
}
