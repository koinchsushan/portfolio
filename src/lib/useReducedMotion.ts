'use client'

import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

/**
 * Live subscription to the reduced-motion media query, not a one-time read.
 * Defaults to `false` (motion allowed) so server render and first client
 * paint agree; a listener then keeps the value in sync with the OS setting
 * for the rest of the session, including a change made mid-visit.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return

    const mql = window.matchMedia(QUERY)
    setReduced(mql.matches)

    const handleChange = (event: MediaQueryListEvent) => setReduced(event.matches)
    mql.addEventListener('change', handleChange)
    return () => mql.removeEventListener('change', handleChange)
  }, [])

  return reduced
}
