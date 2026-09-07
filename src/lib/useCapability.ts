'use client'

import { useEffect, useState } from 'react'

export type CapabilityTier = 'full' | 'lite' | 'static'

/** Below this, `navigator.deviceMemory` (GB) rules the device out of `full`. */
const MIN_DEVICE_MEMORY_GB = 4
/** Below this, `navigator.hardwareConcurrency` rules the device out of `full`. */
const MIN_HARDWARE_CONCURRENCY = 4
/** Below this viewport width, coarse-capable hardware still downgrades to `lite`. */
const LITE_VIEWPORT_WIDTH = 768

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    return Boolean(gl)
  } catch {
    return false
  }
}

/**
 * Reads the current device's capability from the platform, synchronously,
 * client-side only. Never called during server render, only from inside a
 * `useEffect`, so it never has to be SSR-safe on its own; `useCapability`
 * below is what keeps the SSR contract.
 */
function detectTier(): CapabilityTier {
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  if (reducedMotion) return 'static'

  if (!hasWebGL()) return 'static'

  const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
  if (typeof deviceMemory === 'number' && deviceMemory < MIN_DEVICE_MEMORY_GB) return 'static'

  const hardwareConcurrency = navigator.hardwareConcurrency
  if (typeof hardwareConcurrency === 'number' && hardwareConcurrency < MIN_HARDWARE_CONCURRENCY) return 'static'

  const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches ?? false
  const narrowViewport = window.innerWidth < LITE_VIEWPORT_WIDTH
  if (coarsePointer || narrowViewport) return 'lite'

  return 'full'
}

/**
 * The site's three-tier motion budget.
 *
 *   full   , curl-noise WebGL field behind the hero
 *   lite   , an animated CSS gradient mesh instead of WebGL
 *   static , the drawn SVG composition alone, no extra motion
 *
 * Always returns `static` during server render and on the very first client
 * paint (there is no window to inspect yet), then upgrades once in a
 * `useEffect` after mount. That ordering, not the detection logic itself, is
 * what keeps hydration from ever mismatching.
 */
export function useCapability(): { tier: CapabilityTier } {
  const [tier, setTier] = useState<CapabilityTier>('static')

  useEffect(() => {
    setTier(detectTier())

    const onResize = () => {
      // Hardware facts (reduced motion, WebGL, memory, cores) do not change
      // mid-session, so a device already downgraded to `static` stays there;
      // only the viewport-width half of the lite/full split is worth
      // re-checking on resize.
      setTier((previous) => (previous === 'static' ? previous : detectTier()))
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return { tier }
}
