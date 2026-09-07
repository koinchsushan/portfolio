'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import { useReducedMotion } from '@/lib/useReducedMotion'

/**
 * Site-wide smooth scroll. Renders nothing; it only attaches Lenis to the
 * window's own scroll for as long as motion is welcome. Reduced motion does
 * not slow this down, it removes it: the instance is destroyed and native
 * scroll takes back over immediately, and stays that way for as long as the
 * live media query keeps reporting reduced motion.
 */
export function SmoothScroll() {
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) return

    const lenis = new Lenis()

    let frame = 0
    const raf = (time: number) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
    }
  }, [reducedMotion])

  return null
}
