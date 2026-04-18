'use client'

import { useState, useEffect, useRef } from 'react'

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

export function useCountUp(target: number, duration = 1200): number {
  const [value, setValue] = useState(0)
  const startTime = useRef<number | null>(null)
  const raf = useRef<number>(0)

  useEffect(() => {
    if (target === 0) {
      setValue(0)
      return
    }

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (prefersReduced) {
      setValue(target)
      return
    }

    startTime.current = null

    function tick(timestamp: number) {
      if (startTime.current === null) startTime.current = timestamp
      const elapsed = timestamp - startTime.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOutCubic(progress)

      setValue(Math.round(eased * target))

      if (progress < 1) {
        raf.current = requestAnimationFrame(tick)
      }
    }

    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration])

  return value
}
