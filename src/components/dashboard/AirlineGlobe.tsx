'use client'

import { useEffect, useRef } from 'react'
import createGlobe from 'cobe'

export default function AirlineGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const phiRef = useRef(0.5)

  useEffect(() => {
    if (!canvasRef.current) return

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 560,
      height: 560,
      phi: 0.5,
      theta: 0.25,
      dark: 0,
      diffuse: 1.4,
      mapSamples: 20000,
      mapBrightness: 7,
      baseColor: [0.88, 0.94, 1.0],
      markerColor: [0.05, 0.65, 0.91],
      glowColor: [0.75, 0.88, 1.0],
      markers: [
        { location: [42.6977, 23.3219], size: 0.1 },
        { location: [52.3086, 4.7639], size: 0.06 },
        { location: [41.2753, 28.7519], size: 0.06 },
        { location: [48.1103, 16.5697], size: 0.06 },
        { location: [50.0379, 8.5622], size: 0.06 },
        { location: [51.4775, -0.4614], size: 0.06 },
        { location: [48.8566, 2.3522], size: 0.05 },
        { location: [40.4168, -3.7038], size: 0.05 },
      ],
      onRender: (state) => {
        state.phi = phiRef.current
        phiRef.current += 0.003
      },
    })

    return () => globe.destroy()
  }, [])

  return (
    <div className="relative mx-auto" style={{ width: 280, height: 280 }}>
      <div
        className="absolute -inset-2.5 rounded-full"
        style={{ background: 'rgba(14,165,233,0.07)' }}
      />
      <canvas
        ref={canvasRef}
        className="rounded-full"
        style={{ width: 280, height: 280 }}
      />
      <p
        className="mt-3 text-center text-[10px] text-[#94A3B8]"
        style={{ fontFamily: "'Space Mono', monospace" }}
      >
        ✦ Live Network · Sofia Airport · 8 Partner Hubs
      </p>
    </div>
  )
}
