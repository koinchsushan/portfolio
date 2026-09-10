'use client'

import { useEffect } from 'react'
import { useReducedMotion } from '@/lib/useReducedMotion'

/**
 * Site-wide smooth scroll. Renders nothing; it only attaches Lenis to the
 * window's own scroll for as long as motion is welcome. Reduced motion does
 * not slow this down, it removes it: the instance is destroyed and native
 * scroll takes back over immediately, and stays that way for as long as the
 * live media query keeps reporting reduced motion.
 *
 * `lenis` is dynamically imported rather than imported at the top of the
 * file: a static import ships its code to every visitor unconditionally,
 * including the reduced-motion visitor this component never instantiates it
 * for. The dynamic import only ever resolves once `reducedMotion` is known
 * to be `false`, so that visitor's browser never fetches it at all.
 */
export function SmoothScroll() {
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) return

    let cancelled = false
    let lenis: import('lenis').default | undefined
    let frame = 0

    void import('lenis').then(({ default: Lenis }) => {
      if (cancelled) return
      lenis = new Lenis()

      const raf = (time: number) => {
        lenis?.raf(time)
        frame = requestAnimationFrame(raf)
      }
      frame = requestAnimationFrame(raf)
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      lenis?.destroy()
    }
  }, [reducedMotion])

  return null
}
